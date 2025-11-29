# 腾讯云 Lighthouse 部署完整指南

## 📋 部署前准备

### 1. 服务器信息
- ✅ 已购买腾讯云 Lighthouse
- 📝 记录服务器IP地址
- 📝 记录SSH登录密码或密钥

### 2. 域名准备（可选但推荐）
- 已购买域名
- 域名已解析到服务器IP

## 🚀 第一步：连接服务器

### 1. 通过SSH连接

```bash
# 使用密码登录
ssh root@your-server-ip

# 或使用密钥登录
ssh -i your-key.pem root@your-server-ip
```

### 2. 更新系统

**Ubuntu/Debian:**
```bash
apt update && apt upgrade -y
```

**CentOS:**
```bash
yum update -y
```

## 🔧 第二步：安装基础环境

### 1. 安装 Node.js 18.x

**Ubuntu/Debian:**
```bash
# 安装 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 验证安装
node -v  # 应该显示 v18.x.x
npm -v
```

**CentOS:**
```bash
# 安装 Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# 验证安装
node -v
npm -v
```

### 2. 安装 Git

```bash
# Ubuntu/Debian
apt install -y git

# CentOS
yum install -y git
```

### 3. 安装 PM2（进程管理器）

```bash
npm install -g pm2

# 验证安装
pm2 --version
```

### 4. 安装 Nginx（反向代理）

**Ubuntu/Debian:**
```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

**CentOS:**
```bash
yum install -y nginx
systemctl start nginx
systemctl enable nginx
```

### 5. 配置防火墙

```bash
# Ubuntu (使用 ufw)
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw enable

# CentOS (使用 firewalld)
firewall-cmd --permanent --add-service=ssh
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
```

## 📦 第三步：部署应用代码

### 1. 创建应用目录

```bash
mkdir -p /var/www/in-nutri-site
cd /var/www/in-nutri-site
```

### 2. 克隆项目

```bash
# 克隆您的项目
git clone https://github.com/muller530/in-nutri-site.git .

# 如果仓库是私有的，可能需要配置SSH密钥或使用token
```

### 3. 安装项目依赖

```bash
cd /var/www/in-nutri-site
npm install --production
```

### 4. 配置环境变量

```bash
# 创建生产环境配置文件
nano .env.production
```

添加以下内容（根据实际情况修改）：

```env
# 基础配置
NODE_ENV=production
DATABASE_URL=./db/sqlite.db
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# 会话密钥（生成随机密钥）
SESSION_SECRET=your-random-secret-key-here

# 火山引擎AI配置（如果使用）
AI_PROVIDER=volcano
AI_API_KEY=your-volcano-api-key
VOLCANO_ENDPOINT=https://ark.cn-beijing.volces.com/api/v3/chat/completions
VOLCANO_MODEL=doubao-pro-4k

# 其他配置
FORCE_SECURE_COOKIE=true
```

**生成SESSION_SECRET：**
```bash
openssl rand -hex 32
```

### 5. 构建项目

```bash
npm run build
```

### 6. 初始化数据库

```bash
# 创建数据库表
npm run db:push

# 初始化种子数据（包括管理员账号）
npm run db:seed-data
```

**重要：** 记录管理员账号信息（通常在种子数据中定义）

## 🎯 第四步：配置 PM2 进程管理

### 1. 启动应用

```bash
cd /var/www/in-nutri-site

# 使用PM2启动应用
pm2 start npm --name "in-nutri-site" -- start

# 查看状态
pm2 status

# 查看日志
pm2 logs in-nutri-site
```

### 2. 设置开机自启

```bash
# 生成启动脚本
pm2 startup

# 按照提示执行生成的命令（通常是 sudo env PATH=...）

# 保存当前进程列表
pm2 save
```

### 3. PM2 常用命令

```bash
pm2 status              # 查看状态
pm2 logs in-nutri-site  # 查看日志
pm2 restart in-nutri-site  # 重启应用
pm2 stop in-nutri-site     # 停止应用
pm2 delete in-nutri-site   # 删除应用
```

## 🌐 第五步：配置 Nginx 反向代理

### 1. 创建 Nginx 配置文件

**Ubuntu/Debian:**
```bash
nano /etc/nginx/sites-available/in-nutri-site
```

**CentOS:**
```bash
nano /etc/nginx/conf.d/in-nutri-site.conf
```

### 2. 添加配置内容

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # 如果还没有域名，可以使用服务器IP
    # server_name _;

    # 日志
    access_log /var/log/nginx/in-nutri-access.log;
    error_log /var/log/nginx/in-nutri-error.log;

    # 上传文件大小限制
    client_max_body_size 100M;

    # 反向代理到 Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态文件缓存
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }

    # 上传文件目录（如果需要直接访问）
    location /uploads {
        alias /var/www/in-nutri-site/public/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. 启用配置（Ubuntu/Debian）

```bash
# 创建符号链接
ln -s /etc/nginx/sites-available/in-nutri-site /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重新加载Nginx
systemctl reload nginx
```

**CentOS 不需要创建符号链接，直接测试和重载：**
```bash
nginx -t
systemctl reload nginx
```

### 4. 测试访问

在浏览器访问：
- `http://your-server-ip` 或
- `http://your-domain.com`

