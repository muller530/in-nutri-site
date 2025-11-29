# 生产环境登录问题排查和修复指南

## 🔍 问题现象

- ✅ 本地环境可以正常登录
- ❌ 生产环境（网络端）登录提示错误

## 🎯 可能的原因

### 1. 数据库未初始化（最常见）

生产环境的数据库可能没有创建管理员账号。

### 2. 数据库连接配置问题

生产环境可能使用了不同的数据库配置。

### 3. Cookie 设置问题

生产环境的 HTTPS Cookie 设置可能有问题。

## 🛠️ 解决方案

### 方案 1: SSH 到服务器初始化数据库（推荐）

如果您使用的是腾讯云服务器部署：

```bash
# 1. SSH 连接到服务器
ssh root@your-server-ip

# 2. 进入项目目录
cd /var/www/in-nutri-site  # 或您的实际项目路径

# 3. 检查数据库文件是否存在
ls -la db/sqlite.db

# 4. 初始化数据库（创建表结构）
npm run db:push

# 5. 创建管理员账号
npm run db:seed

# 或者只重置管理员密码
npm run db:reset-admin

# 6. 重启应用
pm2 restart in-nutri-site

# 7. 查看日志确认
pm2 logs in-nutri-site
```

### 方案 2: 检查数据库文件权限

```bash
# SSH 到服务器
ssh root@your-server-ip
cd /var/www/in-nutri-site

# 检查数据库文件权限
ls -la db/sqlite.db

# 如果文件不存在或权限有问题，修复权限
chmod 664 db/sqlite.db
chown www-data:www-data db/sqlite.db  # 根据实际用户调整
```

### 方案 3: 检查环境变量配置

```bash
# SSH 到服务器
ssh root@your-server-ip
cd /var/www/in-nutri-site

# 检查环境变量文件
cat .env.production

# 确保包含以下配置
# NODE_ENV=production
# DATABASE_URL=./db/sqlite.db
# SESSION_SECRET=your-secret-key-here
```

### 方案 4: 检查应用日志

```bash
# SSH 到服务器
ssh root@your-server-ip

# 查看 PM2 日志
pm2 logs in-nutri-site --lines 100

# 或者查看 Next.js 日志
tail -f /var/www/in-nutri-site/.next/server.log
```

查找以下错误信息：
- `数据库连接失败`
- `用户不存在`
- `密码错误`
- `Cookie 设置失败`

### 方案 5: 手动创建管理员账号（如果数据库已存在）

如果数据库表已存在但没有管理员账号：

```bash
# SSH 到服务器
ssh root@your-server-ip
cd /var/www/in-nutri-site

# 运行重置管理员密码脚本
npm run db:reset-admin
```

## 📋 标准管理员账号信息

- **邮箱**: `admin@in-nutri.com`
- **密码**: `inNutriAdmin123`

## 🔧 快速修复脚本

创建一个快速修复脚本 `fix-production-login.sh`：

```bash
#!/bin/bash

echo "🔧 开始修复生产环境登录问题..."

# 进入项目目录
cd /var/www/in-nutri-site || exit 1

# 1. 确保数据库目录存在
mkdir -p db

# 2. 初始化数据库
echo "📦 初始化数据库..."
npm run db:push

# 3. 重置管理员密码
echo "🔑 重置管理员密码..."
npm run db:reset-admin

# 4. 检查数据库文件权限
echo "🔒 检查文件权限..."
chmod 664 db/sqlite.db 2>/dev/null || true

# 5. 重启应用
echo "🔄 重启应用..."
pm2 restart in-nutri-site

# 6. 查看日志
echo "📋 查看最新日志..."
pm2 logs in-nutri-site --lines 20

echo "✅ 修复完成！"
echo ""
echo "📋 管理员账号信息："
echo "   邮箱: admin@in-nutri.com"
echo "   密码: inNutriAdmin123"
```

使用方法：

```bash
# 1. 将脚本上传到服务器
scp fix-production-login.sh root@your-server-ip:/var/www/in-nutri-site/

# 2. SSH 到服务器
ssh root@your-server-ip

# 3. 运行脚本
cd /var/www/in-nutri-site
chmod +x fix-production-login.sh
./fix-production-login.sh
```

## 🌐 EdgeOne 部署的特殊处理

如果您使用的是 EdgeOne 部署：

### 问题：EdgeOne 不支持 SQLite 文件系统

EdgeOne 是边缘计算平台，不支持文件系统访问，因此无法使用 SQLite。

### 解决方案：

1. **使用云数据库（MySQL/PostgreSQL）**

在 EdgeOne 控制台设置环境变量：

```
DATABASE_URL=mysql://user:password@host:port/database
```

或

```
DATABASE_URL=postgresql://user:password@host:port/database
```

2. **初始化云数据库**

在本地或服务器上运行：

```bash
# 设置云数据库连接
export DATABASE_URL=mysql://user:password@host:port/database

# 初始化数据库
npm run db:push

# 创建管理员账号
npm run db:seed
```

3. **检查 EdgeOne 环境变量**

确保在 EdgeOne 控制台设置了：
- `DATABASE_URL` - 云数据库连接字符串
- `NODE_ENV=production`
- `SESSION_SECRET` - 会话密钥
- `FORCE_SECURE_COOKIE=true` - 强制使用安全 Cookie

## 🐛 常见错误和解决方案

### 错误 1: "邮箱或密码错误"

**原因**: 数据库中没有管理员账号

**解决**: 运行 `npm run db:seed` 或 `npm run db:reset-admin`

### 错误 2: "数据库连接失败"

**原因**: 
- 数据库文件不存在
- 数据库文件权限问题
- 数据库路径配置错误

**解决**: 
- 检查 `DATABASE_URL` 环境变量
- 检查数据库文件权限
- 运行 `npm run db:push` 创建数据库

### 错误 3: "创建会话失败"

**原因**: Cookie 设置问题或 SESSION_SECRET 未配置

**解决**: 
- 检查 `SESSION_SECRET` 环境变量
- 检查 Cookie 的 secure 设置
- 确保生产环境使用 HTTPS

### 错误 4: 登录后立即退出

**原因**: Cookie 无法保存（secure 设置问题）

**解决**: 
- 检查是否使用 HTTPS
- 设置 `FORCE_SECURE_COOKIE=true`
- 检查浏览器 Cookie 设置

## 📞 需要帮助？

如果以上方案都无法解决问题，请提供以下信息：

1. 部署平台（腾讯云服务器 / EdgeOne / 其他）
2. 错误日志（`pm2 logs` 或 EdgeOne 日志）
3. 数据库配置（`DATABASE_URL` 的值）
4. 环境变量配置（隐藏敏感信息）

## ✅ 验证步骤

修复后，请验证：

1. ✅ 数据库文件存在且可访问
2. ✅ 管理员账号已创建
3. ✅ 应用可以正常启动
4. ✅ 登录页面可以访问
5. ✅ 使用管理员账号可以成功登录
6. ✅ 登录后可以访问后台管理页面

