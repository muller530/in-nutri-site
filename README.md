This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 🚀 部署

### 腾讯云部署（主要部署平台）

本项目**优先支持腾讯云部署**，所有代码修改都必须确保能在腾讯云轻量应用服务器上正常运行。

#### 部署前检查

在提交代码前，请运行兼容性检查：

```bash
npm run check:tencent
```

#### 部署要求

**重要**: 请阅读 [腾讯云部署基本要求](./TENCENT_DEPLOYMENT_REQUIREMENTS.md)，了解所有部署兼容性要求。

核心要求：
- ✅ 必须支持 Node.js 运行时环境（非 Edge Runtime）
- ✅ 必须支持文件系统访问（SQLite 数据库和文件上传）
- ✅ 必须支持标准 Next.js 构建和启动流程
- ❌ 不能依赖 Cloudflare 特定功能

#### 快速部署

```bash
# 1. 检查兼容性
npm run check:tencent

# 2. 构建项目
npm run build

# 3. 部署到腾讯云
npm run deploy:tencent
```

详细部署指南请参考：[腾讯云部署指南](./DEPLOY_TENCENT_CLOUD.md)

### 其他部署平台

#### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

#### Cloudflare Pages

项目也支持 Cloudflare Pages 部署（使用 Edge Runtime 和 D1 数据库），但这不是主要部署目标。

## 📋 开发规范

### 代码修改检查清单

在提交代码前，请确认：

- [ ] 运行 `npm run check:tencent` 通过
- [ ] 没有添加 `export const runtime = 'edge'` 到任何路由
- [ ] 没有使用 Cloudflare 特定的 API
- [ ] `npm run build` 能成功完成
- [ ] `npm run start` 能成功启动应用

详细要求请参考：[腾讯云部署基本要求](./TENCENT_DEPLOYMENT_REQUIREMENTS.md)
