# 修复"邮箱或密码错误"问题 - 最终解决方案

如果仍然遇到"邮箱或密码错误"的问题，请按照以下步骤操作：

## 🚀 快速修复（推荐）

### 在服务器上执行：

```bash
# 1. SSH 连接到服务器
ssh root@your-server-ip

# 2. 进入项目目录
cd /var/www/in-nutri-site

# 3. 拉取最新代码（如果使用 Git）
git pull origin main

# 4. 运行验证和修复脚本（最强大）
npm run db:verify-admin

# 5. 如果第4步失败，尝试重置
npm run db:reset-admin

# 6. 重启应用
pm2 restart in-nutri-site

# 7. 查看日志
pm2 logs in-nutri-site --lines 30
```

## 🔍 详细排查步骤

### 步骤 1: 检查数据库文件

```bash
cd /var/www/in-nutri-site

# 检查数据库文件是否存在
ls -la db/sqlite.db

# 如果不存在，初始化数据库
npm run db:push
```

### 步骤 2: 验证管理员账号

```bash
# 运行验证脚本（会自动修复问题）
npm run db:verify-admin
```

这个脚本会：
- ✅ 检查数据库连接
- ✅ 查找管理员账号
- ✅ 验证密码是否正确
- ✅ 确保账号是激活状态
- ✅ 如果发现问题，自动修复

### 步骤 3: 手动检查数据库内容

如果验证脚本无法运行，可以手动检查：

```bash
# 安装 sqlite3 命令行工具（如果未安装）
apt install -y sqlite3  # Ubuntu/Debian
# 或
yum install -y sqlite  # CentOS

# 查看数据库中的管理员账号
sqlite3 db/sqlite.db "SELECT email, name, role, isActive FROM members WHERE email = 'admin@in-nutri.com';"
```

### 步骤 4: 强制重置管理员账号

如果账号存在但密码不对：

```bash
# 方法 1: 使用验证脚本（推荐）
npm run db:verify-admin

# 方法 2: 使用重置脚本
npm run db:reset-admin

# 方法 3: 删除并重新创建（最后手段）
sqlite3 db/sqlite.db "DELETE FROM members WHERE email = 'admin@in-nutri.com';"
npm run db:seed
```

### 步骤 5: 检查应用日志

```bash
# 查看 PM2 日志
pm2 logs in-nutri-site --lines 100

# 查找登录相关的错误
pm2 logs in-nutri-site | grep -i "login\|password\|email\|admin"
```

## 📋 标准管理员账号

- **邮箱**: `admin@in-nutri.com`
- **密码**: `inNutriAdmin123`

**注意**: 
- 邮箱和密码都是**区分大小写**的
- 确保没有多余的空格
- 如果复制粘贴，注意不要复制到隐藏字符

## 🐛 常见问题

### 问题 1: 运行 `npm run db:verify-admin` 报错

**错误**: `数据库连接失败`

**解决**:
```bash
# 确保数据库文件存在
npm run db:push

# 检查文件权限
chmod 664 db/sqlite.db
chmod 755 db
```

### 问题 2: 账号存在但密码不对

**解决**:
```bash
# 强制重置密码
npm run db:verify-admin
```

这个脚本会验证密码，如果不正确会自动重置。

### 问题 3: 账号被禁用

**解决**:
```bash
# 验证脚本会自动激活账号
npm run db:verify-admin

# 或手动激活
sqlite3 db/sqlite.db "UPDATE members SET isActive = 1 WHERE email = 'admin@in-nutri.com';"
```

### 问题 4: 数据库文件损坏

**解决**:
```bash
# 备份现有数据库
cp db/sqlite.db db/sqlite.db.backup.$(date +%Y%m%d_%H%M%S)

# 删除损坏的数据库
rm db/sqlite.db

# 重新初始化
npm run db:push
npm run db:seed
```

## ✅ 验证修复是否成功

修复后，请验证：

1. **运行验证脚本**:
   ```bash
   npm run db:verify-admin
   ```
   应该显示：`✅ 所有验证通过！`

2. **测试登录**:
   - 访问: `https://your-domain.com/admin/login`
   - 邮箱: `admin@in-nutri.com`
   - 密码: `inNutriAdmin123`

3. **检查应用日志**:
   ```bash
   pm2 logs in-nutri-site | grep -i "login"
   ```
   登录成功应该看到：`登录成功: admin@in-nutri.com`

## 🆘 如果仍然无法登录

如果以上所有方法都尝试过了，仍然无法登录，请提供：

1. **验证脚本的输出**:
   ```bash
   npm run db:verify-admin > verify-output.txt 2>&1
   cat verify-output.txt
   ```

2. **应用日志**:
   ```bash
   pm2 logs in-nutri-site --lines 100 > app-logs.txt
   cat app-logs.txt
   ```

3. **数据库内容**:
   ```bash
   sqlite3 db/sqlite.db "SELECT * FROM members WHERE email = 'admin@in-nutri.com';" > db-content.txt
   cat db-content.txt
   ```

4. **环境变量**:
   ```bash
   cat .env.production | grep -E "DATABASE_URL|SESSION_SECRET"
   ```

## 💡 预防措施

为了避免将来再次出现此问题：

1. **在部署脚本中包含账号创建**:
   ```bash
   npm run db:push
   npm run db:verify-admin
   ```

2. **定期备份数据库**:
   ```bash
   cp db/sqlite.db db/backups/sqlite.db.$(date +%Y%m%d)
   ```

3. **监控应用日志**:
   ```bash
   pm2 logs in-nutri-site --lines 50
   ```

