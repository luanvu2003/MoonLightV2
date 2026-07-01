const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

try {
  console.log('🚀 Đang bắt đầu deploy lên GitHub Pages...');
  
  // 1. Chuyển thư mục làm việc sang public
  process.chdir(publicDir);
  
  // 2. Khởi tạo git tạm thời
  console.log('-> Khởi tạo git tạm thời...');
  execSync('git init', { stdio: 'inherit' });
  
  // 3. Thêm tất cả các file
  console.log('-> Thêm files...');
  execSync('git add -A', { stdio: 'inherit' });
  
  // 4. Commit các thay đổi
  console.log('-> Commit...');
  execSync('git commit -m "deploy"', { stdio: 'inherit' });
  
  // 5. Force push lên nhánh gh-pages
  console.log('-> Đang push lên github...');
  const repoUrl = 'https://github.com/luanvu2003/MoonLightV2.git';
  execSync(`git push -f ${repoUrl} HEAD:gh-pages`, { stdio: 'inherit' });
  
  console.log('🎉 Deploy thành công!');
} catch (error) {
  console.error('❌ Deploy thất bại:', error);
} finally {
  // 6. Xóa thư mục .git tạm thời để tránh ảnh hưởng repo chính
  const gitDir = path.join(publicDir, '.git');
  if (fs.existsSync(gitDir)) {
    console.log('-> Đang dọn dẹp thư mục .git tạm thời...');
    fs.rmSync(gitDir, { recursive: true, force: true });
  }
}
