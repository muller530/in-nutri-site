#!/bin/bash

# 简化版直接部署脚本 - 使用SSH密钥或密码
# 使用方法: bash scripts/deploy-simple.sh

SERVER_IP="115.159.92.235"
SERVER_USER="root"
SERVER_DIR="/var/www/in-nutri-site"

echo "🚀 直接部署到腾讯云服务器..."
echo ""

# 检查SSH连接
echo "🔗 测试SSH连接..."
if ssh -o ConnectTimeout=5 -o BatchMode=yes "${SERVER_USER}@${SERVER_IP}" exit 2>/dev/null; then
    echo "✅ SSH连接正常"
else
    echo "⚠️  SSH连接需要密码或密钥"
    echo "请确保："
    echo "1. 已配置SSH密钥，或"
    echo "2. 使用密码登录（会提示输入密码）"
    echo ""
fi

# 同步文件并部署
echo "📤 同步文件到服务器..."

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
    ./ "${SERVER_USER}@${SERVER_IP}:${SERVER_DIR}/"

echo ""
echo "🔧 在服务器上部署..."

ssh "${SERVER_USER}@${SERVER_IP}" bash << 'DEPLOY_SCRIPT'
    cd /var/www/in-nutri-site
    npm install --production
    npm run build
    pm2 restart in-nutri-site || pm2 start npm --name "in-nutri-site" -- start
    pm2 status
DEPLOY_SCRIPT

echo ""
echo "✅ 部署完成！"




