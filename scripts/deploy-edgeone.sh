#!/bin/bash

# EdgeOne 部署准备脚本
# 此脚本用于准备项目部署到腾讯 EdgeOne

set -e

echo "🚀 开始准备 EdgeOne 部署..."

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查 Node.js 版本
echo -e "${YELLOW}检查 Node.js 版本...${NC}"
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}错误: 需要 Node.js 18 或更高版本${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Node.js 版本: $(node -v)${NC}"

# 检查依赖
echo -e "${YELLOW}检查依赖...${NC}"
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}安装依赖...${NC}"
  npm install
fi
echo -e "${GREEN}✓ 依赖已安装${NC}"

# 检查数据库
echo -e "${YELLOW}检查数据库...${NC}"
if [ ! -f "db/sqlite.db" ]; then
  echo -e "${YELLOW}初始化数据库...${NC}"
  npm run db:push
  npm run db:seed-data
fi
echo -e "${GREEN}✓ 数据库已准备${NC}"

# 清理旧的构建
echo -e "${YELLOW}清理旧的构建...${NC}"
rm -rf .next
echo -e "${GREEN}✓ 清理完成${NC}"

# 构建项目
echo -e "${YELLOW}构建项目...${NC}"
npm run build

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ 构建成功${NC}"
else
  echo -e "${RED}✗ 构建失败${NC}"
  exit 1
fi

# 检查构建输出
echo -e "${YELLOW}检查构建输出...${NC}"
if [ ! -d ".next" ]; then
  echo -e "${RED}✗ 构建输出目录不存在${NC}"
  exit 1
fi
echo -e "${GREEN}✓ 构建输出目录存在${NC}"

# 检查必要文件
echo -e "${YELLOW}检查必要文件...${NC}"
REQUIRED_FILES=(
  "package.json"
  "next.config.js"
  "tsconfig.json"
  "db/schema.ts"
  "db/index.ts"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo -e "${RED}✗ 缺少必要文件: $file${NC}"
    exit 1
  fi
done
echo -e "${GREEN}✓ 所有必要文件存在${NC}"

# 检查上传目录
echo -e "${YELLOW}检查上传目录...${NC}"
if [ ! -d "public/uploads" ]; then
  mkdir -p public/uploads/{products,videos,reports}
  echo -e "${GREEN}✓ 创建上传目录${NC}"
else
  echo -e "${GREEN}✓ 上传目录存在${NC}"
fi

# 生成部署清单
echo -e "${YELLOW}生成部署清单...${NC}"
cat > EDGEONE_DEPLOY_FILES.txt << EOF
# EdgeOne 部署文件清单

## 必需文件/目录
.next/
public/
app/
components/
lib/
db/
package.json
package-lock.json
next.config.js
tsconfig.json
drizzle.config.ts

## 可选文件
README.md
EDGEONE_DEPLOY_COMPLETE.md

## 环境变量配置
在 EdgeOne 控制台设置以下环境变量：
- NODE_ENV=production
- DATABASE_URL=./db/sqlite.db
- EDGEONE_DEPLOY=true
- SESSION_SECRET=<生成随机字符串>
- NEXT_PUBLIC_BASE_URL=https://your-site.edgeone.com

## 构建配置
- 构建命令: npm run build
- 输出目录: .next
- Node.js 版本: 18.x 或 20.x
- 安装命令: npm install --production

## 启动配置
- 启动命令: npm start
- 端口: 3000
EOF

echo -e "${GREEN}✓ 部署清单已生成: EDGEONE_DEPLOY_FILES.txt${NC}"

# 总结
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ EdgeOne 部署准备完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "下一步："
echo "1. 访问腾讯云 EdgeOne 控制台"
echo "2. 创建站点并选择部署方式："
echo "   - GitHub 仓库导入（推荐）"
echo "   - 文件上传"
echo "3. 配置环境变量（参考 EDGEONE_DEPLOY_FILES.txt）"
echo "4. 开始部署"
echo ""
echo "详细说明请查看: EDGEONE_DEPLOY_COMPLETE.md"

