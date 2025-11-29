import Image from "next/image";

export type Product = {
  name: string;
  description: string;
  image: string;
  flavor: string;
  price: string;
  tags: string[];
  badge?: string;
  purchaseUrl?: string;
  viewCount?: number;
};

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group relative z-0 flex flex-col rounded-3xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:shadow-xl overflow-hidden h-full">
      {/* 产品图片区域 - 占据较大空间，类似参考图片的比例 */}
      <div className="relative flex-1 min-h-[280px] overflow-hidden bg-gradient-to-b from-gray-50 to-white px-6 pt-8 pb-4">
        {/* 背景图片 - 鼠标悬停时显示 */}
        <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none">
          <Image
            src="/in.png"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            style={{ objectFit: 'cover' }}
          />
        </div>
        
        {/* 产品图片 */}
        <div className="relative h-full w-full flex items-center justify-center z-10">
          <Image
            src={product.image}
            alt={product.name}
            width={300}
            height={400}
            className="h-full w-full max-h-[320px] object-contain transition duration-500 group-hover:scale-105 relative z-10"
            unoptimized={true}
          />
        </div>
        {product.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-md z-20">
            {product.badge}
          </span>
        )}
      </div>

      {/* 产品信息区域 */}
      <div className="flex flex-col p-5 bg-white">
        {/* 产品名称 */}
        <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
          {product.name}
        </h3>

        {/* 产品标签 */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[var(--color-mint)] px-3 py-1 text-xs text-[var(--color-forest)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 购买按钮 - 固定在底部 */}
        {product.purchaseUrl ? (
          <a
            href={product.purchaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-forest)] px-5 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-primary)] hover:shadow-lg hover:-translate-y-0.5"
          >
            点击购买
            <span className="text-white">→</span>
          </a>
        ) : (
          <button className="flex items-center justify-center gap-2 rounded-xl bg-gray-300 px-5 py-3.5 text-sm font-semibold text-gray-600 cursor-not-allowed">
            点击购买
            <span>→</span>
          </button>
        )}
      </div>
    </article>
  );
}
