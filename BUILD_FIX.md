# 构建问题修复说明

## 已修复的问题

### 1. ✅ Edge Runtime 配置问题
- **修复**: `app/api/auth/logout/route.ts` - 从 `edge` 改为 `nodejs`
- **修复**: `app/debug/page.tsx` - 从 `edge` 改为 `nodejs`，并添加 `force-dynamic`
- **原因**: Edge Runtime 不支持 cookies API 和数据库连接

### 2. ✅ 静态生成问题
- **修复**: `components/Hero.tsx` - 将 `cache: "no-store"` 改为 `next: { revalidate: 60 }`
- **修复**: `components/BrandStory.tsx` - 将 `cache: "no-store"` 改为 `next: { revalidate: 60 }`
- **修复**: `components/SiteFooter.tsx` - 将 `cache: "no-store"` 改为 `next: { revalidate: 60 }`
- **修复**: `app/page.tsx` - 添加 `export const dynamic = 'force-dynamic'`
- **原因**: `no-store` 会导致静态生成失败，使用 `revalidate` 允许静态生成但定期更新

### 3. ⚠️ 数据库表不存在问题

**问题**: 构建时数据库表不存在，导致构建失败
```
[SqliteError: no such table: gallery_images]
[SqliteError: no such table: articles]
```

**解决方案**:

#### 方案 A: 在 EdgeOne 构建配置中添加构建前步骤

在 EdgeOne Pages 项目设置中，添加构建命令：

```bash
npm run db:push && npm run build
```

或者创建一个新的脚本：

```json
{
  "scripts": {
    "build:edgeone": "npm run db:push && npm run build"
  }
}
```

#### 方案 B: 在构建脚本中处理数据库错误

修改数据库访问代码，在表不存在时返回空数组而不是抛出错误（已实现）。

#### 方案 C: 使用环境变量跳过数据库检查

在构建时设置环境变量，跳过需要数据库的页面：

```bash
SKIP_DB_CHECK=true npm run build
```

## 当前状态

✅ **已修复**:
- Edge Runtime 配置
- 静态生成问题
- 数据库错误处理（返回空数组而不是抛出错误）

⚠️ **需要配置**:
- EdgeOne 构建命令需要包含数据库初始化步骤

## 推荐配置

### EdgeOne Pages 构建配置

**构建命令**:
```bash
npm run db:push || true && npm run build
```

`|| true` 确保即使数据库初始化失败，构建也能继续（因为代码已经处理了表不存在的情况）。

### 本地构建

```bash
# 1. 初始化数据库
npm run db:push

# 2. 构建项目
npm run build
```

## 验证修复

运行以下命令验证修复：

```bash
# 1. 检查 Edge Runtime 配置
npm run check:tencent

# 2. 尝试构建
npm run build

# 3. 如果构建成功，启动服务器
npm run start
```

## 注意事项

1. **数据库初始化**: 在 EdgeOne 构建时，数据库文件可能不存在，需要先运行 `db:push`
2. **静态生成**: 首页和组件现在使用 `revalidate: 60`，允许静态生成但每60秒更新一次
3. **动态路由**: 所有使用 cookies 或数据库的页面都已标记为 `force-dynamic`

## 符合腾讯云部署要求

所有修复都符合腾讯云部署基本要求：
- ✅ 使用 Node.js Runtime（非 Edge Runtime）
- ✅ 支持文件系统访问（SQLite）
- ✅ 支持标准 Next.js 构建流程
- ✅ 不依赖 Cloudflare 特定功能
