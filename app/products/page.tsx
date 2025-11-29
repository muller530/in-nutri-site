import { NavigationServer } from "@/components/NavigationServer";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductListCard } from "@/components/ProductListCard";
import { ProductCategoryNav } from "@/components/ProductCategoryNav";
import { ProductSort } from "@/components/ProductSort";
import { PageContentWrapper } from "@/components/PageContentWrapper";
import { getApiUrl } from "@/lib/api";

async function getProducts(category?: string) {
  try {
    const url = category 
      ? getApiUrl(`/api/products?category=${encodeURIComponent(category)}`)
      : getApiUrl("/api/products");
    const res = await fetch(url, {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    const res = await fetch(getApiUrl("/api/products"), {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    const products = data.data || [];
    // 从产品中提取所有分类
    const categories = new Set<string>();
    products.forEach((product: { category?: string }) => {
      if (product.category) {
        categories.add(product.category);
      }
    });
    return Array.from(categories).sort();
  } catch {
    return [];
  }
}

interface DbProduct {
  id: number;
  slug: string;
  name: string;
  category?: string;
  priceCents: number | null;
  shortDescription?: string;
  mainImage?: string;
  tags?: string;
  purchaseUrl?: string;
  viewCount?: number;
  isFeatured?: boolean;
}

function transformProduct(dbProduct: DbProduct) {
  const tags = dbProduct.tags ? (typeof dbProduct.tags === "string" ? JSON.parse(dbProduct.tags) : dbProduct.tags) : [];
  const price = dbProduct.priceCents != null 
    ? `¥${(dbProduct.priceCents / 100).toFixed(2)}`
    : "价格面议";
  
  return {
    id: dbProduct.id,
    slug: dbProduct.slug,
    name: dbProduct.name,
    category: dbProduct.category || "",
    price: price,
    image: dbProduct.mainImage || "https://images.unsplash.com/photo-1502740479091-635887520276?auto=format&fit=crop&w=900&q=80",
    description: dbProduct.shortDescription || "",
    tags: tags,
    purchaseUrl: dbProduct.purchaseUrl,
    viewCount: dbProduct.viewCount || 0,
    isFeatured: dbProduct.isFeatured || false,
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const category = params.category;
  const sort = params.sort || "featured";
  
  const allProducts = await getProducts(category);
  const categories = await getCategories();
  
  // 转换产品数据
  let products = allProducts.map(transformProduct);
  
  // 排序
  type ProductType = ReturnType<typeof transformProduct>;
  if (sort === "price-low") {
    products.sort((a: ProductType, b: ProductType) => {
      const priceA = a.price.match(/¥(\d+\.?\d*)/)?.[1] || "0";
      const priceB = b.price.match(/¥(\d+\.?\d*)/)?.[1] || "0";
      return parseFloat(priceA) - parseFloat(priceB);
    });
  } else if (sort === "price-high") {
    products.sort((a: ProductType, b: ProductType) => {
      const priceA = a.price.match(/¥(\d+\.?\d*)/)?.[1] || "0";
      const priceB = b.price.match(/¥(\d+\.?\d*)/)?.[1] || "0";
      return parseFloat(priceB) - parseFloat(priceA);
    });
  } else if (sort === "name-asc") {
    products.sort((a: ProductType, b: ProductType) => a.name.localeCompare(b.name));
  } else if (sort === "name-desc") {
    products.sort((a: ProductType, b: ProductType) => b.name.localeCompare(a.name));
  } else {
    // featured - 推荐产品在前
    products.sort((a: ProductType, b: ProductType) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    });
  }

  return (
    <div className="min-h-screen bg-white">
      <NavigationServer />
      
      {/* 页面标题 - 根据促销横幅动态调整间距 */}
      <PageContentWrapper>
        <div className="border-b border-gray-200 bg-white pb-8">
          <div className="page-shell">
            <h1 className="text-3xl font-semibold text-gray-900">所有产品</h1>
          </div>
        </div>
      </PageContentWrapper>

      {/* 主要内容区域 - 参考KOS.com的布局 */}
      <div className="page-shell py-8">
        <div className="flex gap-12">
          {/* 左侧分类导航 - 固定宽度 */}
          <aside className="w-56 flex-shrink-0">
            <ProductCategoryNav categories={categories} currentCategory={category} />
          </aside>

          {/* 中间产品区域 */}
          <main className="flex-1 min-w-0">
            {/* 筛选和排序栏 */}
            <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-4">
              <div className="text-sm text-gray-600">
                共 {products.length} 个产品
              </div>
              <ProductSort currentSort={sort} />
            </div>

            {/* 产品网格 - 参考KOS.com的布局，4列网格 */}
            {products.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductListCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-gray-500">
                <p className="text-lg">暂无产品</p>
                <p className="mt-2 text-sm">请选择其他分类查看</p>
              </div>
            )}
          </main>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

