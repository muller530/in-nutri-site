# 腾讯云部署基本条件已建立 ✅

本文档说明已建立的腾讯云部署基本条件，确保后续所有代码修改都能保证部署到腾讯云。

## 📋 已建立的文件和机制

### 1. 部署要求文档
- **文件**: `TENCENT_DEPLOYMENT_REQUIREMENTS.md`
- **作用**: 定义了所有部署兼容性要求，包括：
  - 核心原则
  - 必须遵守的要求（数据库、文件系统、Next.js 配置等）
  - 代码修改检查清单
  - 允许和禁止的操作

### 2. 自动检查脚本
- **文件**: `scripts/check-tencent.sh`
- **命令**: `npm run check:tencent`
- **作用**: 自动检查代码是否符合腾讯云部署要求，包括：
  - Edge Runtime 配置检查
  - Cloudflare 特定 API 检查
  - 依赖包检查
  - 构建脚本检查
  - 环境变量检查
  - 自动构建测试

### 3. 部署脚本
- **文件**: `scripts/deploy-tencent.sh`
- **命令**: `npm run deploy:tencent`
- **作用**: 自动化部署流程

### 4. PM2 配置
- **文件**: `ecosystem.config.js`
- **作用**: 生产环境进程管理配置

### 5. 环境变量示例
- **文件**: `.env.example`
- **作用**: 提供环境变量配置模板

### 6. 更新了 package.json
添加了以下命令：
- `npm run check:tencent` - 检查腾讯云部署兼容性
- `npm run deploy:tencent` - 部署到腾讯云

### 7. 更新了 README.md
添加了腾讯云部署说明和开发规范

## 🔍 如何使用

### 在提交代码前

1. **运行兼容性检查**:
   ```bash
   npm run check:tencent
   ```

2. **修复发现的问题**:
   - 如果发现 Edge Runtime 配置，需要移除或添加条件判断
   - 如果发现 Cloudflare 特定 API，需要提供降级方案

3. **本地测试构建**:
   ```bash
   npm run build
   npm run start
   ```

### 在部署前

1. **确保检查通过**:
   ```bash
   npm run check:tencent
   ```

2. **配置环境变量**:
   ```bash
   cp .env.example .env.production
   # 编辑 .env.production 填写实际值
   ```

3. **运行部署脚本**:
   ```bash
   npm run deploy:tencent
   ```

## ⚠️ 当前发现的问题

运行 `npm run check:tencent` 发现以下问题需要修复：

1. **Edge Runtime 配置** (需要修复):
   - `app/api/auth/logout/route.ts` - 使用了 `export const runtime = 'edge'`
   - `app/debug/page.tsx` - 使用了 `export const runtime = 'edge'`
   - `app/page.tsx` - 有注释掉的 Edge Runtime 配置

2. **警告** (建议修复):
   - `next.config.js` 包含 Cloudflare 适配器配置（但应该不影响标准构建）
   - 依赖包中包含 Cloudflare 相关依赖（作为可选依赖）

## 📝 后续修改注意事项

### ✅ 必须遵守

1. **所有 API 路由必须使用 Node.js Runtime**（默认，不要添加 `export const runtime = 'edge'`）
2. **不能使用 Cloudflare 特定 API**（如 `Request.cf`、`globalThis.DB`）
3. **必须支持文件系统访问**（SQLite 数据库和文件上传）
4. **必须支持标准 Next.js 构建流程**（`npm run build` 和 `npm run start`）

### ❌ 禁止操作

1. 将路由改为 Edge Runtime
2. 使用 Cloudflare 特定的 API 或服务
3. 依赖 Edge Runtime 不兼容的包
4. 破坏标准 Next.js 构建流程

### 🔧 如果必须使用 Edge Runtime

如果确实需要使用 Edge Runtime 功能，请：

1. **创建条件分支**: 使用环境变量检测运行环境
2. **提供降级方案**: 在 Node.js 环境中提供替代实现
3. **更新文档**: 说明不同环境的差异
4. **添加测试**: 确保两种环境都能正常工作

## 🎯 目标

**确保项目始终能够部署到腾讯云轻量应用服务器，所有代码修改都必须通过兼容性检查。**

## 📚 相关文档

- [腾讯云部署基本要求](./TENCENT_DEPLOYMENT_REQUIREMENTS.md) - 详细要求说明
- [腾讯云部署指南](./DEPLOY_TENCENT_CLOUD.md) - 部署步骤
- [部署脚本](./scripts/deploy-tencent.sh) - 自动化部署脚本
- [PM2 配置](./ecosystem.config.js) - 进程管理配置

## ✅ 检查清单

在每次代码修改后，请确认：

- [ ] 运行 `npm run check:tencent` 通过
- [ ] 没有添加 Edge Runtime 配置
- [ ] 没有使用 Cloudflare 特定 API
- [ ] `npm run build` 成功
- [ ] `npm run start` 成功
- [ ] 数据库访问正常
- [ ] 文件上传功能正常

---

**最后更新**: 2024年
**维护者**: 开发团队
**状态**: ✅ 基本条件已建立，需要修复当前发现的问题



