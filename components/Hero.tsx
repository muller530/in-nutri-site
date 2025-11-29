import Image from "next/image";
import Link from "next/link";
import { HeroClient } from "./HeroClient";
import { VideoBackground } from "./VideoBackground";

import { getApiUrl, isBuildTime } from "@/lib/api";

async function getBanner() {
  try {
    // 构建时跳过 fetch，返回 null（使用默认值）
    // 只在真正的构建阶段跳过，运行时应该尝试 fetch
    if (isBuildTime()) {
      return null;
    }
    
    const apiUrl = getApiUrl("/api/banners");
    const res = await fetch(apiUrl, {
      // 使用较短的 revalidate 时间，确保视频更新能及时显示
      next: { revalidate: 10 }, // 10秒重新验证，更快响应更新
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store', // 开发环境禁用缓存，生产环境使用 revalidate
    });
    if (!res.ok) {
      console.warn("Banner API returned non-OK status:", res.status);
      return null;
    }
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
  } catch (error) {
    console.error("Error fetching banner:", error);
    // 返回 null，让组件使用默认值
    return null;
  }
}

async function getBrandStory() {
  try {
    // 构建时跳过 fetch，返回 null（使用默认值）
    // 只在真正的构建阶段跳过，运行时应该尝试 fetch
    if (isBuildTime()) {
      return null;
    }
    
    const apiUrl = getApiUrl("/api/brand-story");
    const res = await fetch(apiUrl, {
      // 使用 revalidate 而不是 no-store，允许静态生成但定期更新
      next: { revalidate: 60 }, // 60秒重新验证
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!res.ok) {
      console.warn("Brand story API returned non-OK status:", res.status);
      return null;
    }
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching brand story:", error);
    // 返回 null，让组件使用默认值
    return null;
  }
}

export async function Hero() {
  // 尝试获取数据，如果失败则使用默认值
  let banner = null;
  let brandStory = null;
  
  try {
    banner = await getBanner();
  } catch (error) {
    console.error("Failed to get banner, using defaults:", error);
  }
  
  try {
    brandStory = await getBrandStory();
  } catch (error) {
    console.error("Failed to get brand story, using defaults:", error);
  }

  // 确保始终有默认值，即使所有 API 调用都失败
  let videoUrl = banner?.image || "";
  
  // 修复：如果 URL 是简单的文件名（如 "video.mp4"），尝试查找上传目录中的文件
  if (videoUrl && !videoUrl.startsWith('/') && !videoUrl.startsWith('http') && !videoUrl.startsWith('https')) {
    // 如果只是文件名，尝试在 uploads/videos 目录中查找
    if (videoUrl.endsWith('.mp4') || videoUrl.endsWith('.mov') || videoUrl.endsWith('.avi') || videoUrl.endsWith('.webm')) {
      videoUrl = `/uploads/videos/${videoUrl}`;
      if (typeof window === "undefined") {
        console.warn("检测到不完整的视频路径，已自动修复:", videoUrl);
      }
    } else {
      // 如果既不是完整路径也不是视频文件，清空
      videoUrl = "";
      if (typeof window === "undefined") {
        console.warn("检测到无效的视频路径，已清空:", banner?.image);
      }
    }
  }
  
  // 确保路径以 / 开头（相对路径）
  if (videoUrl && !videoUrl.startsWith('http') && !videoUrl.startsWith('https') && !videoUrl.startsWith('/')) {
    videoUrl = `/${videoUrl}`;
  }
  
  const title = brandStory?.heroTitle || banner?.title || "In-nutri · 有态度的超级食物";
  const subtitle = brandStory?.heroSubtitle || banner?.subtitle || "源自真实原料";
  const description = banner?.description || brandStory?.mission || "我们用看得见的原料，而不是听起来很厉害的噱头。让自然成分在城市生活中重新被看见。";

  // 判断是否为视频文件（通过扩展名或 URL 路径）
  // 优先检查路径，因为上传的视频路径包含 /uploads/videos/
  const isVideo = videoUrl && (
    videoUrl.includes('/uploads/videos/') ||
    videoUrl.endsWith('.mp4') || 
    videoUrl.endsWith('.mov') || 
    videoUrl.endsWith('.avi') || 
    videoUrl.endsWith('.webm')
  );

  // 调试信息（服务器端和客户端都显示）
  console.log("=== Hero 组件调试信息 ===");
  console.log("Banner 原始 image 值:", banner?.image);
  console.log("修复后的视频 URL:", videoUrl);
  console.log("是否为视频:", isVideo);
  console.log("是否渲染视频组件:", videoUrl && isVideo);
  console.log("Banner key:", banner?.key);
  console.log("Banner 完整数据:", JSON.stringify(banner, null, 2));

  return (
    <header className="relative isolate overflow-hidden text-white min-h-screen" style={{ backgroundColor: '#082317' }}>
      {/* 背景层 - 使用纯 CSS，不依赖外部资源 */}
      <div className="absolute inset-0 z-0" style={{
        background: 'linear-gradient(135deg, #0E4F2E 0%, #1a6b3f 50%, #082317 100%)',
      }} />
      
      {/* 视频层 - 仅在有效 URL 且为视频文件时显示 */}
      {videoUrl && isVideo ? (
        <VideoBackground src={videoUrl} />
      ) : videoUrl && !isVideo ? (
        // 如果是图片 URL，显示为背景图片
        <div 
          className="absolute inset-0 h-full w-full object-cover z-[1] bg-cover bg-center"
          style={{ backgroundImage: `url(${videoUrl})`, zIndex: 1 }}
        />
      ) : null}
      
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
            unoptimized={true}
          />
        </div>
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

