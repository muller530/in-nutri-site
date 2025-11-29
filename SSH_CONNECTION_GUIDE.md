# SSH 连接腾讯云服务器指南

## 问题：Permission denied (publickey)

这个错误表示服务器要求使用SSH密钥认证，但您的电脑没有配置密钥。

## 解决方案

### 方案1：使用密码登录（推荐，最简单）

腾讯云 Lighthouse 默认支持密码登录，但可能需要先重置密码。

#### 步骤1：在腾讯云控制台重置密码

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 进入 **轻量应用服务器** -> **服务器**
3. 找到您的服务器，点击 **更多** -> **重置密码**
4. 设置新密码（建议使用强密码）
5. 等待1-2分钟让密码生效

#### 步骤2：使用密码登录

```bash
# 方法1：直接使用密码登录（会提示输入密码）
ssh root@115.159.92.235

# 方法2：如果方法1不行，尝试强制使用密码认证
ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no root@115.159.92.235
```

### 方案2：配置SSH密钥（更安全）

#### 步骤1：生成SSH密钥（如果还没有）

```bash
# 检查是否已有SSH密钥
ls -la ~/.ssh

# 如果没有，生成新密钥
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
# 按回车使用默认路径，可以设置密码或直接回车
```

#### 步骤2：在腾讯云控制台添加公钥

1. 查看您的公钥：
```bash
cat ~/.ssh/id_rsa.pub
```

2. 复制公钥内容

3. 在腾讯云控制台：
   - 进入 **轻量应用服务器** -> **密钥**
   - 点击 **创建密钥**
   - 选择 **导入已有公钥**
   - 粘贴公钥内容
   - 保存

4. 绑定密钥到服务器：
   - 进入服务器详情页
   - 点击 **密钥** 标签
   - 点击 **绑定密钥**
   - 选择刚才创建的密钥

#### 步骤3：使用密钥登录

```bash
ssh root@115.159.92.235
```

### 方案3：使用腾讯云控制台Web终端（最简单）

如果SSH连接有问题，可以直接使用腾讯云控制台的Web终端：

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 进入 **轻量应用服务器** -> **服务器**
3. 点击您的服务器
4. 点击 **登录** 按钮
5. 使用Web终端直接操作

## 快速连接命令

```bash
# 使用密码登录
ssh root@115.159.92.235

# 如果提示输入密码，输入您在控制台设置的密码
# 注意：输入密码时不会显示字符，这是正常的
```

## 连接成功后

连接成功后，您会看到类似这样的提示：
```
Welcome to Ubuntu 22.04 LTS...
root@VM-xxx:~#
```

然后就可以运行部署脚本了：

```bash
# 下载并运行一键部署脚本
curl -o setup-lighthouse.sh https://raw.githubusercontent.com/muller530/in-nutri-site/main/scripts/setup-lighthouse.sh
bash setup-lighthouse.sh
```

## 常见问题

### Q: 输入密码后还是连接失败？

A: 
1. 确认密码正确（注意大小写）
2. 等待1-2分钟让密码生效
3. 尝试使用Web终端登录

### Q: 忘记密码怎么办？

A: 在腾讯云控制台重置密码

### Q: 想使用密钥但不会配置？

A: 先使用密码登录，部署完成后可以再配置密钥

## 下一步

连接成功后，按照 `QUICK_DEPLOY.md` 或 `LIGHTHOUSE_DEPLOY.md` 中的步骤进行部署。

