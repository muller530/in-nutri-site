# Cloudflare 部署步骤清单

## ✅ 已完成的代码迁移

1. ✅ 创建了 D1 数据库适配器 (`db/cloudflare.ts`)
2. ✅ 更新了数据库配置以支持 D1 和 SQLite (`db/index.ts`)
3. ✅ 创建了 R2 存储适配器 (`lib/r2.ts`)
4. ✅ 更新了所有文件上传 API 以支持 R2
5. ✅ 添加了 Cloudflare 类型定义 (`types/cloudflare.d.ts`)
6. ✅ 更新了 Next.js 配置
7. ✅ 添加了部署脚本到 package.json

## 📋 部署前准备步骤

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
# 或
npm install --save-dev wrangler
```

登录 Cloudflare：
```bash
wrangler login
```

### 2. 创建 Cloudflare D1 数据库

```bash
wrangler d1 create in-nutri-db
```

**重要**：保存输出的 `database_id`，稍后需要填入 `wrangler.toml`

### 3. 创建 R2 存储桶

```bash
# 产品图片存储桶
wrangler r2 bucket create in-nutri-uploads

# 视频存储桶
wrangler r2 bucket create in-nutri-videos

# 报告存储桶
wrangler r2 bucket create in-nutri-reports
```

### 4. 配置 wrangler.toml

1. 复制示例文件：
```bash
cp wrangler.toml.example wrangler.toml
```

2. 编辑 `wrangler.toml`，填入步骤 2 中获取的 `database_id`

### 5. 配置环境变量

在 Cloudflare Pages 控制台设置以下环境变量：

- `SESSION_SECRET`: 随机字符串（至少32字符）
  ```bash
  # 生成方式
  openssl rand -base64 32
  ```

- `NEXT_PUBLIC_BASE_URL`: 您的网站 URL
  - 示例：`https://your-site.pages.dev`

- `R2_PUBLIC_URL`（可选）: R2 公共访问 URL（如果配置了自定义域名）

### 6. 配置 R2 公共访问

R2 存储桶默认是私有的，需要配置公共访问：

1. 在 Cloudflare Dashboard → R2 → 选择存储桶
2. 配置公共访问或使用自定义域名
3. 或者创建 Cloudflare Worker 作为文件代理

### 7. 数据库迁移

将 SQLite 数据库迁移到 D1：

```bash
# 生成 SQL 迁移文件（如果还没有）
npm run db:generate

# 将迁移应用到 D1
wrangler d1 execute in-nutri-db --file=./drizzle/0000_*.sql

# 或者使用 Drizzle Kit（如果支持）
npm run db:push
```

### 8. 迁移现有数据

如果有现有数据，需要导出并导入到 D1：

```bash
# 导出 SQLite 数据
sqlite3 db/sqlite.db .dump > data.sql

# 清理并导入到 D1（需要手动调整 SQL 语法）
wrangler d1 execute in-nutri-db --file=data.sql
```

### 9. 迁移文件到 R2

如果有现有上传的文件，需要上传到 R2：

```bash
# 使用 wrangler 上传文件
wrangler r2 object put in-nutri-uploads/products/image.jpg --file=./public/uploads/products/image.jpg
```

或者使用 Cloudflare Dashboard 的 R2 界面手动上传。

## 🚀 部署步骤

### 方式 A: 通过 Git 集成（推荐）

1. **推送代码到 Git 仓库**
   ```bash
   git add .
   git commit -m "准备 Cloudflare 部署"
   git push origin main
   ```

2. **在 Cloudflare Pages 控制台**
   - 访问 https://dash.cloudflare.com/
   - 进入 "Pages" → "Create a project"
   - 选择 "Connect to Git"
   - 选择您的 Git 提供商和仓库

3. **配置构建设置**
   - Framework preset: `Next.js`
   - Build command: `npm run build`
   - Build output directory: `.next`
   - Root directory: `/` (项目根目录)
   - Node.js version: `18` 或更高

4. **添加环境变量**
   - 在项目设置中添加步骤 5 中提到的环境变量

5. **部署**
   - 点击 "Save and Deploy"
   - Cloudflare 会自动构建和部署

### 方式 B: 通过 Wrangler CLI

```bash
# 构建项目
npm run build

# 部署到 Cloudflare Pages
npm run deploy:cf
# 或
wrangler pages deploy .next --project-name=in-nutri-site
```

## ⚠️ 注意事项

1. **数据库绑定**：确保 `wrangler.toml` 中的 `database_id` 正确
2. **R2 公共访问**：需要配置 R2 存储桶的公共访问或使用 Worker 代理
3. **文件 URL**：R2 中的文件 URL 可能需要调整，根据实际配置修改 `lib/r2.ts` 中的 `uploadToR2` 函数
4. **环境检测**：代码会自动检测运行环境，本地使用 SQLite，Cloudflare 使用 D1
5. **首次部署**：首次部署可能需要较长时间，请耐心等待

## 🔍 故障排查

### 问题：数据库连接失败
- 检查 `wrangler.toml` 中的 `database_id` 是否正确
- 确认 D1 数据库已创建

### 问题：文件上传失败
- 检查 R2 存储桶是否已创建
- 确认 `wrangler.toml` 中的存储桶绑定名称正确
- 检查 R2 存储桶的权限设置

### 问题：文件无法访问
- 配置 R2 存储桶的公共访问
- 或创建 Cloudflare Worker 作为文件代理
- 更新 `R2_PUBLIC_URL` 环境变量

### 问题：构建失败
- 检查 Node.js 版本（需要 18+）
- 查看构建日志中的错误信息
- 确认所有依赖已正确安装

## 📚 相关文档

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 文档](https://developers.cloudflare.com/r2/)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/)

