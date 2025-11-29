# 🚀 快速部署指南（一键脚本）

## 使用方法

### 1. 连接服务器

```bash
ssh root@your-server-ip
```

### 2. 下载并运行一键部署脚本

```bash
# 方法1：如果项目已在服务器上
cd /var/www/in-nutri-site
bash scripts/setup-lighthouse.sh

# 方法2：直接从GitHub下载脚本运行
curl -o setup-lighthouse.sh https://raw.githubusercontent.com/muller530/in-nutri-site/main/scripts/setup-lighthouse.sh
bash setup-lighthouse.sh
```

### 3. 按照提示操作

脚本会自动：
- ✅ 安装 Node.js 18
- ✅ 安装 Git、PM2、Nginx
- ✅ 配置防火墙
- ✅ 克隆项目
- ✅ 安装依赖
- ✅ 配置环境变量
- ✅ 构建项目
- ✅ 初始化数据库
- ✅ 启动应用
- ✅ 配置 Nginx

### 4. 配置 SSL 证书（可选但推荐）

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx  # Ubuntu
# 或
yum install -y certbot python3-certbot-nginx  # CentOS

# 获取证书（替换为您的域名）
certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 脚本会询问的信息

1. **Git仓库地址**（默认使用项目地址）
2. **域名**（用于环境变量和Nginx配置）

## 部署后检查

```bash
# 检查应用状态
pm2 status

# 检查应用日志
pm2 logs in-nutri-site

# 检查Nginx状态
systemctl status nginx

# 测试访问
curl http://localhost:3000
```

## 常见问题

### 问题1：脚本执行失败

**解决：**
- 确保使用 root 用户运行
- 检查网络连接
- 查看错误信息并手动执行失败的步骤

### 问题2：无法访问网站

**检查：**
```bash
# 检查PM2
pm2 status

# 检查端口
netstat -tlnp | grep 3000

# 检查Nginx
systemctl status nginx
nginx -t
```

### 问题3：数据库初始化失败

**解决：**
```bash
cd /var/www/in-nutri-site
npm run db:push
npm run db:seed-data
```

## 更新应用

```bash
cd /var/www/in-nutri-site
git pull
npm install --production
npm run build
pm2 restart in-nutri-site
```

## 需要帮助？

查看详细文档：`LIGHTHOUSE_DEPLOY.md`

