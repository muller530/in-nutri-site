# 腾讯 EdgeOne 完整部署指南

## 📋 部署前准备

### 1. 确保代码已提交

```bash
# 检查 git 状态
git status

# 提交所有更改（如果需要）
git add .
git commit -m "准备部署到 EdgeOne"

# 推送到远程仓库（如果使用 GitHub 导入）
git push origin main
```

### 2. 本地测试

```bash
# 安装依赖
npm install

# 初始化数据库（如果还没有）
npm run db:push
npm run db:seed-data

# 测试本地预览
npm run dev
# 访问 http://localhost:3000 确保一切正常

# 测试生产构建
npm run build
npm start
# 访问 http://localhost:3000 确保构建正常
```

## 🚀 EdgeOne 部署步骤

### 方式 1: GitHub 仓库导入（推荐）

#### 步骤 1: 登录 EdgeOne 控制台

1. 访问 [腾讯云 EdgeOne 控制台](https://console.cloud.tencent.com/edgeone)
2. 使用腾讯云账号登录
3. 如果没有开通 EdgeOne，先开通服务

#### 步骤 2: 创建站点

1. 在 EdgeOne 控制台，点击 **"创建站点"** 或 **"添加站点"**
2. 选择 **"GitHub 仓库导入"**

#### 步骤 3: 连接 GitHub 仓库

1. **授权 GitHub**
   - 点击 "授权 GitHub"
   - 授权 EdgeOne 访问您的 GitHub 账号
   - 选择仓库：`in-nutri-site`（或您的仓库名）
   - 选择分支：`main` 或 `master`

2. **配置构建设置**
   ```
   构建命令: npm run build
   输出目录: .next
   Node.js 版本: 18.x 或 20.x
   安装命令: npm install --production
   ```

3. **配置环境变量**
   在 EdgeOne 控制台的项目设置中添加：
   ```
   NODE_ENV=production
   DATABASE_URL=./db/sqlite.db
   EDGEONE_DEPLOY=true
   SESSION_SECRET=your-secret-key-here-change-in-production
   ```
   
   **生成 SESSION_SECRET：**
   ```bash
   openssl rand -hex 32
   ```

4. **配置域名**
   - 绑定自定义域名（可选）
   - 或使用 EdgeOne 提供的默认域名

5. **开始部署**
   - 点击 "开始部署"
   - EdgeOne 会自动拉取代码、安装依赖、构建项目
   - 等待部署完成（通常 5-10 分钟）

### 方式 2: 文件上传方式

#### 步骤 1: 准备构建文件

```bash
# 1. 构建项目
npm run build

# 2. 准备部署包
# 需要上传的文件/目录：
# - .next/          (构建输出)
# - public/         (静态资源)
# - package.json    (依赖配置)
# - package-lock.json (锁定版本)
# - db/             (数据库目录，包含 sqlite.db)
# - app/            (应用代码)
# - components/     (组件)
# - lib/            (工具库)
# - drizzle.config.ts
# - next.config.js
# - tsconfig.json
```

#### 步骤 2: 上传文件

1. 在 EdgeOne 控制台选择 "文件上传"
2. 上传准备好的文件
3. 配置环境变量（同方式 1）
4. 开始部署

## ⚙️ 环境变量配置

在 EdgeOne 控制台的项目设置中配置以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NODE_ENV` | `production` | 生产环境标识 |
| `DATABASE_URL` | `./db/sqlite.db` | 数据库路径（SQLite） |
| `EDGEONE_DEPLOY` | `true` | EdgeOne 部署标识 |
| `SESSION_SECRET` | `随机字符串` | 会话加密密钥（必须更改） |
| `NEXT_PUBLIC_BASE_URL` | `https://your-site.edgeone.com` | 网站基础 URL（可选） |

**重要：** `SESSION_SECRET` 必须使用强随机字符串，不要使用默认值！

## 📁 需要上传的文件

### GitHub 导入方式
- ✅ 自动处理，无需手动上传

### 文件上传方式
需要上传以下文件/目录：
```
项目根目录/
├── .next/              # Next.js 构建输出（必需）
├── public/             # 静态资源（必需）
├── app/                # 应用代码（必需）
├── components/         # 组件（必需）
├── lib/                # 工具库（必需）
├── db/                 # 数据库目录（必需）
│   ├── schema.ts
│   ├── index.ts
│   └── sqlite.db       # 数据库文件
├── package.json        # 依赖配置（必需）
├── package-lock.json   # 锁定版本（推荐）
├── next.config.js      # Next.js 配置（必需）
├── tsconfig.json       # TypeScript 配置（必需）
└── drizzle.config.ts   # Drizzle 配置（必需）
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
- **健康检查路径**：`/` 或 `/api/banners`

### 3. 域名和 SSL

1. 在 EdgeOne 控制台绑定自定义域名
2. 配置 DNS 解析（CNAME 记录）
3. 启用 SSL 证书（Let's Encrypt 自动证书）

## 🗄️ 数据库配置

### 使用 SQLite（当前配置）

**配置：**
- 确保 `db/sqlite.db` 文件已上传
- 环境变量：`DATABASE_URL=./db/sqlite.db`

**注意事项：**
- SQLite 文件需要可写权限
- 如果文件系统只读，可能需要迁移到外部数据库

### 迁移到腾讯云数据库（推荐生产环境）

如果需要更好的性能和可靠性，可以迁移到腾讯云 MySQL：

1. 在腾讯云创建 MySQL 实例
2. 获取连接信息
3. 修改环境变量：`DATABASE_URL=mysql://user:password@host:port/database`
4. 修改 `db/index.ts` 使用 MySQL 驱动

## 📤 文件上传配置

### 使用本地文件系统（当前配置）

- 上传到 `public/uploads/` 目录
- 需要确保目录有写权限

### 使用腾讯云 COS（推荐生产环境）

1. 创建 COS 存储桶
2. 安装 COS SDK：`npm install cos-nodejs-sdk-v5`
3. 修改上传 API 使用 COS
4. 配置 COS 的公共访问或 CDN

## ✅ 部署后检查清单

部署完成后，检查以下内容：

### 1. 基础功能
- [ ] 访问部署 URL，页面正常显示
- [ ] Hero 区域显示正常
- [ ] Logo 和图片正常加载
- [ ] 视频背景正常播放

### 2. API 路由
- [ ] `/api/banners` 返回数据
- [ ] `/api/products` 返回数据
- [ ] `/api/brand-story` 返回数据
- [ ] `/api/videos` 返回数据

### 3. 功能测试
- [ ] 产品列表显示正常
- [ ] 视频播放正常
- [ ] 二维码生成正常
- [ ] 社交媒体图标正常显示

### 4. 后台管理
- [ ] 后台管理可以访问 (`/admin`)
- [ ] 可以正常登录
- [ ] 可以编辑数据
- [ ] 可以上传文件

### 5. 数据库
- [ ] 数据正常显示
- [ ] 后台可以编辑数据
- [ ] 数据持久化正常

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
- 文件权限是否正确

**解决：**
- 确认数据库文件已上传
- 检查 `DATABASE_URL` 环境变量
- 查看数据库连接日志

### 问题 5: 视频不显示

**检查：**
- 视频文件是否已上传到 `public/uploads/videos/`
- 数据库中的视频 URL 是否正确
- 视频文件权限是否正确

**解决：**
- 确认视频文件已上传
- 检查数据库中的 `image` 字段
- 查看浏览器控制台的错误信息

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
- **数据库**：SQLite 免费，MySQL 按配置计费
- **对象存储**：COS 按存储和流量计费

## 📞 获取帮助

如果遇到问题：
1. 查看 EdgeOne 控制台的构建日志
2. 查看 EdgeOne 控制台的函数日志
3. 查看浏览器控制台的错误信息
4. 参考 [EdgeOne 官方文档](https://cloud.tencent.com/document/product/1552)

## 🎯 快速部署命令

```bash
# 1. 确保代码已提交
git add .
git commit -m "准备部署到 EdgeOne"
git push origin main

# 2. 本地测试构建
npm run build

# 3. 在 EdgeOne 控制台：
#    - 创建站点
#    - 连接 GitHub 仓库（或上传文件）
#    - 配置环境变量
#    - 开始部署

# 4. 等待部署完成，访问提供的 URL
```

## ✅ 部署成功标准

- ✅ 构建成功无错误
- ✅ 部署成功无错误
- ✅ 访问部署 URL 页面正常显示
- ✅ 所有功能正常工作
- ✅ API 路由正常响应
- ✅ 数据库连接正常
- ✅ 后台管理可以访问

部署成功后，您的网站将在 EdgeOne 的全球边缘节点上运行，享受快速访问和自动扩缩容！



