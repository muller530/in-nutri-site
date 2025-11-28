# Cloudflare D1 数据库配置指南

## 问题诊断

如果网站显示为黑色页面或无法加载，可能是 D1 数据库没有正确配置。

## 解决步骤

### 1. 在 Cloudflare Dashboard 中配置 D1 绑定

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入你的账户
3. 选择 **Workers & Pages**
4. 点击你的项目 **in-nutri-site**
5. 进入 **Settings**（设置）
6. 找到 **Functions** 部分
7. 在 **D1 Database bindings** 中添加：
   - **Variable name**: `DB`
   - **D1 Database**: `in-nutri-db`（选择你创建的 D1 数据库）
8. 保存设置

### 2. 配置兼容性标志

1. 在项目设置中找到 **Compatibility Flags**
2. 在 **Production** 和 **Preview** 环境中添加：
   - `nodejs_compat`
3. 保存设置

### 3. 重新部署

配置完成后，Cloudflare Pages 会自动重新部署。等待 2-3 分钟。

## 验证配置

部署完成后，访问网站应该能看到：
- Hero 区域显示品牌绿色渐变背景
- Logo 和文字内容正常显示
- 即使数据库为空，也能看到默认内容

## 如果问题仍然存在

1. 检查浏览器控制台（F12）是否有错误信息
2. 检查 Cloudflare Pages 的部署日志
3. 确认 D1 数据库已创建并已应用迁移

