import { BrandStory } from "@/components/BrandStory";
import { CreatorsSpotlight } from "@/components/CreatorsSpotlight";
import { Hero } from "@/components/Hero";
import { LifestyleGrid } from "@/components/LifestyleGrid";
import { NavigationServer } from "@/components/NavigationServer";
import { PartnerBrands } from "@/components/PartnerBrands";
import { ProductShowcase } from "@/components/ProductShowcase";
import { ScienceHighlights } from "@/components/ScienceHighlights";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteFooter } from "@/components/SiteFooter";

// 使用动态渲染，避免构建时超时
export const dynamic = 'force-dynamic';

const services = [
  {
    title: "1v1 功能营养师",
    description: "专属营养档案 + 指标跟踪，提供控糖、轻体、修护三大模块方案。",
  },
  {
    title: "超级食物冲泡指南",
    description: "以日程表形式拆解早午晚冲泡方式，附带科学依据与注意事项。",
  },
  {
    title: "可持续补充体系",
    description: "可回收补充装、轻量包装与绿色物流，减少每一次补给的环境足迹。",
  },
];

export default async function Home() {
  return (
    <div className="relative z-0 bg-[var(--color-cream)] text-[var(--color-forest)]">
      {/* 导航栏 - 移到页面级别，确保在最上层 */}
      <NavigationServer />
      <Hero />
      <PartnerBrands />
      <BrandStory />

      <section className="relative z-0 bg-white">
        <div className="page-shell py-16">
          <SectionHeading
            eyebrow="SIGNATURE SERVICE"
            title="不仅是产品，更是可执行的超级食物日程"
            description="In-nutri 团队持续迭代冲泡方式、数据追踪工具与生活方式指南，让&quot;坚持&quot;更轻松。"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.title}
                className="rounded-[28px] border border-[var(--color-mint)]/60 bg-[var(--color-soft-mint)] p-6 transition hover:-translate-y-1 hover:bg-white"
              >
                <h3 className="text-xl font-semibold text-[var(--color-forest)]">{service.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#222222]/70">{service.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ProductShowcase />
      <ScienceHighlights />
      <LifestyleGrid />
      <CreatorsSpotlight />

      <section className="relative z-0 bg-[var(--color-mint)]">
        <div className="page-shell flex flex-col items-center gap-6 py-20 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-primary)]">BOOK A TASTING</p>
          <h3 className="text-3xl font-light text-[var(--color-forest)] sm:text-4xl">
            预约线下感官工作坊，体验 45 分钟的超级食物诊断
          </h3>
          <p className="text-sm text-[var(--color-forest)]/70">
            上海 · 北京快闪工作室限时开放，发送邮件至 hello@innutri.com 或扫描二维码即可预约。
          </p>
          <button className="rounded-full bg-[var(--color-forest)] px-8 py-3 text-sm font-medium text-[var(--color-cream)] transition hover:-translate-y-0.5">
            立即预约体验
          </button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
