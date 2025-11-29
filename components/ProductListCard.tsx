import Image from "next/image";
import Link from "next/link";

interface ProductListCardProps {
  product: {
    id: number;
    slug: string;
    name: string;
    price: string;
    image: string;
    description?: string;
    purchaseUrl?: string;
    isFeatured?: boolean;
  };
}

export function ProductListCard({ product }: ProductListCardProps) {
  return (
    <article className="group flex flex-col">
      {/* 产品图片 - 参考KOS.com的尺寸比例 */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-50 mb-4">
        <Link href={`/products/${product.slug}`}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </Link>
        {product.isFeatured && (
          <span className="absolute left-2 top-2 rounded bg-[var(--color-primary)] px-2 py-1 text-xs font-semibold text-white">
            Featured
          </span>
        )}
      </div>

      {/* 产品信息 */}
      <div className="flex flex-col flex-1">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-gray-900 group-hover:text-[var(--color-primary)] transition-colors leading-tight mb-2">
            {product.name}
          </h3>
        </Link>
        
        {product.description && (
          <p className="mb-3 text-xs text-gray-600 line-clamp-2 flex-1">
            {product.description}
          </p>
        )}

        {/* 价格和购买按钮 */}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-base font-semibold text-gray-900">{product.price}</span>
          
          {product.purchaseUrl ? (
            <a
              href={product.purchaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-[var(--color-forest)] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary)]"
            >
              SHOP
            </a>
          ) : (
            <Link
              href={`/products/${product.slug}`}
              className="rounded bg-[var(--color-forest)] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary)]"
            >
              SHOP
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

