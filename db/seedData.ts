import { db } from "./index";
import { products, articles, recipes, banners, brandStory, videos } from "./schema";
import { eq } from "drizzle-orm";

export async function seedData() {
  console.log("开始导入前台数据到数据库...");

  // 1. 导入产品
  try {
    const existingProducts = await db.select().from(products).limit(1);
    if (existingProducts.length === 0) {
      await db.insert(products).values({
        slug: "indonesia-rainforest-cacao-powder",
        name: "印尼雨林可可粉",
        shortDescription: "300g",
        longDescription: "来自印尼雨林的高可可多酚粉，可作控糖热巧或健身奶昔基底。",
        priceCents: 32800,
        mainImage: "https://images.unsplash.com/photo-1502740479091-635887520276?auto=format&fit=crop&w=900&q=80",
        gallery: JSON.stringify([
          "https://images.unsplash.com/photo-1502740479091-635887520276?auto=format&fit=crop&w=900&q=80",
        ]),
        tags: JSON.stringify(["无蔗糖添加", "轻加工", "可可多酚"]),
        category: "powder",
        isFeatured: true,
      });
      console.log("✓ 产品已导入");
    } else {
      console.log("✓ 产品已存在，跳过");
    }
  } catch (error) {
    console.error("导入产品失败:", error);
  }

  // 2. 导入品牌故事
  try {
    const existingStory = await db.select().from(brandStory).limit(1);
    if (existingStory.length === 0) {
      await db.insert(brandStory).values({
        heroTitle: "我们只做一件事：把\"超级食物\"还原成看得见的好原料。",
        heroSubtitle: "源自真实原料",
        mission: "保持真实与克制，是因纽粹的独特态度。我们以国际视角挑选原料，再以科学方式呈现其价值。",
        vision: "成为亚洲领先的功能营养品牌，以科学和自然的力量赋能健康生活。",
        brandTone: "真实、克制、科学、自然",
        storyBlocks: JSON.stringify([
          {
            title: "原产地严选",
            body: "印尼可可、锡兰肉桂、秘鲁姜黄、巴西莓等全球优质原料。",
          },
          {
            title: "公开检测与关键营养数据",
            body: "不玩概念游戏，提供真实可验证的营养数据。",
          },
          {
            title: "少加工、无蔗糖添加",
            body: "不额外加香精，保持原料的天然特性。",
          },
          {
            title: "让控糖、轻体、养护变成可坚持的日常习惯",
            body: "通过科学配方和便捷使用方式，让健康成为生活方式。",
          },
        ]),
      });
      console.log("✓ 品牌故事已导入");
    } else {
      console.log("✓ 品牌故事已存在，跳过");
    }
  } catch (error) {
    console.error("导入品牌故事失败:", error);
  }

  // 3. 导入横幅
  try {
    const existingBanner = await db.select().from(banners).where(eq(banners.key, "home-hero")).limit(1);
    if (existingBanner.length === 0) {
      await db.insert(banners).values({
        key: "home-hero",
        title: "In-nutri · 有态度的超级食物",
        subtitle: "源自真实原料",
        description: "我们用看得见的原料，而不是听起来很厉害的噱头。让自然成分在城市生活中重新被看见。",
        image: "video.mp4",
        linkUrl: "#products",
        position: 0,
        isActive: true,
      });
      console.log("✓ 横幅已导入");
    } else {
      console.log("✓ 横幅已存在，跳过");
    }
  } catch (error) {
    console.error("导入横幅失败:", error);
  }

  // 4. 导入视频
  try {
    const existingVideos = await db.select().from(videos).limit(1);
    if (existingVideos.length === 0) {
      await db.insert(videos).values([
        {
          slug: "creator-77",
          title: "食验室主理人 77",
          type: "用巴西莓粉做 3 分钟免烤能量碗，搭配燕麦与可可碎。",
          platform: "mp4",
          url: "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4",
          isActive: true,
        },
        {
          slug: "nutritionist-xiaobai",
          title: "功能营养师 小白",
          type: "分享控糖早餐日常：姜黄菊粉 Golden Latte + 高纤吐司。",
          platform: "mp4",
          url: "https://storage.googleapis.com/coverr-main/mp4/Canyon.mp4",
          isActive: true,
        },
        {
          slug: "fitness-blogger-zoe",
          title: "健身博主 Zoe",
          type: "训练后用印尼可可粉 + 植物蛋白做低糖奶昔。",
          platform: "mp4",
          url: "https://storage.googleapis.com/coverr-main/mp4/Footboys.mp4",
          isActive: true,
        },
      ]);
      console.log("✓ 视频已导入");
    } else {
      console.log("✓ 视频已存在，跳过");
    }
  } catch (error) {
    console.error("导入视频失败:", error);
  }

  // 5. 导入食谱
  try {
    const existingRecipes = await db.select().from(recipes).limit(1);
    if (existingRecipes.length === 0) {
      await db.insert(recipes).values([
        {
          slug: "sugar-control-breakfast",
          name: "控糖早餐搭配",
          description: "印尼可可粉 + 无糖杏仁奶，摇匀即得暖胃热巧，控糖仍然有幸福感。",
          heroImage: "https://images.unsplash.com/photo-1483918793747-5adbf82956c4?auto=format&fit=crop&w=900&q=80",
          ingredients: JSON.stringify([
            { name: "印尼可可粉", amount: "2", unit: "勺" },
            { name: "无糖杏仁奶", amount: "200", unit: "ml" },
          ]),
          steps: JSON.stringify([
            "将可可粉倒入杯中",
            "加入温热的无糖杏仁奶",
            "搅拌均匀即可",
          ]),
          difficulty: "easy",
        },
        {
          slug: "post-workout-recovery",
          name: "健身后恢复",
          description: "在蛋白奶昔里加一勺巴西莓奇亚籽粉，补回抗氧化与健康脂肪酸。",
          heroImage: "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?auto=format&fit=crop&w=900&q=80",
          ingredients: JSON.stringify([
            { name: "巴西莓奇亚籽粉", amount: "1", unit: "勺" },
            { name: "蛋白粉", amount: "1", unit: "勺" },
            { name: "水或植物奶", amount: "250", unit: "ml" },
          ]),
          steps: JSON.stringify([
            "将所有材料放入摇摇杯",
            "摇匀后即可饮用",
          ]),
          difficulty: "easy",
        },
        {
          slug: "afternoon-tea-golden-latte",
          name: "下午茶代替奶茶",
          description: "姜黄菊粉 Golden Latte，顺滑又带一点香料感，精神与身体同步放松。",
          heroImage: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=80",
          ingredients: JSON.stringify([
            { name: "姜黄粉", amount: "1", unit: "勺" },
            { name: "菊粉", amount: "1", unit: "勺" },
            { name: "植物奶", amount: "200", unit: "ml" },
            { name: "黑胡椒", amount: "少许", unit: "" },
          ]),
          steps: JSON.stringify([
            "将姜黄粉和菊粉混合",
            "加入温热的植物奶",
            "撒上少许黑胡椒（帮助吸收）",
            "搅拌均匀",
          ]),
          difficulty: "normal",
        },
        {
          slug: "night-light-body-care",
          name: "熬夜后的轻体调理",
          description: "加菊粉的藕粉晚安杯，补充纤维并帮助肠道菌群恢复元气。",
          heroImage: "https://images.unsplash.com/photo-1464306076886-da185f6a9d12?auto=format&fit=crop&w=900&q=80",
          ingredients: JSON.stringify([
            { name: "菊粉", amount: "1", unit: "勺" },
            { name: "藕粉", amount: "2", unit: "勺" },
            { name: "温水", amount: "200", unit: "ml" },
          ]),
          steps: JSON.stringify([
            "先用少量冷水调开藕粉",
            "加入热水搅拌至透明",
            "最后加入菊粉搅拌均匀",
          ]),
          difficulty: "easy",
        },
      ]);
      console.log("✓ 食谱已导入");
    } else {
      console.log("✓ 食谱已存在，跳过");
    }
  } catch (error) {
    console.error("导入食谱失败:", error);
  }

  // 6. 导入科学文章（将科学亮点转换为文章）
  try {
    const existingArticles = await db.select().from(articles).limit(1);
    if (existingArticles.length === 0) {
      await db.insert(articles).values([
        {
          slug: "acai-berry-orac",
          title: "巴西莓粉：ORAC≈蓝莓 3-5 倍",
          summary: "冷冻干燥方式保留抗氧化力，可搭配酸奶 / 冰沙作为午后慢补。",
          content: "巴西莓粉通过冷冻干燥技术保留了极高的抗氧化能力，其ORAC值约为蓝莓的3-5倍。这种加工方式能够最大程度地保留营养成分，适合搭配酸奶或冰沙作为午后的营养补充。",
          coverImage: "https://images.unsplash.com/photo-1502740479091-635887520276?auto=format&fit=crop&w=900&q=80",
          published: true,
          publishedAt: new Date(),
        },
        {
          slug: "ceylon-cinnamon-c5",
          title: "锡兰肉桂粉：C5 等级 · 控糖搭档",
          summary: "挥发油含量更高，适合加在代糖拿铁或燕麦中，平衡血糖波动。",
          content: "C5等级的锡兰肉桂粉具有更高的挥发油含量，这使得它在控糖方面表现优异。适合加入代糖拿铁或燕麦中，能够帮助平衡血糖波动，是控糖人群的理想选择。",
          coverImage: "https://images.unsplash.com/photo-1502740479091-635887520276?auto=format&fit=crop&w=900&q=80",
          published: true,
          publishedAt: new Date(),
        },
        {
          slug: "turmeric-curcumin",
          title: "姜黄粉：3% 以上姜黄素",
          summary: "搭配胡椒碱与植物奶，支持抗氧化与运动后修护。",
          content: "我们的姜黄粉含有3%以上的姜黄素，这是姜黄中最重要的活性成分。搭配胡椒碱可以显著提高姜黄素的吸收率，与植物奶一起制作成Golden Latte，能够支持抗氧化和运动后的身体修护。",
          coverImage: "https://images.unsplash.com/photo-1502740479091-635887520276?auto=format&fit=crop&w=900&q=80",
          published: true,
          publishedAt: new Date(),
        },
        {
          slug: "inulin-dietary-fiber",
          title: "菊粉：膳食纤维 ＞ 85%",
          summary: "可溶性纤维帮助肠道菌群与糖代谢，是轻体阶段的隐藏王牌。",
          content: "菊粉是一种优质的可溶性膳食纤维，其含量超过85%。这种纤维能够帮助改善肠道菌群平衡，支持糖代谢，是轻体阶段的理想选择。菊粉可以轻松融入各种饮品和食物中，使用方便。",
          coverImage: "https://images.unsplash.com/photo-1502740479091-635887520276?auto=format&fit=crop&w=900&q=80",
          published: true,
          publishedAt: new Date(),
        },
      ]);
      console.log("✓ 科学文章已导入");
    } else {
      console.log("✓ 科学文章已存在，跳过");
    }
  } catch (error) {
    console.error("导入科学文章失败:", error);
  }

  console.log("\n✅ 所有前台数据已成功导入到数据库！");
  console.log("现在可以在管理后台查看和编辑这些内容了。");
}

