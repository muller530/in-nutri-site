#!/bin/bash

# 腾讯云 Lighthouse 一键部署脚本
# 使用方法: bash scripts/setup-lighthouse.sh

set -e

echo "🚀 开始腾讯云 Lighthouse 一键部署..."
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ 请使用 root 用户运行此脚本${NC}"
    exit 1
fi

# 检测操作系统
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo -e "${RED}❌ 无法检测操作系统${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 检测到操作系统: $OS${NC}"
echo ""

# 第一步：更新系统
echo -e "${YELLOW}📦 第一步：更新系统...${NC}"
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    apt update && apt upgrade -y
elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
    yum update -y
fi
echo -e "${GREEN}✅ 系统更新完成${NC}"
echo ""

# 第二步：安装 Node.js 18
echo -e "${YELLOW}📦 第二步：安装 Node.js 18...${NC}"
if ! command -v node &> /dev/null; then
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt install -y nodejs
    elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
        curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
        yum install -y nodejs
    fi
    echo -e "${GREEN}✅ Node.js 安装完成${NC}"
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js 已安装: $NODE_VERSION${NC}"
fi
echo "Node.js 版本: $(node -v)"
echo "npm 版本: $(npm -v)"
echo ""

# 第三步：安装 Git
echo -e "${YELLOW}📦 第三步：安装 Git...${NC}"
if ! command -v git &> /dev/null; then
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        apt install -y git
    elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
        yum install -y git
    fi
    echo -e "${GREEN}✅ Git 安装完成${NC}"
else
    echo -e "${GREEN}✅ Git 已安装: $(git --version)${NC}"
fi
echo ""

# 第四步：安装 PM2
echo -e "${YELLOW}📦 第四步：安装 PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo -e "${GREEN}✅ PM2 安装完成${NC}"
else
    echo -e "${GREEN}✅ PM2 已安装: $(pm2 --version)${NC}"
fi
echo ""

# 第五步：安装 Nginx
echo -e "${YELLOW}📦 第五步：安装 Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        apt install -y nginx
    elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
        yum install -y nginx
    fi
    systemctl start nginx
    systemctl enable nginx
    echo -e "${GREEN}✅ Nginx 安装完成${NC}"
else
    echo -e "${GREEN}✅ Nginx 已安装${NC}"
    systemctl start nginx 2>/dev/null || true
    systemctl enable nginx 2>/dev/null || true
fi
echo ""

# 第六步：配置防火墙
echo -e "${YELLOW}📦 第六步：配置防火墙...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    echo -e "${GREEN}✅ UFW 防火墙配置完成${NC}"
elif command -v firewall-cmd &> /dev/null; then
    firewall-cmd --permanent --add-service=ssh
    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https
    firewall-cmd --reload
    echo -e "${GREEN}✅ Firewalld 防火墙配置完成${NC}"
else
    echo -e "${YELLOW}⚠️  未检测到防火墙，请手动配置${NC}"
fi
echo ""

# 第七步：创建应用目录
echo -e "${YELLOW}📦 第七步：创建应用目录...${NC}"
APP_DIR="/var/www/in-nutri-site"
mkdir -p $APP_DIR
cd $APP_DIR
echo -e "${GREEN}✅ 应用目录已创建: $APP_DIR${NC}"
echo ""

# 第八步：克隆项目
echo -e "${YELLOW}📦 第八步：克隆项目...${NC}"
if [ -d ".git" ]; then
    echo -e "${YELLOW}⚠️  项目已存在，跳过克隆${NC}"
    echo "如需更新，请运行: cd $APP_DIR && git pull"
