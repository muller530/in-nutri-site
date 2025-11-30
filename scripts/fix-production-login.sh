#!/bin/bash

# 生产环境登录问题快速修复脚本

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 开始修复生产环境登录问题...${NC}"

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

# 1. 确保数据库目录存在
echo -e "${YELLOW}📦 检查数据库目录...${NC}"
mkdir -p db
chmod 755 db

# 2. 检查数据库文件
if [ -f "db/sqlite.db" ]; then
    echo -e "${GREEN}✅ 数据库文件已存在${NC}"
    chmod 664 db/sqlite.db 2>/dev/null || true
else
    echo -e "${YELLOW}⚠️  数据库文件不存在，将创建${NC}"
fi

# 3. 初始化数据库
echo -e "${YELLOW}📦 初始化数据库表结构...${NC}"
npm run db:push || {
    echo -e "${RED}❌ 数据库初始化失败${NC}"
    exit 1
}

# 4. 重置管理员密码
echo -e "${YELLOW}🔑 重置管理员密码...${NC}"
npm run db:reset-admin || {
    echo -e "${RED}❌ 管理员密码重置失败${NC}"
    exit 1
}

# 5. 检查数据库文件权限
echo -e "${YELLOW}🔒 检查文件权限...${NC}"
if [ -f "db/sqlite.db" ]; then
    chmod 664 db/sqlite.db
    # 尝试设置所有者（如果可能）
    if command -v chown &> /dev/null; then
        # 检测运行用户
        if [ -n "$SUDO_USER" ]; then
            chown "$SUDO_USER:$SUDO_USER" db/sqlite.db 2>/dev/null || true
        fi
    fi
fi

# 6. 检查环境变量
echo -e "${YELLOW}🔍 检查环境变量...${NC}"
if [ -f ".env.production" ]; then
    echo -e "${GREEN}✅ 找到 .env.production 文件${NC}"
    if ! grep -q "DATABASE_URL" .env.production; then
        echo -e "${YELLOW}⚠️  DATABASE_URL 未设置，添加默认值...${NC}"
        echo "DATABASE_URL=./db/sqlite.db" >> .env.production
    fi
else
    echo -e "${YELLOW}⚠️  未找到 .env.production 文件${NC}"
fi

# 7. 重启应用（如果使用 PM2）
if command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}🔄 重启 PM2 应用...${NC}"
    if pm2 list | grep -q "in-nutri-site"; then
        pm2 restart in-nutri-site
        echo -e "${GREEN}✅ 应用已重启${NC}"
        
        # 等待一下让应用启动
        sleep 2
        
        # 显示日志
        echo -e "${YELLOW}📋 查看最新日志（最后20行）...${NC}"
        pm2 logs in-nutri-site --lines 20 --nostream || true
    else
        echo -e "${YELLOW}⚠️  未找到 PM2 应用 'in-nutri-site'${NC}"
        echo -e "${YELLOW}   如果应用正在运行，请手动重启${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  未安装 PM2，请手动重启应用${NC}"
fi

echo ""
echo -e "${GREEN}✅ 修复完成！${NC}"
echo ""
echo -e "${GREEN}📋 管理员账号信息：${NC}"
echo -e "   ${GREEN}邮箱:${NC} admin@in-nutri.com"
echo -e "   ${GREEN}密码:${NC} inNutriAdmin123"
echo ""
echo -e "${YELLOW}💡 提示：${NC}"
echo -e "   1. 请使用上述账号登录后台"
echo -e "   2. 登录后建议立即修改密码"
echo -e "   3. 如果仍有问题，请查看应用日志：${GREEN}pm2 logs in-nutri-site${NC}"




