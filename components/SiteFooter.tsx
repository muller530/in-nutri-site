import Image from "next/image";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";
import { SocialIcons } from "./SocialIcons";

async function getSiteSettings() {
  try {
    const res = await fetch(getApiUrl("/api/site-settings"), {
      cache: "no-store",
    });
    const data = await res.json();
    return data.data || null;
  } catch {
    return null;
  }
}

export async function SiteFooter() {
  const settings = await getSiteSettings();

  return (
    <footer className="bg-[var(--color-forest)] text-[var(--color-cream)]">
      <div className="page-shell flex flex-col gap-10 py-16 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <Image 
            src="/logo.png" 
            width={180} 
            height={56} 
            alt="In Nutri 标志"
            unoptimized={process.env.NODE_ENV === 'production'}
          />
          <p className="text-2xl font-semibold">有态度的超级食物</p>
          <p className="text-sm text-white/70">
            我们与世界各地的原料农场合作，以透明检测与诚实配方打造每一勺冲泡体验。
          </p>
          <p className="text-sm text-white/50">© {new Date().getFullYear()} In-nutri. All rights reserved.</p>
        </div>

        <div className="space-y-6 text-sm text-white/80">
          <div className="flex flex-wrap gap-4">
            <a href="#products" className="transition hover:text-white">
              产品系列
            </a>
            <a href="#philosophy" className="transition hover:text-white">
              品牌态度
            </a>
            <a href="#science" className="transition hover:text-white">
              科学数据
            </a>
            <a href="mailto:hello@innutri.com" className="transition hover:text-white">
              联系我们
            </a>
          </div>
          <div className="flex flex-col gap-4">
            {/* 社交媒体图标 */}
            <SocialIcons
              douyinUrl={settings?.douyinUrl}
              xiaohongshuUrl={settings?.xiaohongshuUrl}
              tmallUrl={settings?.tmallUrl}
              jdUrl={settings?.jdUrl}
            />
            {/* 质检报告 */}
            {settings?.qualityReportUrl && (
              <Link
                href={settings.qualityReportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/20 px-4 py-2 text-center text-xs uppercase tracking-[0.3em] text-white/50 transition hover:border-white/40 hover:bg-white/10 hover:text-white/70"
              >
                好产品检测报告
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

