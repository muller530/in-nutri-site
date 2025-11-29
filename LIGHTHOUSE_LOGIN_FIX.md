# 腾讯云 Lighthouse 登录问题修复指南

## 🔍 问题现象

- ✅ 本地环境可以正常登录
- ❌ Lighthouse 服务器上登录提示错误

## 🎯 快速修复（推荐）

### 方法 1: 使用诊断和修复脚本（最推荐 ⭐⭐⭐）

这个脚本会自动诊断问题并尝试修复：

```bash
# 1. 将诊断和修复脚本上传到服务器
scp scripts/diagnose-and-fix.sh root@your-server-ip:/var/www/in-nutri-site/

# 2. SSH 连接到服务器
ssh root@your-server-ip

# 3. 进入项目目录并运行脚本
cd /var/www/in-nutri-site
chmod +x diagnose-and-fix.sh
./diagnose-and-fix.sh
```

脚本会自动：
- ✅ 检查数据库目录和文件
- ✅ 修复文件权限
- ✅ 检查并创建环境变量
- ✅ 初始化数据库表结构
- ✅ 创建/重置管理员账号
- ✅ 测试数据库连接
- ✅ 重启 PM2 应用

### 方法 2: 使用简单修复脚本

```bash
# 1. 将修复脚本上传到服务器
scp scripts/fix-production-login.sh root@your-server-ip:/var/www/in-nutri-site/

# 2. SSH 连接到服务器
ssh root@your-server-ip

# 3. 进入项目目录并运行修复脚本
cd /var/www/in-nutri-site
chmod +x fix-production-login.sh
./fix-production-login.sh
```

### 方法 2: 手动执行命令

```bash
# 1. SSH 连接到服务器
ssh root@your-server-ip

# 2. 进入项目目录
cd /var/www/in-nutri-site

# 3. 检查数据库文件
ls -la db/sqlite.db

# 4. 初始化数据库表结构
npm run db:push

# 5. 创建/重置管理员账号
npm run db:seed
# 或者只重置密码
npm run db:reset-admin

# 6. 检查文件权限
chmod 664 db/sqlite.db

# 7. 重启应用
pm2 restart in-nutri-site

# 8. 查看日志确认
pm2 logs in-nutri-site --lines 50
```

## 📋 标准管理员账号

- **邮箱**: `admin@in-nutri.com`
- **密码**: `inNutriAdmin123`

## 🔧 详细排查步骤

### 步骤 1: 检查数据库文件

```bash
ssh root@your-server-ip
cd /var/www/in-nutri-site

# 检查数据库文件是否存在
ls -la db/sqlite.db

# 如果文件不存在，需要初始化
npm run db:push
```

### 步骤 2: 检查管理员账号

```bash
# 检查数据库中是否有管理员账号
# 如果没有，创建管理员账号
npm run db:seed

# 或者重置现有管理员密码
npm run db:reset-admin
```

### 步骤 3: 检查文件权限

```bash
# 确保数据库文件可读写
chmod 664 db/sqlite.db
chmod 755 db

# 检查文件所有者（应该是运行 PM2 的用户）
ls -la db/sqlite.db
```

### 步骤 4: 检查环境变量

```bash
# 查看环境变量配置
cat .env.production

# 确保包含以下配置：
# NODE_ENV=production
# DATABASE_URL=./db/sqlite.db
# SESSION_SECRET=your-secret-key-here
```

### 步骤 5: 检查应用状态

```bash
# 查看 PM2 应用状态
pm2 status

# 查看应用日志
pm2 logs in-nutri-site --lines 100

# 如果应用未运行，启动它
pm2 start npm --name "in-nutri-site" -- start
```

### 步骤 6: 重启应用

```bash
# 重启应用
pm2 restart in-nutri-site

# 等待几秒后查看日志
sleep 3
pm2 logs in-nutri-site --lines 20
```

## 🐛 常见错误和解决方案

### 错误 1: "邮箱或密码错误"

