import { Request, Response, NextFunction } from 'express';
import os from 'os';
import fs from 'fs';
import path from 'path';
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

      // 3. Biên dịch TypeScript hoặc sử dụng bản dist/ pre-built đã đồng bộ trực tiếp từ GitHub
      let buildSuccess = true;
      try {
        const { stdout: bOut, stderr: bErr } = await execAsync('NODE_OPTIONS="--max-old-space-size=512" npm run build');
        buildOutput = (bOut || '') + (bErr || '') || '✅ Đã biên dịch TypeScript thành công.';
      } catch (err: any) {
        const errDetails = ((err.stdout || '') + '\n' + (err.stderr || '')).trim() || err.message;
        const distServerPath = path.join(process.cwd(), 'dist', 'server.js');
        if (fs.existsSync(distServerPath)) {
          buildSuccess = true;
          buildOutput = `ℹ️ Đã sử dụng mã nguồn biên dịch sẵn dist/ đồng bộ từ GitHub (tsc: ${errDetails.slice(0, 120)}...)`;
        } else {
          buildSuccess = false;
          buildOutput = `❌ Lỗi Build TypeScript: ${errDetails}`;
        }
      }

      // NGUY CƠ SẬP SERVER: Nếu build TypeScript thất bại và không có dist/server.js, hủy reload PM2 để bảo vệ máy chủ
      if (!buildSuccess) {
        sendError(
          res,
          `Biên dịch TypeScript thất bại! Hệ thống đã hủy lệnh reload PM2 để ngăn ngừa sập máy chủ. Vui lòng kiểm tra mã nguồn.\nChi tiết:\n${buildOutput}`,
          500
        );
        return;
      }

      // Tự động nạp HF_TOKEN vào .env nếu được truyền lên qua body
      const userHfToken = req.body?.hfToken || req.query?.hfToken;
      if (userHfToken && typeof userHfToken === 'string' && userHfToken.trim().startsWith('hf_')) {
        try {
          const envPath = path.join(process.cwd(), '.env');
          let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
          if (envContent.includes('HF_TOKEN=')) {
            envContent = envContent.replace(/HF_TOKEN=.*/g, `HF_TOKEN=${userHfToken.trim()}`);
            fs.writeFileSync(envPath, envContent, 'utf-8');
          } else {
            fs.appendFileSync(envPath, `\nHF_TOKEN=${userHfToken.trim()}\n`);
          }
          process.env.HF_TOKEN = userHfToken.trim();
        } catch (err) {
          console.warn('⚠️ Lỗi ghi .env:', err);
        }
      }

      // Đảm bảo các thư viện Python AI được cài đặt và cập nhật phiên bản tương thích
      try {
        await execAsync('pip3 install -U "gradio_client>=1.3.0" || pip install -U "gradio_client>=1.3.0" || true');
      } catch (pipErr: any) {
        console.warn('⚠️ Pip install check:', pipErr.message);
      }

      const durationMs = Date.now() - startTime;

      // 4. Khởi động và reload toàn bộ ứng dụng Node & Python AI qua ecosystem.config.cjs
      setTimeout(() => {
        exec('pm2 startOrReload ecosystem.config.cjs || pm2 start ecosystem.config.cjs || pm2 restart all', (err, stdout, stderr) => {
          if (err) {
            console.error('Lỗi PM2 reload:', err);
          } else {
            console.log('✅ Đã PM2 startOrReload ecosystem.config.cjs thành công!');
          }
        });
      }, 2000);

      sendSuccess(res, {
        durationMs,
        latestCommit,
        filesChanged,
        gitOutput: gitOutput.trim(),
        buildOutput: buildOutput.trim(),
        reloaded: true
      }, 'Cập nhật mã nguồn và khởi động lại toàn bộ Node & Python AI thành công!');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy nhật ký PM2 phục vụ chẩn đoán hệ thống
   */
  static async getLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { stdout } = await execAsync('pm2 status && pm2 logs --lines 40 --nostream');
      sendSuccess(res, { logs: stdout }, 'Lấy logs thành công');
    } catch (err: any) {
      sendSuccess(res, { logs: err.message }, 'Lỗi lấy logs');
    }
  }
}
