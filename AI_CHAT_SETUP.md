# AI聊天功能配置指南

## 功能说明

网站已集成AI聊天助手功能，客户可以在网站上通过聊天窗口咨询产品相关问题。

## 功能特点

- ✅ 右下角浮动聊天按钮
- ✅ 美观的聊天界面
- ✅ 支持对话历史
- ✅ 产品知识库上下文
- ✅ 多AI服务提供商支持

## 配置步骤

### 1. 选择AI服务提供商（推荐国内服务）

**默认使用火山引擎（火山方舟）**，支持以下AI服务：

#### 选项1: 火山引擎（火山方舟）（推荐⭐⭐⭐⭐⭐）

**优点：**
- 国内访问快，无需代理
- 支持多种模型（豆包、DeepSeek等）
- API格式简单，兼容OpenAI格式
- 按Token付费，价格透明
- 推理接入点灵活配置

**配置：**
```env
AI_PROVIDER=volcano
AI_API_KEY=your-volcano-api-key
VOLCANO_ENDPOINT=https://ark.cn-beijing.volces.com/api/v3/chat/completions
VOLCANO_MODEL=doubao-pro-4k  # 可选，指定模型名称
```

**获取API密钥和Endpoint：**
1. 登录 [火山引擎控制台](https://console.volcengine.com/)
2. 进入"火山方舟" -> "在线推理"
3. 创建或选择您的推理接入点
4. 点击"查看 API Key"获取API密钥
5. 复制推理接入点的Endpoint URL（格式类似：`https://ark.cn-beijing.volces.com/api/v3/chat/completions`）

**支持的模型：**
- 豆包系列（Doubao）
- DeepSeek系列
- 即梦系列（Jimen）
- 其他火山方舟支持的模型

**API文档：**
- https://www.volcengine.com/docs/82379/1544856

#### 选项2: 腾讯云混元大模型（推荐⭐⭐⭐）

**优点：**
- 国内访问快，无需代理
- 与腾讯云集成好
- 中文理解优秀
- 价格合理

**配置：**
```env
AI_PROVIDER=tencent
AI_API_KEY=your-tencent-secret-id
AI_SECRET_KEY=your-tencent-secret-key
```

**获取API密钥：**
1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 进入"访问管理" -> "API密钥管理"
3. 创建密钥，获取 SecretId 和 SecretKey
4. 开通"混元大模型"服务：https://console.cloud.tencent.com/hunyuan

**API文档：**
- https://cloud.tencent.com/document/product/1729

#### 选项2: 百度文心一言（推荐⭐⭐）

**优点：**
- 国内访问快
- 中文理解好
- 价格相对便宜

**配置：**
```env
AI_PROVIDER=baidu
AI_API_KEY=your-baidu-api-key
AI_SECRET_KEY=your-baidu-secret-key
```

**获取API密钥：**
1. 登录 [百度智能云](https://cloud.baidu.com/)
2. 进入"文心一言"服务
3. 创建应用，获取 API Key 和 Secret Key

**API文档：**
- https://cloud.baidu.com/doc/WENXINWORKSHOP/s/Ilkkrb0i5

#### 选项3: OpenAI（国际部署使用）

**优点：**
- 回答质量高
- API稳定

**缺点：**
- 国内需要代理
- 按使用量付费

**配置：**
```env
AI_PROVIDER=openai
AI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-3.5-turbo  # 或 gpt-4
```

### 2. 设置环境变量

#### 本地开发

创建 `.env.local` 文件：
```env
# 使用火山引擎（推荐，默认）
AI_PROVIDER=volcano
AI_API_KEY=your-volcano-api-key
VOLCANO_ENDPOINT=https://ark.cn-beijing.volces.com/api/v3/chat/completions
VOLCANO_MODEL=doubao-pro-4k  # 可选

# 或使用腾讯云
# AI_PROVIDER=tencent
# AI_API_KEY=your-tencent-secret-id
# AI_SECRET_KEY=your-tencent-secret-key

# 或使用百度
# AI_PROVIDER=baidu
# AI_API_KEY=your-baidu-api-key
# AI_SECRET_KEY=your-baidu-secret-key
```

#### 生产环境（腾讯云服务器）

编辑 `.env.production` 文件：
```env
AI_PROVIDER=volcano
AI_API_KEY=your-volcano-api-key
VOLCANO_ENDPOINT=https://ark.cn-beijing.volces.com/api/v3/chat/completions
VOLCANO_MODEL=doubao-pro-4k  # 可选
```

#### EdgeOne部署

在 EdgeOne 控制台设置环境变量：
- `AI_PROVIDER`: `volcano`（推荐）、`tencent` 或 `baidu`
- `AI_API_KEY`: 您的API密钥
- `VOLCANO_ENDPOINT`: 火山引擎推理接入点URL（如果使用火山引擎）
- `VOLCANO_MODEL`: 模型名称（可选，如果使用火山引擎）

### 3. 测试功能

1. 启动开发服务器：
```bash
npm run dev
```

2. 打开网站，点击右下角的聊天按钮
3. 输入测试问题，如："你们有哪些产品？"
4. 检查AI回复是否正常

## 产品知识库（自动从数据库读取）

AI助手会**自动从数据库读取**最新的产品信息，包括：

- ✅ **所有产品详情**：名称、描述、价格、标签、购买链接等
- ✅ **品牌故事**：品牌理念、使命、愿景等
- ✅ **实时更新**：每次对话都会获取最新的产品数据

**重要特性：**
1. **精准回答**：AI基于您数据库中的真实产品信息回答
2. **拒绝无关问题**：AI被明确要求只回答与产品/品牌相关的问题
3. **自动更新**：产品信息更新后，AI会自动使用新信息

知识库构建逻辑在 `app/api/chat/route.ts` 的 `buildProductContext()` 函数中，可以根据需要修改。

## 自定义配置

### 修改产品知识库提示词

编辑 `app/api/chat/route.ts`，修改 `buildProductContext()` 函数中的提示词模板：

```typescript
// 在 buildProductContext() 函数中修改 context 变量
const context = `你是 In Nutri 的专业AI客服助手...
  [修改这里的提示词]
`;
```

### 调整AI行为

在 `buildProductContext()` 函数中可以调整：
- AI的回答风格
- 拒绝无关问题的措辞
- 引导用户的方式

### 修改聊天界面样式

编辑 `components/ChatWidget.tsx`，修改样式和布局。

### 添加更多AI服务提供商

在 `app/api/chat/route.ts` 中添加新的函数：

```typescript
async function callYourAI(messages: any[], apiKey: string): Promise<string> {
  // 实现您的AI服务调用
}
```

然后在 `POST` 函数中添加新的 case。

## 成本估算

### OpenAI
- GPT-3.5-turbo: $0.0015/1K tokens（输入）+ $0.002/1K tokens（输出）
- 平均每次对话约 $0.01-0.02

### 腾讯云AI
- 按调用次数计费
- 约 ¥0.01-0.05/次

### 百度文心一言
- 按调用次数计费
- 约 ¥0.01-0.03/次

## 安全建议

1. **保护API密钥**
   - 不要将API密钥提交到Git仓库
   - 使用环境变量存储
   - 定期轮换密钥

2. **限制使用**
   - 可以添加速率限制
   - 可以添加用户验证
   - 可以记录使用日志

3. **内容过滤**
   - 可以添加敏感词过滤
   - 可以添加内容审核

## 故障排查

### 问题：聊天窗口不显示

**解决方案：**
- 检查浏览器控制台是否有错误
- 确认 `ChatWidget` 组件已正确导入
- 检查CSS样式是否加载

### 问题：AI不回复

**解决方案：**
- 检查环境变量是否正确设置
- 检查API密钥是否有效
- 查看服务器日志中的错误信息
- 确认网络连接正常（OpenAI需要代理）

### 问题：回复质量不佳

**解决方案：**
- 优化 `PRODUCT_CONTEXT` 中的产品信息
- 尝试使用更高级的模型（如 GPT-4）
- 调整 `temperature` 参数

## 下一步优化

1. **添加对话历史存储**（使用数据库）
2. **添加用户反馈功能**
3. **添加多语言支持**
4. **添加语音输入**
5. **添加文件上传功能**
6. **集成客服系统**

## 需要帮助？

如有问题，请查看：
- API文档：`app/api/chat/route.ts`
- 组件代码：`components/ChatWidget.tsx`
- 或联系技术支持