**原因**: 数据库中没有管理员账号

**解决**:
```bash
cd /var/www/in-nutri-site
npm run db:reset-admin
pm2 restart in-nutri-site
```

### 错误 2: "数据库连接失败"

**原因**: 
- 数据库文件不存在
- 数据库文件权限问题
- 数据库路径配置错误

**解决**:
```bash
cd /var/www/in-nutri-site

# 创建数据库目录
mkdir -p db

# 初始化数据库
npm run db:push

# 修复权限
chmod 664 db/sqlite.db
chmod 755 db

# 检查环境变量
grep DATABASE_URL .env.production
```

### 错误 3: "创建会话失败"

**原因**: SESSION_SECRET 未配置或 Cookie 设置问题

**解决**:
```bash
cd /var/www/in-nutri-site

# 检查 SESSION_SECRET
grep SESSION_SECRET .env.production

# 如果没有，生成一个并添加到 .env.production
echo "SESSION_SECRET=$(openssl rand -hex 32)" >> .env.production

# 重启应用
pm2 restart in-nutri-site
```

### 错误 4: 登录后立即退出

**原因**: Cookie 无法保存

**解决**:
```bash
# 检查是否使用 HTTPS
# 如果使用 Nginx，确保配置了 SSL 证书

# 检查 Cookie 设置（查看应用日志）
pm2 logs in-nutri-site | grep -i cookie
```

## 🔄 完整重置流程

如果以上方法都不行，可以尝试完整重置：

```bash
# SSH 到服务器
ssh root@your-server-ip
cd /var/www/in-nutri-site

# 1. 停止应用
pm2 stop in-nutri-site

# 2. 备份现有数据库（如果有重要数据）
cp db/sqlite.db db/sqlite.db.backup.$(date +%Y%m%d_%H%M%S)

# 3. 删除数据库文件（可选，会丢失数据）
# rm db/sqlite.db

# 4. 重新初始化数据库
npm run db:push
npm run db:seed

# 5. 修复权限
chmod 664 db/sqlite.db
chmod 755 db

# 6. 重启应用
pm2 restart in-nutri-site

# 7. 查看日志
pm2 logs in-nutri-site --lines 50
```

## 📝 验证步骤

修复后，请验证：

1. ✅ 数据库文件存在: `ls -la db/sqlite.db`
2. ✅ 管理员账号已创建: 运行 `npm run db:reset-admin` 应该显示账号信息
3. ✅ 应用正在运行: `pm2 status` 显示 `in-nutri-site` 状态为 `online`
4. ✅ 登录页面可访问: 浏览器访问 `https://your-domain.com/admin/login`
5. ✅ 可以成功登录: 使用 `admin@in-nutri.com` / `inNutriAdmin123`
6. ✅ 登录后可以访问后台: 可以访问 `/admin` 页面

## 🆘 需要帮助？

如果以上方法都无法解决问题，请提供以下信息：

1. **错误日志**:
   ```bash
   pm2 logs in-nutri-site --lines 100 > error.log
   # 然后查看 error.log 文件
   ```

2. **数据库状态**:
   ```bash
   ls -la db/
   cat .env.production | grep DATABASE_URL
   ```

3. **应用状态**:
   ```bash
   pm2 status
   pm2 info in-nutri-site
   ```

4. **环境信息**:
   ```bash
   node -v
   npm -v
   pm2 --version
   ```

## 💡 预防措施

为了避免将来再次出现此问题：

1. **在部署脚本中包含数据库初始化**:
   ```bash
   npm run db:push
   npm run db:seed
   ```

2. **定期备份数据库**:
   ```bash
   cp db/sqlite.db db/backups/sqlite.db.$(date +%Y%m%d)
   ```

3. **监控应用日志**:
   ```bash
   pm2 logs in-nutri-site --lines 50
   ```

4. **设置 PM2 开机自启**:
   ```bash
   pm2 startup
   pm2 save
   ```

