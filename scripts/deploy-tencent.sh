#!/bin/bash

# 腾讯云轻量应用服务器部署脚本
# 使用方法: bash scripts/deploy-tencent.sh

set -e

echo "🚀 开始部署到腾讯云..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 18+"
    exit 1
fi

# 检查 PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 安装 PM2..."
    npm install -g pm2
fi

# 安装依赖
echo "📦 安装依赖..."
npm install --production

# 检查环境变量
if [ ! -f .env.production ]; then
    echo "⚠️  未找到 .env.production 文件，创建示例文件..."
    cat > .env.production << EOF
NODE_ENV=production
DATABASE_URL=./db/sqlite.db
NEXT_PUBLIC_BASE_URL=https://your-domain.com
SESSION_SECRET=$(openssl rand -hex 32)
EOF
    echo "✅ 已创建 .env.production，请编辑后重新运行"
    exit 1
fi

# 构建项目
echo "🔨 构建项目..."
npm run build

# 初始化数据库
echo "🗄️  初始化数据库..."
npm run db:push || echo "⚠️  数据库迁移失败，请检查"
npm run db:seed-data || echo "⚠️  数据库种子数据失败，请检查"

# 停止旧进程
echo "🛑 停止旧进程..."
pm2 stop in-nutri-site 2>/dev/null || true
pm2 delete in-nutri-site 2>/dev/null || true

# 启动应用
echo "▶️  启动应用..."
pm2 start npm --name "in-nutri-site" -- start

# 保存 PM2 配置
pm2 save

echo "✅ 部署完成！"
echo "📊 查看状态: pm2 status"
echo "📝 查看日志: pm2 logs in-nutri-site"
echo "🔄 重启应用: pm2 restart in-nutri-site"



