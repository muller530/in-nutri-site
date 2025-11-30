# 🤖 自动化部署方案

## 方案对比

### 方案1：GitHub Actions 自动部署（推荐⭐⭐⭐⭐⭐）

**优点：**
- ✅ 代码推送到GitHub后自动部署
- ✅ 无需手动操作
- ✅ 有部署日志和状态
- ✅ 支持回滚

**缺点：**
- 需要配置SSH密钥到GitHub Secrets

### 方案2：服务器端Git Hook（推荐⭐⭐⭐⭐）

**优点：**
- ✅ 代码推送后自动部署
- ✅ 配置简单
- ✅ 无需第三方服务

**缺点：**
- 需要在服务器上配置

### 方案3：一键更新脚本（最简单⭐⭐⭐）

**优点：**
- ✅ 配置最简单
- ✅ 随时可以运行

**缺点：**
- 需要手动运行

## 🚀 推荐方案：GitHub Actions + 服务器端脚本

### 第一步：在服务器上配置自动部署脚本

```bash
# SSH登录服务器后
cd /var/www/in-nutri-site

# 创建自动部署脚本（已创建：scripts/auto-deploy.sh）
# 确保脚本有执行权限
chmod +x scripts/auto-deploy.sh

# 测试运行
bash scripts/auto-deploy.sh
```

### 第二步：配置GitHub Actions（可选）

#### 1. 在GitHub仓库设置Secrets

进入 GitHub 仓库 → Settings → Secrets and variables → Actions → New repository secret

添加以下Secrets：
- `SERVER_HOST`: 115.159.92.235
- `SERVER_USER`: root
- `SERVER_SSH_KEY`: 您的SSH私钥内容

#### 2. 推送代码后自动部署

现在每次您运行：
```bash
git push origin main
```

GitHub Actions会自动：
1. 检测到代码推送
2. SSH连接到服务器
3. 拉取最新代码
4. 安装依赖
5. 构建项目
6. 重启应用

### 第三步：查看部署状态

在GitHub仓库的 **Actions** 标签页可以看到：
- ✅ 部署成功/失败状态
- 📝 部署日志
- ⏱️ 部署时间

## 🔄 方案2：服务器端Git Hook（更简单）

### 配置步骤

```bash
# SSH登录服务器
cd /var/www/in-nutri-site

# 创建post-receive hook
cat > .git/hooks/post-receive << 'EOF'
#!/bin/bash
cd /var/www/in-nutri-site
git pull origin main
npm install --production
npm run build
pm2 restart in-nutri-site
EOF

chmod +x .git/hooks/post-receive
```

然后配置GitHub Webhook（可选）或使用GitHub Actions触发。

## 📝 方案3：一键更新脚本（最简单）

### 使用方法

在服务器上运行：

```bash
cd /var/www/in-nutri-site
bash scripts/auto-deploy.sh
```

或者创建一个快捷命令：

```bash
# 添加到 ~/.bashrc 或 ~/.zshrc
alias deploy-in-nutri='cd /var/www/in-nutri-site && bash scripts/auto-deploy.sh'

# 然后就可以直接运行
deploy-in-nutri
```

## 🎯 推荐工作流程

### 日常开发流程

1. **本地开发**
   ```bash
   # 修改代码
   # 测试
   npm run dev
   ```

2. **提交代码**
   ```bash
   git add .
   git commit -m "更新说明"
   git push origin main
   ```

3. **自动部署**（如果配置了GitHub Actions）
   - GitHub Actions自动部署
   - 或手动运行：`bash scripts/auto-deploy.sh`

4. **验证部署**
   - 访问网站检查是否正常
   - 查看日志：`pm2 logs in-nutri-site`

## 🔧 高级配置：定时自动部署

如果需要定时自动部署（例如每天凌晨）：

```bash
# 编辑crontab
crontab -e

# 添加以下行（每天凌晨2点自动部署）
0 2 * * * cd /var/www/in-nutri-site && bash scripts/auto-deploy.sh >> /var/log/auto-deploy.log 2>&1
```

## 📊 部署监控

### 查看部署日志

```bash
# 应用日志
pm2 logs in-nutri-site

# 部署日志（如果配置了）
tail -f /var/log/auto-deploy.log
```

### 检查部署状态

```bash
# PM2状态
pm2 status

# 检查应用是否运行
curl http://localhost:3000
```

## 🛡️ 安全建议

1. **使用SSH密钥而非密码**
2. **限制SSH访问IP**（可选）
3. **定期备份数据库**
4. **监控服务器资源使用**

## 📝 快速命令参考

```bash
# 手动部署
cd /var/www/in-nutri-site && bash scripts/auto-deploy.sh

# 查看状态
pm2 status

# 查看日志
pm2 logs in-nutri-site

# 重启应用
pm2 restart in-nutri-site

# 回滚到上一个版本（如果使用Git）
cd /var/www/in-nutri-site
git reset --hard HEAD~1
npm run build
pm2 restart in-nutri-site
```

## 🎉 总结

**推荐配置：**
1. ✅ 使用GitHub Actions自动部署（推送代码后自动部署）
2. ✅ 服务器上保留 `auto-deploy.sh` 脚本（可以手动运行）
3. ✅ 定期备份数据库

这样您就可以：
- ✅ 本地开发
- ✅ 推送代码到GitHub
- ✅ 自动部署到服务器
- ✅ 无需手动操作！

需要我帮您配置哪种方案？




