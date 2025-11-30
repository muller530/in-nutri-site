#!/bin/bash

# 生产环境登录问题诊断脚本

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🔍 生产环境登录问题诊断工具${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# 检测项目目录
if [ -d "/var/www/in-nutri-site" ]; then
    PROJECT_DIR="/var/www/in-nutri-site"
elif [ -d "$(pwd)" ] && [ -f "$(pwd)/package.json" ]; then
    PROJECT_DIR="$(pwd)"
else
    echo -e "${RED}❌ 未找到项目目录，请手动指定${NC}"
    exit 1
fi

cd "$PROJECT_DIR" || exit 1
echo -e "${GREEN}📁 项目目录: $PROJECT_DIR${NC}"
echo ""

# 诊断结果
ISSUES=0
WARNINGS=0

# 1. 检查数据库文件
echo -e "${BLUE}1. 检查数据库文件...${NC}"
if [ -f "db/sqlite.db" ]; then
    echo -e "${GREEN}   ✅ 数据库文件存在${NC}"
    DB_SIZE=$(du -h db/sqlite.db | cut -f1)
    echo -e "   📊 文件大小: $DB_SIZE"
    
    # 检查权限
    DB_PERM=$(stat -c "%a" db/sqlite.db 2>/dev/null || stat -f "%OLp" db/sqlite.db 2>/dev/null || echo "unknown")
    echo -e "   🔒 文件权限: $DB_PERM"
    
    if [ ! -r "db/sqlite.db" ]; then
        echo -e "${RED}   ❌ 数据库文件不可读${NC}"
        ((ISSUES++))
    fi
    
    if [ ! -w "db/sqlite.db" ]; then
        echo -e "${YELLOW}   ⚠️  数据库文件不可写${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}   ❌ 数据库文件不存在${NC}"
    ((ISSUES++))
fi
echo ""

# 2. 检查数据库目录
echo -e "${BLUE}2. 检查数据库目录...${NC}"
if [ -d "db" ]; then
    echo -e "${GREEN}   ✅ 数据库目录存在${NC}"
    DB_DIR_PERM=$(stat -c "%a" db 2>/dev/null || stat -f "%OLp" db 2>/dev/null || echo "unknown")
    echo -e "   🔒 目录权限: $DB_DIR_PERM"
else
    echo -e "${YELLOW}   ⚠️  数据库目录不存在，将创建${NC}"
    mkdir -p db
    ((WARNINGS++))
fi
echo ""

# 3. 检查环境变量
echo -e "${BLUE}3. 检查环境变量...${NC}"
if [ -f ".env.production" ]; then
    echo -e "${GREEN}   ✅ 找到 .env.production 文件${NC}"
    
    if grep -q "DATABASE_URL" .env.production; then
        DB_URL=$(grep "DATABASE_URL" .env.production | cut -d'=' -f2- | tr -d '"' | tr -d "'")
        echo -e "   📝 DATABASE_URL: $DB_URL"
        
        # 检查是否是 SQLite
        if [[ "$DB_URL" == *"sqlite"* ]] || [[ "$DB_URL" == "./db"* ]]; then
            echo -e "${GREEN}   ✅ 使用 SQLite 数据库${NC}"
        else
            echo -e "${YELLOW}   ⚠️  使用云数据库（MySQL/PostgreSQL）${NC}"
        fi
    else
        echo -e "${YELLOW}   ⚠️  DATABASE_URL 未设置${NC}"
        ((WARNINGS++))
    fi
    
    if grep -q "SESSION_SECRET" .env.production; then
        echo -e "${GREEN}   ✅ SESSION_SECRET 已设置${NC}"
    else
        echo -e "${YELLOW}   ⚠️  SESSION_SECRET 未设置（将使用默认值）${NC}"
        ((WARNINGS++))
    fi
    
    if grep -q "NODE_ENV" .env.production; then
        NODE_ENV=$(grep "NODE_ENV" .env.production | cut -d'=' -f2- | tr -d '"' | tr -d "'")
        echo -e "   📝 NODE_ENV: $NODE_ENV"
    else
        echo -e "${YELLOW}   ⚠️  NODE_ENV 未设置${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}   ⚠️  未找到 .env.production 文件${NC}"
    ((WARNINGS++))
fi
echo ""

# 4. 检查数据库连接
echo -e "${BLUE}4. 检查数据库连接...${NC}"
if command -v npm &> /dev/null; then
    echo -e "   🔄 尝试连接数据库..."
    if npm run db:verify-admin > /tmp/db-check.log 2>&1; then
        echo -e "${GREEN}   ✅ 数据库连接正常${NC}"
        
        # 检查管理员账号
        if grep -q "✅ 找到管理员账号" /tmp/db-check.log; then
            echo -e "${GREEN}   ✅ 管理员账号存在${NC}"
        elif grep -q "❌ 未找到管理员账号" /tmp/db-check.log; then
            echo -e "${RED}   ❌ 管理员账号不存在${NC}"
            ((ISSUES++))
        fi
    else
        echo -e "${RED}   ❌ 数据库连接失败${NC}"
        echo -e "${YELLOW}   错误详情:${NC}"
        tail -5 /tmp/db-check.log | sed 's/^/      /'
        ((ISSUES++))
    fi
    rm -f /tmp/db-check.log
else
    echo -e "${YELLOW}   ⚠️  未找到 npm，跳过数据库连接检查${NC}"
    ((WARNINGS++))
fi
echo ""

# 5. 检查应用状态
echo -e "${BLUE}5. 检查应用状态...${NC}"
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "in-nutri-site"; then
        echo -e "${GREEN}   ✅ PM2 应用正在运行${NC}"
        
        # 检查应用状态
        APP_STATUS=$(pm2 jlist | grep -A 5 "in-nutri-site" | grep "pm2_env" -A 10 | grep "status" | cut -d'"' -f4 || echo "unknown")
        echo -e "   📊 应用状态: $APP_STATUS"
        
        # 检查最近的错误日志
        echo -e "   📋 最近的错误日志（如果有）:"
        pm2 logs in-nutri-site --lines 5 --nostream 2>&1 | grep -i "error\|fail" | tail -3 | sed 's/^/      /' || echo "      无错误日志"
    else
        echo -e "${YELLOW}   ⚠️  PM2 应用未运行${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}   ⚠️  未安装 PM2，无法检查应用状态${NC}"
    ((WARNINGS++))
fi
echo ""

# 6. 检查 Node.js 和 npm
echo -e "${BLUE}6. 检查运行环境...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}   ✅ Node.js: $NODE_VERSION${NC}"
else
    echo -e "${RED}   ❌ 未找到 Node.js${NC}"
    ((ISSUES++))
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}   ✅ npm: $NPM_VERSION${NC}"
else
    echo -e "${RED}   ❌ 未找到 npm${NC}"
    ((ISSUES++))
