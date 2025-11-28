# 腾讯云部署指南

## 部署方案对比

### 方案 1: 腾讯云 Serverless Cloud Framework (SCF) - 推荐 ⭐

**优点：**
- 类似 Vercel，零服务器管理
- 自动扩缩容
- 按量付费，成本低
- 支持 Next.js
- 国内访问速度快

**缺点：**
- 需要适配 Serverless 环境
- 某些 Node.js 模块可能受限

**适用场景：** 中小型网站，希望零运维

### 方案 2: 腾讯云轻量应用服务器 (Lighthouse) - 最灵活 ⭐⭐⭐

**优点：**
- 完全控制，无平台限制
- 可以使用任何数据库（MySQL、PostgreSQL、SQLite）
- 文件系统完全可用
- 成本固定，可预测

**缺点：**
- 需要自己维护服务器
- 需要配置 SSL、域名等

**适用场景：** 需要完全控制，或已有运维经验

### 方案 3: 腾讯云容器服务 (TKE)

**优点：**
- 容器化部署
- 高可用性
- 自动扩缩容

**缺点：**
- 配置复杂
- 成本较高
- 需要 Kubernetes 知识

**适用场景：** 大型应用，需要高可用

## 推荐方案：轻量应用服务器 (Lighthouse)

对于您的项目，我推荐使用 **腾讯云轻量应用服务器**，因为：
1. 完全兼容 Node.js 环境，无需修改代码
2. 可以使用 SQLite 或 MySQL/PostgreSQL
3. 文件上传直接使用文件系统
4. 配置简单，成本可控

## 部署步骤（轻量应用服务器）

### 第一步：购买服务器

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 进入 **轻量应用服务器**
3. 选择配置：
   - **地域**：选择离用户最近的地域（如：上海、北京）
   - **镜像**：选择 **Ubuntu 22.04 LTS** 或 **CentOS 7.6**
   - **套餐**：建议 **2核2G** 或更高（约 ¥24-48/月）
   - **带宽**：3-5Mbps 足够

### 第二步：配置服务器环境

#### 1. 连接服务器

```bash
ssh root@your-server-ip
```

#### 2. 安装 Node.js 和 npm

**Ubuntu:**
```bash
# 更新系统
apt update && apt upgrade -y

# 安装 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 验证安装
node -v  # 应该显示 v18.x.x
npm -v
```

**CentOS:**
```bash
# 更新系统
yum update -y

# 安装 Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# 验证安装
node -v
npm -v
```

#### 3. 安装 PM2（进程管理器）

```bash
npm install -g pm2
```

#### 4. 安装 Nginx（反向代理）

**Ubuntu:**
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

#### 5. 安装数据库（可选）

**选项 A: 继续使用 SQLite（最简单）**
- 无需额外安装，Node.js 项目自带

**选项 B: 使用 MySQL（推荐生产环境）**
```bash
# Ubuntu
apt install -y mysql-server
systemctl start mysql
systemctl enable mysql

# CentOS
yum install -y mariadb-server
systemctl start mariadb
systemctl enable mariadb
```

**选项 C: 使用 PostgreSQL**
```bash
# Ubuntu
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# CentOS
yum install -y postgresql-server postgresql-contrib
postgresql-setup --initdb
systemctl start postgresql
systemctl enable postgresql
```

### 第三步：部署应用

#### 1. 克隆项目

```bash
# 安装 Git
apt install -y git  # Ubuntu
# 或
yum install -y git  # CentOS

# 创建应用目录
mkdir -p /var/www/in-nutri-site
cd /var/www/in-nutri-site

# 克隆项目
git clone https://github.com/muller530/in-nutri-site.git .

# 或使用您自己的仓库地址
```

#### 2. 安装依赖

```bash
cd /var/www/in-nutri-site
npm install --production
```

#### 3. 配置环境变量

```bash
# 创建 .env.production 文件
nano .env.production
```

添加以下内容：
```env
NODE_ENV=production
DATABASE_URL=./db/sqlite.db
NEXT_PUBLIC_BASE_URL=https://your-domain.com
SESSION_SECRET=your-secret-key-here
```

#### 4. 构建项目

```bash
npm run build
```

#### 5. 初始化数据库

```bash
# 运行数据库迁移和种子数据
npm run db:push
npm run db:seed-data
```

#### 6. 使用 PM2 启动应用

```bash
# 启动 Next.js 应用
pm2 start npm --name "in-nutri-site" -- start

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs in-nutri-site
```

### 第四步：配置 Nginx 反向代理

#### 1. 创建 Nginx 配置

```bash
nano /etc/nginx/sites-available/in-nutri-site
```

**Ubuntu:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

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
    }

    # 静态文件缓存
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

**CentOS:**
```bash
nano /etc/nginx/conf.d/in-nutri-site.conf
```
（使用相同的配置内容）

#### 2. 启用配置

**Ubuntu:**
```bash
ln -s /etc/nginx/sites-available/in-nutri-site /etc/nginx/sites-enabled/
nginx -t  # 测试配置
systemctl reload nginx
```

**CentOS:**
```bash
nginx -t
systemctl reload nginx
```

### 第五步：配置 SSL 证书（HTTPS）

#### 使用 Let's Encrypt 免费证书

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx  # Ubuntu
# 或
yum install -y certbot python3-certbot-nginx  # CentOS

# 获取证书
certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期
certbot renew --dry-run
```

### 第六步：配置防火墙

```bash
# 允许 HTTP 和 HTTPS
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp  # SSH
ufw enable
```

## 数据库迁移（如果使用 MySQL/PostgreSQL）

### 从 SQLite 迁移到 MySQL

1. 安装 MySQL 客户端工具
2. 导出 SQLite 数据
3. 转换并导入到 MySQL

### 从 SQLite 迁移到 PostgreSQL

类似步骤，使用 PostgreSQL 客户端工具

## 文件上传配置

### 使用本地文件系统（最简单）

无需修改，直接使用 `public/uploads/` 目录

### 使用腾讯云 COS（对象存储）

1. 创建 COS 存储桶
2. 安装腾讯云 COS SDK
3. 修改上传 API 使用 COS

## 监控和维护

### 查看应用日志

```bash
pm2 logs in-nutri-site
```

### 重启应用

```bash
pm2 restart in-nutri-site
```

### 更新应用

```bash
cd /var/www/in-nutri-site
git pull
npm install --production
npm run build
pm2 restart in-nutri-site
```

## 成本估算

- **轻量应用服务器**：¥24-48/月（2核2G）
- **域名**：¥50-100/年
- **SSL 证书**：免费（Let's Encrypt）
- **带宽**：包含在服务器套餐中

**总计：约 ¥300-600/年**

## 其他国内平台选项

### 1. 阿里云 ECS
- 类似腾讯云轻量应用服务器
- 配置步骤基本相同

### 2. 华为云 ECS
- 类似配置
- 价格可能更优惠

### 3. 百度智能云
- 类似配置
- 适合百度生态

## 需要我帮您做什么？

1. **创建部署脚本**：自动化部署流程
2. **修改代码适配**：确保代码在服务器上正常运行
3. **数据库迁移脚本**：从 SQLite 迁移到 MySQL/PostgreSQL
4. **配置 Nginx**：优化性能配置
5. **设置 CI/CD**：自动部署流程

请告诉我您选择哪个方案，我可以帮您完成具体的配置！

