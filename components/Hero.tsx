import Image from "next/image";
import Link from "next/link";
import { HeroClient } from "./HeroClient";

// 暂时移除所有 API 调用，使用静态内容
// 这样可以确保即使数据库连接失败，页面也能正常显示
export async function Hero() {
  // 使用静态默认值，不调用任何 API
  const title = "In-nutri · 有态度的超级食物";
  const subtitle = "源自真实原料";
  const description = "我们用看得见的原料，而不是听起来很厉害的噱头。让自然成分在城市生活中重新被看见。";
  const videoUrl = ""; // 不使用视频，只使用 CSS 渐变背景

  return (
    <header className="relative isolate overflow-hidden text-white min-h-screen" style={{ backgroundColor: '#082317' }}>
      {/* 背景层 - 使用纯 CSS，不依赖外部资源 */}
      <div className="absolute inset-0 z-0" style={{
        background: 'linear-gradient(135deg, #0E4F2E 0%, #1a6b3f 50%, #082317 100%)',
      }} />
      
      {/* 视频层 - 仅在有效 URL 时显示 */}
      {videoUrl && (
        <video
          className="absolute inset-0 h-full w-full object-cover z-0"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}
      
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-[#082317]/50 z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#2fb54a33,transparent_50%),radial-gradient(circle_at_80%_20%,#e7f6ec44,transparent_60%)] z-20" />
      <div className="absolute left-1/2 top-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#2fb54a22] blur-[160px] z-20" />
      <div className="absolute inset-0 opacity-40 z-20">
        <div className="particle pointer-events-none absolute left-6 top-10 h-24 w-24 rounded-full border border-white/10" />
      </div>

      <div className="page-shell relative z-30 flex min-h-screen flex-col items-center justify-center gap-10 py-24 text-center">
        <div className="mt-16">
          <Image 
            src="/logo.png" 
            width={260} 
            height={80} 
            alt="In Nutri 标志" 
            priority 
            className="drop-shadow-lg"
            onError={(e) => {
              console.error("Logo image failed to load");
              // 如果图片加载失败，隐藏图片元素
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
        <div className="space-y-6 max-w-3xl">
          <h1 className="text-4xl font-light leading-tight tracking-wide sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {/* 暂时使用简单的文本，不使用打字效果 */}
          <div className="text-2xl font-semibold text-[#e9ffec]">
            {subtitle}
          </div>
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

