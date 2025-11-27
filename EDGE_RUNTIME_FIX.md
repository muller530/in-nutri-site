# Edge Runtime 配置修复

## 问题

Cloudflare Pages 要求所有非静态路由使用 Edge Runtime。需要为所有 API 路由和动态页面添加：

```typescript
export const runtime = 'edge';
```

## 需要修改的文件

### API 路由（35 个文件）
所有 `app/api/**/route.ts` 文件都需要添加 Edge Runtime。

### 动态页面
所有 `app/**/[id]/page.tsx` 和 `app/**/[slug]/page.tsx` 文件也需要添加。

### 主页面
`app/page.tsx` 也需要添加。

## 批量修复方案

由于文件数量较多，建议使用脚本批量添加。但考虑到 Edge Runtime 的限制（不支持某些 Node.js API），我们需要先检查是否有不兼容的代码。

## 重要提示

Edge Runtime 不支持：
- `fs` 模块
- `path` 模块（部分）
- 某些 Node.js 内置模块
- `better-sqlite3`（需要使用 D1 替代）

## 当前状态

项目使用了 `better-sqlite3`，这在 Edge Runtime 中不可用。需要：
1. 确保所有数据库操作都通过 D1（在 Cloudflare 环境中）
2. 或者使用兼容 Edge Runtime 的数据库客户端

## 建议

由于项目已经配置了 D1 数据库适配器（`db/index.ts`），应该可以正常工作。现在需要：
1. 为所有路由添加 Edge Runtime 配置
2. 确保没有使用不兼容的 Node.js API

