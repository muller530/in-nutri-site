#!/bin/bash

# 腾讯云 Lighthouse 完整部署脚本（包含数据库）
# 使用方法: bash scripts/deploy-lighthouse-complete.sh [服务器IP] [SSH用户]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 腾讯云 Lighthouse 完整部署脚本${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# 检查参数
SERVER_IP=${1:-""}
SSH_USER=${2:-"root"}

if [ -z "$SERVER_IP" ]; then
    echo -e "${RED}❌ 请提供服务器IP地址${NC}"
    echo "使用方法: bash scripts/deploy-lighthouse-complete.sh <服务器IP> [SSH用户]"
    echo "示例: bash scripts/deploy-lighthouse-complete.sh 123.456.789.0 root"
    exit 1
fi

echo -e "${GREEN}📋 部署配置:${NC}"
echo "  服务器IP: $SERVER_IP"
echo "  SSH用户: $SSH_USER"
echo ""

# 第一步：备份本地数据库
echo -e "${YELLOW}📦 第一步：备份本地数据库...${NC}"
if [ -f "./db/sqlite.db" ]; then
    bash scripts/backup-database.sh
    echo -e "${GREEN}✅ 数据库备份完成${NC}"
else
    echo -e "${YELLOW}⚠️  本地数据库文件不存在，跳过备份${NC}"
fi
echo ""

# 第二步：提交所有更改到 Git
echo -e "${YELLOW}📝 第二步：提交代码到 Git...${NC}"
read -p "是否提交所有更改到 Git? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add -A
    read -p "请输入提交信息 (默认: Deploy to Lighthouse): " COMMIT_MSG
    COMMIT_MSG=${COMMIT_MSG:-"Deploy to Lighthouse"}
    git commit -m "$COMMIT_MSG" || echo "⚠️  没有需要提交的更改"
    echo -e "${GREEN}✅ 代码已提交${NC}"
else
    echo -e "${YELLOW}⚠️  跳过 Git 提交${NC}"
fi
echo ""

# 第三步：推送到远程仓库
echo -e "${YELLOW}📤 第三步：推送到远程仓库...${NC}"
read -p "是否推送到远程仓库? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin main || git push origin master || echo -e "${YELLOW}⚠️  推送失败，请检查远程仓库配置${NC}"
    echo -e "${GREEN}✅ 代码已推送${NC}"
else
    echo -e "${YELLOW}⚠️  跳过 Git 推送${NC}"
fi
echo ""

# 第四步：连接到服务器并部署
echo -e "${YELLOW}🔌 第四步：连接到服务器...${NC}"
echo -e "${BLUE}正在连接到 $SSH_USER@$SERVER_IP...${NC}"
echo ""

# 创建临时部署脚本
DEPLOY_SCRIPT=$(cat <<'DEPLOY_EOF'
#!/bin/bash
set -e

APP_DIR="/var/www/in-nutri-site"
BACKUP_DIR="$APP_DIR/backups"

echo "🚀 开始在服务器上部署..."

# 检查应用目录
if [ ! -d "$APP_DIR" ]; then
    echo "📁 创建应用目录..."
    mkdir -p $APP_DIR
fi

cd $APP_DIR

# 备份现有数据库（如果存在）
if [ -f "$APP_DIR/db/sqlite.db" ]; then
    echo "📦 备份现有数据库..."
    mkdir -p $BACKUP_DIR
    cp "$APP_DIR/db/sqlite.db" "$BACKUP_DIR/sqlite_backup_$(date +%Y%m%d_%H%M%S).db"
fi

# 拉取最新代码
echo "📥 拉取最新代码..."
if [ -d ".git" ]; then
    git pull origin main || git pull origin master
else
    echo "⚠️  未找到 Git 仓库，请先克隆项目"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm install --production

# 检查环境变量
if [ ! -f .env.production ]; then
    echo "⚠️  未找到 .env.production 文件"
    echo "请创建环境变量文件"
fi

# 构建项目
echo "🔨 构建项目..."
npm run build

# 初始化数据库
echo "🗄️  初始化数据库..."
npm run db:push || echo "⚠️  数据库迁移失败"
npm run db:seed-data || echo "⚠️  数据库种子数据失败"

# 重启应用
echo "🔄 重启应用..."
pm2 stop in-nutri-site 2>/dev/null || true
pm2 delete in-nutri-site 2>/dev/null || true
pm2 start npm --name "in-nutri-site" -- start
pm2 save

echo "✅ 部署完成！"
echo "📊 查看状态: pm2 status"
echo "📝 查看日志: pm2 logs in-nutri-site"
DEPLOY_EOF
)

# 将脚本传输到服务器并执行
echo -e "${BLUE}📤 上传部署脚本到服务器...${NC}"
echo "$DEPLOY_SCRIPT" | ssh "$SSH_USER@$SERVER_IP" 'cat > /tmp/deploy.sh && chmod +x /tmp/deploy.sh'

echo -e "${BLUE}▶️  执行部署脚本...${NC}"
ssh "$SSH_USER@$SERVER_IP" 'bash /tmp/deploy.sh'

# 清理临时文件
ssh "$SSH_USER@$SERVER_IP" 'rm -f /tmp/deploy.sh'

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ 部署完成！${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "🌐 访问网站: http://$SERVER_IP"
echo ""
echo "📊 查看应用状态:"
echo "   ssh $SSH_USER@$SERVER_IP 'pm2 status'"
echo ""
echo "📝 查看应用日志:"
echo "   ssh $SSH_USER@$SERVER_IP 'pm2 logs in-nutri-site'"
echo ""

