# 火山引擎（火山方舟）AI接入指南

## 快速开始

### 1. 获取API密钥和Endpoint

1. **登录火山引擎控制台**
   - 访问：https://console.volcengine.com/
   - 使用您的账号登录

2. **进入火山方舟**
   - 在控制台中找到"火山方舟"（Volcano Ark）
   - 点击进入

3. **创建或选择推理接入点**
   - 进入"在线推理" -> "自定义推理接入点"
   - 如果已有接入点，直接使用
   - 如果没有，点击"+ 创建推理接入点"
   - 选择您要使用的模型（如：豆包、DeepSeek等）

4. **获取API信息**
   - 在推理接入点列表中，找到您的接入点
   - 点击"查看 API Key"获取API密钥
   - 复制推理接入点的Endpoint URL
     - 格式类似：`https://ark.cn-beijing.volces.com/api/v3/chat/completions`
     - 或：`https://ark.cn-beijing.volces.com/api/v3`

### 2. 配置环境变量

#### 本地开发（.env.local）

```env
AI_PROVIDER=volcano
AI_API_KEY=your-api-key-here
VOLCANO_ENDPOINT=https://ark.cn-beijing.volces.com/api/v3/chat/completions
VOLCANO_MODEL=doubao-pro-4k
```

#### 生产环境（.env.production）

```env
AI_PROVIDER=volcano
AI_API_KEY=your-production-api-key
VOLCANO_ENDPOINT=https://ark.cn-beijing.volces.com/api/v3/chat/completions
VOLCANO_MODEL=doubao-pro-4k
```

#### EdgeOne部署

在 EdgeOne 控制台的环境变量中设置：
- `AI_PROVIDER` = `volcano`
- `AI_API_KEY` = 您的API密钥
- `VOLCANO_ENDPOINT` = 您的推理接入点URL
- `VOLCANO_MODEL` = 模型名称（可选）

### 3. 支持的模型

火山方舟支持多种模型，您可以在创建推理接入点时选择：

- **豆包系列**：`doubao-pro-4k`、`doubao-lite-4k` 等
- **DeepSeek系列**：`deepseek-chat`、`deepseek-r1` 等
- **即梦系列**：`jimen-4.0` 等
- 其他火山方舟支持的模型

### 4. Endpoint格式说明

火山引擎的Endpoint通常有两种格式：

1. **完整格式**（推荐）：
   ```
   https://ark.cn-beijing.volces.com/api/v3/chat/completions
   ```

2. **基础格式**：
   ```
   https://ark.cn-beijing.volces.com/api/v3
   ```

代码会自动处理这两种格式，但建议使用完整格式。

### 5. 测试配置

启动开发服务器：

```bash
npm run dev
```

打开网站，点击右下角的聊天按钮，输入测试问题：
- "你们有什么产品？"
- "产品价格是多少？"

如果AI能正常回答，说明配置成功！

## 常见问题

### Q: 如何找到我的推理接入点URL？

A: 在火山方舟控制台的"在线推理"页面，找到您的推理接入点，点击"API调用"，会显示完整的调用示例，其中包含Endpoint URL。

### Q: 如何选择模型？

A: 
1. 在创建推理接入点时选择模型
2. 或者在环境变量中设置 `VOLCANO_MODEL` 指定模型名称
3. 如果不设置，默认使用 `doubao-pro-4k`

### Q: API调用失败怎么办？

A: 
1. 检查API密钥是否正确
2. 检查Endpoint URL是否正确
3. 检查网络连接
4. 查看服务器日志中的错误信息
5. 如果API失败，系统会自动使用降级方案（关键词匹配）

### Q: 如何切换不同的模型？

A: 
1. 在火山方舟控制台创建多个推理接入点（每个接入点对应一个模型）
2. 修改环境变量中的 `VOLCANO_ENDPOINT` 切换到不同的接入点
3. 或者修改 `VOLCANO_MODEL` 指定模型名称

### Q: 费用如何计算？

A: 火山引擎按Token付费，具体价格请查看火山引擎的定价页面。您可以在控制台查看使用量和费用。

## API调用示例

代码中已经实现了火山引擎的API调用，格式如下：

```typescript
const response = await fetch(VOLCANO_ENDPOINT, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${API_KEY}`,
  },
  body: JSON.stringify({
    model: "doubao-pro-4k",
    messages: [...],
    temperature: 0.7,
    max_tokens: 1000,
  }),
});
```

## 更多资源

- [火山引擎文档](https://www.volcengine.com/docs/)
- [火山方舟API文档](https://www.volcengine.com/docs/82379/1544856)
- [火山引擎控制台](https://console.volcengine.com/)

## 技术支持

如有问题，请：
1. 查看服务器日志
2. 检查火山引擎控制台的使用情况
3. 联系火山引擎技术支持

