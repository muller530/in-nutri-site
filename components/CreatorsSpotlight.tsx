import { getApiUrl } from "@/lib/api";
import { VideoPlayer } from "./VideoPlayer";

async function getVideos() {
  try {
    const res = await fetch(getApiUrl("/api/videos"), {
      cache: "no-store",
    });
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function CreatorsSpotlight() {
  const videos = await getVideos();
  
  // 只显示有URL的视频，优先使用上传的视频
  const videosWithUrl = videos.filter((v: { url?: string }) => v.url && v.url.trim() !== "");
  
  // 确保至少显示3个视频，优先使用上传的视频
  const displayVideos = videosWithUrl.length > 0 
    ? videosWithUrl.slice(0, 3)
    : [];
  
  // 调试信息
  if (typeof window === "undefined") {
    console.log("服务器端 - 获取到的视频数量:", videos.length);
    console.log("服务器端 - 有URL的视频数量:", videosWithUrl.length);
    console.log("服务器端 - 要显示的视频:", displayVideos.map((v: { title?: string; url?: string; product?: any }) => ({ 
      title: v.title, 
      url: v.url,
      productId: (v as any).productId,
      product: v.product 
    })));
  }

  // Fallback to default videos if no data
  const defaultVideos = [
    {
      name: "食验室主理人 77",
      video: "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4",
      desc: "用巴西莓粉做 3 分钟免烤能量碗，搭配燕麦与可可碎。",
    },
    {
      name: "功能营养师 小白",
      video: "https://storage.googleapis.com/coverr-main/mp4/Canyon.mp4",
      desc: "分享控糖早餐日常：姜黄菊粉 Golden Latte + 高纤吐司。",
    },
    {
      name: "健身博主 Zoe",
      video: "https://storage.googleapis.com/coverr-main/mp4/Footboys.mp4",
      desc: "训练后用印尼可可粉 + 植物蛋白做低糖奶昔。",
    },
  ];

  interface Video {
    title?: string;
    url?: string;
    type?: string;
    coverImage?: string;
    productId?: number | null;
    product?: {
      id?: number;
      name?: string;
      mainImage?: string;
      purchaseUrl?: string;
    } | null;
  }

  const creators = displayVideos.length > 0
    ? displayVideos.map((v: Video) => {
        // 调试：打印产品信息
        if (typeof window === "undefined") {
          console.log("视频产品信息:", {
            title: v.title,
            productId: v.productId,
            product: v.product,
            mainImage: v.product?.mainImage
          });
        }
        return {
          name: v.title || "创作者",
          video: v.url || "",
          desc: v.type || "",
          cover: v.coverImage || "",
          productImage: v.product?.mainImage || null,
          productName: v.product?.name || null,
          productPurchaseUrl: v.product?.purchaseUrl || null,
        };
      })
    : defaultVideos.map((v) => ({ ...v, cover: "", productImage: null, productName: null, productPurchaseUrl: null }));

  return (
    <section className="relative z-0 bg-[var(--color-cream)]">
      <div className="page-shell py-24">
        <div className="flex flex-col gap-4 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-primary)]">CREATOR STORIES</p>
          <h2 className="text-3xl font-light text-[var(--color-forest)] sm:text-[40px]">达人真实冲泡日志</h2>
          <p className="text-[var(--color-ink)]/70">记录他们如何把超级食物带进自己的厨房与日常。</p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {creators.map((creator: { name: string; video: string; desc: string; cover?: string; productImage?: string | null; productName?: string | null; productPurchaseUrl?: string | null }, index: number) => (
            <article
              key={creator.name || index}
              className="flex flex-col rounded-[28px] border border-[var(--color-mint)] bg-white p-4 shadow-[var(--shadow-card)]"
            >
              <div className="relative aspect-[9/16] overflow-hidden rounded-[24px] bg-[var(--color-mint)]/40">
                {creator.video ? (
                  <>
                    <VideoPlayer 
                      src={creator.video} 
                      className="absolute inset-0 h-full w-full object-cover" 
                      productImage={creator.productImage || undefined}
                      productName={creator.productName || undefined}
                      productPurchaseUrl={creator.productPurchaseUrl || undefined}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#041c11]/90 via-transparent to-transparent pointer-events-none" />
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                    暂无视频
                  </div>
                )}
              </div>
              <div className="space-y-2 p-4">
                <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-primary)]/80">{creator.name}</p>
                <p className="text-base text-[var(--color-ink)]/80">{creator.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

