# Cloudflare Pages 部署检查清单

## 问题：部署后的页面与本地预览不一致

### 可能的原因和解决方案

#### 1. 数据库连接问题

**检查 D1 数据库绑定**：
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** → 项目 `in-nutri-site`
3. 进入 **Settings** → **Functions**
4. 检查 **D1 Database bindings**：
   - 变量名：`DB`
   - 数据库：`in-nutri-db`

**如果未绑定，请添加绑定**。

**检查数据库数据**：
```bash
# 检查数据库中是否有数据
npx wrangler d1 query in-nutri-db --command="SELECT COUNT(*) FROM banners;" --remote
npx wrangler d1 query in-nutri-db --command="SELECT COUNT(*) FROM products;" --remote
```

**如果没有数据，运行迁移和种子数据**：
```bash
# 应用迁移
npx wrangler d1 execute in-nutri-db --file=./drizzle/0000_*.sql --remote

# 插入默认数据（如果需要）
# 可以通过后台管理面板添加数据，或手动插入
```

#### 2. API 路由问题

**检查 API 路由是否正常工作**：
1. 访问 `https://in-nutri-site.pages.dev/api/banners`
2. 应该返回 JSON 数据
3. 如果返回错误，检查 Cloudflare Pages 函数日志

**检查函数日志**：
1. 在 Cloudflare Dashboard 中进入 **Workers & Pages** → 项目
2. 进入 **Functions** 标签页
3. 查看是否有错误日志

#### 3. 静态资源问题

**检查静态资源是否加载**：
1. 打开浏览器开发者工具（F12）
2. 进入 **Network** 标签页
3. 刷新页面
4. 检查以下资源是否加载成功：
   - `/logo.png`
   - CSS 文件
   - JavaScript 文件

**如果资源加载失败**：
- 检查 `public` 文件夹中的文件是否已提交到 Git
- 确保文件大小不超过 Cloudflare Pages 的限制（25 MB）

#### 4. 客户端组件问题

**检查客户端组件是否正常工作**：
- `HeroClient` - 打字效果
- `ScrollReset` - 滚动重置
- `VideoPlayer` - 视频播放
- `QRCodeModal` - 二维码弹窗
- `SocialIcons` - 社交媒体图标

**如果动态效果不工作**：
1. 检查浏览器控制台是否有 JavaScript 错误
2. 确认客户端组件是否正确标记为 `"use client"`
3. 检查是否有 Edge Runtime 兼容性问题

#### 5. CSS 和样式问题

**检查 CSS 是否加载**：
1. 打开浏览器开发者工具（F12）
2. 检查 **Elements** 标签页中的元素样式
3. 确认 CSS 变量是否正确应用：
   - `--color-primary`
   - `--color-cream`
   - `--color-forest`
   等

**如果样式不正确**：
- 检查 `app/globals.css` 是否正确加载
- 确认 Tailwind CSS 配置是否正确

#### 6. 环境变量问题

**检查环境变量**：
1. 在 Cloudflare Dashboard 中进入项目设置
2. 进入 **Settings** → **Environment variables**
3. 确认以下变量（如果需要）：
   - `SESSION_SECRET` - 用于管理员认证
   - `NEXT_PUBLIC_BASE_URL` - 如果需要（通常不需要）

#### 7. 构建配置问题

**检查构建配置**：
1. 进入 **Settings** → **Builds & deployments**
2. 确认以下配置：
   - **Framework preset**: `None`
   - **Build command**: `npm run pages:build`
   - **Build output directory**: `.vercel/output/static`
   - **Root directory**: `/`（留空）
   - **Node.js version**: `18` 或更高

#### 8. 兼容性标志

**检查兼容性标志**：
1. 进入 **Settings** → **Compatibility Flags**
2. 确认 **Production** 和 **Preview** 环境都添加了：
   - `nodejs_compat`

### 调试步骤

1. **检查部署日志**：
   - 在 Cloudflare Dashboard 中查看最新的部署日志
   - 查找错误或警告信息

2. **检查浏览器控制台**：
   - 打开部署的网站
   - 按 F12 打开开发者工具
   - 查看 Console 标签页中的错误

3. **检查网络请求**：
   - 在开发者工具的 Network 标签页中
   - 检查 API 请求是否成功
   - 检查静态资源是否加载

4. **对比本地和部署环境**：
   - 本地：`http://localhost:3000`
   - 部署：`https://in-nutri-site.pages.dev`
   - 对比两者的差异

### 常见问题解决

**问题：页面显示但内容为空**
- 可能是 API 调用失败
- 检查 `/api/banners` 和 `/api/brand-story` 是否返回数据
- 检查数据库连接

**问题：动态效果不工作**
- 检查客户端组件是否正确加载
- 检查浏览器控制台是否有 JavaScript 错误

**问题：样式不正确**
- 检查 CSS 文件是否加载
- 检查 Tailwind CSS 是否正确编译

**问题：图片不显示**
- 检查图片路径是否正确
- 检查图片文件是否存在于 `public` 文件夹
- 检查 Next.js Image 优化是否正常工作

### 如果问题仍然存在

请提供以下信息：
1. 浏览器控制台的完整错误信息
2. Network 标签页中失败的请求详情
3. Cloudflare Pages 部署日志
4. 具体哪些功能或效果不工作



