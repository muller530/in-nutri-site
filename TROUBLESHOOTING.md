# 网站无法访问 - 故障排查指南

## 快速检查清单

### 1. 确认正确的 URL

根据项目信息，正确的 URL 应该是：
- **`https://in-nutri-site.pages.dev`**

### 2. 检查部署状态

在 Cloudflare Pages 控制台：

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **Pages**
3. 找到项目 `in-nutri-site`
4. 点击项目
5. 查看 **"部署 (Deployments)"** 页面
6. 检查最新部署的状态：
   - ✅ **Success** - 部署成功
   - ⏳ **Building** - 正在构建
   - ❌ **Failed** - 部署失败

### 3. 如果部署失败

查看构建日志：
1. 点击失败的部署
2. 查看 **"构建日志 (Build Logs)"**
3. 查找错误信息
4. 根据错误信息修复问题

### 4. 如果部署成功但无法访问

可能的原因：

#### A. DNS 传播延迟
- 首次部署后，DNS 可能需要几分钟到几小时才能生效
- **解决方案**：等待 5-10 分钟后重试

#### B. 浏览器缓存
- 浏览器可能缓存了旧的错误页面
- **解决方案**：
  - 使用无痕模式访问
  - 或清除浏览器缓存
  - 或使用不同的浏览器

#### C. 网络问题
- 检查网络连接
- 尝试使用 VPN 或不同的网络
- 检查防火墙设置

#### D. D1 绑定未配置
- 如果网站可以访问但功能不正常，可能是 D1 绑定未配置
- **解决方案**：在 Cloudflare Pages 设置中添加 D1 绑定

### 5. 检查网站响应

使用命令行测试：

```bash
# 测试网站是否响应
curl -I https://in-nutri-site.pages.dev

# 测试 API 路由
curl https://in-nutri-site.pages.dev/api/products
```

### 6. 常见错误和解决方案

#### 错误：404 Not Found
- **原因**：部署未完成或 URL 错误
- **解决**：检查部署状态，确认 URL 正确

#### 错误：500 Internal Server Error
- **原因**：可能是 D1 绑定未配置或数据库连接失败
- **解决**：添加 D1 绑定并重新部署

#### 错误：502 Bad Gateway
- **原因**：Cloudflare 服务器问题或部署正在进行
- **解决**：等待几分钟后重试

### 7. 手动触发重新部署

如果问题持续：

1. 在 Cloudflare Pages 控制台
2. 进入项目设置
3. 找到 **"部署 (Deployments)"**
4. 点击 **"Retry deployment"** 或 **"Redeploy"**
5. 等待部署完成

### 8. 检查项目配置

确认以下配置正确：

- ✅ **生产分支**: `main`
- ✅ **构建命令**: `npm run build`
- ✅ **构建输出**: `.next`
- ✅ **D1 绑定**: 已添加（变量名：`DB`）
- ✅ **环境变量**: `SESSION_SECRET` 已设置

### 9. 联系支持

如果以上方法都无法解决问题：

1. 在 Cloudflare Dashboard 中提交支持请求
2. 提供以下信息：
   - 项目名称：`in-nutri-site`
   - 部署 ID
   - 错误信息
   - 构建日志

## 验证步骤

1. ✅ 确认部署状态为 "Success"
2. ✅ 确认 URL 正确：`https://in-nutri-site.pages.dev`
3. ✅ 尝试使用无痕模式访问
4. ✅ 检查浏览器控制台是否有错误
5. ✅ 测试 API 路由是否响应

