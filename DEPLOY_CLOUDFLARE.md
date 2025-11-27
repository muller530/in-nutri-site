# Cloudflare Pages 部署指南

本指南将帮助您将 In-nutri 网站部署到 Cloudflare Pages。

## ⚠️ 重要说明

由于 Cloudflare Pages 的限制，当前项目需要进行以下重大调整：

1. **数据库**：从 SQLite (`better-sqlite3`) 迁移到 Cloudflare D1
2. **文件存储**：从本地文件系统迁移到 Cloudflare R2
3. **运行时环境**：适配 Cloudflare Edge Runtime

**注意**：这是一个较大的迁移工作，建议先在测试环境验证。

## 📋 前置要求

1. Cloudflare 账户（免费账户即可）
2. Node.js 18+ 和 npm
3. Git 仓库（GitHub/GitLab/Bitbucket）

## 🚀 快速开始

### 步骤 1: 安装 Wrangler CLI

```bash
npm install -g wrangler
# 或本地安装
npm install --save-dev wrangler
```

登录 Cloudflare：
```bash
wrangler login
```

### 步骤 2: 创建 Cloudflare D1 数据库

```bash
# 创建 D1 数据库
wrangler d1 create in-nutri-db

# 输出示例：
# ✅ Created database in-nutri-db in region APAC
# Created your database using D1's new storage backend. The new storage backend is not yet recommended for production workloads, but backs up your data via snapshots to R2.
# [[d1_databases]]
# binding = "DB"
# database_name = "in-nutri-db"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  ← 保存这个 ID
```

### 步骤 3: 创建 Cloudflare R2 存储桶

```bash
# 创建产品图片存储桶
wrangler r2 bucket create in-nutri-uploads

# 创建视频存储桶
wrangler r2 bucket create in-nutri-videos

# 创建报告存储桶
wrangler r2 bucket create in-nutri-reports
```

### 步骤 4: 配置 wrangler.toml

在项目根目录创建 `wrangler.toml` 文件（参考 `wrangler.toml.example`）：

```toml
name = "in-nutri-site"
compatibility_date = "2024-01-01"
pages_build_output_dir = ".next"

[[d1_databases]]
binding = "DB"
database_name = "in-nutri-db"
database_id = "YOUR_D1_DATABASE_ID"  # 替换为步骤2中的 database_id

[[r2_buckets]]
binding = "UPLOADS_BUCKET"
bucket_name = "in-nutri-uploads"

[[r2_buckets]]
binding = "VIDEOS_BUCKET"
bucket_name = "in-nutri-videos"

[[r2_buckets]]
binding = "REPORTS_BUCKET"
bucket_name = "in-nutri-reports"
```

### 步骤 5: 更新 package.json

添加 Cloudflare 相关依赖：

```bash
npm install --save-dev @cloudflare/next-on-pages wrangler
```

### 步骤 6: 更新 Next.js 配置

修改 `next.config.js`：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Cloudflare Pages 适配
  output: 'standalone', // 或 'export' 如果使用静态导出
};

module.exports = nextConfig;
```

### 步骤 7: 配置环境变量

在 Cloudflare Pages 控制台设置环境变量：

**必需的环境变量：**
- `SESSION_SECRET`: 用于会话加密的随机字符串（至少32字符）
- `NEXT_PUBLIC_BASE_URL`: 您的网站 URL（如 `https://your-site.pages.dev`）

**可选环境变量：**
- `NODE_ENV`: `production`

### 步骤 8: 部署方式

#### 方式 A: 通过 Git 集成（推荐）

1. **推送代码到 Git 仓库**
   ```bash
   git add .
   git commit -m "准备 Cloudflare 部署"
   git push origin main
   ```

2. **在 Cloudflare Pages 控制台连接仓库**
   - 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 "Pages" → "Create a project"
   - 选择 "Connect to Git"
   - 选择您的 Git 提供商和仓库

3. **配置构建设置**
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Root directory**: `/` (项目根目录)
   - **Node.js version**: 18 或更高

4. **添加环境变量**
   - 在项目设置中添加步骤7中提到的环境变量

5. **部署**
   - 点击 "Save and Deploy"
   - Cloudflare 会自动构建和部署

#### 方式 B: 通过 Wrangler CLI

```bash
# 构建项目
npm run build

# 部署到 Cloudflare Pages
wrangler pages deploy .next --project-name=in-nutri-site
```

## ⚙️ 代码迁移需求

### 1. 数据库迁移（SQLite → D1）

需要修改 `db/index.ts` 以支持 D1：

```typescript
// 需要创建适配器来支持 D1 和 SQLite
// 在开发环境使用 SQLite，生产环境使用 D1
```

### 2. 文件上传迁移（本地文件系统 → R2）

需要修改以下文件：
- `app/api/admin/upload/route.ts`
- `app/api/admin/upload-video/route.ts`
- `app/api/admin/upload-report/route.ts`

改为使用 R2 API 上传文件。

### 3. 文件访问

R2 中的文件需要通过 Cloudflare 的公共 URL 或自定义域名访问。

## 📝 迁移检查清单

- [ ] 安装 Wrangler CLI
- [ ] 创建 D1 数据库
- [ ] 创建 R2 存储桶（3个）
- [ ] 配置 `wrangler.toml`
- [ ] 更新数据库代码以支持 D1
- [ ] 更新文件上传代码以使用 R2
- [ ] 配置环境变量
- [ ] 运行数据库迁移
- [ ] 迁移现有文件到 R2
- [ ] 测试部署

## 🔧 本地测试

在部署前，可以使用 Wrangler 在本地测试：

```bash
# 启动本地开发服务器（使用 D1）
wrangler pages dev .next --local

# 或使用远程 D1 数据库
wrangler pages dev .next --d1=DB=in-nutri-db
```

## 📚 相关资源

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 文档](https://developers.cloudflare.com/r2/)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/)

## ⚠️ 注意事项

1. **数据库迁移**：需要将 SQLite 数据导出并导入到 D1
2. **文件迁移**：需要将 `public/uploads/` 中的文件上传到 R2
3. **API 路由限制**：某些 Node.js API 在 Edge Runtime 中不可用
4. **文件大小限制**：Cloudflare Pages 有文件大小限制
5. **构建时间**：首次构建可能需要较长时间

## 🆘 常见问题

### Q: 如何迁移 SQLite 数据到 D1？
A: 可以使用 Drizzle ORM 的迁移功能，或手动导出 SQL 并导入到 D1。

### Q: 如何访问 R2 中的文件？
A: 需要配置 R2 的公共访问，或使用 Cloudflare Workers 作为代理。

### Q: 支持文件上传吗？
A: 是的，但需要使用 R2 API，不能使用本地文件系统。

---

**提示**：由于迁移工作量较大，建议分阶段进行：
1. 先部署静态部分
2. 然后迁移数据库
3. 最后迁移文件存储
