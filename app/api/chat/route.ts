import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { products, brandStory, siteSettings, type Product } from "@/db/schema";

const chatSchema = z.object({
  message: z.string().min(1).max(1000),
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })).optional(),
});

// 从数据库构建产品知识库
async function buildProductContext(): Promise<string> {
  try {
    // 获取所有产品
    const allProducts = await db.select().from(products);
    
    // 调试日志：检查产品数据
    console.log(`📦 从数据库读取到 ${allProducts.length} 个产品`);
    if (allProducts.length > 0) {
      console.log("产品列表:", allProducts.map((p: Product) => p.name).join(", "));
    } else {
      console.warn("⚠️ 数据库中没有产品数据，请先在后台添加产品");
    }
    
    // 获取品牌故事
    const brandStories = await db.select().from(brandStory).limit(1);
    const brandInfo = brandStories.length > 0 ? brandStories[0] : null;
    
    // 构建产品信息字符串（更详细、结构化）
    let productsInfo = "";
    if (allProducts.length === 0) {
      productsInfo = "目前暂无产品信息。";
    } else {
      productsInfo = `In Nutri 共有 ${allProducts.length} 款产品，详细信息如下：\n\n`;
      
      allProducts.forEach((product: Product, index: number) => {
        try {
          const tags = product.tags ? (typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags) : [];
          const price = product.priceCents ? (product.priceCents / 100).toFixed(2) : null;
          
          productsInfo += `【产品 ${index + 1}】${product.name}\n`;
          
          // 分类信息
          if (product.category) {
            productsInfo += `分类：${product.category}\n`;
          }
          
          // 简短描述（重要）
          if (product.shortDescription) {
            productsInfo += `简介：${product.shortDescription}\n`;
          }
          
          // 详细描述（最重要）
          if (product.longDescription) {
            productsInfo += `详细介绍：${product.longDescription}\n`;
          }
          
          // 标签/特点
          if (tags && tags.length > 0) {
            const tagList = Array.isArray(tags) ? tags : [tags];
            productsInfo += `特点/标签：${tagList.join("、")}\n`;
          }
          
          // 价格信息
          if (price) {
            productsInfo += `价格：¥${price}\n`;
          } else {
            productsInfo += `价格：请联系客服咨询\n`;
          }
          
          // 购买链接
          if (product.purchaseUrl) {
            productsInfo += `购买方式：${product.purchaseUrl}\n`;
          }
          
          // 产品标识（slug）
          if (product.slug) {
            productsInfo += `产品标识：${product.slug}\n`;
          }
          
          productsInfo += "\n";
        } catch (error) {
          console.error(`Error processing product ${product.id}:`, error);
          // 即使解析失败，也添加基本信息
          productsInfo += `【产品 ${index + 1}】${product.name}\n`;
          if (product.shortDescription) {
            productsInfo += `简介：${product.shortDescription}\n`;
          }
          productsInfo += "\n";
        }
      });
    }
    
    // 构建品牌信息
    let brandInfoText = "品牌信息：\n";
    if (brandInfo) {
      brandInfoText += `- 品牌标题：${brandInfo.heroTitle || "In-nutri · 有态度的超级食物"}\n`;
      brandInfoText += `- 品牌副标题：${brandInfo.heroSubtitle || "源自真实原料"}\n`;
      if (brandInfo.mission) {
        brandInfoText += `- 品牌使命：${brandInfo.mission}\n`;
      }
      if (brandInfo.vision) {
        brandInfoText += `- 品牌愿景：${brandInfo.vision}\n`;
      }
      if (brandInfo.brandTone) {
        brandInfoText += `- 品牌调性：${brandInfo.brandTone}\n`;
      }
    } else {
      brandInfoText += "- 品牌理念：以精准营养科技打造全天候能量管理方案\n";
      brandInfoText += "- 覆盖场景：晨间代谢、日间防护与夜间修护三大场景\n";
      brandInfoText += "- 使用植物活性成分和临床数据支持\n";
    }
    
    // 构建完整的系统提示词（优化版 - 更强调直接回答）
    const context = `你是 In Nutri（功能营养品牌）的专业AI客服助手。你的核心任务是准确、详细地回答客户关于我们产品的所有问题。

【最重要规则 - 必须严格遵守】
1. **直接回答问题**：当用户问"有没有XX"、"是否有XX"、"你们有XX吗"时，第一句话必须明确回答"有"或"没有"，不要给出模糊或通用的回复
2. **基于产品信息库回答**：必须严格基于以下产品信息回答，不要编造或猜测
3. **提供详细信息**：如果"有"，立即提供该产品的完整信息；如果"没有"，说明没有但可以推荐相似产品或列出所有产品

【核心职责】
1. **准确回答产品问题**：必须基于以下产品信息准确回答，包括产品名称、描述、特点、价格、购买方式等
2. **直接回答用户问题**：当用户询问"有没有XX产品"、"是否有XX"时，要直接回答"有"或"没有"，然后提供详细信息
3. **详细说明产品信息**：当用户询问产品时，要提供完整的产品信息，包括简介、详细介绍、特点、价格等
4. **智能匹配产品**：如果用户询问的产品名称不完全匹配，要尝试匹配相似的产品（如"可可粉"可能对应"复合营养粉"等），并明确说明"我们没有XX，但我们有[相似产品]"
5. **拒绝无关问题**：如果用户询问与产品/品牌无关的问题（如天气、新闻、其他品牌、无关话题），礼貌拒绝并引导关注我们的产品
6. **专业友好**：用专业、友好、热情的语气回答，展现品牌的专业性
7. **禁止通用回复**：绝对不要给出"感谢您的咨询，我是..."这样的通用开场白，要直接回答问题

【产品信息库】
${productsInfo}

【品牌信息】
${brandInfoText}

【服务内容】
- 1v1 功能营养师咨询：专属营养档案 + 指标跟踪，提供控糖、轻体、修护三大模块方案
- 超级食物冲泡指南：以日程表形式拆解早午晚冲泡方式，附带科学依据与注意事项
- 可持续补充体系：可回收补充装、轻量包装与绿色物流

【联系方式】
- 客服邮箱：hello@innutri.com
- 官网：访问我们的官方网站了解更多产品详情

【回答指南】
1. **产品询问**：当用户问"有什么产品"、"产品介绍"、"产品特点"时，要详细列出所有产品，包括名称、简介、特点、价格
2. **"有没有XX"类问题**：当用户问"你们有XX吗"、"有没有XX"、"是否有XX"时：
   - 首先明确回答"有"或"没有"
   - 如果有，立即提供该产品的完整信息（名称、简介、详细介绍、特点、价格、购买方式）
   - 如果没有完全匹配的产品，尝试匹配相似产品（如"可可粉"可能对应"复合营养粉"等），并说明"我们没有XX，但我们有[相似产品]"
   - 如果完全没有相似产品，说明没有，但列出所有产品供用户选择
3. **具体产品**：当用户询问某个具体产品时，要提供该产品的完整信息，包括详细介绍、特点、价格、购买方式
4. **价格询问**：如果产品有价格信息，直接告知；如果没有，引导联系客服
5. **购买方式**：提供购买链接或引导联系客服
6. **产品对比**：如果用户询问产品区别，要基于产品信息进行对比说明
7. **重要**：不要给出模糊或通用的回复，必须基于产品信息库给出具体、准确的答案

【回答示例】
用户："你们有什么产品？"
回答：In Nutri 提供以下产品：
1. [产品1名称] - [产品1简介]。特点：[特点]。价格：¥[价格]
2. [产品2名称] - [产品2简介]。特点：[特点]。价格：¥[价格]
[继续列出所有产品]
如需了解某个产品的详细信息，请告诉我产品名称。

用户："你们有可可粉吗？" 或 "有没有可可粉？"
回答格式（必须严格遵守）：
[如果有完全匹配的产品]
有！我们有[产品名称]。[简介]。详细介绍：[详细描述]。特点：[特点]。价格：¥[价格]。如需购买，[购买方式]。

[如果有相似产品]
我们没有名为"可可粉"的产品，但我们有[相似产品名称]，它[简介]。详细介绍：[详细描述]。特点：[特点]。价格：¥[价格]。这个产品可能符合您的需求。

[如果完全没有相关产品]
没有，我们目前没有"可可粉"产品。但我们有以下产品供您选择：[列出所有产品名称和简介]。这些产品都经过精心配方，使用植物活性成分。您想了解哪个产品呢？

**重要**：第一句话必须是"有"或"没有"，不要用"感谢您的咨询"这样的通用开场白！

用户："[具体产品名]怎么样？"
回答：[产品名称]是我们的一款[分类]产品。
简介：[简短描述]
详细介绍：[详细描述]
特点：[标签/特点]
价格：¥[价格]
购买方式：[购买链接或联系客服]
您还想了解这个产品的哪些方面呢？

用户："产品价格是多少？"
回答：我们的产品价格如下：
- [产品1]：¥[价格]
- [产品2]：¥[价格]
[列出所有有价格的产品]
如需了解更多价格信息或套餐优惠，请联系客服邮箱 hello@innutri.com

用户："今天天气怎么样？"
回答：抱歉，我是 In Nutri 的产品咨询助手，只能回答与我们的产品和品牌相关的问题。如果您对我们的产品有任何疑问，比如产品特点、使用方法、购买方式等，我很乐意为您详细解答！

【重要提醒】
- 当用户询问"有没有XX"、"是否有XX"时，必须先明确回答"有"或"没有"
- 如果有，立即提供该产品的详细信息
- 如果没有，说明没有，但可以推荐相似产品或列出所有产品供用户选择
- 不要给出模糊或通用的回复，要基于产品信息库给出具体答案

【绝对禁止的行为】
1. ❌ 禁止使用"感谢您的咨询！我是..."这样的通用开场白
2. ❌ 禁止给出模糊的回复，如"如果您对我们的产品有任何疑问..."
3. ❌ 禁止不直接回答问题，必须先回答"有"或"没有"

【必须遵守的格式】
当用户问"有没有XX"时，回答格式必须是：
- 第一句："有！" 或 "没有，"
- 第二句：立即提供产品信息或说明原因
- 不要有任何通用开场白

请严格按照以上指南回答用户问题，确保信息准确、详细、专业。`;

    // 调试日志：检查构建的知识库长度
    console.log(`📚 产品知识库已构建，长度: ${context.length} 字符`);
    
    return context;
  } catch (error) {
    console.error("❌ 构建产品知识库失败:", error);
    // 如果数据库查询失败，返回基础上下文
    return `你是 In Nutri（功能营养品牌）的AI客服助手。你只能回答与 In Nutri 产品、品牌、营养相关的问题。如果用户询问无关问题，请礼貌拒绝并引导关注我们的产品。联系方式：hello@innutri.com

注意：当前无法从数据库读取产品信息，请检查数据库连接或联系技术支持。`;
  }
}

