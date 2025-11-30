# 🚀 直接从 Cursor 部署到腾讯云服务器

## 方案说明

无需通过GitHub，直接从本地（Cursor）推送代码到腾讯云服务器。

## 快速开始

### 方法1：使用一键部署脚本（推荐）

```bash
# 在项目根目录运行
bash scripts/deploy-direct.sh
```

脚本会自动：
1. ✅ 同步文件到服务器（使用rsync，只同步变更的文件）
2. ✅ 在服务器上安装依赖
3. ✅ 构建项目
4. ✅ 重启应用

### 方法2：使用简化脚本

```bash
bash scripts/deploy-simple.sh
```

## 配置SSH连接

### 方案A：使用密码登录（最简单）

首次连接时输入密码，之后可以配置SSH密钥免密登录。

```bash
# 测试连接（会提示输入密码）
ssh root@115.159.92.235

# 如果连接成功，就可以使用部署脚本了
bash scripts/deploy-direct.sh
```

### 方案B：配置SSH密钥（推荐，免密登录）

#### 1. 生成SSH密钥（如果还没有）

```bash
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
# 按回车使用默认路径
```

#### 2. 复制公钥到服务器

```bash
# 方法1：使用ssh-copy-id（如果可用）
ssh-copy-id root@115.159.92.235

# 方法2：手动复制
cat ~/.ssh/id_rsa.pub | ssh root@115.159.92.235 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

#### 3. 测试免密登录

```bash
ssh root@115.159.92.235
# 应该可以直接登录，无需密码
```

## 部署脚本说明

### deploy-direct.sh（完整版）

功能：
- ✅ 使用rsync同步文件（快速，只同步变更）
- ✅ 自动排除不需要的文件（node_modules、.next等）
- ✅ 在服务器上执行部署命令
- ✅ 检查部署状态

### deploy-simple.sh（简化版）

功能：
- ✅ 更简单的脚本
- ✅ 适合快速部署

## 工作流程

### 日常开发流程

1. **在Cursor中修改代码**
   ```bash
   # 修改文件
   # 保存
   ```

2. **运行部署脚本**
   ```bash
   bash scripts/deploy-direct.sh
   ```

3. **完成！**
   - 文件自动同步到服务器
   - 自动构建和重启
   - 网站自动更新

## 自定义配置

### 修改服务器信息

编辑 `scripts/deploy-direct.sh`：

```bash
SERVER_IP="115.159.92.235"      # 您的服务器IP
SERVER_USER="root"               # SSH用户名
SERVER_DIR="/var/www/in-nutri-site"  # 服务器上的项目目录
```

### 排除不需要同步的文件

脚本已经排除了：
- `node_modules` - 依赖包（在服务器上安装）
- `.next` - 构建输出（在服务器上构建）
- `.git` - Git仓库
- `*.db` - 数据库文件（服务器上已有）
- `.env.local` - 本地环境变量

如需添加更多排除项，编辑脚本中的 `--exclude` 参数。

## 高级用法

### 只同步特定文件

```bash
# 只同步特定目录
rsync -avz ./app/ root@115.159.92.235:/var/www/in-nutri-site/app/
```

### 查看同步进度

脚本默认显示同步进度，可以看到：
- 正在同步的文件
- 同步速度
- 完成百分比

### 部署前备份

可以在脚本中添加备份功能：

```bash
# 在部署前备份
ssh root@115.159.92.235 "cd /var/www/in-nutri-site && tar -czf /backup/backup-\$(date +%Y%m%d-%H%M%S).tar.gz ."
```

## 故障排查

### 问题1：SSH连接失败

**解决：**
```bash
# 测试SSH连接
ssh -v root@115.159.92.235

# 如果提示密码，输入服务器密码
# 如果提示密钥错误，检查 ~/.ssh/id_rsa 是否存在
```

### 问题2：rsync命令不存在

**解决：**
```bash
# macOS安装rsync（通常已预装）
# 如果没有，使用Homebrew
brew install rsync

# Linux通常已预装
```

### 问题3：文件同步失败

**解决：**
- 检查服务器目录权限
- 检查磁盘空间
- 查看错误信息

### 问题4：部署后应用未启动

**解决：**
```bash
# SSH到服务器检查
ssh root@115.159.92.235
pm2 status
pm2 logs in-nutri-site
```

## 优势对比

| 方式 | 优点 | 缺点 |
|------|------|------|
| **直接部署** | ✅ 快速<br>✅ 无需GitHub<br>✅ 实时同步 | 需要SSH连接 |
| **GitHub部署** | ✅ 有版本历史<br>✅ 可以回滚 | 需要推送代码 |

## 推荐工作流程

**开发时：**
- 使用直接部署脚本快速测试

**正式发布：**
- 推送到GitHub（保留版本历史）
- 或使用直接部署脚本

## 快速命令

```bash
# 一键部署
bash scripts/deploy-direct.sh

# 只同步文件（不部署）
rsync -avz --exclude 'node_modules' --exclude '.next' ./ root@115.159.92.235:/var/www/in-nutri-site/

# 只执行部署命令（文件已同步）
ssh root@115.159.92.235 "cd /var/www/in-nutri-site && npm install --production && npm run build && pm2 restart in-nutri-site"
```

## 总结

现在您可以：
1. ✅ 在Cursor中修改代码
2. ✅ 运行 `bash scripts/deploy-direct.sh`
3. ✅ 代码自动同步到服务器并部署
4. ✅ 无需GitHub，无需手动操作！

需要我帮您配置SSH连接吗？