else
    read -p "请输入Git仓库地址 (默认: https://github.com/muller530/in-nutri-site.git): " GIT_REPO
    GIT_REPO=${GIT_REPO:-https://github.com/muller530/in-nutri-site.git}
    git clone $GIT_REPO .
    echo -e "${GREEN}✅ 项目克隆完成${NC}"
fi
echo ""

# 第九步：安装依赖
echo -e "${YELLOW}📦 第九步：安装项目依赖...${NC}"
npm install --production
echo -e "${GREEN}✅ 依赖安装完成${NC}"
echo ""

# 第十步：配置环境变量
echo -e "${YELLOW}📦 第十步：配置环境变量...${NC}"
if [ ! -f .env.production ]; then
    read -p "请输入您的域名 (例如: example.com): " DOMAIN
    DOMAIN=${DOMAIN:-your-domain.com}
    
    SESSION_SECRET=$(openssl rand -hex 32)
    
    cat > .env.production << EOF
NODE_ENV=production
DATABASE_URL=./db/sqlite.db
NEXT_PUBLIC_BASE_URL=https://${DOMAIN}
SESSION_SECRET=${SESSION_SECRET}

# 火山引擎AI配置（可选，如需使用AI聊天功能请填写）
AI_PROVIDER=volcano
AI_API_KEY=a4bff291-99f3-40b6-84cf-55ff7fd19e44
VOLCANO_ENDPOINT=https://ark.cn-beijing.volces.com/api/v3/chat/completions
VOLCANO_MODEL=doubao-pro-4k
EOF
    
    echo -e "${GREEN}✅ 环境变量文件已创建${NC}"
    echo -e "${YELLOW}📝 如需修改配置，请编辑: $APP_DIR/.env.production${NC}"
else
    echo -e "${YELLOW}⚠️  .env.production 已存在，跳过创建${NC}"
fi
echo ""

# 第十一步：构建项目
echo -e "${YELLOW}📦 第十一步：构建项目...${NC}"
npm run build
echo -e "${GREEN}✅ 项目构建完成${NC}"
echo ""

# 第十二步：初始化数据库
echo -e "${YELLOW}📦 第十二步：初始化数据库...${NC}"
npm run db:push || echo -e "${YELLOW}⚠️  数据库迁移失败，请检查${NC}"
npm run db:seed-data || echo -e "${YELLOW}⚠️  数据库种子数据失败，请检查${NC}"
echo -e "${GREEN}✅ 数据库初始化完成${NC}"
echo ""

# 第十三步：配置 PM2
echo -e "${YELLOW}📦 第十三步：配置 PM2...${NC}"
pm2 stop in-nutri-site 2>/dev/null || true
pm2 delete in-nutri-site 2>/dev/null || true
pm2 start npm --name "in-nutri-site" -- start
pm2 save

# 设置开机自启
PM2_STARTUP=$(pm2 startup | grep -o "sudo.*")
if [ ! -z "$PM2_STARTUP" ]; then
    echo -e "${YELLOW}请运行以下命令设置PM2开机自启:${NC}"
    echo "$PM2_STARTUP"
fi

echo -e "${GREEN}✅ PM2 配置完成${NC}"
echo ""

# 第十四步：配置 Nginx
echo -e "${YELLOW}📦 第十四步：配置 Nginx...${NC}"
read -p "请输入您的域名 (用于Nginx配置): " NGINX_DOMAIN
NGINX_DOMAIN=${NGINX_DOMAIN:-your-domain.com}

if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    NGINX_CONF="/etc/nginx/sites-available/in-nutri-site"
    cat > $NGINX_CONF << EOF
server {
    listen 80;
    server_name ${NGINX_DOMAIN} www.${NGINX_DOMAIN};

    access_log /var/log/nginx/in-nutri-access.log;
    error_log /var/log/nginx/in-nutri-error.log;

    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }

    location /uploads {
        alias ${APP_DIR}/public/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF
    
    ln -sf $NGINX_CONF /etc/nginx/sites-enabled/in-nutri-site
    nginx -t && systemctl reload nginx
    echo -e "${GREEN}✅ Nginx 配置完成${NC}"
    
elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
    NGINX_CONF="/etc/nginx/conf.d/in-nutri-site.conf"
    cat > $NGINX_CONF << EOF
server {
    listen 80;
    server_name ${NGINX_DOMAIN} www.${NGINX_DOMAIN};

    access_log /var/log/nginx/in-nutri-access.log;
    error_log /var/log/nginx/in-nutri-error.log;

    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }

    location /uploads {
        alias ${APP_DIR}/public/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF
    
    nginx -t && systemctl reload nginx
    echo -e "${GREEN}✅ Nginx 配置完成${NC}"
fi
echo ""

# 完成
echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ 部署完成！${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "📊 查看应用状态: pm2 status"
echo "📝 查看应用日志: pm2 logs in-nutri-site"
echo "🔄 重启应用: pm2 restart in-nutri-site"
echo ""
echo "🌐 访问网站: http://${NGINX_DOMAIN}"
echo ""
echo "🔒 下一步：配置 SSL 证书（HTTPS）"
echo "运行: certbot --nginx -d ${NGINX_DOMAIN} -d www.${NGINX_DOMAIN}"
echo ""
echo "📚 详细文档请查看: LIGHTHOUSE_DEPLOY.md"
echo ""