// 使用 Node.js runtime，因为需要数据库连接
export const runtime = 'nodejs';

// 预处理：检查产品是否存在
async function checkProductExists(productName: string): Promise<{ exists: boolean; products: any[] }> {
  try {
    const allProducts = await db.select().from(products);
    
    // 模糊匹配：检查产品名称、描述、标签中是否包含关键词
    const keyword = productName.toLowerCase().replace(/[吗？?]/g, '').trim();
    const matchedProducts = allProducts.filter((product: Product) => {
      const name = (product.name || '').toLowerCase();
      const shortDesc = (product.shortDescription || '').toLowerCase();
      const longDesc = (product.longDescription || '').toLowerCase();
      const category = (product.category || '').toLowerCase();
      
      // 尝试解析tags
      let tags = [];
      try {
        tags = product.tags ? (typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags) : [];
      } catch {}
      const tagsStr = Array.isArray(tags) ? tags.join(' ').toLowerCase() : String(tags).toLowerCase();
      
      return name.includes(keyword) || 
             shortDesc.includes(keyword) || 
             longDesc.includes(keyword) ||
             category.includes(keyword) ||
             tagsStr.includes(keyword);
    });
    
    return {
      exists: matchedProducts.length > 0,
      products: matchedProducts
    };
  } catch (error) {
    console.error("Error checking products:", error);
    return { exists: false, products: [] };
  }
}

