#!/bin/bash

# 数据库问题诊断脚本

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🔍 开始诊断数据库问题...${NC}"
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

# 1. 检查数据库文件
echo -e "${YELLOW}1. 检查数据库文件...${NC}"
if [ -f "db/sqlite.db" ]; then
    echo -e "${GREEN}   ✅ 数据库文件存在${NC}"
    ls -la db/sqlite.db
    echo ""
    
    # 检查文件大小
    SIZE=$(stat -f%z db/sqlite.db 2>/dev/null || stat -c%s db/sqlite.db 2>/dev/null || echo "0")
    if [ "$SIZE" -eq 0 ]; then
        echo -e "${RED}   ⚠️  数据库文件大小为 0，可能已损坏${NC}"
    else
        echo -e "${GREEN}   ✅ 数据库文件大小: $SIZE 字节${NC}"
    fi
else
    echo -e "${RED}   ❌ 数据库文件不存在${NC}"
fi
echo ""

# 2. 检查文件权限
echo -e "${YELLOW}2. 检查文件权限...${NC}"
if [ -f "db/sqlite.db" ]; then
    PERMS=$(stat -f%OLp db/sqlite.db 2>/dev/null || stat -c%a db/sqlite.db 2>/dev/null || echo "unknown")
    echo -e "   权限: $PERMS"
    
    # 检查是否可读
    if [ -r "db/sqlite.db" ]; then
        echo -e "${GREEN}   ✅ 文件可读${NC}"
    else
        echo -e "${RED}   ❌ 文件不可读${NC}"
    fi
    
    # 检查是否可写
    if [ -w "db/sqlite.db" ]; then
        echo -e "${GREEN}   ✅ 文件可写${NC}"
    else
        echo -e "${RED}   ❌ 文件不可写${NC}"
    fi
fi
echo ""

# 3. 检查数据库目录权限
echo -e "${YELLOW}3. 检查数据库目录权限...${NC}"
if [ -d "db" ]; then
    echo -e "${GREEN}   ✅ 数据库目录存在${NC}"
    ls -la db/ | head -5
else
    echo -e "${RED}   ❌ 数据库目录不存在${NC}"
fi
echo ""

# 4. 检查环境变量
echo -e "${YELLOW}4. 检查环境变量...${NC}"
if [ -f ".env.production" ]; then
    echo -e "${GREEN}   ✅ 找到 .env.production 文件${NC}"
    if grep -q "DATABASE_URL" .env.production; then
        DB_URL=$(grep "DATABASE_URL" .env.production | cut -d'=' -f2 | tr -d ' ')
        echo -e "   DATABASE_URL: $DB_URL"
    else
        echo -e "${YELLOW}   ⚠️  DATABASE_URL 未设置${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠️  未找到 .env.production 文件${NC}"
fi
echo ""

# 5. 检查 PM2 应用状态
echo -e "${YELLOW}5. 检查 PM2 应用状态...${NC}"
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "in-nutri-site"; then
        echo -e "${GREEN}   ✅ 应用正在运行${NC}"
        pm2 info in-nutri-site | grep -E "status|pid|uptime" || true
    else
        echo -e "${RED}   ❌ 应用未运行${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠️  PM2 未安装${NC}"
fi
echo ""

# 6. 检查应用日志中的数据库错误
echo -e "${YELLOW}6. 检查应用日志中的数据库错误...${NC}"
if command -v pm2 &> /dev/null && pm2 list | grep -q "in-nutri-site"; then
    echo "   最近的错误日志："
    pm2 logs in-nutri-site --lines 50 --nostream 2>&1 | grep -i -E "error|database|sqlite|连接失败" | tail -10 || echo "   未找到相关错误"
else
    echo -e "${YELLOW}   ⚠️  无法检查日志（应用未运行或 PM2 未安装）${NC}"
fi
echo ""

# 7. 尝试测试数据库连接
echo -e "${YELLOW}7. 测试数据库连接...${NC}"
if command -v node &> /dev/null; then
    # 创建一个临时测试脚本
    cat > /tmp/test-db.js << 'EOF'
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_URL || './db/sqlite.db';
const resolvedPath = path.resolve(process.cwd(), dbPath);

console.log('数据库路径:', resolvedPath);
console.log('文件存在:', fs.existsSync(resolvedPath));

try {
    const db = new Database(resolvedPath);
    const result = db.prepare('SELECT 1 as test').get();
    console.log('✅ 数据库连接成功:', result);
    db.close();
} catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    process.exit(1);
}
EOF
    
    cd "$PROJECT_DIR"
    if [ -f ".env.production" ]; then
        export $(cat .env.production | grep -v '^#' | xargs)
    fi
    node /tmp/test-db.js 2>&1 || echo -e "${RED}   ❌ 数据库连接测试失败${NC}"
    rm -f /tmp/test-db.js
else
    echo -e "${YELLOW}   ⚠️  Node.js 未安装，跳过测试${NC}"
fi
echo ""

# 8. 检查运行用户
echo -e "${YELLOW}8. 检查运行用户...${NC}"
echo "   当前用户: $(whoami)"
if command -v pm2 &> /dev/null && pm2 list | grep -q "in-nutri-site"; then
    PM2_USER=$(pm2 info in-nutri-site 2>/dev/null | grep "username" | awk '{print $4}' || echo "unknown")
    echo "   PM2 运行用户: $PM2_USER"
fi
echo ""

echo -e "${GREEN}✅ 诊断完成！${NC}"
echo ""
echo -e "${YELLOW}💡 建议：${NC}"
echo "   1. 如果数据库文件不存在，运行: npm run db:push"
echo "   2. 如果权限有问题，运行: chmod 664 db/sqlite.db"
echo "   3. 如果仍有问题，考虑使用 MySQL/PostgreSQL 数据库"
echo "   4. 查看详细日志: pm2 logs in-nutri-site"




