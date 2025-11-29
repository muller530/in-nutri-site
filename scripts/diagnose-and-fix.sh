#!/bin/bash

# 数据库问题诊断和自动修复脚本

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  数据库诊断和修复工具${NC}"
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

# 问题计数器
ISSUES_FOUND=0
FIXES_APPLIED=0

# ============================================
# 1. 检查数据库目录
# ============================================
echo -e "${YELLOW}[1/8] 检查数据库目录...${NC}"
if [ ! -d "db" ]; then
    echo -e "${RED}   ❌ 数据库目录不存在${NC}"
    echo -e "${YELLOW}   🔧 创建数据库目录...${NC}"
    mkdir -p db
    chmod 755 db
    echo -e "${GREEN}   ✅ 数据库目录已创建${NC}"
    ((FIXES_APPLIED++))
else
    echo -e "${GREEN}   ✅ 数据库目录存在${NC}"
    chmod 755 db 2>/dev/null || true
fi
echo ""

# ============================================
# 2. 检查数据库文件
# ============================================
echo -e "${YELLOW}[2/8] 检查数据库文件...${NC}"
if [ ! -f "db/sqlite.db" ]; then
    echo -e "${RED}   ❌ 数据库文件不存在${NC}"
    ((ISSUES_FOUND++))
else
    echo -e "${GREEN}   ✅ 数据库文件存在${NC}"
    
    # 检查文件大小
    SIZE=$(stat -f%z db/sqlite.db 2>/dev/null || stat -c%s db/sqlite.db 2>/dev/null || echo "0")
    if [ "$SIZE" -eq 0 ]; then
        echo -e "${RED}   ⚠️  数据库文件大小为 0，可能已损坏${NC}"
        ((ISSUES_FOUND++))
    else
        echo -e "${GREEN}   ✅ 数据库文件大小: $SIZE 字节${NC}"
    fi
    
    # 检查文件权限
    PERMS=$(stat -f%OLp db/sqlite.db 2>/dev/null || stat -c%a db/sqlite.db 2>/dev/null || echo "unknown")
    echo -e "   权限: $PERMS"
    
    if [ ! -r "db/sqlite.db" ] || [ ! -w "db/sqlite.db" ]; then
        echo -e "${RED}   ⚠️  文件权限不正确${NC}"
        echo -e "${YELLOW}   🔧 修复文件权限...${NC}"
        chmod 664 db/sqlite.db
        echo -e "${GREEN}   ✅ 文件权限已修复${NC}"
        ((FIXES_APPLIED++))
    fi
fi
echo ""

# ============================================
# 3. 检查环境变量
# ============================================
echo -e "${YELLOW}[3/8] 检查环境变量...${NC}"
if [ ! -f ".env.production" ]; then
    echo -e "${RED}   ❌ .env.production 文件不存在${NC}"
    echo -e "${YELLOW}   🔧 创建 .env.production 文件...${NC}"
    cat > .env.production << EOF
NODE_ENV=production
DATABASE_URL=./db/sqlite.db
SESSION_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "change-this-secret-key-in-production")
EOF
    echo -e "${GREEN}   ✅ .env.production 文件已创建${NC}"
    ((FIXES_APPLIED++))
else
    echo -e "${GREEN}   ✅ .env.production 文件存在${NC}"
    
    if ! grep -q "DATABASE_URL" .env.production; then
        echo -e "${YELLOW}   ⚠️  DATABASE_URL 未设置${NC}"
        echo -e "${YELLOW}   🔧 添加 DATABASE_URL...${NC}"
        echo "DATABASE_URL=./db/sqlite.db" >> .env.production
        echo -e "${GREEN}   ✅ DATABASE_URL 已添加${NC}"
        ((FIXES_APPLIED++))
    else
        DB_URL=$(grep "DATABASE_URL" .env.production | cut -d'=' -f2 | tr -d ' ' | head -1)
        echo -e "   DATABASE_URL: $DB_URL"
    fi
    
    if ! grep -q "SESSION_SECRET" .env.production; then
        echo -e "${YELLOW}   ⚠️  SESSION_SECRET 未设置${NC}"
        echo -e "${YELLOW}   🔧 添加 SESSION_SECRET...${NC}"
        echo "SESSION_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "change-this-secret-key-in-production")" >> .env.production
        echo -e "${GREEN}   ✅ SESSION_SECRET 已添加${NC}"
        ((FIXES_APPLIED++))
    fi
fi
echo ""

# ============================================
# 4. 检查 Node.js 和 npm
# ============================================
echo -e "${YELLOW}[4/8] 检查 Node.js 环境...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}   ❌ Node.js 未安装${NC}"
    ((ISSUES_FOUND++))
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}   ✅ Node.js: $NODE_VERSION${NC}"
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}   ❌ npm 未安装${NC}"
    ((ISSUES_FOUND++))
else
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}   ✅ npm: $NPM_VERSION${NC}"
fi
echo ""

# ============================================
# 5. 初始化数据库表结构
# ============================================
echo -e "${YELLOW}[5/8] 初始化数据库表结构...${NC}"
if command -v npm &> /dev/null; then
    echo -e "${YELLOW}   🔧 运行 db:push...${NC}"
    if npm run db:push 2>&1 | tee /tmp/db-push.log; then
        echo -e "${GREEN}   ✅ 数据库表结构初始化成功${NC}"
        ((FIXES_APPLIED++))
    else
        echo -e "${RED}   ❌ 数据库表结构初始化失败${NC}"
        echo -e "${YELLOW}   查看错误日志:${NC}"
        tail -20 /tmp/db-push.log
        ((ISSUES_FOUND++))
    fi