// 构建产品回答
function buildProductAnswer(products: any[]): string {
  if (products.length === 0) {
    return "没有，我们目前没有这个产品。";
  }
  
  let answer = "有！";
  if (products.length === 1) {
    const p = products[0];
    const tags = p.tags ? (typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags) : [];
    const price = p.priceCents ? `¥${(p.priceCents / 100).toFixed(2)}` : "价格咨询";
    
    answer += `我们有【${p.name}】。\n\n`;
    if (p.shortDescription) {
      answer += `简介：${p.shortDescription}\n`;
    }
    if (p.longDescription) {
      answer += `详细介绍：${p.longDescription}\n`;
    }
    if (tags.length > 0) {
      answer += `特点：${Array.isArray(tags) ? tags.join("、") : tags}\n`;
    }
    answer += `价格：${price}\n`;
    if (p.purchaseUrl) {
      answer += `购买方式：${p.purchaseUrl}\n`;
    }
  } else {
    answer += `我们有 ${products.length} 款相关产品：\n\n`;
    products.forEach((p, index) => {
      const tags = p.tags ? (typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags) : [];
      const price = p.priceCents ? `¥${(p.priceCents / 100).toFixed(2)}` : "价格咨询";
      
      answer += `${index + 1}. 【${p.name}】\n`;
      if (p.shortDescription) {
        answer += `   ${p.shortDescription}\n`;
      }
      if (tags.length > 0) {
        answer += `   特点：${Array.isArray(tags) ? tags.join("、") : tags}\n`;
      }
      answer += `   价格：${price}\n\n`;
    });
    answer += "您想了解哪个产品的详细信息呢？";
  }
  
  return answer;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] } = chatSchema.parse(body);

    // 优先使用国内AI服务（默认使用火山引擎）
    const aiProvider = process.env.AI_PROVIDER || "volcano"; // 默认使用火山引擎
    const apiKey = process.env.AI_API_KEY;
    const secretKey = process.env.AI_SECRET_KEY; // 腾讯云和百度需要secret key

    // 调试日志（生产环境可以移除）
    console.log("AI配置检查:", {
      provider: aiProvider,
      hasApiKey: !!apiKey,
      endpoint: process.env.VOLCANO_ENDPOINT,
      model: process.env.VOLCANO_MODEL,
    });

    if (!apiKey) {
      // 如果没有配置API密钥，返回默认回复
      console.warn("⚠️ AI_API_KEY 未配置，请检查 .env.local 文件");
      return NextResponse.json({
        message: "感谢您的咨询！目前AI助手功能正在配置中，请直接发送邮件至 hello@innutri.com 或通过其他方式联系我们。",
      });
    }

    // 预处理：检测"有没有XX"类问题，直接查询产品
    const productQueryMatch = message.match(/(?:有没有|是否有|你们有)(.+?)(?:吗|？|\?|$)/);
    if (productQueryMatch) {
      const productName = productQueryMatch[1].trim();
      console.log(`🔍 检测到产品查询："${productName}"`);
      
      const { exists, products } = await checkProductExists(productName);
      
      if (exists) {
        // 直接返回产品信息，不调用AI
        const answer = buildProductAnswer(products);
        console.log("✅ 直接返回产品信息，跳过AI调用");
        return NextResponse.json({ message: answer });
      } else {
        // 没有找到产品，但还是要调用AI来给出友好的回复
        console.log("❌ 未找到匹配产品，继续使用AI回答");
      }
    }

    // 从数据库构建产品知识库
    const productContext = await buildProductContext();

    // 检查用户问题是否是"有没有XX"类型，如果是，在系统提示词中特别强调
    const isProductQuery = /(有没有|是否有|你们有|有.*吗)/.test(message);
    const enhancedContext = isProductQuery 
      ? productContext + "\n\n【特别提醒】用户正在询问产品是否存在，你必须第一句话就回答'有'或'没有'，不要使用任何通用开场白！直接回答问题！"
      : productContext;

    // 构建消息历史
    const messages = [
      {
        role: "system",
        content: enhancedContext,
      },
      ...history.slice(-5), // 只保留最近5条消息
      {
        role: "user",
        content: message,
      },
    ];
    
    // 调试日志
    if (isProductQuery) {
      console.log("🔍 检测到产品查询问题，已增强提示词");
    }

    let aiResponse: string;

    // 根据配置选择AI服务提供商（优先国内服务）
    switch (aiProvider.toLowerCase()) {
      case "volcano":
      case "volcengine":
        // 火山引擎（火山方舟）
        const endpoint = process.env.VOLCANO_ENDPOINT; // 推理接入点URL
        aiResponse = await callVolcanoAI(messages, apiKey, endpoint);
        break;
      case "tencent":
        aiResponse = await callTencentAI(messages, apiKey, secretKey);
        break;
      case "baidu":
        aiResponse = await callBaiduAI(messages, apiKey, secretKey);
        break;
      case "openai":
        aiResponse = await callOpenAI(messages, apiKey);
        break;
      default:
        // 默认尝试火山引擎
        const defaultEndpoint = process.env.VOLCANO_ENDPOINT;
        aiResponse = await callVolcanoAI(messages, apiKey, defaultEndpoint);
    }

    return NextResponse.json({
      message: aiResponse,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "请求格式错误" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "AI服务暂时不可用，请稍后再试" },
      { status: 500 }
    );
  }
}

