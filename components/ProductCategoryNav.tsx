"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getApiUrl } from "@/lib/api";

interface ProductCategoryNavProps {
  categories: string[];
  currentCategory?: string;
}

interface SiteSettings {
  promotionalBannerActive?: boolean;
  promotionalBannerText?: string | null;
}

export function ProductCategoryNav({ categories, currentCategory }: ProductCategoryNavProps) {
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") || "featured";
  const [hasPromoBanner, setHasPromoBanner] = useState(false);

  useEffect(() => {
    async function checkPromoBanner() {
      try {
        const res = await fetch(getApiUrl("/api/site-settings"), {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          const settings: SiteSettings = data.data || {};
          setHasPromoBanner(
            !!settings.promotionalBannerActive && !!settings.promotionalBannerText
          );
        }
      } catch {
        // 忽略错误
      }
    }
    checkPromoBanner();
  }, []);

  const getCategoryUrl = (category?: string) => {
    const params = new URLSearchParams();
    if (category) {
      params.set("category", category);
    }
    if (sort && sort !== "featured") {
      params.set("sort", sort);
    }
    const query = params.toString();
    return `/products${query ? `?${query}` : ""}`;
  };

  // 导航栏高度: 64px (h-16)
  // 有促销横幅时: 32px (促销) + 64px (导航) = 96px
  // 没有促销横幅时: 64px (导航)
  const stickyTop = hasPromoBanner ? "top-24" : "top-16";

  return (
    <nav className={`sticky ${stickyTop} z-10`}>
      <div className="space-y-1">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-900">
          产品类别
        </h2>
        
        {/* 全部产品 */}
        <Link
          href={getCategoryUrl()}
          className={`block rounded-md px-3 py-2 text-sm transition-colors ${
            !currentCategory
              ? "bg-gray-100 font-medium text-gray-900"
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          所有产品
        </Link>

        {/* 分类列表 */}
        {categories.map((category) => {
          const displayName = getCategoryDisplayName(category);
          return (
            <Link
              key={category}
              href={getCategoryUrl(category)}
              className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                currentCategory === category
                  ? "bg-gray-100 font-medium text-gray-900"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {displayName}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function getCategoryDisplayName(category: string): string {
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

