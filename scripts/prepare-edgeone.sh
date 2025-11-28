#!/bin/bash

# EdgeOne 部署准备脚本
# 使用方法: bash scripts/prepare-edgeone.sh

set -e

echo "🚀 准备 EdgeOne 部署..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi

# 清理旧的构建
echo "🧹 清理旧的构建..."
rm -rf .next
rm -rf out

# 安装依赖
echo "📦 安装依赖..."
npm install --production

# 构建项目
echo "🔨 构建项目..."
npm run build

# 检查构建结果
if [ ! -d ".next" ]; then
    echo "❌ 构建失败：.next 目录不存在"
    exit 1
fi

echo "✅ 构建成功！"

# 创建部署包信息
echo ""
echo "📦 部署包信息："
echo "需要上传的文件/目录："
echo "  - .next/ (构建输出)"
echo "  - public/ (静态资源)"
echo "  - package.json"
echo "  - package-lock.json"
if [ -d "db" ]; then
    echo "  - db/ (数据库目录)"
fi

# 计算文件大小
echo ""
echo "📊 文件大小："
du -sh .next 2>/dev/null || echo "  .next: 未找到"
du -sh public 2>/dev/null || echo "  public: 未找到"
du -sh db 2>/dev/null || echo "  db: 未找到"

echo ""
echo "✅ 准备完成！"
echo ""
echo "📝 下一步："
echo "  1. 登录 EdgeOne 控制台：https://console.cloud.tencent.com/edgeone"
echo "  2. 创建站点并选择部署方式"
echo "  3. 配置环境变量（参考 DEPLOY_EDGEONE.md）"
echo "  4. 开始部署"

