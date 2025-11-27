# Cloudflare Pages 404 错误 - 最终解决方案

## 问题诊断

- ✅ 构建成功（本地测试通过）
- ✅ `standalone` 目录已生成
- ❌ 网站返回 404 错误

**根本原因**：Cloudflare Pages 的构建输出目录配置不正确。

## 解决方案

### 方案 1: 修改 Cloudflare Pages 构建输出目录（推荐）

在 Cloudflare Pages 控制台：

1. **进入项目设置**
   - 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 **Workers & Pages** → **Pages**
   - 选择项目 `in-nutri-site`
   - 点击 **"设置 (Settings)"** → **"构建设置 (Builds & deployments)"**

2. **修改构建输出目录**
   
   当前可能是：`.next` 或 `.next/standalone`
   
   **改为**：
   ```
   .next
   ```
   
   或者尝试：
   ```
   .next/standalone
   ```

3. **检查 Framework preset**
   - 如果显示 **"Next.js"**，保持原样
   - 如果显示 **"None"**，尝试改为 **"Next.js"**

4. **保存并重新部署**
   - 点击 **"保存 (Save)"**
   - 触发新的部署

### 方案 2: 使用静态导出（如果不需要 SSR 和 API 路由）

如果您的网站主要是静态内容，可以改用静态导出：

1. **修改 `next.config.js`**：
   ```javascript
   const nextConfig = {
     output: 'export', // 改为静态导出
     images: {
       unoptimized: true, // 静态导出需要禁用图片优化
       remotePatterns: [
         {
           protocol: "https",
           hostname: "images.unsplash.com",
         },
       ],
     },
   };
   ```

2. **修改 Cloudflare Pages 构建输出目录**：
   ```
   out
   ```

3. **重新部署**

**注意**：静态导出不支持：
- ❌ API 路由（`/api/*`）
- ❌ 服务器端渲染（SSR）
- ❌ 动态路由（需要预渲染）
- ❌ 管理员后台（需要 API）

### 方案 3: 检查构建日志

如果以上方案都不行，请检查构建日志：

1. 在 Cloudflare Pages 控制台
2. 进入 **"部署 (Deployments)"**
3. 点击最新的部署（ID: `5c068b9a-3c84-4575-af56-56f37c8dcfc9`）
4. 查看 **"构建日志 (Build Logs)"**
5. 查找以下错误：
   - `Build output directory not found`
   - `Could not find a production build`
   - `Missing required files`

## 当前配置检查清单

请在 Cloudflare Pages 控制台确认：

- [ ] **构建命令**: `npm run build`
- [ ] **构建输出目录**: `.next` 或 `.next/standalone`
- [ ] **Framework preset**: `Next.js` 或 `None`
- [ ] **Node.js 版本**: `18` 或更高
- [ ] **Root directory**: `/`（项目根目录）
- [ ] **环境变量**: `SESSION_SECRET` 已设置
- [ ] **D1 绑定**: 变量名 `DB`，数据库 `in-nutri-db`

## 立即操作步骤

### 步骤 1: 检查当前配置

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **Pages** → `in-nutri-site`
3. 点击 **"设置"** → **"构建设置"**
4. **截图或记录**当前的配置

### 步骤 2: 尝试修改构建输出目录

**选项 A**: 如果当前是 `.next/standalone`，改为 `.next`
**选项 B**: 如果当前是 `.next`，改为 `.next/standalone`

### 步骤 3: 保存并等待重新部署

1. 点击 **"保存"**
2. 等待自动触发新部署（约 1-2 分钟）
3. 查看新部署状态

### 步骤 4: 测试访问

部署完成后，尝试访问：
- `https://in-nutri-site.pages.dev`
- `https://[新部署ID].in-nutri-site.pages.dev`

## 如果仍然无法访问

请提供以下信息：

1. **构建日志**（从 Cloudflare Pages 控制台复制完整日志）
2. **当前构建配置**（截图或文字描述）
3. **错误信息**（如果有）

## 临时解决方案

如果急需网站上线，可以考虑：

1. **使用 Vercel 部署**（Next.js 原生支持，更简单）
2. **降级到 Next.js 15**（然后使用 `@cloudflare/next-on-pages`）
3. **使用静态导出**（如果不需要动态功能）

## 重要提示

**最关键的是检查 Cloudflare Pages 控制台的构建日志**！

构建日志会显示：
- 构建是否成功
- 输出目录是否正确
- 是否有文件缺失
- 具体的错误信息

请先完成步骤 1-3，然后告诉我结果。

