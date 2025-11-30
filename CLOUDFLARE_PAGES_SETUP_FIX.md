# Cloudflare Pages 构建配置修复

## 问题：测试页面返回 404

当使用 `@cloudflare/next-on-pages` 时，Cloudflare Pages 需要正确的构建配置。

## 解决方案

### 1. 在 Cloudflare Pages 控制台设置构建配置

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** → 选择项目 `in-nutri-site`
3. 进入 **Settings** → **Builds & deployments**
4. 设置以下配置：

   - **Framework preset**: `None`（不要选择 Next.js preset）
   - **Build command**: `npm run pages:build`
   - **Build output directory**: `.vercel/output/static`
   - **Root directory**: `/`（留空或填写 `/`）
   - **Node.js version**: `18` 或更高

### 2. 验证构建命令

确保 `package.json` 中有以下脚本：

```json
{
  "scripts": {
    "pages:build": "npx @cloudflare/next-on-pages"
  }
}
```

### 3. 构建流程说明

`@cloudflare/next-on-pages` 的工作流程：

1. 运行 `npm run pages:build`
2. 这会执行 `npx @cloudflare/next-on-pages`
3. 适配器会：
   - 先运行 `next build`（如果需要）
   - 然后将 Next.js 应用转换为 Cloudflare Pages 兼容格式
   - 输出到 `.vercel/output/static` 目录

### 4. 检查构建输出

构建成功后，应该能看到：

```
.vercel/
  └── output/
      └── static/
          ├── _worker.js
          ├── index.html
          └── ... (其他静态文件)
```

### 5. 如果仍然 404

检查以下几点：

1. **构建是否成功**
   - 查看 Cloudflare Pages 部署日志
   - 确认没有构建错误

2. **输出目录是否正确**
   - 确认 `.vercel/output/static` 目录存在
   - 确认目录中有 `_worker.js` 文件

3. **路由是否正确**
   - `@cloudflare/next-on-pages` 会自动处理 Next.js 路由
   - 如果路由不工作，可能是适配器配置问题

4. **重新部署**
   - 修改配置后，需要重新触发部署
   - 可以推送一个空提交来触发：`git commit --allow-empty -m "触发重新部署" && git push`

### 6. 调试步骤

1. **本地测试构建**
   ```bash
   npm run pages:build
   ```
   检查 `.vercel/output/static` 目录是否生成

2. **检查构建日志**
   - 在 Cloudflare Pages 控制台查看构建日志
   - 查找错误或警告信息

3. **验证路由**
   - 访问根路径：`https://in-nutri-site.pages.dev/`
   - 访问测试页面：`https://in-nutri-site.pages.dev/test`
   - 如果根路径可以访问但测试页面不行，可能是路由配置问题

### 7. 常见问题

**Q: 为什么使用 `None` 作为 Framework preset？**
A: 因为 `@cloudflare/next-on-pages` 会自己处理 Next.js 构建，不需要 Cloudflare 的自动检测。

**Q: 为什么输出目录是 `.vercel/output/static`？**
A: 这是 `@cloudflare/next-on-pages` 的默认输出目录。

**Q: 可以修改输出目录吗？**
A: 可以，但需要同时修改 `@cloudflare/next-on-pages` 的配置和 Cloudflare Pages 的设置。