fi
echo ""

# 7. 检查依赖
echo -e "${BLUE}7. 检查项目依赖...${NC}"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}   ✅ node_modules 目录存在${NC}"
    
    # 检查关键依赖
    if [ -d "node_modules/better-sqlite3" ]; then
        echo -e "${GREEN}   ✅ better-sqlite3 已安装${NC}"
    else
        echo -e "${RED}   ❌ better-sqlite3 未安装${NC}"
        ((ISSUES++))
    fi
    
    if [ -d "node_modules/drizzle-orm" ]; then
        echo -e "${GREEN}   ✅ drizzle-orm 已安装${NC}"
    else
        echo -e "${RED}   ❌ drizzle-orm 未安装${NC}"
        ((ISSUES++))
    fi
else
    echo -e "${RED}   ❌ node_modules 目录不存在，请运行 npm install${NC}"
    ((ISSUES++))
fi
echo ""

# 总结
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📊 诊断结果总结${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"

if [ $ISSUES -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ 未发现问题，系统状态正常${NC}"
elif [ $ISSUES -eq 0 ]; then
    echo -e "${YELLOW}⚠️  发现 $WARNINGS 个警告，但不影响基本功能${NC}"
else
    echo -e "${RED}❌ 发现 $ISSUES 个严重问题，$WARNINGS 个警告${NC}"
fi
echo ""

if [ $ISSUES -gt 0 ]; then
    echo -e "${YELLOW}💡 建议修复步骤:${NC}"
    echo -e "   1. 运行修复脚本: ${GREEN}./scripts/fix-production-login.sh${NC}"
    echo -e "   2. 或手动执行: ${GREEN}npm run db:push && npm run db:reset-admin${NC}"
    echo -e "   3. 重启应用: ${GREEN}pm2 restart in-nutri-site${NC}"
    echo ""
fi

echo -e "${BLUE}📋 管理员账号信息:${NC}"
echo -e "   邮箱: ${GREEN}admin@in-nutri.com${NC}"
echo -e "   密码: ${GREEN}inNutriAdmin123${NC}"
echo ""




