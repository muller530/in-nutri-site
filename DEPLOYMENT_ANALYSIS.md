# 部署环境差异分析

## 本地开发 vs Cloudflare Pages 的主要差异

### 1. **运行时环境**

**本地开发 (Node.js Runtime)**
- 使用完整的 Node.js 环境
- 支持所有 Node.js API（`fs`, `path`, `crypto` 等）
- 可以直接使用 `better-sqlite3` 连接 SQLite 数据库
- API 路由使用 Node.js Runtime

**Cloudflare Pages (Edge Runtime)**
- 使用 Cloudflare Workers 的 Edge Runtime
- 不支持 Node.js 文件系统 API
- 需要使用 Cloudflare D1 数据库（不是 SQLite）
- 所有 API 路由必须使用 Edge Runtime
- 某些 Node.js 模块无法使用

### 2. **数据库连接**

**本地开发**
- 使用 `better-sqlite3` 连接本地 SQLite 文件 (`db/sqlite.db`)
- 数据库文件存储在本地文件系统

**Cloudflare Pages**
- 必须使用 Cloudflare D1 数据库
- 需要配置 D1 绑定
- 数据库存储在 Cloudflare 的分布式网络中

### 3. **API 调用**

**本地开发**
- Server Component 中的 `fetch` 可以使用绝对 URL (`http://localhost:3000`)
- 相对路径也能正常工作

**Cloudflare Pages**
- Server Component 中的 `fetch` 在 Edge Runtime 中行为不同
- 相对路径可能无法正确解析
- 需要特殊处理来获取正确的 API URL

### 4. **文件上传**

**本地开发**
- 文件存储在 `public/uploads/` 目录
- 使用 Node.js `fs` API

**Cloudflare Pages**
- 必须使用 Cloudflare R2 存储
- 不能使用文件系统 API

## 当前项目的问题

### 问题 1: 数据库连接
- 构建时可能无法正确检测 D1 绑定
- 运行时可能返回占位符对象，导致数据为空

### 问题 2: API URL 解析
- Edge Runtime 中的 `fetch` 可能无法正确解析相对路径
- 导致 API 调用失败

### 问题 3: 环境变量
- Cloudflare Pages 的环境变量配置可能不完整
- `NEXT_PUBLIC_BASE_URL` 等变量可能未设置

## 解决方案选项

### 选项 1: 继续使用 Cloudflare Pages（推荐修复）

**优点：**
- 免费额度高
- 全球 CDN 加速
- 与 Cloudflare 生态系统集成

**需要修复的问题：**
1. 确保 D1 数据库绑定正确配置
2. 修复 API URL 解析逻辑
3. 添加环境变量配置
4. 确保所有 API 路由正确处理 Edge Runtime

**修复步骤：**
```bash
# 1. 检查 D1 绑定
npx wrangler d1 list

# 2. 在 Cloudflare Pages 设置中添加环境变量
NEXT_PUBLIC_BASE_URL=https://your-site.pages.dev

# 3. 确保 D1 数据库有数据
npx wrangler d1 execute in-nutri-db --command="SELECT COUNT(*) FROM banners;" --remote
```

### 选项 2: 迁移到 Vercel（最简单）

**优点：**
- Next.js 原生支持，零配置
- 自动处理 Node.js Runtime
- 可以使用 PostgreSQL、MySQL 等数据库
- 文件上传到 Vercel Blob 或 AWS S3

**迁移步骤：**
1. 在 Vercel 导入 GitHub 仓库
2. 配置环境变量
3. 使用 Vercel Postgres 或外部数据库
4. 移除 Cloudflare 特定代码

**需要修改：**
- 移除 `@cloudflare/next-on-pages`
- 恢复标准的 Next.js 配置
- 使用 Vercel 的数据库服务或外部数据库

### 选项 3: 迁移到 Netlify

**优点：**
- 类似 Vercel，对 Next.js 支持好
- 可以使用 Netlify Functions
- 支持 PostgreSQL、MongoDB 等

**迁移步骤：**
1. 在 Netlify 导入 GitHub 仓库
2. 配置构建命令：`npm run build`
3. 配置环境变量
4. 使用 Netlify 数据库或外部数据库

### 选项 4: 自托管服务器（VPS）

**优点：**
- 完全控制
- 可以使用任何数据库
- 无平台限制

**缺点：**
- 需要自己维护服务器
- 需要配置 SSL、CDN 等
- 成本可能更高

**推荐方案：**
- 使用 Docker 容器化
- 部署到 DigitalOcean、Linode 等
- 使用 Nginx 作为反向代理

## 推荐方案

### 如果希望快速解决问题：**迁移到 Vercel**

Vercel 是 Next.js 的创建者，对 Next.js 的支持最好，几乎不需要任何配置就能正常工作。

### 如果希望继续使用 Cloudflare：**修复当前配置**

需要：
1. 正确配置 D1 数据库绑定
2. 修复 API URL 解析
3. 添加必要的环境变量
4. 确保数据已迁移到 D1

## 快速诊断

运行以下命令检查当前问题：

```bash
# 检查本地数据库
npm run db:seed-data

# 检查 D1 数据库
npx wrangler d1 query in-nutri-db --command="SELECT COUNT(*) FROM banners;" --remote

# 检查环境变量（在 Cloudflare Pages 设置中）
echo $NEXT_PUBLIC_BASE_URL
```

## 下一步

请告诉我：
1. 您更倾向于哪个方案？
2. 当前遇到的具体问题是什么？（页面显示、API 调用、数据库等）
3. 是否需要我帮您迁移到 Vercel 或其他平台？

