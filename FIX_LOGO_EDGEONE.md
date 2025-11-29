# EdgeOne 部署后 Logo 不显示问题修复

## 问题原因

EdgeOne 部署后 logo 不显示的可能原因：

1. **public 目录未上传**：`public/logo.png` 文件没有上传到 EdgeOne
2. **Next.js Image 优化问题**：EdgeOne 可能不支持 Next.js 的图片优化功能
3. **静态资源路径问题**：静态资源路径配置不正确

## 已实施的修复

### 1. 添加 unoptimized 选项

在 `next.config.js` 和组件中添加了 `unoptimized` 选项，禁用 Next.js 图片优化：

```javascript
// next.config.js
images: {
  unoptimized: process.env.NODE_ENV === 'production' && process.env.EDGEONE_DEPLOY === 'true',
}

// 组件中
<Image 
  src="/logo.png" 
  unoptimized={process.env.NODE_ENV === 'production'}
/>
```

### 2. 确保 public 目录上传

在部署时，必须确保 `public/` 目录已上传，包含：
- `logo.png`
- 其他静态资源

## 解决方案

### 方案 1: 重新部署并确保 public 目录上传（推荐）

1. **检查 public 目录**
   ```bash
   ls -la public/logo.png
   # 确认文件存在
   ```

2. **重新部署**
   - 在 EdgeOne 控制台重新部署
   - **确保上传 public 目录**
   - 或通过 GitHub 导入（会自动包含 public 目录）

3. **验证**
   - 访问 `https://your-site.edgeone.com/logo.png`
   - 应该能直接访问图片文件

### 方案 2: 使用环境变量禁用图片优化

在 EdgeOne 控制台添加环境变量：
```
EDGEONE_DEPLOY=true
```

这会自动禁用 Next.js 图片优化，直接使用原始图片。

### 方案 3: 检查静态资源路径

如果 logo 仍然不显示，检查：

1. **浏览器控制台**
   - 打开开发者工具
   - 查看 Network 标签
   - 检查 `/logo.png` 请求的状态码
   - 如果是 404，说明文件未上传

2. **直接访问图片 URL**
   - 访问 `https://your-site.edgeone.com/logo.png`
   - 如果返回 404，说明 public 目录未正确上传

3. **检查 EdgeOne 文件列表**
   - 在 EdgeOne 控制台查看已上传的文件
   - 确认 `public/logo.png` 存在

## 快速修复步骤

### 如果使用 GitHub 导入：

1. 确保 `public/logo.png` 已提交到 GitHub
2. 在 EdgeOne 控制台重新部署
3. 添加环境变量：`EDGEONE_DEPLOY=true`

### 如果使用文件上传：

1. 重新运行准备脚本：
   ```bash
   npm run prepare:edgeone
   ```

2. 在 EdgeOne 控制台：
   - 删除旧部署
   - 重新上传文件
   - **确保包含 public 目录**

3. 添加环境变量：`EDGEONE_DEPLOY=true`

## 验证修复

修复后，检查：

1. **直接访问图片**
   ```
   https://your-site.edgeone.com/logo.png
   ```
   应该能看到 logo 图片

2. **页面显示**
   - 刷新页面
   - Hero 区域应该显示 logo
   - Footer 区域应该显示 logo

3. **浏览器控制台**
   - 没有 404 错误
   - logo.png 请求返回 200

## 如果问题仍然存在

1. **检查文件权限**
   - 确保 logo.png 文件有读取权限

2. **检查文件大小**
   - 如果文件太大，可能需要优化

3. **使用 CDN**
   - 将 logo 上传到腾讯云 COS
   - 使用 CDN URL 替代本地路径

4. **临时方案：使用普通 img 标签**
   ```tsx
   <img 
     src="/logo.png" 
     alt="In Nutri 标志" 
     width={260} 
     height={80}
     className="drop-shadow-lg"
   />
   ```

## 需要帮助？

如果问题仍然存在，请提供：
1. 浏览器控制台的错误信息
2. Network 标签中 logo.png 的请求状态
3. 直接访问 `https://your-site.edgeone.com/logo.png` 的结果