// 火山引擎（火山方舟）API调用
async function callVolcanoAI(messages: any[], apiKey: string, endpoint?: string): Promise<string> {
  try {
    // 火山引擎API endpoint
    // 从环境变量获取推理接入点URL，如果没有则使用默认格式
    const apiEndpoint = endpoint || process.env.VOLCANO_ENDPOINT || "https://ark.cn-beijing.volces.com/api/v3";
    
    // 提取系统提示词和用户消息
    const systemMessage = messages.find(m => m.role === "system");
    const userMessages = messages.filter(m => m.role !== "system");
    
    // 构建请求体（火山引擎使用类似OpenAI的格式）
    const requestBody = {
      model: process.env.VOLCANO_MODEL || "doubao-pro-4k", // 默认模型，可在环境变量中配置
      messages: [
        ...(systemMessage ? [systemMessage] : []),
        ...userMessages.map(m => ({
          role: m.role,
          content: m.content
        }))
      ],
      temperature: 0.3, // 降低温度，让回答更准确、更贴近产品信息
      max_tokens: 1500, // 增加token限制，允许更详细的回答
      stream: false,
    };
    
    // 调试日志
    console.log("🔥 调用火山引擎API:", {
      endpoint: apiEndpoint,
      model: requestBody.model,
      messageCount: requestBody.messages.length,
      userMessage: userMessages[userMessages.length - 1]?.content?.substring(0, 50) + "...",
    });

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Volcano AI API error:", error);
      // 如果API调用失败，使用降级方案
      return getFallbackResponse(messages[messages.length - 1]?.content || "");
    }

    const data = await response.json();
    // 火山引擎返回格式：{ choices: [{ message: { content: "..." } }] }
    return data.choices?.[0]?.message?.content || data.result || getFallbackResponse(messages[messages.length - 1]?.content || "");
  } catch (error) {
    console.error("Volcano AI call error:", error);
    // 降级到关键词匹配
    return getFallbackResponse(messages[messages.length - 1]?.content || "");
  }
}

