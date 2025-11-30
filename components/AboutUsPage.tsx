import { getApiUrl, isBuildTime } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { PartnerBrands } from "./PartnerBrands";
import { WorldMap } from "./WorldMap";
import { MilestoneTimeline } from "./MilestoneTimeline";

async function getAboutUs() {
  try {
    if (isBuildTime()) {
      return null;
    }
    const res = await fetch(getApiUrl("/api/about-us"), {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

async function getCoreValues() {
  try {
    if (isBuildTime()) {
      return [];
    }
    const res = await fetch(getApiUrl("/api/core-values"), {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

async function getMilestones() {
  try {
    if (isBuildTime()) {
      return [];
    }
    const res = await fetch(getApiUrl("/api/milestones"), {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

async function getGallery() {
  try {
    if (isBuildTime()) {
      return [];
    }
    const res = await fetch(getApiUrl("/api/about-gallery"), {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function AboutUsPage() {
  const aboutUs = await getAboutUs();
  const coreValues = await getCoreValues();
  const milestones = await getMilestones();
  const gallery = await getGallery();

  // 默认内容
  const heroTitle = aboutUs?.heroTitle || "我们是谁";
  const heroSubtitle = aboutUs?.heroSubtitle || "通过真实原料，让自然成分在城市生活中重新被看见。";
  const missionTitle = aboutUs?.missionTitle || "我们的使命";
  const missionContent = aboutUs?.missionContent || "我们只做一件事：把\"超级食物\"还原成看得见的好原料。保持真实与克制，是因纽粹的独特态度。我们以国际视角挑选原料，再以科学方式呈现其价值。";
  const motto = aboutUs?.motto || "每周节省一天时间";

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section - 参考 ClickUp 设计 */}
      <section className="relative bg-white py-20 md:py-32">
        <div className="page-shell">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* 左侧文字内容 */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                {heroTitle}
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
                {heroSubtitle}
              </p>
              {aboutUs?.heroVideoUrl && (
                <div className="pt-4">
                  <a
                    href={aboutUs.heroVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 group"
                  >
                    <div className="w-16 h-16 rounded-full bg-[var(--color-primary)] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <span className="text-lg font-medium text-gray-900">观看视频了解更多</span>
                  </a>
                </div>
              )}
            </div>
            {/* 右侧团队头像网格 - 参考 ClickUp */}
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-full bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-forest)]/20 flex items-center justify-center text-gray-400 text-xs font-medium"
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 客户 Logo 滚动条 - 参考 ClickUp */}
      <PartnerBrands />

      {/* Mission Section - 参考 ClickUp 设计 */}
      <section className="py-20 bg-white">
        <div className="page-shell">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              {/* 左侧：标题和内容 */}
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                  {missionTitle}
                </h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-lg text-gray-600 leading-relaxed whitespace-pre-line">
                    {missionContent}
                  </p>
                </div>
              </div>
              {/* 右侧：大文字展示 */}
              <div className="lg:sticky lg:top-20">
                <p className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  通过真实原料，让世界更健康
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Motto Section - 参考 ClickUp 紫色横幅设计 */}
      <section className="py-20 bg-[#7C3AED] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="page-shell relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-8xl md:text-9xl font-serif text-white/20 mb-4">"</div>
            <p className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight relative z-10">
              {motto}
            </p>
          </div>
        </div>
      </section>

      {/* Meet the Team Section - 参考 ClickUp 设计 */}
      <section className="py-20 bg-white">
        <div className="page-shell">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              认识我们的团队！
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              我们是一群充满激情、充满活力的独特人才，共同致力于节省时间，让世界更高效。
            </p>
          </div>
          
          {/* 世界地图 - 显示团队位置 */}
          <div className="max-w-6xl mx-auto mb-12">
            <WorldMap />
          </div>
          
          {/* 团队头像网格 */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-4">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-full bg-gradient-to-br from-[var(--color-primary)]/30 to-[var(--color-forest)]/30 flex items-center justify-center text-gray-500 text-xs font-medium border-2 border-gray-100 hover:border-[var(--color-primary)] transition-colors"
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section - 参考 ClickUp 设计 */}
      {coreValues.length > 0 && (
        <section className="py-20 bg-white">
          <div className="page-shell">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-16">
              核心价值
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {coreValues.map((value: any) => (
                <div
                  key={value.id}
                  className="bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-[var(--color-primary)] transition-colors"
                >
                  <div className="text-2xl font-bold text-gray-400 mb-3">
                    {value.number || String(value.id).padStart(2, '0')}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                    {value.title}
                  </h3>
                  {value.hashtag && (
                    <p className="text-sm font-medium text-[var(--color-primary)]">{value.hashtag}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Milestones Section - 严格按照截图设计 */}
      {milestones.length > 0 && (
        <section className="py-20 bg-gray-100 relative overflow-hidden">
          {/* 背景网格点 - 严格按照截图 */}
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle, #6b7280 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
            opacity: 0.3
          }}></div>
          
          <div className="page-shell relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-16">
              发展历程
            </h2>
            <div className="max-w-7xl mx-auto">
              <MilestoneTimeline milestones={milestones} />
              {/* "To be continued..." 文字 - 严格按照截图 */}
              {milestones.length > 0 && (
                <div className="text-right mt-6 text-gray-400 text-sm font-light italic">
                  To be continued...
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section - 参考 ClickUp 图片画廊设计 */}
      {gallery.length > 0 && (
        <section className="py-20 bg-white">
          <div className="page-shell">
            <div className="mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                团队生活
              </h2>
              <p className="text-lg text-gray-600">
                全球各地的办公室和团队活动
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gallery.map((item: any, index: number) => {
                // 创建不同的图片尺寸变化，参考 ClickUp 的布局
                const isLarge = index % 7 === 0 || index % 7 === 3;
                return (
                  <div
                    key={item.id}
                    className={`relative overflow-hidden rounded-xl group cursor-pointer ${
                      isLarge ? "md:col-span-2 md:row-span-2" : ""
                    }`}
                    style={{
                      aspectRatio: isLarge ? "2/1" : "1/1",
                    }}
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.alt || "团队生活"}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