else
    echo -e "${RED}   ❌ npm 未安装，无法初始化数据库${NC}"
    ((ISSUES_FOUND++))
fi
echo ""

# ============================================
# 6. 创建/重置管理员账号
# ============================================
echo -e "${YELLOW}[6/8] 创建管理员账号...${NC}"
if command -v npm &> /dev/null; then
    echo -e "${YELLOW}   🔧 重置管理员密码...${NC}"
    if npm run db:reset-admin 2>&1 | tee /tmp/db-reset.log; then
        echo -e "${GREEN}   ✅ 管理员账号已创建/重置${NC}"
        ((FIXES_APPLIED++))
    else
        echo -e "${RED}   ❌ 管理员账号创建失败${NC}"
        echo -e "${YELLOW}   查看错误日志:${NC}"
        tail -20 /tmp/db-reset.log
        ((ISSUES_FOUND++))
    fi
else
    echo -e "${RED}   ❌ npm 未安装，无法创建管理员账号${NC}"
    ((ISSUES_FOUND++))
fi
echo ""

# ============================================
# 7. 测试数据库连接
# ============================================
echo -e "${YELLOW}[7/8] 测试数据库连接...${NC}"
if command -v node &> /dev/null && [ -f "db/sqlite.db" ]; then
    # 创建测试脚本
    cat > /tmp/test-db-connection.js << 'EOF'
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_URL || './db/sqlite.db';
const resolvedPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);

console.log('数据库路径:', resolvedPath);
console.log('文件存在:', fs.existsSync(resolvedPath));

try {
    const db = new Database(resolvedPath);
    const result = db.prepare('SELECT 1 as test').get();
    console.log('✅ 数据库连接成功');
    
    // 检查是否有 members 表
    try {
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='members'").get();
        if (tables) {
            const adminCount = db.prepare("SELECT COUNT(*) as count FROM members WHERE email = 'admin@in-nutri.com'").get();
            console.log('✅ members 表存在');
            console.log('✅ 管理员账号数量:', adminCount.count);
        } else {
            console.log('⚠️  members 表不存在');
        }
    } catch (e) {
        console.log('⚠️  无法检查表结构:', e.message);
    }
    
    db.close();
    process.exit(0);
} catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    process.exit(1);
}
EOF
    
    # 加载环境变量
    if [ -f ".env.production" ]; then
        export $(cat .env.production | grep -v '^#' | xargs)
    fi
    
    if node /tmp/test-db-connection.js 2>&1; then
        echo -e "${GREEN}   ✅ 数据库连接测试成功${NC}"
    else
        echo -e "${RED}   ❌ 数据库连接测试失败${NC}"
        ((ISSUES_FOUND++))
    fi
    rm -f /tmp/test-db-connection.js
else
    echo -e "${YELLOW}   ⚠️  跳过测试（Node.js 未安装或数据库文件不存在）${NC}"
fi
echo ""

# ============================================
# 8. 检查 PM2 应用状态
# ============================================
echo -e "${YELLOW}[8/8] 检查 PM2 应用状态...${NC}"
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "in-nutri-site"; then
        echo -e "${GREEN}   ✅ PM2 应用存在${NC}"
        STATUS=$(pm2 jlist | grep -o '"pm2_env":{"name":"in-nutri-site"[^}]*"status":"[^"]*"' | grep -o '"status":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
        echo -e "   状态: $STATUS"
        
        if [ "$STATUS" != "online" ]; then
            echo -e "${YELLOW}   🔧 重启应用...${NC}"
            pm2 restart in-nutri-site
            sleep 2
            echo -e "${GREEN}   ✅ 应用已重启${NC}"
            ((FIXES_APPLIED++))
        fi
        
        # 显示最近的错误日志
        echo -e "${YELLOW}   最近的错误日志:${NC}"
        pm2 logs in-nutri-site --lines 20 --nostream 2>&1 | grep -i -E "error|database|sqlite|连接失败" | tail -5 || echo "   未找到相关错误"
    else
        echo -e "${YELLOW}   ⚠️  PM2 应用不存在${NC}"
        echo -e "${YELLOW}   💡 提示: 如果应用未运行，请手动启动: pm2 start npm --name 'in-nutri-site' -- start${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠️  PM2 未安装${NC}"
fi
echo ""

# ============================================
# 总结
# ============================================
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  诊断和修复完成${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

if [ $ISSUES_FOUND -eq 0 ] && [ $FIXES_APPLIED -gt 0 ]; then
    echo -e "${GREEN}✅ 所有问题已修复！${NC}"
    echo -e "${GREEN}   修复项数: $FIXES_APPLIED${NC}"
elif [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ 未发现问题${NC}"
else
    echo -e "${YELLOW}⚠️  发现 $ISSUES_FOUND 个问题${NC}"
    if [ $FIXES_APPLIED -gt 0 ]; then
        echo -e "${GREEN}   已修复 $FIXES_APPLIED 个问题${NC}"
    fi
fi
echo ""

echo -e "${GREEN}📋 管理员账号信息：${NC}"
echo -e "   ${GREEN}邮箱:${NC} admin@in-nutri.com"
echo -e "   ${GREEN}密码:${NC} inNutriAdmin123"
echo ""

if [ $ISSUES_FOUND -gt 0 ]; then
    echo -e "${YELLOW}💡 如果问题仍然存在，请：${NC}"
    echo "   1. 查看详细日志: pm2 logs in-nutri-site"
    echo "   2. 检查文件权限: ls -la db/"
    echo "   3. 考虑使用 MySQL 数据库（参考 LIGHTHOUSE_MYSQL_SETUP.md）"
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"

