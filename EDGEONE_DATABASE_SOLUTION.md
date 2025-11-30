# EdgeOne 数据库连接问题解决方案

## 问题

EdgeOne 部署后登录后台提示：**"数据库连接失败，请检查数据库配置"**

## 原因

**EdgeOne 不支持 SQLite 文件系统访问**

EdgeOne 是边缘计算平台（类似 Cloudflare Pages），特点：
- ✅ 支持静态文件和 API 路由
- ❌ **不支持文件系统写入**
- ❌ **不支持 SQLite 文件数据库**

`better-sqlite3` 需要文件系统访问，在 EdgeOne 环境中无法工作。

## 解决方案

### 方案 1: 使用腾讯云 MySQL/PostgreSQL（推荐）⭐

**步骤**：

1. **创建云数据库**
   - 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
   - 创建 MySQL 或 PostgreSQL 实例
   - 记录连接信息（主机、端口、用户名、密码、数据库名）

2. **修改数据库配置**
   - 在 EdgeOne 项目设置中添加环境变量：
     ```
     DATABASE_URL=mysql://user:password@host:port/database
     ```
     或
     ```
     DATABASE_URL=postgresql://user:password@host:port/database
     ```

3. **安装数据库驱动**
   ```bash
   # MySQL
   npm install mysql2
   
   # PostgreSQL
   npm install postgres
   ```

4. **修改数据库连接代码**
   - 更新 `db/index.ts` 支持 MySQL/PostgreSQL
   - 更新 `drizzle.config.ts` 配置

### 方案 2: 使用腾讯云轻量应用服务器（推荐）⭐⭐

**优点**：
- ✅ 完全支持 SQLite
- ✅ 完全支持文件系统
- ✅ 完全兼容现有代码
- ✅ 成本可控（¥24-48/月）

**步骤**：
1. 购买腾讯云轻量应用服务器
2. 按照 `DEPLOY_TENCENT_CLOUD.md` 部署
3. 使用现有的 SQLite 数据库

### 方案 3: 使用 EdgeOne KV 存储（如果支持）

如果 EdgeOne 提供 KV 存储服务（类似 Cloudflare KV），可以：
1. 使用 KV 存储替代数据库
2. 需要重写数据访问层

## 快速修复（临时方案）

如果需要快速测试，可以：

1. **在 EdgeOne 环境变量中设置**：
   ```
   EDGEONE_DEPLOY=false
   ```
   这会尝试使用 SQLite，但可能仍然失败。

2. **或者使用内存数据库**（仅用于测试，数据不会持久化）

## 推荐方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **腾讯云服务器** | 完全兼容、成本低、易维护 | 需要服务器管理 | ⭐⭐⭐ 推荐 |
| **云数据库 MySQL** | 专业、可扩展 | 需要配置、成本较高 | 大型项目 |
| **EdgeOne + 云数据库** | 边缘加速 | 配置复杂、成本高 | 高流量项目 |

## 当前状态

代码已更新，会：
1. 检测 EdgeOne 环境
2. 提供明确的错误提示
3. 指导使用云数据库

## 下一步

**推荐**：使用腾讯云轻量应用服务器部署（方案 2）

这样可以：
- 保持现有代码不变
- 使用 SQLite 数据库
- 支持文件上传功能
- 成本可控

参考文档：`DEPLOY_TENCENT_CLOUD.md`




