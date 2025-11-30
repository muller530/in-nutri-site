# Cloudflare Pages 构建配置问题排查

## 问题：网站返回 404

### 可能的原因

1. **构建输出目录配置错误**
   - Cloudflare Pages 需要正确的构建输出目录
   - Next.js 16 的默认输出是 `.next`，但可能需要特殊配置

2. **Next.js 16 兼容性**
   - `@cloudflare/next-on-pages` 不支持 Next.js 16
   - 需要使用其他方法

### 解决方案

#### 方案 1: 检查 Cloudflare Pages 构建配置

在 Cloudflare Pages 控制台检查：

1. **进入项目设置**
   - 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 **Workers & Pages** → **Pages**
   - 选择项目 `in-nutri-site`
   - 点击 **"设置 (Settings)"** → **"构建设置 (Builds & deployments)"**

2. **检查构建配置**
   - **Framework preset**: 应该选择 **"Next.js"** 或 **"None"**
   - **Build command**: `npm run build`
   - **Build output directory**: `.next` 或 `out`（取决于配置）
   - **Root directory**: `/`（项目根目录）
   - **Node.js version**: `18` 或更高

3. **如果使用 Next.js preset**
   - Cloudflare 会自动检测 Next.js 项目
   - 但可能需要手动指定输出目录

#### 方案 2: 使用静态导出（如果不需要 SSR）

如果您的网站主要是静态内容，可以修改 `next.config.js`：

```javascript
const nextConfig = {
  output: 'export', // 静态导出
  images: {
    unoptimized: true, // 静态导出需要禁用图片优化
  },
};
```

然后修改构建输出目录为 `out`。

**注意**：静态导出不支持：
- API 路由
- 服务器端渲染
- 动态路由（需要预渲染）

#### 方案 3: 检查构建日志

1. 在 Cloudflare Pages 控制台
2. 进入 **"部署 (Deployments)"**
3. 点击最新的部署
4. 查看 **"构建日志 (Build Logs)"**
5. 查找错误信息

常见错误：
- `Error: Could not find a production build`
- `Error: Build output directory not found`
- `Error: Missing required files`

#### 方案 4: 手动指定构建输出

如果 Cloudflare 自动检测失败，可以：

1. **修改 package.json 构建脚本**
   ```json
   {
     "scripts": {
       "build": "next build && cp -r .next/standalone . && cp -r .next/static .next/standalone/.next/"
     }
   }
   ```

2. **或使用 wrangler 手动部署**
   ```bash
   npm run build
   npx wrangler pages deploy .next
   ```

### 当前配置检查清单

- [ ] Cloudflare Pages 构建命令：`npm run build`
- [ ] 构建输出目录：`.next` 或 `out`
- [ ] Node.js 版本：18 或更高
- [ ] Framework preset：Next.js 或 None
- [ ] 环境变量已设置：`SESSION_SECRET`
- [ ] D1 绑定已添加：变量名 `DB`，数据库 `in-nutri-db`

### 下一步操作

1. **检查 Cloudflare Pages 控制台的构建日志**
   - 查看是否有构建错误
   - 确认构建是否成功完成

2. **验证构建输出**
   - 确认 `.next` 目录已生成
   - 检查 `.next/standalone` 是否存在（如果使用 standalone 模式）

3. **重新部署**
   - 如果配置已修改，触发新的部署
   - 等待部署完成

4. **测试访问**
   - 使用正确的 URL：`https://in-nutri-site.pages.dev`
   - 或使用部署特定的 URL：`https://[部署ID].in-nutri-site.pages.dev`

### 如果问题仍然存在

请提供以下信息：
1. Cloudflare Pages 构建日志（完整）
2. 构建输出目录的内容
3. `next.config.js` 的完整内容
4. `package.json` 的构建脚本






