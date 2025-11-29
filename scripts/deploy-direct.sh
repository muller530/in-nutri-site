#!/bin/bash

# 直接从本地部署到腾讯云服务器
# 使用方法: bash scripts/deploy-direct.sh

set -e

# 配置服务器信息
SERVER_IP="115.159.92.235"
SERVER_USER="root"
SERVER_DIR="/var/www/in-nutri-site"
LOCAL_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 开始直接部署到腾讯云服务器...${NC}"
echo "服务器: ${SERVER_USER}@${SERVER_IP}"
echo "目标目录: ${SERVER_DIR}"
echo ""

# 检查rsync是否安装
if ! command -v rsync &> /dev/null; then
    echo -e "${YELLOW}⚠️  rsync 未安装，使用 scp 方式...${NC}"
    USE_SCP=true
else
    USE_SCP=false
fi

# 方法1：使用rsync同步文件（推荐，只同步变更的文件）
if [ "$USE_SCP" = false ]; then
    echo -e "${YELLOW}📤 使用 rsync 同步文件到服务器...${NC}"
    
    # 排除不需要同步的文件
    rsync -avz --progress \
        --exclude 'node_modules' \
        --exclude '.next' \
        --exclude '.git' \
        --exclude '*.db' \
        --exclude '*.db-shm' \
        --exclude '*.db-wal' \
        --exclude '.env.local' \
        --exclude '.env.development' \
        --exclude '*.log' \
        --exclude '.DS_Store' \
        -e "ssh -o StrictHostKeyChecking=no" \
        "${LOCAL_DIR}/" "${SERVER_USER}@${SERVER_IP}:${SERVER_DIR}/"
    
    echo -e "${GREEN}✅ 文件同步完成${NC}"
fi

# 方法2：使用scp（如果rsync不可用）
if [ "$USE_SCP" = true ]; then
    echo -e "${YELLOW}📤 使用 scp 上传文件到服务器...${NC}"
    echo -e "${RED}⚠️  注意：scp 较慢，建议安装 rsync${NC}"
    
    # 创建临时tar包
    TEMP_TAR=$(mktemp)
    cd "$LOCAL_DIR"
    tar --exclude='node_modules' \
        --exclude='.next' \
        --exclude='.git' \
        --exclude='*.db' \
        --exclude='*.db-shm' \
        --exclude='*.db-wal' \
        --exclude='.env.local' \
        -czf "$TEMP_TAR" .
    
    # 上传并解压
    scp "$TEMP_TAR" "${SERVER_USER}@${SERVER_IP}:/tmp/in-nutri-site.tar.gz"
    ssh "${SERVER_USER}@${SERVER_IP}" "cd ${SERVER_DIR} && tar -xzf /tmp/in-nutri-site.tar.gz && rm /tmp/in-nutri-site.tar.gz"
    rm "$TEMP_TAR"
    
    echo -e "${GREEN}✅ 文件上传完成${NC}"
fi

echo ""
echo -e "${YELLOW}🔧 在服务器上执行部署操作...${NC}"

# SSH到服务器执行部署命令
ssh "${SERVER_USER}@${SERVER_IP}" << EOF
    set -e
    cd ${SERVER_DIR}
    
    # 加载nvm环境（如果使用nvm安装的Node.js）
    export NVM_DIR="\$HOME/.nvm"
    [ -s "\$NVM_DIR/nvm.sh" ] && . "\$NVM_DIR/nvm.sh"
    
    echo "📦 安装依赖（包括开发依赖，构建需要）..."
    npm install
    
    echo "🔨 构建项目..."
    npm run build
    
    echo "🗄️  初始化数据库..."
    npm run db:push || echo "⚠️  数据库迁移失败，请检查"
    
    echo "🔑 验证和修复管理员账号..."
    npm run db:verify-admin || npm run db:reset-admin || echo "⚠️  管理员账号修复失败，请检查"
    
    echo "🔄 重启应用..."
    pm2 restart in-nutri-site || pm2 start npm --name "in-nutri-site" -- start
    
    echo "⏳ 等待应用启动..."
    sleep 3
    
    echo "📊 检查应用状态..."
    pm2 status
    
    echo "✅ 部署完成！"
EOF

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ 部署完成！${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "🌐 访问网站: http://${SERVER_IP}"
echo "📊 查看日志: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 logs in-nutri-site'"
echo ""