// OpenAI API调用
async function callOpenAI(messages: any[], apiKey: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "抱歉，我无法回答这个问题。";
}

// 腾讯云混元大模型API调用
async function callTencentAI(messages: any[], apiKey: string, secretKey?: string): Promise<string> {
  try {
    // 腾讯云混元大模型API
    // 文档：https://cloud.tencent.com/document/product/1729
    const endpoint = "https://hunyuan.tencentcloudapi.com";
    
    // 提取系统提示词和用户消息
    const systemMessage = messages.find(m => m.role === "system");
    const userMessages = messages.filter(m => m.role !== "system");
    
    // 构建请求体（根据腾讯云API文档格式）
    const requestBody = {
      Model: "hunyuan-lite", // 或 "hunyuan-standard"
      Messages: [
        ...(systemMessage ? [{
          Role: "system",
          Content: systemMessage.content
        }] : []),
        ...userMessages.map(m => ({
          Role: m.role === "user" ? "user" : "assistant",
          Content: m.content
        }))
      ],
      Temperature: 0.7,
      MaxTokens: 1000,
    };

    // 注意：腾讯云API需要签名认证，这里简化处理
    // 实际使用时需要实现签名算法，参考：https://cloud.tencent.com/document/api/1729/101843
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`, // 实际需要签名
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Tencent AI API error:", error);
      // 如果API调用失败，使用关键词匹配作为降级方案
      return getFallbackResponse(messages[messages.length - 1]?.content || "");
    }

    const data = await response.json();
    return data.Response?.Choices?.[0]?.Message?.Content || getFallbackResponse(messages[messages.length - 1]?.content || "");
  } catch (error) {
    console.error("Tencent AI call error:", error);
    // 降级到关键词匹配
    return getFallbackResponse(messages[messages.length - 1]?.content || "");
  }
}

// 百度文心一言API调用
async function callBaiduAI(messages: any[], apiKey: string, secretKey?: string): Promise<string> {
  try {
    // 百度文心一言API
    // 文档：https://cloud.baidu.com/doc/WENXINWORKSHOP/s/Ilkkrb0i5
    const endpoint = "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions";
    
    // 提取系统提示词和用户消息
    const systemMessage = messages.find(m => m.role === "system");
    const userMessages = messages.filter(m => m.role !== "system");
    
    // 构建请求体
    const requestBody = {
      messages: [
        ...(systemMessage ? [systemMessage] : []),
        ...userMessages
      ],
      temperature: 0.7,
      max_output_tokens: 1000,
    };

    // 获取access_token（需要先调用token接口）
    // 这里简化处理，实际需要先获取token
    const tokenUrl = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`;
    const tokenResponse = await fetch(tokenUrl, { method: "POST" });
    
    if (!tokenResponse.ok) {
      throw new Error("Failed to get access token");
    }
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const response = await fetch(`${endpoint}?access_token=${accessToken}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Baidu AI API error:", error);
      return getFallbackResponse(messages[messages.length - 1]?.content || "");
    }

    const data = await response.json();
    return data.result || getFallbackResponse(messages[messages.length - 1]?.content || "");
  } catch (error) {
    console.error("Baidu AI call error:", error);
    return getFallbackResponse(messages[messages.length - 1]?.content || "");
  }
}

// 降级响应（当API调用失败时使用）
function getFallbackResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  // 检查是否是无关问题
  const unrelatedKeywords = ["天气", "新闻", "股票", "政治", "其他品牌", "竞争对手"];
  const isUnrelated = unrelatedKeywords.some(keyword => lowerMessage.includes(keyword));
  
  if (isUnrelated) {
    return "抱歉，我是 In Nutri 的产品咨询助手，只能回答与我们的产品和品牌相关的问题。如果您对我们的产品有任何疑问，我很乐意为您解答！您也可以发送邮件至 hello@innutri.com 联系我们的客服。";
  }
  
  // 产品相关问题
  if (lowerMessage.includes("产品") || lowerMessage.includes("有什么")) {
    return "In Nutri 提供多种功能营养产品，包括复合营养粉、胶原饮和植萃片等。每个产品都经过精心配方，使用植物活性成分。您想了解哪个产品的详细信息？";
  }
  
  if (lowerMessage.includes("价格") || lowerMessage.includes("多少钱") || lowerMessage.includes("费用")) {
    return "产品价格信息请访问我们的官网或联系客服。我们提供多种套餐选择，满足不同需求。如需详细价格信息，请发送邮件至 hello@innutri.com";
  }
  
  if (lowerMessage.includes("购买") || lowerMessage.includes("怎么买") || lowerMessage.includes("哪里买")) {
    return "您可以通过我们的官网购买产品，也可以联系客服邮箱 hello@innutri.com 了解更多购买方式。我们提供多种购买渠道，方便您选择。";
  }
  
  if (lowerMessage.includes("营养") || lowerMessage.includes("功效") || lowerMessage.includes("作用")) {
    return "In Nutri 的产品采用精准营养科技，使用植物活性成分和临床数据支持，覆盖晨间代谢、日间防护与夜间修护三大场景。如需了解具体产品的营养成分和功效，请告诉我您感兴趣的产品名称。";
  }
  
  // 默认回复
  return "感谢您的咨询！我是 In Nutri 的产品咨询助手。如果您对我们的产品、品牌或营养相关问题有任何疑问，我很乐意为您解答。您也可以发送邮件至 hello@innutri.com 联系我们的客服团队。";
}

