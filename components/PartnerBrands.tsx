"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";
import { ensureUrlProtocol } from "@/lib/urlUtils";

interface PartnerBrand {
  id: number;
  name: string;
  logoUrl: string;
  websiteUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export function PartnerBrands() {
  const [brands, setBrands] = useState<PartnerBrand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBrands() {
      try {
        const res = await fetch(getApiUrl("/api/partner-brands"), {
          next: { revalidate: 60 },
        });
        if (res.ok) {
          const data = await res.json();
          setBrands(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch partner brands:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBrands();
  }, []);

  // 动态注入滚动动画样式
  useEffect(() => {
    if (brands.length === 0) return;

    const styleId = 'partner-brands-scroll-animation';
    // 移除已存在的样式
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    // 创建新的样式
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes partnerBrandsScroll {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(-20%);
        }
      }
      .partner-brands-scroll-custom {
        animation: partnerBrandsScroll ${brands.length * 2.5}s linear infinite;
        display: flex;
        will-change: transform;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const styleToRemove = document.getElementById(styleId);
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, [brands.length]);

  if (loading || brands.length === 0) {
    return null;
  }

  // 复制品牌列表足够多次，确保无缝无限滚动
  // 复制5次，确保有足够的内容填充屏幕且无缝循环
  const copies = 5;
  const duplicatedBrands: PartnerBrand[] = [];
  for (let i = 0; i < copies; i++) {
    duplicatedBrands.push(...brands);
  }

  // 计算每个logo的宽度（包括padding）
  const logoWidth = 200; // 每个logo容器宽度
  const totalWidth = duplicatedBrands.length * logoWidth; // 总宽度

  return (
    <section className="relative bg-gray-100 py-8 overflow-hidden -mt-8 mb-0">
      <div className="relative w-full overflow-hidden">
        {/* 滚动容器 */}
        <div 
          className="partner-brands-scroll-custom"
          style={{
            width: `${totalWidth}px`,
          }}
        >
          {duplicatedBrands.map((brand, index) => (
            <div
              key={`${brand.id}-${index}`}
              className="flex-shrink-0 flex items-center justify-center"
              style={{ 
                width: `${logoWidth}px`,
                paddingLeft: "2rem",
                paddingRight: "2rem",
              }}
            >
              {brand.websiteUrl ? (
                <a
                  href={ensureUrlProtocol(brand.websiteUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-60 hover:opacity-100 transition-opacity duration-300"
                >
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="object-contain h-12 w-auto grayscale hover:grayscale-0 transition-all duration-300"
                    style={{ maxHeight: "60px" }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </a>
              ) : (
                <div className="opacity-60">
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="object-contain h-12 w-auto grayscale"
                    style={{ maxHeight: "60px" }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

