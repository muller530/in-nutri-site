# EdgeOne 部署检查清单

## ✅ 本地预览检查

### 1. 环境检查
- [ ] Node.js 18+ 已安装
- [ ] npm 已安装
- [ ] 依赖已安装 (`npm install`)

### 2. 数据库检查
- [ ] 数据库文件存在 (`db/sqlite.db`)
- [ ] 数据库已初始化 (`npm run db:push`)
- [ ] 种子数据已加载 (`npm run db:seed-data`)

### 3. 环境变量检查
- [ ] `.env.local` 文件存在
- [ ] `DATABASE_URL` 已配置
- [ ] `NEXT_PUBLIC_BASE_URL` 已配置（本地：`http://localhost:3000`）

### 4. 本地预览测试
```bash
# 运行检查脚本
bash scripts/check-local.sh

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000 检查：
- [ ] 页面正常加载
- [ ] Hero 区域显示正常
- [ ] 产品列表显示正常
- [ ] 视频播放正常
- [ ] 所有链接正常工作
- [ ] 后台管理可以访问 (/admin)
```

### 5. 构建测试
```bash
# 测试生产构建
npm run build
npm start

# 访问 http://localhost:3000 检查：
- [ ] 生产构建成功
- [ ] 页面正常显示
- [ ] 所有功能正常
```

## ✅ EdgeOne 部署检查

### 1. EdgeOne 账号准备
- [ ] 已注册腾讯云账号
- [ ] 已开通 EdgeOne 服务
- [ ] 已创建 EdgeOne 站点

### 2. 项目构建
```bash
# 确保构建成功
npm run build

# 检查构建输出
- [ ] `.next` 目录已生成
- [ ] `public` 目录存在
- [ ] 无构建错误
```

### 3. EdgeOne 配置

#### 环境变量配置
在 EdgeOne 控制台设置以下环境变量：
- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL=./db/sqlite.db`（或外部数据库 URL）
- [ ] `NEXT_PUBLIC_BASE_URL=https://your-domain.edgeone.com`
- [ ] `SESSION_SECRET=your-secret-key`

#### 构建配置
- [ ] 构建命令：`npm run build`
- [ ] 输出目录：`.next`
- [ ] Node.js 版本：18.x

### 4. 文件上传
- [ ] 上传 `.next` 目录
- [ ] 上传 `public` 目录
- [ ] 上传 `package.json`
- [ ] 上传 `package-lock.json`
- [ ] 上传 `db` 目录（如果使用 SQLite）

### 5. 域名和 SSL
- [ ] 域名已绑定
- [ ] SSL 证书已配置
- [ ] CDN 加速已启用

### 6. 部署后测试
访问部署后的网站，检查：
- [ ] 首页正常加载
- [ ] API 路由正常工作 (`/api/banners`, `/api/products` 等)
- [ ] 数据库连接正常
- [ ] 文件上传功能正常
- [ ] 后台管理可以访问
- [ ] 所有功能正常

## 🔧 常见问题排查

### 问题 1: 本地预览失败
**解决方案：**
1. 检查 Node.js 版本：`node -v`（需要 18+）
2. 重新安装依赖：`rm -rf node_modules && npm install`
3. 检查数据库：`npm run db:push && npm run db:seed-data`
4. 查看错误日志：`npm run dev` 的输出

### 问题 2: EdgeOne 部署失败
**解决方案：**
1. 检查构建是否成功：`npm run build`
2. 检查环境变量是否正确配置
3. 检查 EdgeOne 控制台的错误日志
4. 确认 Node.js 版本兼容性

### 问题 3: API 路由不工作
**解决方案：**
1. 检查 `NEXT_PUBLIC_BASE_URL` 环境变量
2. 检查 API 路由的 `runtime` 配置
3. 查看浏览器控制台的网络请求
4. 检查 EdgeOne 的函数日志

### 问题 4: 数据库连接失败
**解决方案：**
1. 确认数据库文件已上传（SQLite）
2. 或配置外部数据库（MySQL/PostgreSQL）
3. 检查 `DATABASE_URL` 环境变量
4. 查看数据库连接日志

## 📝 部署命令参考

### 本地开发
```bash
# 安装依赖
npm install

# 初始化数据库
npm run db:push
npm run db:seed-data

# 启动开发服务器
npm run dev
```

### 生产构建
```bash
# 构建项目
npm run build

# 测试生产构建
npm start
```

### EdgeOne 部署
```bash
# 1. 构建项目
npm run build

# 2. 使用 EdgeOne CLI 部署（如果可用）
edgeone pages deploy

# 或通过控制台上传构建文件
```

## 🎯 成功标准

### 本地预览成功标准
- ✅ `npm run dev` 无错误
- ✅ 访问 `http://localhost:3000` 页面正常显示
- ✅ 所有功能正常工作
- ✅ 后台管理可以访问

### EdgeOne 部署成功标准
- ✅ 构建成功无错误
- ✅ 部署成功无错误
- ✅ 访问部署 URL 页面正常显示
- ✅ 所有功能正常工作
- ✅ API 路由正常响应
- ✅ 数据库连接正常

## 📞 需要帮助？

如果遇到问题：
1. 检查本文档的常见问题部分
2. 查看 EdgeOne 控制台的日志
3. 查看浏览器控制台的错误信息
4. 检查服务器日志

