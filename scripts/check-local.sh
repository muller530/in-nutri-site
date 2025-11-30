#!/bin/bash

# 本地预览检查脚本
# 使用方法: bash scripts/check-local.sh

set -e

echo "🔍 检查本地预览环境..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi
echo "✅ Node.js 版本: $(node -v)"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi
echo "✅ npm 版本: $(npm -v)"

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
else
    echo "✅ 依赖已安装"
fi

# 检查数据库文件
if [ ! -f "db/sqlite.db" ]; then
    echo "⚠️  数据库文件不存在，将初始化..."
    npm run db:push || echo "⚠️  数据库初始化失败"
    npm run db:seed-data || echo "⚠️  数据库种子数据失败"
else
    echo "✅ 数据库文件存在"
fi

# 检查环境变量
if [ ! -f ".env.local" ]; then
    echo "⚠️  未找到 .env.local 文件"
    echo "创建示例 .env.local 文件..."
    cat > .env.local << EOF
NODE_ENV=development
DATABASE_URL=./db/sqlite.db
NEXT_PUBLIC_BASE_URL=http://localhost:3000
SESSION_SECRET=$(openssl rand -hex 32)
EOF
    echo "✅ 已创建 .env.local，请根据需要修改"
else
    echo "✅ .env.local 文件存在"
fi

# 构建测试
echo "🔨 测试构建..."
npm run build

echo ""
echo "✅ 本地环境检查完成！"
echo ""
echo "📝 下一步："
echo "   1. 运行 'npm run dev' 启动开发服务器"
echo "   2. 访问 http://localhost:3000 查看预览"
echo "   3. 检查所有功能是否正常"






