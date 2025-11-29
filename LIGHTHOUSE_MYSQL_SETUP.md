# 腾讯云 Lighthouse 使用 MySQL 数据库配置指南

如果 SQLite 在 Lighthouse 上有问题，可以使用独立的 MySQL 数据库。腾讯云提供了 MySQL 数据库服务，配置简单且稳定可靠。

## 🎯 方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **SQLite** | 简单、无需额外配置 | 文件权限问题、并发性能有限 | 小型项目、单用户 |
| **MySQL** | 稳定、性能好、支持并发 | 需要单独购买数据库服务 | 生产环境、多用户 |

## 🚀 第一步：购买腾讯云 MySQL 数据库

### 1. 登录腾讯云控制台

访问：https://console.cloud.tencent.com/cdb

### 2. 创建 MySQL 实例

1. 点击 **"新建"** 或 **"创建实例"**
2. 选择配置：
   - **地域**: 选择与 Lighthouse 服务器相同的地域（降低延迟）
   - **数据库版本**: MySQL 5.7 或 8.0（推荐 8.0）
   - **架构**: 基础版（单节点）即可，性价比高
   - **规格**: 1核1GB 起步（根据需求选择）
   - **存储**: 20GB 起步
   - **网络**: 选择与 Lighthouse 相同的 VPC（如果使用 VPC）

### 3. 设置密码

- 创建时设置 root 密码
- **重要**: 记录密码，后续无法查看

### 4. 配置安全组

1. 在 MySQL 实例详情页，找到 **"安全组"**
2. 添加规则：
   - **类型**: MySQL(3306)
   - **来源**: 选择您的 Lighthouse 服务器 IP 或安全组
   - **策略**: 允许

### 5. 获取连接信息

在实例详情页找到：
- **内网地址**: `cdb-xxxxx.sql.tencentcdb.com:3306`
- **外网地址**: （如果需要外网访问）
- **端口**: 通常是 3306

## 🔧 第二步：在 Lighthouse 服务器上配置

### 1. SSH 连接到服务器

```bash
ssh root@your-server-ip
cd /var/www/in-nutri-site
```

### 2. 安装 MySQL 客户端（用于测试）

```bash
# Ubuntu/Debian
apt update
apt install -y mysql-client

# CentOS
yum install -y mysql
```

### 3. 测试数据库连接

```bash
mysql -h cdb-xxxxx.sql.tencentcdb.com -P 3306 -u root -p
# 输入密码，如果成功连接说明配置正确
```

### 4. 创建数据库和用户

```bash
mysql -h cdb-xxxxx.sql.tencentcdb.com -P 3306 -u root -p
```

在 MySQL 命令行中执行：

```sql
-- 创建数据库
CREATE DATABASE in_nutri_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建专用用户（推荐，更安全）
CREATE USER 'in_nutri_user'@'%' IDENTIFIED BY 'your-strong-password';

-- 授予权限
GRANT ALL PRIVILEGES ON in_nutri_db.* TO 'in_nutri_user'@'%';

-- 刷新权限
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

### 5. 安装 Node.js MySQL 驱动

```bash
cd /var/www/in-nutri-site
npm install mysql2
npm install drizzle-orm
```

## 📝 第三步：修改代码支持 MySQL

### 1. 更新数据库配置

需要修改 `db/index.ts` 以支持 MySQL。由于当前代码只支持 SQLite，我们需要添加 MySQL 支持。

### 2. 更新环境变量

编辑 `.env.production`:

```bash
# 使用 MySQL
DATABASE_URL=mysql://in_nutri_user:your-strong-password@cdb-xxxxx.sql.tencentcdb.com:3306/in_nutri_db

# 或者使用完整格式
# DATABASE_URL=mysql://username:password@host:port/database
```

### 3. 更新 drizzle.config.ts

修改 `drizzle.config.ts` 以支持 MySQL：

```typescript
import type { Config } from "drizzle-kit";

const dbUrl = process.env.DATABASE_URL || "./db/sqlite.db";
const isMySQL = dbUrl.startsWith("mysql://");

const config: Config = {
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: isMySQL ? "mysql" : "sqlite",
  dbCredentials: isMySQL
    ? {
        url: dbUrl,
      }
    : {
        url: dbUrl,
      },
};

export default config;
```

## 🛠️ 第四步：初始化数据库

### 1. 推送数据库结构

```bash
cd /var/www/in-nutri-site
npm run db:push
```

### 2. 创建管理员账号

```bash
npm run db:seed
# 或
npm run db:reset-admin
```

### 3. 重启应用

```bash
pm2 restart in-nutri-site
pm2 logs in-nutri-site
```

## ✅ 验证

1. **测试数据库连接**:
   ```bash
   mysql -h cdb-xxxxx.sql.tencentcdb.com -P 3306 -u in_nutri_user -p in_nutri_db
   ```

2. **查看表结构**:
   ```sql
   SHOW TABLES;
   SELECT * FROM members LIMIT 1;
   ```

3. **测试登录**:
   - 访问: `https://your-domain.com/admin/login`
   - 使用: `admin@in-nutri.com` / `inNutriAdmin123`

## 🔒 安全建议

1. **使用专用数据库用户**，不要使用 root
2. **使用强密码**
3. **限制 IP 访问**（在安全组中只允许 Lighthouse 服务器 IP）
4. **定期备份数据库**
5. **启用 SSL 连接**（如果 MySQL 实例支持）

## 💰 成本估算

- **MySQL 基础版（1核1GB）**: 约 ¥50-100/月
- **存储（20GB）**: 约 ¥10-20/月
- **总成本**: 约 ¥60-120/月

## 🆘 常见问题

### Q: 连接超时怎么办？

A: 检查安全组配置，确保允许 Lighthouse 服务器 IP 访问 MySQL 端口（3306）。

### Q: 认证失败怎么办？

A: 检查用户名和密码是否正确，确保用户有访问数据库的权限。

### Q: 如何备份数据库？

A: 使用 `mysqldump`:
```bash
mysqldump -h host -u user -p database_name > backup.sql
```

### Q: 如何迁移现有 SQLite 数据到 MySQL？

A: 需要编写迁移脚本，将 SQLite 数据导出并导入到 MySQL。

## 📞 需要帮助？

如果遇到问题，请提供：
1. MySQL 连接信息（隐藏密码）
2. 错误日志
3. 安全组配置截图

