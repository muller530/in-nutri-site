"use client";

import { useEffect, useState } from "react";
import { getApiUrl } from "@/lib/api";

interface SiteSettings {
  promotionalBannerActive?: boolean;
  promotionalBannerText?: string | null;
}

interface PageContentWrapperProps {
  children: React.ReactNode;
  defaultPaddingTop?: string; // 默认 pt-24
}

export function PageContentWrapper({ 
  children, 
  defaultPaddingTop = "pt-24" 
}: PageContentWrapperProps) {
  const [paddingTop, setPaddingTop] = useState(defaultPaddingTop);

  useEffect(() => {
    async function checkPromoBanner() {
      try {
        const res = await fetch(getApiUrl("/api/site-settings"), {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          const settings: SiteSettings = data.data || {};
          const hasPromoBanner = 
            !!settings.promotionalBannerActive && !!settings.promotionalBannerText;
          
          // 导航栏高度: 64px (h-16)
          // 促销横幅高度: 约 32px
          // 有促销横幅时: 32px (促销) + 64px (导航) + 间距 = 128px (pt-32)
          // 没有促销横幅时: 64px (导航) + 间距 = 96px (pt-24)
          setPaddingTop(hasPromoBanner ? "pt-32" : defaultPaddingTop);
        }
      } catch {
        // 忽略错误，使用默认值
      }
    }
    checkPromoBanner();
  }, [defaultPaddingTop]);

  return <div className={paddingTop}>{children}</div>;
}

