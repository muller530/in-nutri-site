# 登录页面问题排查

## 当前问题
访问 `/admin/login` 时显示 "Internal Server Error"

## 可能的原因

1. **数据库连接失败**：`parseAdminFromCookie` 函数在尝试连接数据库时失败
2. **路由冲突**：`app/(admin)/admin/layout.tsx` 可能拦截了登录页面
3. **构建缓存问题**：`.next` 目录可能损坏

## 已完成的修复

1. ✅ 登录 API 已修复（使用 Node.js runtime）
2. ✅ 数据库连接已修复（直接使用 require）
3. ✅ 添加了错误处理到 `parseAdminFromCookie`
4. ✅ 添加了错误处理到 `getAdmin` 函数

## 需要执行的步骤

### 1. 清理构建缓存
```bash
rm -rf .next
```

### 2. 检查数据库
```bash
# 检查数据库文件是否存在
ls -la db/sqlite.db

# 检查是否有管理员账号
sqlite3 db/sqlite.db "SELECT email, is_active FROM members;"
```

### 3. 如果没有管理员账号，创建它
```bash
npm run db:seed
```

### 4. 重启开发服务器
```bash
pkill -f "next dev"
npm run dev
```

### 5. 访问登录页面
打开浏览器访问：`http://localhost:3000/admin/login`

## 登录信息
- 邮箱：`admin@in-nutri.com`
- 密码：`inNutriAdmin123`

## 如果问题仍然存在

1. 检查开发服务器的控制台输出，查看具体错误信息
2. 检查浏览器控制台，查看是否有 JavaScript 错误
3. 尝试访问其他页面（如 `/`），确认服务器是否正常运行






