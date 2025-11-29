# 为什么上传的文件不会被部署？

## 📋 问题解释

### 1. `.gitignore` 排除了 `/public/uploads`

查看 `.gitignore` 文件第 45 行：
```
/uploads
/public/uploads
```

**为什么要排除？**

这是**标准的最佳实践**，原因如下：

1. **用户生成的内容**：上传的文件是用户通过管理后台上传的，不是代码的一部分
2. **仓库大小**：视频和图片文件通常很大，如果提交到 git，会让仓库变得非常大
3. **版本控制不适合**：git 是用来管理代码的，不适合管理二进制文件（图片、视频）
4. **安全性**：避免将用户上传的内容提交到公开的代码仓库
5. **多环境问题**：不同环境（开发、测试、生产）应该有不同的上传文件

### 2. EdgeOne 从 Git 仓库构建

EdgeOne 的构建流程：

```
1. 从 GitHub 仓库克隆代码
   ↓
2. 运行 npm install
   ↓
3. 运行 npm run build
   ↓
4. 部署构建产物
```

**关键点**：
- EdgeOne **只从 git 仓库获取代码**
- 如果文件不在 git 仓库中，构建时就不存在
- `/public/uploads` 被 `.gitignore` 排除，所以 git 仓库中没有这些文件
- 因此构建时这些文件不存在

### 3. 上传文件是运行时生成的

查看上传 API (`app/api/admin/upload/route.ts`)：

```typescript
// 本地文件系统存储
const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
const localFilePath = path.join(uploadDir, fileName);
await writeFile(localFilePath, buffer);
```

**流程**：
1. 用户通过管理后台上传文件
2. 文件保存到服务器的 `public/uploads/` 目录
3. 文件路径保存到数据库
4. 前端通过 `/uploads/products/xxx.jpg` 访问文件

**问题**：
- 这些文件是在**运行时**上传的
- 不是在**构建时**就存在的
- EdgeOne 构建时，这些文件还不存在

## 🔍 对比：为什么其他文件可以部署？

查看 `public/` 目录：
```
public/
├── logo.png          ✅ 可以部署（在 git 仓库中）
├── dy.png            ✅ 可以部署（在 git 仓库中）
├── icons/            ✅ 可以部署（在 git 仓库中）
└── uploads/          ❌ 不能部署（被 .gitignore 排除）
    ├── products/     ❌ 运行时生成
    └── videos/       ❌ 运行时生成
```

**区别**：
- `logo.png`、`dy.png` 等是**代码的一部分**，提交到了 git
- `uploads/` 目录是**用户上传的内容**，不应该提交到 git

## 💡 解决方案

### 方案 1: 使用云存储（推荐）⭐

**使用腾讯云 COS（对象存储）**：

1. **优点**：
   - 文件独立于代码仓库
   - 支持 CDN 加速
   - 更好的可扩展性
   - 符合生产环境最佳实践

2. **实现**：
   - 修改上传 API，将文件上传到 COS
   - 返回 COS 的 URL（如 `https://your-bucket.cos.ap-shanghai.myqcloud.com/uploads/xxx.jpg`）
   - 前端直接使用 COS URL

3. **代码示例**：
```typescript
// 上传到 COS
const cos = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY,
});

await cos.putObject({
  Bucket: 'your-bucket',
  Region: 'ap-shanghai',
  Key: `uploads/products/${fileName}`,
  Body: buffer,
});

const fileUrl = `https://your-bucket.cos.ap-shanghai.myqcloud.com/uploads/products/${fileName}`;
```

### 方案 2: 移除 .gitignore（不推荐）❌

**不推荐的原因**：
- 仓库会变得非常大（视频文件可能几百 MB）
- git 不适合管理二进制文件
- 不同环境会互相覆盖文件
- 违反最佳实践

### 方案 3: 手动上传文件到 EdgeOne

1. 在 EdgeOne 项目设置中，找到静态文件上传功能
2. 手动上传 `/public/uploads` 目录的文件
3. **缺点**：每次有新文件都需要手动上传

### 方案 4: 使用 EdgeOne 的文件存储功能

如果 EdgeOne 支持文件存储 API，可以在运行时上传文件到 EdgeOne 的存储。

## 🎯 推荐方案

**最佳实践：使用腾讯云 COS**

1. **创建 COS 存储桶**
   - 登录腾讯云控制台
   - 创建对象存储（COS）存储桶
   - 配置 CDN 加速（可选）

2. **安装 COS SDK**
   ```bash
   npm install cos-nodejs-sdk-v5
   ```

3. **修改上传 API**
   - 将文件上传到 COS
   - 返回 COS URL

4. **配置环境变量**
   ```env
   COS_SECRET_ID=your-secret-id
   COS_SECRET_KEY=your-secret-key
   COS_BUCKET=your-bucket-name
   COS_REGION=ap-shanghai
   ```

## 📊 总结

| 文件类型 | 是否在 git | 是否部署 | 原因 |
|---------|-----------|---------|------|
| `logo.png` | ✅ 是 | ✅ 是 | 代码的一部分 |
| `uploads/products/xxx.jpg` | ❌ 否 | ❌ 否 | 用户上传的内容，被 .gitignore 排除 |
| `uploads/videos/xxx.mp4` | ❌ 否 | ❌ 否 | 用户上传的内容，被 .gitignore 排除 |

**核心原因**：
- `.gitignore` 排除了上传文件（这是正确的做法）
- EdgeOne 从 git 构建，所以这些文件不存在
- 上传文件是运行时生成的，不是构建时存在的

**解决方案**：使用云存储（如腾讯云 COS）存储上传的文件。

