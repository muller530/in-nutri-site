#!/bin/bash

# 检查导航菜单配置脚本

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  导航菜单配置检查工具${NC}"
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

# 1. 检查数据库中的导航项
echo -e "${YELLOW}[1/3] 检查数据库中的导航项...${NC}"
if command -v sqlite3 &> /dev/null && [ -f "db/sqlite.db" ]; then
    echo "所有导航项:"
    sqlite3 db/sqlite.db "SELECT id, label, position, type, isActive, sortOrder FROM navigation_items ORDER BY position, sortOrder;" || echo "未找到导航项"
    echo ""
    echo "激活的导航项:"
    sqlite3 db/sqlite.db "SELECT id, label, position, type, isActive FROM navigation_items WHERE isActive = 1 ORDER BY position, sortOrder;" || echo "未找到激活的导航项"
    echo ""
    echo "左侧导航项:"
    sqlite3 db/sqlite.db "SELECT id, label, type, isActive FROM navigation_items WHERE position = 'left' AND isActive = 1 ORDER BY sortOrder;" || echo "未找到左侧导航项"
    echo ""
    echo "右侧导航项:"
    sqlite3 db/sqlite.db "SELECT id, label, type, isActive FROM navigation_items WHERE position = 'right' AND isActive = 1 ORDER BY sortOrder;" || echo "未找到右侧导航项"
else
    echo -e "${YELLOW}   ⚠️  sqlite3 未安装或数据库文件不存在${NC}"
fi
echo ""

# 2. 测试 API 响应
echo -e "${YELLOW}[2/3] 测试导航 API...${NC}"
if command -v node &> /dev/null; then
    cat > /tmp/test-navigation-api.js << 'EOF'
const { db } = require('./db/index');
const { navigationItems } = require('./db/schema');
const { eq, asc } = require('drizzle-orm');

(async () => {
  try {
    const items = await db
      .select()
      .from(navigationItems)
      .where(eq(navigationItems.isActive, true))
      .orderBy(asc(navigationItems.sortOrder));
    
    console.log('激活的导航项数量:', items.length);
    items.forEach(item => {
      console.log(`  - ${item.label} (${item.position}, ${item.type}, 排序: ${item.sortOrder})`);
    });
    
    const leftItems = items.filter(i => i.position === 'left');
    const rightItems = items.filter(i => i.position === 'right');
    
    console.log('\n左侧导航项:', leftItems.length);
    console.log('右侧导航项:', rightItems.length);
  } catch (error) {
    console.error('错误:', error.message);
  }
  process.exit(0);
})();
EOF
    
    cd "$PROJECT_DIR"
    if node /tmp/test-navigation-api.js 2>&1; then
        echo -e "${GREEN}   ✅ API 测试成功${NC}"
    else
        echo -e "${RED}   ❌ API 测试失败${NC}"
    fi
    rm -f /tmp/test-navigation-api.js
else
    echo -e "${YELLOW}   ⚠️  Node.js 未安装，跳过 API 测试${NC}"
fi
echo ""

# 3. 检查组件文件
echo -e "${YELLOW}[3/3] 检查组件文件...${NC}"
if [ -f "components/Navigation.tsx" ]; then
    echo -e "${GREEN}   ✅ Navigation.tsx 存在${NC}"
else
    echo -e "${RED}   ❌ Navigation.tsx 不存在${NC}"
fi

if [ -f "components/Hero.tsx" ]; then
    if grep -q "Navigation" components/Hero.tsx; then
        echo -e "${GREEN}   ✅ Hero.tsx 已导入 Navigation 组件${NC}"
    else
        echo -e "${RED}   ❌ Hero.tsx 未导入 Navigation 组件${NC}"
    fi
else
    echo -e "${RED}   ❌ Hero.tsx 不存在${NC}"
fi
echo ""

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ 检查完成！${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}💡 建议：${NC}"
echo "   1. 确保在后台创建了导航项（/admin/navigation）"
echo "   2. 确保导航项的 isActive 为 true"
echo "   3. 确保导航项的 position 设置为 'left' 或 'right'"
echo "   4. 左侧和右侧各最多显示 2 个导航项"
echo "   5. 清除浏览器缓存后刷新页面"
echo "   6. 查看浏览器控制台的调试信息"

