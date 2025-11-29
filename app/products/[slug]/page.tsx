import { NavigationServer } from "@/components/NavigationServer";
import { SiteFooter } from "@/components/SiteFooter";
import { PageContentWrapper } from "@/components/PageContentWrapper";
import { getApiUrl } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getProduct(slug: string) {
  try {
    const res = await fetch(getApiUrl(`/api/products/${slug}`), {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

interface DbProduct {
  id: number;
  slug: string;
  name: string;
  shortDescription?: string;
  longDescription?: string;
  category?: string;
  priceCents: number | null;
  mainImage?: string;
  gallery?: string; // JSON string for array of images
  tags?: string; // JSON string for array of strings
  purchaseUrl?: string;
  viewCount?: number;
  isFeatured?: boolean;
}

function parseJsonField(field: string | null | undefined, defaultValue: any = []) {
  if (!field) return defaultValue;
  try {
    return typeof field === "string" ? JSON.parse(field) : field;
  } catch {
    return defaultValue;
  }
}

function getCategoryDisplayName(category?: string): string {
  if (!category) return "";
  const categoryMap: Record<string, string> = {
    powder: "Superfood Powders",
    drink: "Drink Mixes",
    combo: "Combos",
    protein: "Protein",
    hydration: "Hydration",
    superfoods: "Superfoods",
    supplements: "Supplements",
    accessories: "Accessories",
  };
  return categoryMap[category] || category;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product: DbProduct | null = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const tags = parseJsonField(product.tags, []);
  const galleryImages = parseJsonField(product.gallery, []);
  const price = product.priceCents != null 
    ? `¥${(product.priceCents / 100).toFixed(2)}`
    : "价格面议";
  
  const allImages = product.mainImage 
    ? [product.mainImage, ...galleryImages].filter(Boolean)
    : galleryImages.length > 0 
      ? galleryImages 
      : ["https://images.unsplash.com/photo-1502740479091-635887520276?auto=format&fit=crop&w=900&q=80"];

  return (
    <div className="min-h-screen bg-white">
      <NavigationServer />
      
      <PageContentWrapper>
        <div className="page-shell py-8">
          {/* 面包屑导航 */}
          <nav className="mb-6 text-sm text-gray-600">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/" className="hover:text-gray-900 transition-colors">
                  首页
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/products" className="hover:text-gray-900 transition-colors">
                  产品
                </Link>
              </li>
              <li>/</li>
              <li className="text-gray-900 font-medium">{product.name}</li>
            </ol>
          </nav>

          {/* 产品详情内容 */}
          <div className="grid gap-12 lg:grid-cols-2">
            {/* 左侧：产品图片 */}
            <div className="space-y-4">
              {/* 主图 */}
              <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-50">
                <Image
                  src={allImages[0]}
                  alt={product.name}
                  fill
                  className="object-contain p-8"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                {product.isFeatured && (
                  <span className="absolute left-4 top-4 rounded bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">
                    Featured
                  </span>
                )}
              </div>

              {/* 图片画廊（如果有多个图片） */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {allImages.slice(0, 4).map((image: string, index: number) => (
                    <div
                      key={index}
                      className="relative aspect-square overflow-hidden rounded-lg bg-gray-50"
                    >
                      <Image
                        src={image}
                        alt={`${product.name} - 图片 ${index + 1}`}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 1024px) 25vw, 12.5vw"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 右侧：产品信息 */}
            <div className="flex flex-col">
              {/* 分类标签 */}
              {product.category && (
                <div className="mb-4">
                  <span className="text-sm text-gray-600">
                    {getCategoryDisplayName(product.category)}
                  </span>
                </div>
              )}

              {/* 产品名称 */}
              <h1 className="text-3xl font-semibold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* 价格 */}
              <div className="mb-6">
                <span className="text-2xl font-semibold text-gray-900">{price}</span>
              </div>

              {/* 简短描述 */}
              {product.shortDescription && (
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {product.shortDescription}
                </p>
              )}

              {/* 标签 */}
              {tags.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="rounded-full bg-[var(--color-soft-mint)] px-3 py-1 text-xs font-medium text-[var(--color-forest)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 购买按钮 */}
              <div className="mt-auto space-y-4 pt-6 border-t border-gray-200">
                {product.purchaseUrl ? (
                  <a
                    href={product.purchaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full rounded bg-[var(--color-forest)] px-6 py-3 text-center text-base font-medium text-white transition-colors hover:bg-[var(--color-primary)]"
                  >
                    立即购买
                  </a>
                ) : (
                  <button
                    disabled
                    className="block w-full rounded bg-gray-300 px-6 py-3 text-center text-base font-medium text-gray-500 cursor-not-allowed"
                  >
                    暂不可购买
                  </button>
                )}
                
                {/* 返回产品列表 */}
                <Link
                  href="/products"
                  className="block w-full rounded border border-gray-300 bg-white px-6 py-3 text-center text-base font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  返回产品列表
                </Link>
              </div>

              {/* 查看次数（可选） */}
              {product.viewCount !== undefined && product.viewCount > 0 && (
                <div className="mt-4 text-sm text-gray-500">
                  已查看 {product.viewCount} 次
                </div>
              )}
            </div>
          </div>

          {/* 详细描述 */}
          {product.longDescription && (
            <div className="mt-16 border-t border-gray-200 pt-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">产品详情</h2>
              <div 
                className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.longDescription }}
              />
            </div>
          )}
        </div>
      </PageContentWrapper>

      <SiteFooter />
    </div>
  );
}

