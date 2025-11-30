import { SectionHeading } from "@/components/SectionHeading";
import { getApiUrl, isBuildTime } from "@/lib/api";

async function getBrandStory() {
  try {
    // 构建时跳过 fetch，返回 null（使用默认值）
    // 只在真正的构建阶段跳过，运行时应该尝试 fetch
    if (isBuildTime()) {
      return null;
    }
    
    const res = await fetch(getApiUrl("/api/brand-story"), {
      // 使用 revalidate 而不是 no-store，允许静态生成但定期更新
      next: { revalidate: 60 }, // 60秒重新验证
    });
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

function parseStoryBlocks(storyBlocks: string | null) {
  if (!storyBlocks) return [];
  try {
    return JSON.parse(storyBlocks);
  } catch {
    return [];
  }
}

export async function BrandStory() {
  const brandStory = await getBrandStory();

  // Default content
  const title = brandStory?.heroTitle || "我们只做一件事：把\"超级食物\"还原成看得见的好原料。";
  const description = brandStory?.mission || "保持真实与克制，是因纽粹的独特态度。我们以国际视角挑选原料，再以科学方式呈现其价值。";
  const storyBlocks = parseStoryBlocks(brandStory?.storyBlocks);

  // Default bullets if no story blocks
  const defaultBullets = [
    "🌱 原产地严选：印尼可可、锡兰肉桂、秘鲁姜黄、巴西莓等",
    "🧪 公开检测与关键营养数据，不玩概念游戏",
    "🍃 少加工、无蔗糖添加、不额外加香精",
    "⚖️ 让控糖、轻体、养护变成可坚持的日常习惯",
  ];

  interface StoryBlock {
    title?: string;
    body?: string;
  }

  const bullets = storyBlocks.length > 0
    ? storyBlocks.map((block: StoryBlock) => `🌱 ${block.title || ""} ${block.body || ""}`)
    : defaultBullets;

  // Default pillars
  const defaultPillars = [
    {
      title: "植物活性科学",
      description: "甄选 18 种高纯度植物活性分子，联合冷萃与低温冻干技术，保留营养完整结构。",
    },
    {
      title: "精准配方矩阵",
      description: "基于亚洲人基因数据库，构建水溶、脂溶双通道吸收路径，提升 32% 功效稳定性。",
    },
    {
      title: "临床验证体系",
      description: "与三甲医院共建营养实验室，持续输出双盲测试报告，保障真实有效。",
    },
  ];

  const pillars = storyBlocks.length >= 3
    ? storyBlocks.slice(0, 3).map((block: StoryBlock) => ({
        title: block.title || "",
        description: block.body || "",
      }))
    : defaultPillars;

  return (
    <section id="philosophy" className="relative z-0 bg-white -mt-0">
      <div className="page-shell grid gap-12 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-8">
          <SectionHeading
            eyebrow="BRAND ATTITUDE"
            title={title}
            description={description}
          />
          <ul className="space-y-4 rounded-3xl bg-[var(--color-brand-soft-mint)]/70 p-6">
            {bullets.map((bullet: string, index: number) => (
              <li key={index} className="text-base text-[var(--color-ink)]/80">
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          {pillars.map((pillar: { title: string; description: string }, index: number) => (
            <article
              key={pillar.title || index}
              className="rounded-3xl border border-[var(--color-mint)]/60 bg-white p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[0_30px_60px_rgba(14,79,46,0.18)]"
            >
              <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-primary)]/80">{pillar.title}</p>
              <p className="mt-3 text-lg font-medium text-[var(--color-forest)]">{pillar.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

