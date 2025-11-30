# 创建 Cloudflare D1 数据库步骤

## 方法 1: 使用 npx（推荐，无需全局安装）

### 步骤 1: 登录 Cloudflare

```bash
cd /Users/muller/Downloads/cusor/in-nutri/in-nutri-site
npx wrangler login
```

这会打开浏览器，让您登录 Cloudflare 账户。

### 步骤 2: 创建 D1 数据库

```bash
npx wrangler d1 create in-nutri-db
```

### 步骤 3: 查看输出

命令执行后会输出类似以下内容：

```
✅ Created database in-nutri-db in region APAC

[[d1_databases]]
binding = "DB"
database_name = "in-nutri-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**重要**：保存 `database_id`，稍后可能需要用到。

## 方法 2: 在 Cloudflare Dashboard 中创建

如果您不想使用命令行，也可以在 Cloudflare Dashboard 中创建：

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **D1**
3. 点击 **"Create database"**
4. 输入数据库名称：`in-nutri-db`
5. 选择区域（建议选择离您最近的区域）
6. 点击 **"Create"**

## 创建后的步骤

### 1. 在 Cloudflare Pages 中添加绑定

1. 进入您的 Pages 项目设置
2. 找到 **"绑定 (Bindings)"** 部分
3. 点击 **"+ 添加"** → 选择 **"D1 Database"**
4. **变量名称**: `DB`（必须使用这个名称）
5. **数据库**: 选择刚创建的 `in-nutri-db`
6. 保存

### 2. 运行数据库迁移（可选）

如果需要在 D1 中创建表结构，可以运行：

```bash
# 生成迁移文件（如果还没有）
npm run db:generate

# 将迁移应用到 D1
npx wrangler d1 execute in-nutri-db --file=./drizzle/0000_*.sql
```

或者使用 Drizzle Kit：

```bash
npx drizzle-kit push --driver=d1 --schema=./db/schema.ts
```

## 验证

创建完成后，可以在 Cloudflare Dashboard 中看到新创建的数据库。

## 注意事项

- D1 数据库是 Cloudflare 的 SQLite 兼容数据库
- 免费账户有使用限制，但通常足够开发和小型项目使用
- 数据库绑定后，代码会自动使用 D1，而不是本地 SQLite