应该能看到网站首页。

## 🔒 第六步：配置 SSL 证书（HTTPS）

### 1. 安装 Certbot

**Ubuntu/Debian:**
```bash
apt install -y certbot python3-certbot-nginx
```

**CentOS:**
```bash
yum install -y certbot python3-certbot-nginx
```

### 2. 获取 SSL 证书

```bash
# 如果有域名
certbot --nginx -d your-domain.com -d www.your-domain.com

# 按照提示操作：
# 1. 输入邮箱地址
# 2. 同意服务条款
# 3. 选择是否重定向HTTP到HTTPS（推荐选择2，自动重定向）
```

### 3. 自动续期

```bash
# 测试续期
certbot renew --dry-run

# 证书会自动续期，但可以手动设置定时任务
crontab -e

# 添加以下行（每月1号凌晨2点检查续期）
0 2 1 * * certbot renew --quiet
```

## ✅ 第七步：验证部署

### 1. 检查服务状态

```bash
# 检查PM2
pm2 status

# 检查Nginx
systemctl status nginx

# 检查端口
netstat -tlnp | grep -E '3000|80|443'
```

### 2. 测试功能

访问网站并测试：
- ✅ 首页是否正常显示
- ✅ 产品页面是否正常
- ✅ 后台登录是否正常
- ✅ AI聊天功能是否正常
- ✅ 文件上传是否正常

### 3. 查看日志

```bash
# 应用日志
pm2 logs in-nutri-site

# Nginx日志
tail -f /var/log/nginx/in-nutri-access.log
tail -f /var/log/nginx/in-nutri-error.log
```

## 🔄 第八步：更新应用

当代码有更新时：

```bash
cd /var/www/in-nutri-site

# 拉取最新代码
git pull

# 安装新依赖（如果有）
npm install --production

# 重新构建
npm run build

# 重启应用
pm2 restart in-nutri-site

# 查看日志确认无错误
pm2 logs in-nutri-site --lines 50
```

## 🛠️ 故障排查

### 问题1：无法访问网站

**检查：**
```bash
# 检查PM2状态
pm2 status

# 检查应用日志
pm2 logs in-nutri-site

# 检查Nginx状态
systemctl status nginx

# 检查端口
netstat -tlnp | grep 3000
```

### 问题2：502 Bad Gateway

**可能原因：**
- Next.js应用未启动
- 端口3000被占用
- Nginx配置错误

**解决：**
```bash
# 重启应用
pm2 restart in-nutri-site

# 检查Nginx配置
nginx -t

# 检查端口占用
lsof -i :3000
```

### 问题3：数据库连接失败

**检查：**
```bash
# 检查数据库文件权限
ls -la /var/www/in-nutri-site/db/

# 检查环境变量
cat .env.production | grep DATABASE_URL
```

### 问题4：AI聊天功能不工作

**检查：**
```bash
# 检查环境变量
cat .env.production | grep AI_

# 查看应用日志
pm2 logs in-nutri-site | grep -i "ai\|volcano"
```

## 📊 性能优化建议

### 1. 启用 Nginx 缓存

在 Nginx 配置中添加：
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

server {
    # ... 其他配置
    
    location / {
        proxy_cache my_cache;
        proxy_cache_valid 200 10m;
        # ... 其他proxy配置
    }
}
```

### 2. 启用 Gzip 压缩

在 Nginx 配置中添加：
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### 3. PM2 集群模式（可选）

```bash
pm2 delete in-nutri-site
pm2 start npm --name "in-nutri-site" -i max -- start
```

## 🔐 安全建议

1. **定期更新系统**
   ```bash
   apt update && apt upgrade -y  # Ubuntu
   yum update -y                 # CentOS
   ```

2. **修改SSH端口**（可选）
   ```bash
   nano /etc/ssh/sshd_config
   # 修改 Port 22 为其他端口
   systemctl restart sshd
   ```

3. **配置防火墙规则**
   - 只开放必要的端口
   - 限制SSH访问IP（可选）

4. **定期备份数据库**
   ```bash
   # 备份SQLite数据库
   cp /var/www/in-nutri-site/db/sqlite.db /backup/sqlite-$(date +%Y%m%d).db
   ```

## 📝 快速部署脚本

可以使用项目中的部署脚本：

```bash
cd /var/www/in-nutri-site
bash scripts/deploy-tencent.sh
```

## 🎉 部署完成！

部署完成后，您的网站应该可以通过以下方式访问：
- HTTP: `http://your-domain.com`
- HTTPS: `https://your-domain.com`

**下一步：**
1. 登录后台管理系统：`https://your-domain.com/admin/login`
2. 添加产品数据
3. 配置网站设置
4. 测试所有功能

## 需要帮助？

如果遇到问题，请：
1. 查看日志文件
2. 检查环境变量配置
3. 确认所有服务正常运行
4. 联系技术支持

祝部署顺利！🚀

