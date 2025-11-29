"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";
import { Search, User, ShoppingCart } from "lucide-react";

interface NavigationItem {
  id: number;
  label: string;
  url?: string | null;
  type: string;
  pageType?: string | null;
  pageSlug?: string | null;
  position: string;
  sortOrder: number;
  parentId?: number | null;
  isActive: boolean;
  openInNewTab: boolean;
  children?: NavigationItem[];
}

interface SiteSettings {
  promotionalBannerText?: string | null;
  promotionalBannerUrl?: string | null;
  promotionalBannerActive?: boolean;
  logoTagline?: string | null;
}

export function Navigation() {
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  // 监听滚动
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 获取导航数据和站点设置
  useEffect(() => {
    async function fetchData() {
      try {
        // 获取导航项
        const navRes = await fetch(getApiUrl("/api/navigation"), {
          cache: "no-store",
        });
        if (navRes.ok) {
          const navData = await navRes.json();
          if (navData.data && Array.isArray(navData.data)) {
            const items = navData.data as NavigationItem[];
            const parentItems = items.filter((item) => !item.parentId);
            const childrenMap = new Map<number, NavigationItem[]>();
            
            items.forEach((item) => {
              if (item.parentId) {
                if (!childrenMap.has(item.parentId)) {
                  childrenMap.set(item.parentId, []);
                }
                childrenMap.get(item.parentId)!.push(item);
              }
            });

            const buildTree = (item: NavigationItem): NavigationItem => {
              const children = childrenMap.get(item.id) || [];
              return {
                ...item,
                children: children.length > 0 ? children.map(buildTree) : undefined,
              };
            };

            setNavItems(parentItems.map(buildTree).sort((a, b) => a.sortOrder - b.sortOrder));
          }
        }

        // 获取站点设置
        const settingsRes = await fetch(getApiUrl("/api/site-settings"), {
          cache: "no-store",
        });
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (settingsData.data) {
            setSiteSettings(settingsData.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch navigation data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getHref = (item: NavigationItem): string => {
    if (item.type === "page" && item.pageType) {
      switch (item.pageType) {
        case "products":
          return item.pageSlug ? `/products/${item.pageSlug}` : "/#products";
        case "videos":
          return item.pageSlug ? `/videos/${item.pageSlug}` : "/#videos";
        case "recipes":
          return item.pageSlug ? `/recipes/${item.pageSlug}` : "/#recipes";
        case "articles":
          return item.pageSlug ? `/articles/${item.pageSlug}` : "/#articles";
        case "custom":
          return item.url || "#";
        default:
          return item.url || "#";
      }
    }
    return item.url || "#";
  };

  const leftItems = navItems.filter((item) => item.position === "left");
  const rightItems = navItems.filter((item) => item.position === "right");

  const renderMenuItem = (item: NavigationItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const href = getHref(item);
    const textColor = isScrolled ? "text-gray-900" : "text-white";

    if (hasChildren) {
      return (
        <div
          key={item.id}
          className="relative"
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${textColor} hover:opacity-80`}
          >
            {item.label}
            <span className="ml-1">▼</span>
          </button>
          {hoveredItem === item.id && (
            <div className="absolute left-0 top-full mt-1 w-48 rounded-md bg-white shadow-lg py-2 z-50">
              {item.children!.map((child) => (
                <Link
                  key={child.id}
                  href={getHref(child)}
                  target={child.openInNewTab ? "_blank" : "_self"}
                  className="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                >
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        href={href}
        target={item.openInNewTab ? "_blank" : "_self"}
        className={`px-4 py-2 text-sm font-medium transition-colors ${textColor} hover:opacity-80`}
      >
        {item.label}
      </Link>
    );
  };

  const showPromoBanner = siteSettings?.promotionalBannerActive && siteSettings?.promotionalBannerText;

  return (
    <>
      {/* 顶部促销横幅 */}
      {showPromoBanner && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-gray-900 text-white text-center py-2 text-xs font-medium">
          {siteSettings.promotionalBannerUrl ? (
            <Link href={siteSettings.promotionalBannerUrl} className="hover:opacity-80">
              {siteSettings.promotionalBannerText}
            </Link>
          ) : (
            <span>{siteSettings.promotionalBannerText}</span>
          )}
        </div>
      )}

      {/* 主导航栏 */}
      <nav
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
          showPromoBanner ? "top-8" : "top-0"
        } ${
          isScrolled
            ? "bg-white shadow-sm"
            : "bg-transparent backdrop-blur-sm"
        }`}
        style={{
          borderRadius: isScrolled ? "0" : "0 0 12px 12px",
        }}
      >
        <div className="page-shell">
          <div className="flex items-center justify-between h-16">
            {/* 左侧导航 */}
            <div className="flex items-center gap-4 min-w-[200px]">
              {loading ? (
                <span className={`text-xs ${isScrolled ? "text-gray-400" : "text-white/60"}`}>
                  加载中...
                </span>
              ) : (
                leftItems.slice(0, 2).map((item) => renderMenuItem(item))
              )}
            </div>

            {/* Logo 居中 */}
            <Link href="/" className="flex-shrink-0 flex flex-col items-center">
              {siteSettings?.logoTagline && (
                <span
                  className={`text-xs font-medium mb-1 transition-colors ${
                    isScrolled ? "text-gray-600" : "text-white"
                  }`}
                  style={{ letterSpacing: "0.05em" }}
                >
                  {siteSettings.logoTagline}
                </span>
              )}
              <Image
                src="/logo.png"
                width={120}
                height={40}
                alt="In Nutri 标志"
                className="h-8 w-auto"
                priority
                unoptimized={true}
              />
            </Link>

            {/* 右侧导航和图标 */}
            <div className="flex items-center gap-4 min-w-[200px] justify-end">
              {loading ? (
                <span className={`text-xs ${isScrolled ? "text-gray-400" : "text-white/60"}`}>
                  加载中...
                </span>
              ) : (
                <>
                  {rightItems.slice(0, 2).map((item) => renderMenuItem(item))}
                  
                  {/* 右侧图标 */}
                  <div className="flex items-center gap-3 ml-2 pl-2 border-l border-gray-300">
                    <button
                      className={`p-2 transition-colors ${isScrolled ? "text-gray-900" : "text-white"} hover:opacity-80`}
                      aria-label="搜索"
                    >
                      <Search size={18} />
                    </button>
                    <button
                      className={`p-2 transition-colors ${isScrolled ? "text-gray-900" : "text-white"} hover:opacity-80`}
                      aria-label="会员"
                    >
                      <User size={18} />
                    </button>
                    <button
                      className={`p-2 transition-colors ${isScrolled ? "text-gray-900" : "text-white"} hover:opacity-80`}
                      aria-label="购物车"
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
