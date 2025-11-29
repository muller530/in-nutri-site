import { SectionHeading } from "@/components/SectionHeading";
import { ProductCard, type Product } from "@/components/ProductCard";
import { getApiUrl } from "@/lib/api";

async function getProducts() {
  try {
    const res = await fetch(getApiUrl("/api/products?featured=1"), {
      cache: "no-store",
    });
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

interface DbProduct {
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

function transformProduct(dbProduct: DbProduct): Product {
  const tags = dbProduct.tags ? (typeof dbProduct.tags === "string" ? JSON.parse(dbProduct.tags) : dbProduct.tags) : [];
  const price = dbProduct.priceCents != null 
    ? `¥${(dbProduct.priceCents / 100).toFixed(0)} / ${dbProduct.shortDescription || ""}`
    : `${dbProduct.shortDescription || ""}`;
  return {
    name: dbProduct.name,
    flavor: dbProduct.category || "",
    price: price,
    image: dbProduct.mainImage || "https://images.unsplash.com/photo-1502740479091-635887520276?auto=format&fit=crop&w=900&q=80",
    description: dbProduct.shortDescription || "",
    tags: tags,
    purchaseUrl: dbProduct.purchaseUrl,
    viewCount: dbProduct.viewCount || 0,
    badge: dbProduct.isFeatured ? "必选" : undefined,
  };
}

export async function ProductShowcase() {
  const dbProducts = await getProducts();
  const products = dbProducts.map(transformProduct);

  // Fallback to default products if no data
  const displayProducts = products.length > 0 ? products : [
    {
      name: "印尼雨林可可粉",
      flavor: "控糖早餐 / 热巧",
      price: "¥328 / 300g",
      image: "https://images.unsplash.com/photo-1502740479091-635887520276?auto=format&fit=crop&w=900&q=80",
      description: "来自印尼雨林的高可可多酚粉，可作控糖热巧或健身奶昔基底。",
      tags: ["无蔗糖添加", "轻加工", "可可多酚"],
      badge: "必选",
    },
  ];

  return (
    <section id="products" className="relative z-0 bg-[var(--color-mint)]/40">
      <div className="page-shell py-24">
        <SectionHeading
          eyebrow="SUPERFOOD COLLECTION"
          title="三大功能线，覆盖全天候的超级食物补能"
          description="晨间控糖、午间防护、夜间修护，In-nutri 将原料与真实场景紧密相连。"
          align="center"
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayProducts.map((product: Product, index: number) => (
            <ProductCard key={product.name || index} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

