# SSH密钥配置指南

## 当前状态

您正在生成SSH密钥，遇到了密码短语不匹配的问题。

## 解决方案

### 选项1：不设置密码短语（推荐⭐⭐⭐）

**最简单的方法**：直接按回车，不设置密码短语。

**操作步骤：**
1. 当提示 `Enter passphrase for "/Users/muller/.ssh/id_rsa" (empty for no passphrase):` 时
2. **直接按回车**（留空）
3. 当提示 `Enter same passphrase again:` 时
4. **再次按回车**（留空）

**优点：**
- ✅ 部署时无需输入密码
- ✅ 更方便快捷
- ✅ 适合个人开发

**缺点：**
- ⚠️ 如果密钥文件泄露，他人可以直接使用

### 选项2：设置密码短语（更安全）

**操作步骤：**
1. 当提示 `Enter passphrase` 时，输入一个密码短语
2. 当提示 `Enter same passphrase again` 时，**完全相同的**输入刚才的密码短语
3. 如果两次输入不一致，会提示重试

**注意：**
- 密码短语区分大小写
- 输入时不会显示字符（这是正常的）
- 如果忘记密码短语，需要重新生成密钥

## 推荐操作

**对于个人开发，建议不设置密码短语**，直接按回车即可。

## 生成密钥后的步骤

### 1. 查看公钥

```bash
cat ~/.ssh/id_rsa.pub
```

### 2. 复制公钥到服务器

**方法1：使用ssh-copy-id（最简单）**

```bash
ssh-copy-id root@115.159.92.235
```

**方法2：手动复制**

```bash
# 复制公钥内容
cat ~/.ssh/id_rsa.pub

# 然后SSH到服务器（会提示输入密码）
ssh root@115.159.92.235

# 在服务器上运行
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
# 粘贴公钥内容，保存退出

# 设置权限
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### 3. 测试免密登录

```bash
ssh root@115.159.92.235
# 应该可以直接登录，无需密码
```

## 如果密钥已存在

如果 `~/.ssh/id_rsa` 已存在，可以：

**选项1：使用现有密钥**
```bash
cat ~/.ssh/id_rsa.pub
# 复制公钥到服务器
```

**选项2：生成新密钥（使用不同名称）**
```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa_tencent -C "tencent-cloud"
# 使用 -f 指定不同的文件名
```

## 配置完成后

配置好SSH密钥后，就可以使用直接部署脚本了：

```bash
npm run deploy
# 或
bash scripts/deploy-direct.sh
```

## 需要帮助？

如果遇到问题：
1. 检查 `~/.ssh/id_rsa.pub` 文件是否存在
2. 确认公钥已正确添加到服务器
3. 检查服务器上的 `~/.ssh/authorized_keys` 文件权限

