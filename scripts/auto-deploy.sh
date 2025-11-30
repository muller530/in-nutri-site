#!/bin/bash

# 自动部署脚本 - 在服务器上运行
# 使用方法: bash scripts/auto-deploy.sh
# 或添加到 crontab 实现定时自动部署

set -e

APP_DIR="/var/www/in-nutri-site"
cd $APP_DIR

echo "🚀 开始自动部署..."
echo "时间: $(date)"
echo ""

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 安装新依赖（如果有）
echo "📦 检查依赖更新..."
npm install --production

# 重新构建
echo "🔨 构建项目..."
npm run build

# 重启应用
echo "🔄 重启应用..."
pm2 restart in-nutri-site

# 等待几秒确保启动成功
sleep 3

# 检查应用状态
if pm2 list | grep -q "in-nutri-site.*online"; then
    echo "✅ 部署成功！应用运行正常"
    pm2 logs in-nutri-site --lines 10 --nostream
else
    echo "❌ 部署失败！请检查日志"
    pm2 logs in-nutri-site --lines 50
    exit 1
fi

echo ""
echo "📊 应用状态:"
pm2 status

echo ""
echo "✅ 自动部署完成！"




