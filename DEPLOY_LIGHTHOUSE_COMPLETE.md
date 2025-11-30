# 腾讯云 Lighthouse 完整部署指南（包含数据库）

## 📋 部署前准备

### 1. 服务器信息
- ✅ 已购买腾讯云 Lighthouse 服务器
- 📝 记录服务器IP地址
- 📝 记录SSH登录密码或密钥

### 2. 本地环境
- ✅ 已安装 Git
- ✅ 已安装 Node.js 18+
- ✅ 代码已提交到 Git 仓库

## 🚀 快速部署（推荐）

### 方法一：使用完整部署脚本（自动化）

```bash
# 1. 确保脚本有执行权限
chmod +x scripts/deploy-lighthouse-complete.sh

# 2. 执行部署脚本
bash scripts/deploy-lighthouse-complete.sh <服务器IP> [SSH用户]

# 示例
bash scripts/deploy-lighthouse-complete.sh 123.456.789.0 root
```

**脚本会自动完成：**
1. ✅ 备份本地数据库
2. ✅ 提交代码到 Git
3. ✅ 推送到远程仓库
4. ✅ 连接到服务器
5. ✅ 备份服务器现有数据库
6. ✅ 拉取最新代码
7. ✅ 安装依赖
8. ✅ 构建项目
9. ✅ 初始化数据库（包括种子数据）
10. ✅ 重启应用

### 方法二：手动部署

#### 第一步：备份本地数据库

```bash
bash scripts/backup-database.sh
```

#### 第二步：提交并推送代码

```bash
git add -A
git commit -m "Deploy to Lighthouse"
git push origin main
```

#### 第三步：在服务器上执行部署

```bash
# 连接到服务器
ssh root@your-server-ip

# 进入应用目录
cd /var/www/in-nutri-site

# 备份现有数据库
mkdir -p backups
cp db/sqlite.db backups/sqlite_backup_$(date +%Y%m%d_%H%M%S).db

# 拉取最新代码
git pull origin main

# 安装依赖
npm install --production

# 构建项目
npm run build

# 初始化数据库（包括种子数据）
npm run db:push
npm run db:seed-data

# 重启应用
pm2 restart in-nutri-site
```

## 📦 数据库管理

### 备份数据库

**本地备份：**
```bash
bash scripts/backup-database.sh
```

**服务器备份：**
```bash
ssh root@your-server-ip
cd /var/www/in-nutri-site
mkdir -p backups
cp db/sqlite.db backups/sqlite_backup_$(date +%Y%m%d_%H%M%S).db
```

### 恢复数据库

**从备份恢复：**
```bash
ssh root@your-server-ip
cd /var/www/in-nutri-site
cp backups/sqlite_backup_YYYYMMDD_HHMMSS.db db/sqlite.db
pm2 restart in-nutri-site
```

### 导出数据库数据

**导出为 SQL：**
```bash
ssh root@your-server-ip
cd /var/www/in-nutri-site
sqlite3 db/sqlite.db .dump > backups/database_export_$(date +%Y%m%d_%H%M%S).sql
```

### 导入数据库数据

**从 SQL 导入：**
```bash
ssh root@your-server-ip
cd /var/www/in-nutri-site
sqlite3 db/sqlite.db < backups/database_export_YYYYMMDD_HHMMSS.sql
pm2 restart in-nutri-site
```

## 🔄 更新部署

当代码有更新时，只需重新运行部署脚本：

```bash
bash scripts/deploy-lighthouse-complete.sh <服务器IP>
```

或者手动更新：

```bash
ssh root@your-server-ip
cd /var/www/in-nutri-site
git pull origin main
npm install --production
npm run build
npm run db:push  # 如果有数据库迁移
pm2 restart in-nutri-site
```

## 🛠️ 故障排查

### 问题1：部署脚本无法连接服务器

**检查：**
- SSH 密钥或密码是否正确
- 服务器防火墙是否开放 SSH 端口（22）
- 服务器IP地址是否正确

### 问题2：数据库初始化失败

**检查：**
```bash
ssh root@your-server-ip
cd /var/www/in-nutri-site
ls -la db/
cat .env.production | grep DATABASE_URL
```

**解决：**
- 确保数据库目录有写权限
- 检查环境变量配置

### 问题3：应用无法启动

**检查：**
```bash
ssh root@your-server-ip
pm2 logs in-nutri-site
pm2 status
```

**解决：**
- 查看日志找出错误原因
- 检查端口3000是否被占用
- 检查环境变量配置

## 📊 监控和维护

### 查看应用状态

```bash
ssh root@your-server-ip 'pm2 status'
```

### 查看应用日志

```bash
ssh root@your-server-ip 'pm2 logs in-nutri-site'
```

### 重启应用

```bash
ssh root@your-server-ip 'pm2 restart in-nutri-site'
```

### 停止应用

```bash
ssh root@your-server-ip 'pm2 stop in-nutri-site'
```

## 🔐 安全建议

1. **定期备份数据库**
   ```bash
   # 设置定时任务，每天备份一次
   ssh root@your-server-ip
   crontab -e
   # 添加：0 2 * * * cd /var/www/in-nutri-site && bash scripts/backup-database.sh
   ```

2. **更新系统**
   ```bash
   ssh root@your-server-ip
   apt update && apt upgrade -y  # Ubuntu
   # 或
   yum update -y  # CentOS
   ```

3. **配置防火墙**
   - 只开放必要的端口（80, 443, 22）
   - 限制SSH访问IP（可选）

## 📝 注意事项

1. **数据库文件位置**
   - 本地：`./db/sqlite.db`
   - 服务器：`/var/www/in-nutri-site/db/sqlite.db`

2. **环境变量**
   - 确保服务器上的 `.env.production` 文件配置正确
   - 特别是 `NEXT_PUBLIC_BASE_URL` 应设置为实际域名

3. **文件权限**
   - 确保数据库目录有写权限
   - 确保上传目录有写权限

4. **备份策略**
   - 建议每天自动备份数据库
   - 保留最近30天的备份

## 🎉 部署完成检查清单

- [ ] 代码已推送到 Git 仓库
- [ ] 服务器已安装 Node.js 18+
- [ ] 服务器已安装 PM2
- [ ] 服务器已安装 Nginx
- [ ] 环境变量已配置
- [ ] 数据库已初始化
- [ ] 应用已启动
- [ ] Nginx 已配置
- [ ] SSL 证书已配置（可选）
- [ ] 网站可以正常访问
- [ ] 后台管理系统可以登录
- [ ] 所有功能正常

## 📞 需要帮助？

如果遇到问题：
1. 查看应用日志：`pm2 logs in-nutri-site`
2. 查看 Nginx 日志：`tail -f /var/log/nginx/in-nutri-error.log`
3. 检查服务器资源：`htop` 或 `free -h`
4. 检查端口占用：`netstat -tlnp | grep 3000`

祝部署顺利！🚀

