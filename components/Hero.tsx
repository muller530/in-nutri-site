import Image from "next/image";
import Link from "next/link";
import { HeroClient } from "./HeroClient";
import { getApiUrl } from "@/lib/api";

async function getBanner() {
  try {
    const res = await fetch(getApiUrl("/api/banners"), {
      cache: "no-store",
    });
    const data = await res.json();
    const banners = data.data || [];
    interface Banner {
      key: string;
      image?: string;
      title?: string;
      subtitle?: string;
      description?: string;
    }
    return banners.find((b: Banner) => b.key === "home-hero") || banners[0] || null;
  } catch {
    return null;
  }
}

async function getBrandStory() {
  try {
    const res = await fetch(getApiUrl("/api/brand-story"), {
      cache: "no-store",
    });
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

export async function Hero() {
  const banner = await getBanner();
  const brandStory = await getBrandStory();

  const videoUrl = banner?.image || "video.mp4";
  const title = brandStory?.heroTitle || banner?.title || "In-nutri · 有态度的超级食物";
  const subtitle = brandStory?.heroSubtitle || banner?.subtitle || "源自真实原料";
  const description = banner?.description || brandStory?.mission || "我们用看得见的原料，而不是听起来很厉害的噱头。让自然成分在城市生活中重新被看见。";

  return (
    <header className="relative isolate overflow-hidden text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="https://images.unsplash.com/photo-1516826435551-36f4e65f2230?auto=format&fit=crop&w=1600&q=80"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[#082317]/70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#2fb54a33,transparent_50%),radial-gradient(circle_at_80%_20%,#e7f6ec44,transparent_60%)]" />
      <div className="absolute left-1/2 top-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#2fb54a22] blur-[160px]" />
      <div className="absolute inset-0 opacity-40">
        <div className="particle pointer-events-none absolute left-6 top-10 h-24 w-24 rounded-full border border-white/10" />
      </div>

      <div className="page-shell relative flex min-h-screen flex-col items-center justify-center gap-10 py-24 text-center">
        <Image src="/logo.png" width={260} height={80} alt="In Nutri 标志" priority className="mt-16 drop-shadow-lg" />
        <div className="space-y-6 max-w-3xl">
          <h1 className="text-4xl font-light leading-tight tracking-wide sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <HeroClient defaultPhrase={subtitle} />
          <p className="text-base text-white/80 sm:text-lg">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <Link
            href="#products"
            className="rounded-full bg-[var(--color-primary)] px-10 py-3 font-medium text-[#0b2113] shadow-xl shadow-[#2fb54a44] transition hover:-translate-y-0.5"
          >
            了解更多
          </Link>
          <Link
            href="#philosophy"
            className="rounded-full border border-white/30 px-10 py-3 font-medium text-white transition hover:-translate-y-0.5 hover:border-white hover:bg-white/10"
          >
            了解因纽粹的态度
          </Link>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 text-xs text-white/70">
          <div className="scroll-mouse">
            <div className="scroll-mouse-dot" />
          </div>
          <span>向下滚动，探索更多超级食物</span>
        </div>
      </div>
    </header>
  );
}

