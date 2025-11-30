# EdgeOne 部署总结

## ✅ 部署准备已完成

### 构建状态
- ✅ 项目构建成功
- ✅ 所有必要文件已准备
- ✅ 数据库已初始化
- ✅ 部署清单已生成

### 构建输出
- 构建目录：`.next/`
- 静态资源：`public/`
- 数据库：`db/sqlite.db`

## 📋 部署步骤

### 方式 1: GitHub 仓库导入（推荐）

1. **访问 EdgeOne 控制台**
   - 网址：https://console.cloud.tencent.com/edgeone
   - 登录腾讯云账号

2. **创建站点**
   - 点击 "创建站点"
   - 选择 "GitHub 仓库导入"

3. **连接仓库**
   - 授权 GitHub 账号
   - 选择仓库：`in-nutri-site`
   - 选择分支：`main`

4. **配置构建设置**
   ```
   构建命令: npm run build
   输出目录: .next
   Node.js 版本: 18.x 或 20.x
   安装命令: npm install --production
   ```

5. **配置环境变量**
   在 EdgeOne 控制台添加：
   ```
   NODE_ENV=production
   DATABASE_URL=./db/sqlite.db
   EDGEONE_DEPLOY=true
   SESSION_SECRET=<生成随机字符串>
   ```
   
   生成 SESSION_SECRET：
   ```bash
   openssl rand -hex 32
   ```

6. **开始部署**
   - 点击 "开始部署"
   - 等待部署完成（5-10 分钟）

### 方式 2: 文件上传

1. **准备文件**
   - 已通过 `npm run deploy:edgeone` 准备完成
   - 参考 `EDGEONE_DEPLOY_FILES.txt` 清单

2. **上传文件**
   - 在 EdgeOne 控制台选择 "文件上传"
   - 上传以下目录/文件：
     - `.next/`
     - `public/`
     - `app/`
     - `components/`
     - `lib/`
     - `db/`
     - `package.json`
     - `package-lock.json`
     - `next.config.js`
     - `tsconfig.json`
     - `drizzle.config.ts`

3. **配置环境变量**（同方式 1）

4. **开始部署**

## ⚙️ 环境变量配置

| 变量名 | 值 | 必需 | 说明 |
|--------|-----|------|------|
| `NODE_ENV` | `production` | ✅ | 生产环境标识 |
| `DATABASE_URL` | `./db/sqlite.db` | ✅ | 数据库路径 |
| `EDGEONE_DEPLOY` | `true` | ✅ | EdgeOne 部署标识 |
| `SESSION_SECRET` | `<随机字符串>` | ✅ | 会话密钥（必须更改） |
| `NEXT_PUBLIC_BASE_URL` | `https://your-site.edgeone.com` | ⚠️ | 网站 URL（可选） |

## 📁 文件清单

### 必需文件/目录
- `.next/` - Next.js 构建输出
- `public/` - 静态资源（包含 logo.png、上传的视频等）
- `app/` - 应用代码
- `components/` - React 组件
- `lib/` - 工具库
- `db/` - 数据库目录（包含 schema.ts、index.ts、sqlite.db）
- `package.json` - 依赖配置
- `package-lock.json` - 版本锁定
- `next.config.js` - Next.js 配置
- `tsconfig.json` - TypeScript 配置
- `drizzle.config.ts` - Drizzle 配置

### 可选文件
- `README.md`
- `EDGEONE_DEPLOY_COMPLETE.md`
- `EDGEONE_DEPLOY_SUMMARY.md`

## 🔧 重要配置

### Next.js 配置
- 图片优化：EdgeOne 部署时自动禁用（`EDGEONE_DEPLOY=true`）
- Runtime：所有 API 路由和 admin 页面使用 `nodejs` runtime
- 数据库：使用 SQLite（本地）或外部数据库（生产）

### 数据库
- 当前使用：SQLite (`db/sqlite.db`)
- 包含数据：产品、文章、食谱、横幅、视频、品牌故事等
- 管理员账号：`admin@in-nutri.com` / `inNutriAdmin123`

## ✅ 部署后检查

### 1. 基础功能
- [ ] 访问部署 URL，页面正常显示
- [ ] Hero 区域显示正常
- [ ] Logo 正常显示
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
- [ ] 后台可以访问 (`/admin`)
- [ ] 可以正常登录
- [ ] 可以编辑数据
- [ ] 可以上传文件（视频、图片、报告）

## 🔍 常见问题

### 问题 1: 构建警告
**说明：** 构建时出现的 "Dynamic server usage" 警告是正常的，因为：
- Admin 页面需要动态渲染（使用 cookies）
- API 路由需要动态处理
- 这些页面会在运行时动态生成

**解决：** 无需处理，这些警告不影响功能。

### 问题 2: 视频不显示
**检查：**
1. 数据库中的视频 URL 是否正确
2. 视频文件是否已上传到 `public/uploads/videos/`
3. 浏览器控制台是否有错误

**解决：**
- 确保视频文件已上传
- 检查数据库中的 `image` 字段
- 查看浏览器控制台错误

### 问题 3: 数据库连接失败
**检查：**
1. `db/sqlite.db` 文件是否存在
2. `DATABASE_URL` 环境变量是否正确
3. 文件权限是否正确

**解决：**
- 确认数据库文件已上传
- 检查环境变量配置
- 查看 EdgeOne 日志

## 📞 获取帮助

如果遇到问题：
1. 查看 EdgeOne 控制台的构建日志
2. 查看 EdgeOne 控制台的函数日志
3. 查看浏览器控制台的错误信息
4. 参考 `EDGEONE_DEPLOY_COMPLETE.md` 详细文档

## 🎯 快速命令

```bash
# 本地测试
npm run dev

# 构建项目
npm run build

# 准备部署
npm run deploy:edgeone

# 修复视频 URL（如果需要）
npm run fix:banner-video
```

## 📝 部署清单

- [x] 代码已提交到 Git
- [x] 本地预览正常
- [x] 构建成功
- [x] 部署文件已准备
- [ ] 在 EdgeOne 控制台创建站点
- [ ] 配置环境变量
- [ ] 开始部署
- [ ] 部署后测试

部署成功后，您的网站将在 EdgeOne 的全球边缘节点上运行！






