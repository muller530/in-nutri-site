# 修复 404 错误 - 详细步骤

## 问题诊断

网站返回 404 错误，可能的原因：
1. 构建输出目录配置错误
2. Next.js 16 在 Cloudflare Pages 上的兼容性问题
3. 构建失败但显示为成功

## 立即检查步骤

### 1. 检查 Cloudflare Pages 构建日志

**这是最重要的步骤！**

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **Pages**
3. 选择项目 `in-nutri-site`
4. 点击 **"部署 (Deployments)"**
5. 找到最新的部署（ID: `b50dec09-92ad-4660-9e4c-98c253dc9010`）
6. 点击部署查看详情
7. **查看完整的构建日志**

### 2. 检查构建配置

在 Cloudflare Pages 项目设置中：

1. 进入 **"设置 (Settings)"** → **"构建设置 (Builds & deployments)"**
2. 检查以下配置：

   **构建命令 (Build command):**
   ```
   npm run build
   ```

   **构建输出目录 (Build output directory):**
   ```
   .next
   ```
   或尝试：
   ```
   .next/standalone
   ```

   **Framework preset:**
   - 选择 **"Next.js"**（如果可用）
   - 或选择 **"None"** 并手动配置

   **Node.js 版本:**
   - 选择 **18** 或更高

### 3. 可能的解决方案

#### 方案 A: 修改构建输出目录

如果当前是 `.next`，尝试改为：

1. 在 Cloudflare Pages 设置中
2. 修改 **"构建输出目录"** 为：`.next/standalone`
3. 保存并重新部署

#### 方案 B: 使用静态导出（如果不需要 SSR）

如果您的网站主要是静态内容，可以：

1. 修改 `next.config.js`：
   ```javascript
   const nextConfig = {
     output: 'export',
     images: {
       unoptimized: true,
     },
   };
   ```

2. 修改 Cloudflare Pages 构建输出目录为：`out`

3. 重新部署

**注意**：静态导出不支持 API 路由和服务器端渲染。

#### 方案 C: 检查环境变量

确保在 Cloudflare Pages 设置中添加了：

- `SESSION_SECRET`: 随机字符串（至少32字符）
- `NODE_ENV`: `production`

### 4. 验证构建输出

在本地测试构建：

```bash
npm run build
ls -la .next
```

检查 `.next` 目录是否包含：
- `standalone/` 目录（如果使用 standalone 模式）
- `static/` 目录
- 其他必要的文件

### 5. 重新部署

修改配置后：

1. 在 Cloudflare Pages 控制台
2. 进入 **"部署 (Deployments)"**
3. 点击 **"重新部署 (Redeploy)"** 或 **"重试部署 (Retry deployment)"**
4. 等待部署完成
5. 查看新的构建日志

### 6. 测试访问

部署完成后，尝试访问：

- 主 URL: `https://in-nutri-site.pages.dev`
- 部署特定 URL: `https://[新部署ID].in-nutri-site.pages.dev`

## 如果仍然无法访问

### 检查清单

- [ ] 构建日志中是否有错误？
- [ ] 构建是否成功完成？
- [ ] 构建输出目录是否正确？
- [ ] 环境变量是否已设置？
- [ ] D1 绑定是否已添加？
- [ ] Node.js 版本是否正确？

### 获取帮助

如果问题持续，请提供：

1. **完整的构建日志**（从 Cloudflare Pages 控制台复制）
2. **构建配置截图**（构建设置页面）
3. **错误信息**（如果有）

## 临时解决方案

如果急需网站上线，可以考虑：

1. **降级到 Next.js 15**
   ```bash
   npm install next@15.5.2
   npm install --save-dev @cloudflare/next-on-pages
   ```

2. **使用 Vercel 部署**（Next.js 原生支持）

3. **使用静态导出**（如果不需要动态功能）

## 下一步

**请先检查 Cloudflare Pages 控制台的构建日志**，这是诊断问题的关键！

将构建日志的内容发给我，我可以帮您分析具体问题。






