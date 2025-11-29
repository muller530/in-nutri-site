# Cloudflare Pages 配置更新

## 已完成的更改

1. ✅ 降级 Next.js 到 15.5.2（兼容 Cloudflare Pages）
2. ✅ 安装 `@cloudflare/next-on-pages` 适配器
3. ✅ 更新构建脚本
4. ✅ 代码已提交并推送

## 接下来需要做的

### 步骤 1: 修改 Cloudflare Pages 构建配置

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **Pages** → `in-nutri-site`
3. 点击 **"设置"** → **"构建设置"**

### 步骤 2: 更新构建命令

找到 **"构建命令 (Build command)"** 字段，改为：
```
npm run pages:build
```

### 步骤 3: 更新构建输出目录

找到 **"构建输出目录 (Build output directory)"** 字段，改为：
```
.vercel/output/static
```

### 步骤 4: 保存并等待部署

1. 点击 **"保存"**
2. 等待自动触发新部署（约 2-3 分钟）

### 步骤 5: 测试访问

部署完成后，访问：
- `https://in-nutri-site.pages.dev`

## 预期结果

- ✅ 构建成功
- ✅ 网站可以正常访问
- ✅ 所有功能正常工作（SSR、API 路由、管理员后台）

## 如果仍然有问题

请检查新的构建日志，应该会看到：
- `@cloudflare/next-on-pages` 正在运行
- 构建输出到 `.vercel/output/static`

如果还有其他错误，请提供新的构建日志。



