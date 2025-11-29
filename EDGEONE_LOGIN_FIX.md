# EdgeOne 部署后登录问题排查和修复

## 可能的问题

### 1. 数据库未初始化 ⚠️

**问题**：EdgeOne 部署时，数据库可能没有初始化，管理员账号不存在。

**检查方法**：
- 查看 EdgeOne 构建日志，确认是否运行了 `db:push` 和 `db:seed`
- 检查数据库文件是否存在

**解决方案**：
- 确保构建命令包含数据库初始化：`npm run build:edgeone`
- 或者在部署后手动运行数据库初始化

### 2. Cookie Secure 设置问题 ⚠️

**问题**：登录 API 中设置了 `secure: process.env.NODE_ENV === "production"`，但在某些环境下可能有问题。

**代码位置**：`app/api/auth/login/route.ts` 第 43 行

**解决方案**：
- 检查 EdgeOne 是否使用 HTTPS
- 如果使用 HTTPS，确保 `secure: true`
- 如果使用 HTTP，需要设置 `secure: false`

### 3. SESSION_SECRET 环境变量 ⚠️

**问题**：`lib/auth.ts` 中使用了 `process.env.SESSION_SECRET`，如果未设置会使用默认值。

**代码位置**：`lib/auth.ts` 第 6 行

**解决方案**：
- 在 EdgeOne 项目设置中添加 `SESSION_SECRET` 环境变量
- 使用强随机字符串（建议 32 字符以上）

### 4. 数据库连接问题 ⚠️

**问题**：EdgeOne 可能不支持 SQLite 文件系统访问。

**检查方法**：
- 查看登录 API 的错误日志
- 检查数据库连接是否成功

**解决方案**：
- 如果 EdgeOne 不支持文件系统，需要使用云数据库（如 MySQL、PostgreSQL）
- 或者使用 EdgeOne 提供的数据库服务

### 5. API 路由问题 ⚠️

**问题**：登录 API 路由可能无法正常工作。

**检查方法**：
- 打开浏览器开发者工具，查看网络请求
- 检查 `/api/auth/login` 是否返回错误

## 排查步骤

### 步骤 1: 检查数据库

```bash
# 在 EdgeOne 构建日志中查找
npm run db:push
npm run db:seed
```

### 步骤 2: 检查环境变量

在 EdgeOne 项目设置中，确保设置了：
- `SESSION_SECRET` - 会话密钥
- `DATABASE_URL` - 数据库路径（如果使用 SQLite）

### 步骤 3: 检查 Cookie 设置

打开浏览器开发者工具：
1. 打开 Network 标签
2. 尝试登录
3. 查看登录请求的响应头
4. 检查是否设置了 `Set-Cookie` 头

### 步骤 4: 检查错误日志

在 EdgeOne 控制台查看：
- 构建日志
- 运行时日志
- 错误信息

## 快速修复

### 修复 1: 确保数据库初始化

在 EdgeOne 构建命令中：
```bash
npm run build:edgeone
```

这个命令会：
1. 运行 `db:push`（创建数据库表）
2. 运行 `db:seed`（创建管理员账号）

### 修复 2: 设置环境变量

在 EdgeOne 项目设置中添加：
```
SESSION_SECRET=your-random-secret-key-here-min-32-chars
DATABASE_URL=./db/sqlite.db
```

### 修复 3: 修复 Cookie Secure 设置

如果 EdgeOne 使用 HTTPS，确保 `secure: true`。
如果使用 HTTP，需要修改代码。

## 测试登录

1. 访问登录页面：`https://your-domain.com/admin/login`
2. 使用默认账号：
   - Email: `admin@in-nutri.com`
   - Password: `inNutriAdmin123`
3. 检查浏览器控制台是否有错误
4. 检查网络请求是否成功

## 如果仍然无法登录

1. **检查数据库**：确认管理员账号是否存在
2. **检查 Cookie**：确认 Cookie 是否被正确设置
3. **检查环境变量**：确认 SESSION_SECRET 已设置
4. **查看日志**：检查 EdgeOne 的错误日志

