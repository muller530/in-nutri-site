# 立即修复 404 错误

## 问题

网站返回 404，原因是 Cloudflare Pages 无法找到正确的构建输出。

## 解决方案：修改 Cloudflare Pages 构建输出目录

### 步骤 1: 登录 Cloudflare Dashboard

访问：https://dash.cloudflare.com/

### 步骤 2: 进入项目设置

1. 点击 **"Workers & Pages"**
2. 点击 **"Pages"**
3. 找到并点击项目 **"in-nutri-site"**
4. 点击 **"设置 (Settings)"** 标签
5. 点击 **"构建设置 (Builds & deployments)"**

### 步骤 3: 修改构建输出目录

找到 **"构建输出目录 (Build output directory)"** 字段

**当前可能是**：
- `.next`
- `.next/standalone`
- 或其他值

**请改为**：
```
.next
```

### 步骤 4: 检查其他设置

确保以下设置正确：

- **Framework preset**: `Next.js`（如果可用）或 `None`
- **构建命令 (Build command)**: `npm run build`
- **Root directory**: `/`（留空或填写 `/`）
- **Node.js version**: `18` 或更高

### 步骤 5: 保存并等待部署

1. 点击 **"保存 (Save)"** 按钮
2. Cloudflare 会自动触发新的部署
3. 等待 2-3 分钟让部署完成

### 步骤 6: 检查部署状态

1. 点击 **"部署 (Deployments)"** 标签
2. 查看最新的部署状态
3. 等待状态变为 **"Success"**

### 步骤 7: 测试访问

部署完成后，访问：
- `https://in-nutri-site.pages.dev`

## 如果仍然无法访问

### 检查构建日志

1. 在 **"部署"** 页面
2. 点击最新的部署
3. 查看 **"构建日志 (Build Logs)"**
4. 查找错误信息

### 尝试其他构建输出目录

如果 `.next` 不行，尝试：

1. `.next/standalone/in-nutri`
2. `.next/standalone`
3. `out`（如果改用静态导出）

## 重要提示

**最关键的是检查构建日志**！

构建日志会显示：
- 构建是否成功
- 输出目录是否正确
- 是否有文件缺失

请先完成步骤 1-7，然后告诉我结果。






