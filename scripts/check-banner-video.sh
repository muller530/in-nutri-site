#!/bin/bash

# 检查首屏视频配置脚本

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  首屏视频配置检查工具${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# 检测项目目录
if [ -d "/var/www/in-nutri-site" ]; then
    PROJECT_DIR="/var/www/in-nutri-site"
elif [ -d "$(pwd)" ] && [ -f "$(pwd)/package.json" ]; then
    PROJECT_DIR="$(pwd)"
else
    echo -e "${RED}❌ 未找到项目目录${NC}"
    exit 1
fi

cd "$PROJECT_DIR" || exit 1

echo -e "${GREEN}📁 项目目录: $PROJECT_DIR${NC}"
echo ""

# 1. 检查数据库中的 banner 配置
echo -e "${YELLOW}[1/4] 检查数据库中的 banner 配置...${NC}"
if command -v sqlite3 &> /dev/null && [ -f "db/sqlite.db" ]; then
    echo "查询 home-hero banner:"
    sqlite3 db/sqlite.db "SELECT key, title, image, isActive FROM banners WHERE key = 'home-hero';" || echo "未找到 home-hero banner"
    echo ""
    echo "所有激活的 banners:"
    sqlite3 db/sqlite.db "SELECT key, title, image, isActive FROM banners WHERE isActive = 1;" || echo "未找到激活的 banners"
else
    echo -e "${YELLOW}   ⚠️  sqlite3 未安装或数据库文件不存在${NC}"
fi
echo ""

# 2. 检查视频文件是否存在
echo -e "${YELLOW}[2/4] 检查视频文件...${NC}"
if [ -d "public/uploads/videos" ]; then
    VIDEO_COUNT=$(find public/uploads/videos -type f \( -name "*.mp4" -o -name "*.mov" -o -name "*.avi" -o -name "*.webm" \) | wc -l)
    echo -e "${GREEN}   ✅ 视频目录存在${NC}"
    echo "   视频文件数量: $VIDEO_COUNT"
    if [ "$VIDEO_COUNT" -gt 0 ]; then
        echo "   视频文件列表:"
        find public/uploads/videos -type f \( -name "*.mp4" -o -name "*.mov" -o -name "*.avi" -o -name "*.webm" \) | head -5 | while read -r file; do
            echo "     - $(basename "$file") ($(du -h "$file" | cut -f1))"
        done
    else
        echo -e "${YELLOW}   ⚠️  未找到视频文件${NC}"
    fi
else
    echo -e "${RED}   ❌ 视频目录不存在: public/uploads/videos${NC}"
fi
echo ""

# 3. 检查文件权限
echo -e "${YELLOW}[3/4] 检查文件权限...${NC}"
if [ -d "public/uploads/videos" ]; then
    ls -la public/uploads/videos | head -5
    echo ""
    echo "检查目录权限:"
    if [ -r "public/uploads/videos" ] && [ -x "public/uploads/videos" ]; then
        echo -e "${GREEN}   ✅ 目录可读可执行${NC}"
    else
        echo -e "${RED}   ❌ 目录权限不正确${NC}"
        echo -e "${YELLOW}   🔧 修复权限...${NC}"
        chmod -R 755 public/uploads/videos
    fi
fi
echo ""

# 4. 测试 API 响应
echo -e "${YELLOW}[4/4] 测试 Banner API...${NC}"
if command -v node &> /dev/null; then
    # 创建测试脚本
    cat > /tmp/test-banner-api.js << 'EOF'
const { db } = require('./db/index');
const { banners } = require('./db/schema');
const { eq } = require('drizzle-orm');

(async () => {
  try {
    const allBanners = await db.select().from(banners).where(eq(banners.isActive, true));
    console.log('激活的 banners:');
    allBanners.forEach(banner => {
      console.log(`  Key: ${banner.key}`);
      console.log(`  Title: ${banner.title || '无'}`);
      console.log(`  Image/Video URL: ${banner.image || '无'}`);
      console.log(`  IsActive: ${banner.isActive}`);
      console.log('  ---');
    });
    
    const homeHero = allBanners.find(b => b.key === 'home-hero');
    if (homeHero) {
      console.log('\n✅ 找到 home-hero banner');
      console.log(`视频 URL: ${homeHero.image || '无'}`);
    } else {
      console.log('\n❌ 未找到 home-hero banner');
    }
  } catch (error) {
    console.error('错误:', error.message);
  }
  process.exit(0);
})();
EOF
    
    cd "$PROJECT_DIR"
    if node /tmp/test-banner-api.js 2>&1; then
        echo -e "${GREEN}   ✅ API 测试成功${NC}"
    else
        echo -e "${RED}   ❌ API 测试失败${NC}"
    fi
    rm -f /tmp/test-banner-api.js
else
    echo -e "${YELLOW}   ⚠️  Node.js 未安装，跳过 API 测试${NC}"
fi
echo ""

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ 检查完成！${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}💡 建议：${NC}"
echo "   1. 确保 banner 的 key 设置为 'home-hero'"
echo "   2. 确保视频文件上传到了 public/uploads/videos/ 目录"
echo "   3. 确保 banner 的 image 字段包含完整的视频路径（如 /uploads/videos/xxx.mp4）"
echo "   4. 清除浏览器缓存或等待10秒后刷新页面"
echo "   5. 检查浏览器控制台的错误信息"

