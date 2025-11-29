# 腾讯云部署基本要求

本文档定义了项目部署到腾讯云的基本条件，**所有后续代码修改都必须遵守这些要求**。

## 📋 核心原则

1. **必须支持 Node.js 运行时环境**（非 Edge Runtime）
2. **必须支持文件系统访问**（SQLite 数据库和文件上传）
3. **必须支持标准 Next.js 构建和启动流程**
4. **不能依赖 Cloudflare 特定功能**（如 D1、R2、Edge Runtime）

## ✅ 必须遵守的要求

### 1. 数据库配置

- ✅ **允许使用**: `better-sqlite3` 和 SQLite 文件数据库
- ✅ **允许使用**: MySQL、PostgreSQL（通过 Drizzle ORM）
- ❌ **禁止使用**: Cloudflare D1（仅在 Cloudflare 环境可用）
- ❌ **禁止使用**: Edge Runtime 专用的数据库适配器

**检查点**: 确保 `db/index.ts` 在 Node.js 环境中能正确初始化 SQLite 连接。

### 2. 文件系统访问

- ✅ **允许使用**: 本地文件系统（`public/uploads/`、`db/sqlite.db`）
- ✅ **允许使用**: 腾讯云 COS（对象存储，可选）
- ❌ **禁止使用**: Cloudflare R2（仅在 Cloudflare 环境可用）

**检查点**: 文件上传 API 必须支持本地文件系统写入。

### 3. Next.js 配置

- ✅ **必须支持**: `npm run build` 和 `npm run start`
- ✅ **必须支持**: Node.js Runtime（非 Edge Runtime）
- ❌ **禁止使用**: `@cloudflare/next-on-pages` 适配器（仅在 Cloudflare Pages 需要）
- ❌ **禁止使用**: Edge Runtime 路由配置

**检查点**: `next.config.js` 不能包含仅适用于 Cloudflare 的配置。

### 4. 环境变量

**必需的环境变量**:
```env
NODE_ENV=production
DATABASE_URL=./db/sqlite.db  # 或 MySQL/PostgreSQL 连接字符串
NEXT_PUBLIC_BASE_URL=https://your-domain.com
SESSION_SECRET=your-secret-key
PORT=3000  # 可选，默认 3000
```

**检查点**: 确保所有环境变量都有合理的默认值或清晰的错误提示。

### 5. 依赖包

- ✅ **允许使用**: 标准 Node.js 包（如 `better-sqlite3`、`bcryptjs`）
- ❌ **禁止使用**: Cloudflare Workers 专用包（如 `@cloudflare/workers-types`）
- ❌ **禁止使用**: Edge Runtime 不兼容的包

**检查点**: 所有依赖必须能在标准 Node.js 环境中运行。

### 6. API 路由

- ✅ **必须使用**: Node.js Runtime（默认）
- ❌ **禁止使用**: `export const runtime = 'edge'`
- ❌ **禁止使用**: Edge Runtime 专用 API（如 `Request.cf`）

**检查点**: 所有 API 路由必须能在 Node.js 环境中运行。

### 7. 静态资源

- ✅ **允许使用**: `public/` 目录中的静态文件
- ✅ **允许使用**: Next.js Image 组件（需要配置 `unoptimized` 或使用外部图片服务）
- ❌ **禁止依赖**: Cloudflare 的图片优化服务

**检查点**: 图片优化配置必须兼容标准 Next.js 部署。

## 🔍 代码修改检查清单

在提交代码前，请确认：

- [ ] 没有添加 `export const runtime = 'edge'` 到任何路由
- [ ] 没有使用 Cloudflare 特定的 API（如 `Request.cf`、`globalThis.DB`）
- [ ] 数据库访问代码在 Node.js 环境中能正常工作
- [ ] 文件上传功能支持本地文件系统
- [ ] `npm run build` 能成功完成
- [ ] `npm run start` 能成功启动应用
- [ ] 没有引入 Edge Runtime 不兼容的依赖

## 🚀 部署验证

部署前必须验证：

```bash
# 1. 构建测试
npm run build

# 2. 启动测试
npm run start

# 3. 检查数据库连接
npm run db:push

# 4. 运行部署检查脚本
npm run check:tencent
```

## 📝 修改代码时的注意事项

### ✅ 允许的操作

- 添加新的 API 路由（使用默认 Node.js Runtime）
- 修改数据库 schema（使用 Drizzle ORM）
- 添加新的页面和组件
- 使用标准 Node.js 包

### ❌ 禁止的操作

- 将路由改为 Edge Runtime
- 使用 Cloudflare 特定的 API
- 依赖 Cloudflare 服务（D1、R2、Workers）
- 使用 Edge Runtime 不兼容的包

## 🔧 如果必须使用 Edge Runtime

如果确实需要使用 Edge Runtime 功能，请：

1. **创建条件分支**: 使用环境变量检测运行环境
2. **提供降级方案**: 在 Node.js 环境中提供替代实现
3. **更新文档**: 说明不同环境的差异
4. **添加测试**: 确保两种环境都能正常工作

## 📚 相关文档

- [腾讯云部署指南](./DEPLOY_TENCENT_CLOUD.md)
- [部署脚本](./scripts/deploy-tencent.sh)
- [PM2 配置](./ecosystem.config.js)

## ⚠️ 重要提醒

**所有代码修改都必须确保项目能在腾讯云轻量应用服务器上正常运行。**

如果修改可能影响部署兼容性，请：
1. 先运行 `npm run check:tencent` 检查
2. 在本地测试 `npm run build` 和 `npm run start`
3. 更新本文档（如需要）
4. 在 PR 中说明兼容性影响

