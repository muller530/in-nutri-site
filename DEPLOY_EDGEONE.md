# 腾讯 EdgeOne 部署完整指南

## 📋 部署前准备

### 1. 确保本地预览正常

```bash
# 运行本地检查
npm run check:local

# 启动开发服务器测试
npm run dev
# 访问 http://localhost:3000 确保一切正常
```

### 2. 构建项目

```bash
# 构建生产版本
npm run build

# 测试生产构建（可选）
npm start
# 访问 http://localhost:3000 确保构建正常
```

## 🚀 EdgeOne 部署方式

### 方式 1: 通过 EdgeOne 控制台部署（推荐）

#### 步骤 1: 登录 EdgeOne

1. 访问 [腾讯云 EdgeOne 控制台](https://console.cloud.tencent.com/edgeone)
2. 使用腾讯云账号登录
3. 如果没有开通 EdgeOne，先开通服务

#### 步骤 2: 创建站点

1. 在 EdgeOne 控制台，点击 **"创建站点"** 或 **"添加站点"**
2. 选择部署方式：
   - **GitHub 仓库导入**（推荐）：直接连接 GitHub 仓库
   - **文件上传**：手动上传构建文件

#### 步骤 3A: GitHub 仓库导入（推荐）

1. **连接 GitHub 仓库**
   - 在 EdgeOne 控制台选择 "GitHub 仓库导入"
   - 授权 EdgeOne 访问您的 GitHub 账号
   - 选择仓库：`muller530/in-nutri-site`
   - 选择分支：`main`

2. **配置构建设置**
   - **构建命令**：`npm run build`
   - **输出目录**：`.next`
   - **Node.js 版本**：18.x
   - **安装命令**：`npm install --production`

3. **配置环境变量**
   在 EdgeOne 控制台的项目设置中添加：
   ```
   NODE_ENV=production
   DATABASE_URL=./db/sqlite.db
   NEXT_PUBLIC_BASE_URL=https://your-site.edgeone.com
   SESSION_SECRET=your-secret-key-here
   ```

4. **开始部署**
   - 点击 "开始部署"
   - EdgeOne 会自动拉取代码、安装依赖、构建项目
   - 部署完成后会提供访问 URL

#### 步骤 3B: 文件上传方式

1. **准备构建文件**
   ```bash
   # 构建项目
   npm run build
   
   # 创建部署包（包含必要文件）
   # 需要上传的文件：
   # - .next/ 目录
   # - public/ 目录
   # - package.json
   # - package-lock.json
   # - db/ 目录（如果使用 SQLite）
   # - node_modules/（或让 EdgeOne 自动安装）
   ```

2. **上传文件**
   - 在 EdgeOne 控制台选择 "文件上传"
   - 上传构建好的文件
   - 或使用 EdgeOne CLI（如果可用）

3. **配置环境变量**（同步骤 3A）

### 方式 2: 使用 EdgeOne CLI（如果可用）

```bash
# 安装 EdgeOne CLI（如果提供）
npm install -g @tencent/edgeone-cli

# 登录
edgeone login

# 初始化项目
edgeone init

# 部署
edgeone deploy
```

## ⚙️ 环境变量配置

在 EdgeOne 控制台的项目设置中配置以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NODE_ENV` | `production` | 生产环境标识 |
| `DATABASE_URL` | `./db/sqlite.db` | 数据库路径（SQLite）或外部数据库 URL |
| `NEXT_PUBLIC_BASE_URL` | `https://your-site.edgeone.com` | 网站基础 URL |
| `SESSION_SECRET` | `随机字符串` | 会话加密密钥 |

**生成 SESSION_SECRET：**
```bash
openssl rand -hex 32
```

## 📁 需要上传的文件

### GitHub 导入方式
- ✅ 自动处理，无需手动上传

### 文件上传方式
需要上传以下文件/目录：
```
项目根目录/
├── .next/              # Next.js 构建输出（必需）
├── public/             # 静态资源（必需）
├── package.json        # 依赖配置（必需）
├── package-lock.json   # 锁定版本（推荐）
├── db/                 # 数据库目录（如果使用 SQLite）
│   └── sqlite.db
└── node_modules/       # 依赖（可选，建议让 EdgeOne 自动安装）
```

## 🔧 EdgeOne 特定配置

### 1. 构建配置

在 EdgeOne 控制台的项目设置中：

- **构建命令**：`npm run build`
- **输出目录**：`.next`
- **Node.js 版本**：18.x 或 20.x
- **安装命令**：`npm install --production`

### 2. 运行配置

- **启动命令**：`npm start`
- **端口**：3000（EdgeOne 会自动处理）
- **健康检查路径**：`/` 或 `/api/health`

### 3. 域名配置

1. 在 EdgeOne 控制台绑定自定义域名
2. 配置 DNS 解析（CNAME 记录）
3. 启用 SSL 证书（Let's Encrypt 或自有证书）

## 🗄️ 数据库配置

### 选项 1: 继续使用 SQLite（简单）

**优点：**
- 无需额外配置
- 适合小型应用

**配置：**
- 确保 `db/sqlite.db` 文件已上传
- 环境变量：`DATABASE_URL=./db/sqlite.db`

**限制：**
- 文件系统可能只读
- 数据持久化可能受限

### 选项 2: 使用腾讯云数据库（推荐生产环境）

**MySQL：**
1. 在腾讯云创建 MySQL 实例
2. 获取连接信息
3. 环境变量：`DATABASE_URL=mysql://user:password@host:port/database`
4. 修改 `db/index.ts` 使用 MySQL 驱动

**PostgreSQL：**
1. 在腾讯云创建 PostgreSQL 实例
2. 获取连接信息
3. 环境变量：`DATABASE_URL=postgresql://user:password@host:port/database`
4. 修改 `db/index.ts` 使用 PostgreSQL 驱动

## 📤 文件上传配置

### 选项 1: 使用本地文件系统（如果支持）

- 上传到 `public/uploads/` 目录
- 需要确保目录有写权限

### 选项 2: 使用腾讯云 COS（推荐）

1. 创建 COS 存储桶
2. 安装 COS SDK：`npm install cos-nodejs-sdk-v5`
3. 修改上传 API 使用 COS
4. 配置 COS 的公共访问或 CDN

## 🚀 部署步骤总结

### 快速部署（GitHub 导入）

1. ✅ 确保代码已推送到 GitHub
2. ✅ 在 EdgeOne 控制台创建站点
3. ✅ 选择 GitHub 仓库导入
4. ✅ 配置构建命令：`npm run build`
5. ✅ 配置环境变量
6. ✅ 开始部署
7. ✅ 等待部署完成
8. ✅ 访问提供的 URL 测试

### 手动部署（文件上传）

1. ✅ 本地构建：`npm run build`
2. ✅ 准备上传文件（.next, public, package.json 等）
3. ✅ 在 EdgeOne 控制台创建站点
4. ✅ 选择文件上传
5. ✅ 上传文件
6. ✅ 配置环境变量
7. ✅ 开始部署
8. ✅ 访问提供的 URL 测试

## ✅ 部署后检查

部署完成后，检查以下内容：

1. **首页加载**
   - [ ] 访问部署 URL，页面正常显示
   - [ ] Hero 区域显示正常
   - [ ] Logo 和图片正常加载

2. **API 路由**
   - [ ] `/api/banners` 返回数据
   - [ ] `/api/products` 返回数据
   - [ ] `/api/brand-story` 返回数据

3. **功能测试**
   - [ ] 产品列表显示正常
   - [ ] 视频播放正常
   - [ ] 二维码生成正常
   - [ ] 后台管理可以访问 (`/admin`)

4. **数据库**
   - [ ] 数据正常显示
   - [ ] 后台可以编辑数据

## 🔍 故障排查

### 问题 1: 构建失败

**检查：**
- Node.js 版本是否正确（18+）
- 依赖是否完整安装
- 构建日志中的错误信息

**解决：**
```bash
# 本地测试构建
npm run build

# 检查错误信息
# 修复后重新部署
```

### 问题 2: 页面显示空白

**检查：**
- 浏览器控制台错误
- EdgeOne 控制台的函数日志
- 环境变量是否正确配置

**解决：**
- 检查 `NEXT_PUBLIC_BASE_URL` 是否正确
- 检查 API 路由是否正常
- 查看 EdgeOne 日志

### 问题 3: API 路由 404

**检查：**
- API 路由文件是否存在
- EdgeOne 是否正确识别 API 路由
- 环境变量配置

**解决：**
- 确保所有 API 路由文件已上传
- 检查 EdgeOne 的路由配置
- 查看 API 路由的日志

### 问题 4: 数据库连接失败

**检查：**
- 数据库文件是否存在（SQLite）
- 数据库连接字符串是否正确
- 数据库服务是否正常运行（外部数据库）

**解决：**
- 确认数据库文件已上传
- 检查 `DATABASE_URL` 环境变量
- 查看数据库连接日志

## 📊 性能优化建议

1. **启用 CDN 缓存**
   - 静态资源缓存：1年
   - HTML 缓存：不缓存或短时间

2. **图片优化**
   - 使用 Next.js Image 组件
   - 配置图片 CDN

3. **代码分割**
   - Next.js 自动代码分割
   - 使用动态导入减少初始包大小

## 💰 成本估算

- **EdgeOne 基础版**：免费（有限制）
- **EdgeOne 专业版**：按流量计费
- **数据库**：SQLite 免费，MySQL/PostgreSQL 按配置计费
- **对象存储**：COS 按存储和流量计费

## 📞 获取帮助

如果遇到问题：
1. 查看 EdgeOne 控制台的构建日志
2. 查看 EdgeOne 控制台的函数日志
3. 查看浏览器控制台的错误信息
4. 参考 [EdgeOne 官方文档](https://cloud.tencent.com/document/product/1552)

## 🎯 下一步

1. ✅ 按照本指南完成部署
2. ✅ 测试所有功能
3. ✅ 配置自定义域名
4. ✅ 启用 SSL 证书
5. ✅ 配置 CDN 加速

部署成功后，您的网站将在 EdgeOne 的全球边缘节点上运行，享受快速访问和自动扩缩容！



