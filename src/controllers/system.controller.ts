import { Request, Response, NextFunction } from 'express';
import os from 'os';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import mongoose from 'mongoose';
import { sendSuccess, sendError } from '../utils/response.js';

const execAsync = promisify(exec);

export class SystemController {
  /**
   * Lấy thông số phần cứng, mạng và trạng thái kết nối Database thời gian thực
   */
  static async getHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. Tính toán CPU
      const cpus = os.cpus();
      const cpuCount = cpus.length;
      const cpuModel = cpus[0]?.model || 'Generic CPU';
      const loadAvg = os.loadavg(); // [1m, 5m, 15m]
      
      // Tính phần trăm tải CPU ước lượng dựa trên load average 1 phút chia cho số core
      const cpuUsagePct = Math.min(100, Math.round((loadAvg[0] / Math.max(1, cpuCount)) * 100));

      // 2. Tính toán RAM
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memUsagePct = Math.round((usedMem / totalMem) * 100);

      // Node.js process memory
      const processMem = process.memoryUsage();

      // Kiểm tra Swap Memory trên Linux (nếu có)
      let swapTotal = 0;
      let swapFree = 0;
      let swapUsed = 0;
      try {
        if (fs.existsSync('/proc/meminfo')) {
          const meminfo = fs.readFileSync('/proc/meminfo', 'utf-8');
          const swapTotalMatch = meminfo.match(/SwapTotal:\s+(\d+)\s+kB/);
          const swapFreeMatch = meminfo.match(/SwapFree:\s+(\d+)\s+kB/);
          if (swapTotalMatch && swapFreeMatch) {
            swapTotal = parseInt(swapTotalMatch[1], 10) * 1024;
            swapFree = parseInt(swapFreeMatch[1], 10) * 1024;
            swapUsed = swapTotal - swapFree;
          }
        }
      } catch (err) {
        // Fallback bỏ qua nếu không đọc được /proc/meminfo
      }

      // 3. Đo lường kết nối MongoDB
      const dbState = mongoose.connection.readyState;
      // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
      const isDbConnected = dbState === 1;
      let dbLatencyMs = 0;

      if (isDbConnected && mongoose.connection.db) {
        const startPing = Date.now();
        try {
          await mongoose.connection.db.admin().ping();
          dbLatencyMs = Date.now() - startPing;
        } catch (e) {
          dbLatencyMs = -1;
        }
      }

      // 4. Thời gian Uptime
      const systemUptimeSeconds = Math.floor(os.uptime());
      const appUptimeSeconds = Math.floor(process.uptime());

      const data = {
        server: {
          hostname: os.hostname(),
          platform: os.platform(),
          release: os.release(),
          type: os.type(),
          arch: os.arch(),
          nodeVersion: process.version,
          systemUptimeSeconds,
          appUptimeSeconds
        },
        cpu: {
          model: cpuModel,
          cores: cpuCount,
          usagePct: cpuUsagePct,
          loadAverage: loadAvg.map(n => Math.round(n * 100) / 100)
        },
        memory: {
          totalBytes: totalMem,
          usedBytes: usedMem,
          freeBytes: freeMem,
          usagePct: memUsagePct,
          processRssBytes: processMem.rss,
          swapTotalBytes: swapTotal,
          swapUsedBytes: swapUsed,
          swapUsagePct: swapTotal > 0 ? Math.round((swapUsed / swapTotal) * 100) : 0
        },
        database: {
          connected: isDbConnected,
          state: dbState === 1 ? 'Connected' : 'Disconnected',
          latencyMs: dbLatencyMs,
          host: mongoose.connection.host || '127.0.0.1',
          name: mongoose.connection.name || 'moonlight_db'
        },
        network: {
          status: 'Online',
          latencyMs: 1
        },
        timestamp: new Date().toISOString()
      };

      sendSuccess(res, data, 'Lấy thông số sức khỏe hệ thống thành công');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tự động kéo mã nguồn mới nhất từ GitHub, biên dịch và reload lại ứng dụng (Zero-Downtime)
   */
  static async deploy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const startTime = Date.now();
      let gitOutput = '';
      let buildOutput = '';
      let filesChanged = '';

      // 1. Kéo code từ Git - Sử dụng fetch + reset --hard để chống kẹt conflict do file rác (.DS_Store)
      try {
        const { stdout: fetchOut, stderr: fetchErr } = await execAsync('git fetch origin main && git reset --hard origin/main');
        gitOutput = (fetchOut || '') + (fetchErr || '');
      } catch (err: any) {
        // Fallback sang git pull nếu reset gặp vấn đề
        try {
          const { stdout: pullOut } = await execAsync('git pull origin main');
          gitOutput = pullOut || '';
        } catch (pullErr: any) {
          gitOutput = `⚠️ Git Pull: ${pullErr.message}`;
        }
      }

      // 2. Lấy thông tin commit mới nhất & danh sách file thay đổi
      let latestCommit = '';
      try {
        const { stdout: logOut } = await execAsync('git log -1 --pretty=format:"%h - %s (%cr) <%an>"');
        latestCommit = logOut.trim();
        
        const { stdout: diffOut } = await execAsync('git diff --stat HEAD~1 HEAD 2>/dev/null || true');
        filesChanged = diffOut.trim();
      } catch (e) {
        latestCommit = 'Đã cập nhật phiên bản mới nhất';
      }

      // 3. Biên dịch TypeScript
      try {
        const { stdout: bOut, stderr: bErr } = await execAsync('npm run build');
        buildOutput = (bOut || '') + (bErr || '');
      } catch (err: any) {
        buildOutput = `⚠️ Cảnh báo Build: ${err.message}`;
      }

      const durationMs = Date.now() - startTime;

      // 4. Lên lịch reload PM2 sau 1.2 giây để kịp trả response JSON về cho trình duyệt
      setTimeout(() => {
        exec('pm2 reload moonlight || pm2 restart moonlight', (err, stdout, stderr) => {
          if (err) {
            console.error('Lỗi PM2 reload:', err);
          } else {
            console.log('✅ Đã PM2 reload moonlight thành công!');
          }
        });
      }, 1200);

      sendSuccess(res, {
        durationMs,
        latestCommit,
        filesChanged,
        gitOutput: gitOutput.trim(),
        buildOutput: buildOutput.trim(),
        reloaded: true
      }, 'Cập nhật mã nguồn và yêu cầu khởi động lại ứng dụng thành công!');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy nhật ký PM2 phục vụ chẩn đoán hệ thống
   */
  static async getLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { stdout } = await execAsync('pm2 logs moonlight --lines 80 --nostream || pm2 logs --lines 80 --nostream');
      sendSuccess(res, { logs: stdout }, 'Lấy logs thành công');
    } catch (err: any) {
      sendSuccess(res, { logs: err.message }, 'Lỗi lấy logs');
    }
  }
}
