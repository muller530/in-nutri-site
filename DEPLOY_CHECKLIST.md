# Cloudflare 部署检查清单

## ✅ 已修复的问题

### 1. 类型错误修复
- ✅ 修复了 `subscribers` 表缺失问题
- ✅ 修复了 `priceCents` 可能为 null 的类型错误
- ✅ 修复了 `storyBlocks` 数组类型错误
- ✅ 修复了所有 Zod 错误处理（`error.errors` → `error.issues`）

### 2. 代码质量检查
- ✅ TypeScript 编译通过（`npx tsc --noEmit`）
- ✅ Next.js 构建成功（`npm run build`）
- ✅ 所有可能为 null 的字段都有适当的空值检查

## 📋 部署前检查

### 代码检查
- [x] TypeScript 编译无错误
- [x] Next.js 构建成功
- [x] 所有类型错误已修复
- [x] 所有空值检查已添加

### Cloudflare 配置
- [ ] 已创建 D1 数据库
- [ ] 已创建 R2 存储桶（3个）
- [ ] `wrangler.toml` 已配置
- [ ] 环境变量已设置：
  - [ ] `SESSION_SECRET`
  - [ ] `NEXT_PUBLIC_BASE_URL`
  - [ ] `R2_PUBLIC_URL`（可选）

### 数据库迁移
- [ ] 已运行数据库迁移到 D1
- [ ] 已迁移现有数据（如果有）

### 文件迁移
- [ ] 已迁移现有文件到 R2（如果有）

## 🚀 部署步骤

1. **确保代码已提交到 Git**
   ```bash
   git add .
   git commit -m "修复所有类型错误，准备部署"
   git push
   ```

2. **在 Cloudflare Pages 控制台**
   - 连接 Git 仓库
   - 配置构建设置：
     - Build command: `npm run build`
     - Build output directory: `.next`
     - Node.js version: `18` 或更高
   - 添加环境变量
   - 触发部署

3. **部署后验证**
   - [ ] 网站可以正常访问
   - [ ] 数据库连接正常
   - [ ] 文件上传功能正常
   - [ ] 管理员登录正常
   - [ ] 所有 API 路由正常

## ⚠️ 注意事项

1. **R2 公共访问**：需要配置 R2 存储桶的公共访问，否则上传的文件无法在前端显示
2. **数据库绑定**：确保 `wrangler.toml` 中的 `database_id` 正确
3. **环境变量**：确保所有必需的环境变量都已设置
4. **首次部署**：首次部署可能需要较长时间，请耐心等待

## 🔍 故障排查

如果部署失败：

1. **检查构建日志**：查看 Cloudflare Pages 的构建日志
2. **检查环境变量**：确保所有必需的环境变量都已设置
3. **检查数据库绑定**：确保 D1 数据库 ID 正确
4. **检查 R2 绑定**：确保 R2 存储桶名称正确
5. **清除缓存**：在 Cloudflare Pages 中清除构建缓存

## 📝 已修复的文件列表

### 类型错误修复
- `db/schema.ts` - 添加了 `subscribers` 表
- `app/(admin)/admin/products/page.tsx` - 修复 `priceCents` 空值检查
- `app/(admin)/admin/products/[id]/page.tsx` - 修复 `priceCents` 空值检查
- `app/(admin)/admin/brand-story/edit/page.tsx` - 修复 `storyBlocks` 数组类型
- `components/ProductShowcase.tsx` - 修复 `priceCents` 类型和空值检查

### Zod 错误处理修复（16个文件）
- `app/api/admin/products/route.ts`
- `app/api/admin/products/[id]/route.ts`
- `app/api/admin/videos/route.ts`
- `app/api/admin/videos/[id]/route.ts`
- `app/api/admin/site-settings/route.ts`
- `app/api/admin/members/route.ts`
- `app/api/admin/members/[id]/route.ts`
- `app/api/admin/gallery/route.ts`
- `app/api/admin/gallery/[id]/route.ts`
- `app/api/admin/brand-story/route.ts`
- `app/api/admin/banners/route.ts`
- `app/api/admin/banners/[id]/route.ts`
- `app/api/admin/articles/route.ts`
- `app/api/admin/articles/[id]/route.ts`
- `app/api/admin/recipes/route.ts`
- `app/api/admin/recipes/[id]/route.ts`

## ✅ 验证结果

- **TypeScript 检查**：✅ 通过（无错误）
- **Next.js 构建**：✅ 成功
- **所有路由**：✅ 正常生成

**代码已准备好部署到 Cloudflare！**



