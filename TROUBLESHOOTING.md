# 故障排查指南

如果网站显示为黑色背景和占位符图形，请按照以下步骤排查：

## 1. 检查浏览器控制台

打开浏览器开发者工具（F12），查看 Console 标签页是否有错误信息。

常见错误：
- `Failed to fetch` - API 调用失败
- `Cannot read property 'X' of undefined` - 数据格式问题
- `Module not found` - 构建问题

## 2. 检查网络请求

在开发者工具的 Network 标签页中，检查以下 API 请求是否成功：

- `/api/banners` - 应该返回 200 状态码
- `/api/brand-story` - 应该返回 200 状态码
- `/api/products` - 应该返回 200 状态码

如果这些请求返回 500 错误，可能是数据库连接问题。

## 3. 检查 Cloudflare Pages 设置

### D1 数据库绑定

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** > 您的项目
3. 进入 **Settings** > **Functions**
4. 检查 **D1 Database bindings** 中是否有 `DB` 绑定
5. 如果没有，请添加绑定：
   - Variable name: `DB`
   - D1 Database: 选择 `in-nutri-db`

### 兼容性标志

1. 在 **Settings** > **Compatibility Flags** 中
2. 确保 **Production** 和 **Preview** 环境都添加了 `nodejs_compat`

## 4. 检查测试页面

访问 `/test` 页面（例如：`https://in-nutri-site.pages.dev/test`）

如果测试页面能正常显示，说明基本渲染正常，问题可能在于：
- API 路由
- 数据库连接
- 特定组件

## 5. 检查部署日志

在 Cloudflare Pages 的 **Deployments** 标签页中，查看最新的部署日志，检查是否有：
- 构建错误
- 运行时错误
- 数据库连接错误

## 6. 常见问题解决方案

### 问题：页面完全黑色，没有任何内容

**可能原因：**
- CSS 未加载
- JavaScript 错误导致页面无法渲染
- 所有 API 调用都失败

**解决方案：**
1. 检查浏览器控制台错误
2. 检查 Network 标签页，确认 CSS 和 JS 文件是否加载
3. 检查 API 路由是否返回数据

### 问题：API 返回 500 错误

**可能原因：**
- D1 数据库未绑定
- 数据库迁移未应用
- 数据库连接失败

**解决方案：**
1. 确认 D1 数据库已绑定（见步骤 3）
2. 运行迁移：`npx wrangler d1 execute in-nutri-db --file=./drizzle/0000_*.sql --remote`
3. 检查数据库是否有数据：`npx wrangler d1 query in-nutri-db --command="SELECT COUNT(*) FROM banners;" --remote`

### 问题：页面显示占位符图形

**可能原因：**
- Hero 组件无法获取数据
- 图片/视频资源加载失败

**解决方案：**
1. 检查 `/api/banners` 是否返回数据
2. 检查 `/api/brand-story` 是否返回数据
3. 确认 `logo.png` 文件存在于 `public` 文件夹

## 7. 联系支持

如果以上步骤都无法解决问题，请提供：
1. 浏览器控制台的完整错误信息
2. Network 标签页中失败的请求详情
3. Cloudflare Pages 部署日志
4. 访问的 URL
