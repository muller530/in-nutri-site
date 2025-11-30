# 修复登录页面错误

## 问题
`Cannot find module './586.js'` - Webpack 模块解析错误

## 解决方案

1. **清理构建缓存**：
```bash
rm -rf .next
```

2. **重启开发服务器**：
```bash
pkill -f "next dev"
npm run dev
```

3. **如果问题仍然存在，检查路由冲突**：
   - 登录页面在 `/app/admin/login/page.tsx`
   - Admin layout 在 `/app/(admin)/admin/layout.tsx`
   - 这两个不应该冲突，因为 `(admin)` 是路由组，不影响 URL

4. **如果问题持续，尝试重新安装依赖**：
```bash
rm -rf node_modules .next
npm install
npm run dev
```

## 当前状态
- 登录 API 已修复（使用 Node.js runtime）
- 数据库连接已修复（直接使用 require）
- 需要清理构建缓存并重启服务器






