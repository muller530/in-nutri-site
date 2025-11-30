"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getApiUrl } from "@/lib/api";
import { Search, User, ShoppingCart } from "lucide-react";
import { ensureUrlProtocol } from "@/lib/urlUtils";

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

interface Product {
  id: number;
  name: string;
  slug: string;
  priceCents: number | null;
  mainImage?: string | null;
  shortDescription?: string | null;
}

interface BrandStory {
  heroTitle?: string | null;
  mission?: string | null;
  storyBlocks?: string | null;
}

interface NavigationProps {
  initialNavItems?: NavigationItem[];
  initialSiteSettings?: SiteSettings | null;
}

export function Navigation({ 
  initialNavItems = [], 
  initialSiteSettings = null 
}: NavigationProps = {}) {
  const pathname = usePathname();
  const [navItems, setNavItems] = useState<NavigationItem[]>(initialNavItems);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(initialSiteSettings);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [loading, setLoading] = useState(!initialNavItems.length || !initialSiteSettings);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [brandStory, setBrandStory] = useState<BrandStory | null>(null);
  const [loadingMenuData, setLoadingMenuData] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // 判断是否为首页
  const isHomePage = pathname === "/";

  // 监听滚动
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 在非首页，初始状态就应该显示白色背景
  useEffect(() => {
    if (!isHomePage) {
      setIsScrolled(true);
    }
  }, [isHomePage]);

  // 构建导航树结构
  const buildNavTree = useMemo(() => {
    const buildTree = (items: NavigationItem[]): NavigationItem[] => {
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

      const buildTreeRecursive = (item: NavigationItem): NavigationItem => {
        const children = childrenMap.get(item.id) || [];
        return {
          ...item,
          children: children.length > 0 ? children.map(buildTreeRecursive) : undefined,
        };
      };

      return parentItems.map(buildTreeRecursive).sort((a, b) => a.sortOrder - b.sortOrder);
    };
    return buildTree;
  }, []);

  // 如果有初始数据，检查是否已经是树结构
  useEffect(() => {
    if (initialNavItems.length > 0) {
      // 检查第一个项是否已经有 children 属性（说明已经是树结构）
      const isTreeStructure = initialNavItems.some(item => item.children !== undefined);
      
      let processedItems: NavigationItem[];
      if (isTreeStructure) {
        // 已经是树结构，直接使用
        processedItems = initialNavItems;
      } else {
        // 是扁平数组，需要构建树结构
        processedItems = buildNavTree(initialNavItems);
      }
      
      setNavItems(processedItems);
      setLoading(false);
    }
  }, [initialNavItems, buildNavTree]);

  // 如果没有初始数据，则获取数据（用于客户端导航等场景）
  useEffect(() => {
    if (initialNavItems.length > 0 && initialSiteSettings) {
      return; // 已有初始数据，不需要再获取
    }

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
            setNavItems(buildNavTree(items));
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
  }, [initialNavItems, initialSiteSettings, buildNavTree]);

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
          // 自定义路径可能是相对路径或外部链接
          if (item.url && !item.url.startsWith("/")) {
            return ensureUrlProtocol(item.url);
          }
          return item.url || "#";
        default:
          return item.url || "#";
      }
    }
    // 外部链接：确保有协议前缀
    if (item.type === "link" && item.url) {
      return ensureUrlProtocol(item.url);
    }
    return item.url || "#";
  };

  // 获取主推产品和品牌介绍数据（只在首次悬停时加载，之后缓存）
  useEffect(() => {
    if (!hoveredItem || (featuredProducts.length > 0 && brandStory)) {
      return; // 如果已有数据，不重复加载
    }

    const fetchMenuData = async () => {
      setLoadingMenuData(true);
      try {
        // 获取主推产品
        const productsRes = await fetch(getApiUrl("/api/products?featured=1"), {
          cache: "no-store",
        });
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          const products = (productsData.data || []).slice(0, 3) as Product[];
          setFeaturedProducts(products);
        }

        // 获取品牌介绍
        const brandRes = await fetch(getApiUrl("/api/brand-story"), {
          cache: "no-store",
        });
        if (brandRes.ok) {
          const brandData = await brandRes.json();
          setBrandStory(brandData.data || null);
        }
      } catch (error) {
        console.error("Failed to fetch menu data:", error);
      } finally {
        setLoadingMenuData(false);
      }
    };

    fetchMenuData();
  }, [hoveredItem, featuredProducts.length, brandStory]);

  const leftItems = navItems.filter((item) => item.position === "left");
  const rightItems = navItems.filter((item) => item.position === "right");

  // 格式化价格
  const formatPrice = (priceCents: number | null): string => {
    if (priceCents === null) return "价格待定";
    return `¥${(priceCents / 100).toFixed(2)}`;
  };

  // 解析品牌故事块
  const parseStoryBlocks = (storyBlocks: string | null): string => {
    if (!storyBlocks) return "";
    try {
      const blocks = JSON.parse(storyBlocks);
      if (Array.isArray(blocks) && blocks.length > 0) {
        const firstBlock = blocks[0];
        return `${firstBlock.title || ""} ${firstBlock.body || ""}`.trim();
      }
    } catch {
      return "";
    }
    return "";
  };

  const showPromoBanner = siteSettings?.promotionalBannerActive && siteSettings?.promotionalBannerText;

  const renderMenuItem = (item: NavigationItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const href = getHref(item);
    // 非首页或滚动后显示深色文字
    const textColor = isScrolled || !isHomePage ? "text-gray-900" : "text-white";
    const isHovered = hoveredItem === item.id;

    if (hasChildren) {
      return (
        <div
          key={item.id}
          className="relative"
          style={{ zIndex: 10000 }}
          onMouseEnter={() => {
            // 清除之前的延迟
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
              hoverTimeoutRef.current = null;
            }
            setHoveredItem(item.id);
          }}
          onMouseLeave={() => {
            // 添加延迟，让用户有时间移动到菜单上
            hoverTimeoutRef.current = setTimeout(() => {
              setHoveredItem((prev) => prev === item.id ? null : prev);
              hoverTimeoutRef.current = null;
            }, 150);
          }}
        >
          <button
            type="button"
            className={`relative px-3 py-2 text-sm font-medium transition-colors ${textColor} hover:opacity-80 flex items-center`}
          >
            {item.label}
            <svg 
              className={`ml-1.5 w-3 h-3 transition-transform duration-200 ${isHovered ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {/* 下划线动画 */}
            <span
              className={`absolute bottom-0 left-0 h-0.5 bg-current transition-all duration-300 ease-out ${
                isHovered ? "w-full" : "w-0"
              }`}
            />
          </button>
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        href={href}
        target={item.openInNewTab ? "_blank" : "_self"}
        className={`relative px-3 py-2 text-sm font-medium transition-colors ${textColor} hover:opacity-80`}
        onMouseEnter={() => setHoveredItem(item.id)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        {item.label}
        {/* 下划线动画 - 自左向右出现 */}
        <span
          className={`absolute bottom-0 left-0 h-0.5 bg-current transition-all duration-300 ease-out ${
            isHovered ? "w-full" : "w-0"
          }`}
        />
      </Link>
    );
  };

  return (
    <>
      {/* 顶部促销横幅 - 初始透明毛玻璃效果，滚动后变黑色 */}
      {showPromoBanner && (
        <div 
          className={`fixed top-0 left-0 right-0 text-white text-center py-2.5 text-xs font-medium uppercase tracking-wide transition-all duration-300 ${
            isScrolled || !isHomePage
              ? "bg-black"
              : "bg-black/20 backdrop-blur-md shadow-lg"
          }`}
          style={{ 
            zIndex: 10000, 
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {siteSettings.promotionalBannerUrl ? (
            <Link href={siteSettings.promotionalBannerUrl} className="hover:opacity-80">
              {siteSettings.promotionalBannerText}
            </Link>
          ) : (
            <span>{siteSettings.promotionalBannerText}</span>
          )}
        </div>
      )}

      {/* 主导航栏 - 首页全透明，滚动后变白色；二级页面默认白色，第二高层级 */}
      <nav
        className={`fixed left-0 right-0 transition-all duration-300 ${
          showPromoBanner ? "top-8" : "top-0"
        } ${
          isScrolled || !isHomePage
            ? "bg-white shadow-lg"
            : "bg-transparent"
        }`}
        style={{
          borderRadius: isScrolled || !isHomePage ? "0" : "0 0 12px 12px",
          zIndex: 9999,
          position: "fixed",
          top: showPromoBanner ? "32px" : "0",
        }}
      >
        <div className="page-shell" style={{ position: "relative", zIndex: 9999, overflow: "visible" }}>
          <div className="flex items-center justify-between h-16 relative" style={{ overflow: "visible" }}>
            {/* 左侧导航 - 靠近logo右侧 */}
            <div className="flex items-center gap-6 absolute left-1/2 -translate-x-1/2 -ml-48" style={{ overflow: "visible", zIndex: 10001 }}>
              {loading ? (
                <span className={`text-xs ${isScrolled || !isHomePage ? "text-gray-400" : "text-white/60"}`}>
                  加载中...
                </span>
              ) : (
                leftItems.slice(0, 2).map((item) => renderMenuItem(item))
              )}
            </div>

            {/* Logo 居中 */}
            <div className="absolute left-1/2 -translate-x-1/2 flex justify-center items-center" style={{ zIndex: 10000 }}>
              <Link href="/" className="flex flex-col items-center">
                {siteSettings?.logoTagline && (
                  <span
                    className={`text-xs font-medium mb-1 transition-colors ${
                      isScrolled || !isHomePage ? "text-gray-600" : "text-white"
                    }`}
                    style={{ letterSpacing: "0.05em" }}
                  >
                    {siteSettings.logoTagline}
                  </span>
                )}
                <div 
                  className={`transition-all duration-300 ${
                    isScrolled || !isHomePage ? "brightness-0" : ""
                  }`} 
                  style={{ display: 'flex', alignItems: 'center', height: '2rem' }}
                >
                  <img
                    src="/logo.png"
                    alt="In Nutri 标志"
                    style={{ 
                      height: '2rem',
                      width: 'auto',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              </Link>
            </div>

            {/* 右侧导航和图标 - 靠右对齐 */}
            <div className="flex items-center gap-6 ml-auto" style={{ overflow: "visible", zIndex: 10001 }}>
              {/* 右侧导航文字菜单 */}
              {loading ? (
                <span className={`text-xs ${isScrolled || !isHomePage ? "text-gray-400" : "text-white/60"}`}>
                  加载中...
                </span>
              ) : (
                rightItems.slice(0, 2).map((item) => renderMenuItem(item))
              )}
              
              {/* 右侧图标 */}
              <div className={`flex items-center gap-3 pl-4 border-l transition-colors ${
                isScrolled || !isHomePage ? "border-gray-300" : "border-white/30"
              }`}>
                <button
                  className={`p-2 transition-colors ${isScrolled || !isHomePage ? "text-gray-900" : "text-white"} hover:opacity-80`}
                  aria-label="搜索"
                >
                  <Search size={18} />
                </button>
                <button
                  className={`p-2 transition-colors ${isScrolled || !isHomePage ? "text-gray-900" : "text-white"} hover:opacity-80`}
                  aria-label="会员"
                >
                  <User size={18} />
                </button>
                <button
                  className={`p-2 transition-colors ${isScrolled || !isHomePage ? "text-gray-900" : "text-white"} hover:opacity-80`}
                  aria-label="购物车"
                >
                  <ShoppingCart size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 二级菜单 - 在导航栏外部，相对于整个导航栏居中 */}
      {hoveredItem && (() => {
        const hoveredNavItem = [...leftItems, ...rightItems].find(item => item.id === hoveredItem);
        if (!hoveredNavItem || !hoveredNavItem.children || hoveredNavItem.children.length === 0) {
          return null;
        }
        return (
          <>
            {/* 过渡区域 - 连接按钮和菜单，避免鼠标移动时菜单消失 */}
            <div 
              className="fixed h-4"
              style={{ 
                zIndex: 10000,
                top: showPromoBanner ? 'calc(32px + 64px)' : '64px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'min(1200px, calc(100vw - 3rem))'
              }}
              onMouseEnter={() => {
                if (hoverTimeoutRef.current) {
                  clearTimeout(hoverTimeoutRef.current);
                  hoverTimeoutRef.current = null;
                }
                setHoveredItem(hoveredItem);
              }}
              onMouseLeave={() => {
                hoverTimeoutRef.current = setTimeout(() => {
                  setHoveredItem((prev) => prev === hoveredItem ? null : prev);
                  hoverTimeoutRef.current = null;
                }, 150);
              }}
            />
            <div 
              className="fixed pt-4 bg-white shadow-2xl rounded-lg border border-gray-200 overflow-hidden"
              style={{ 
                zIndex: 10001,
                display: 'block',
                visibility: 'visible',
                opacity: 1,
                top: showPromoBanner ? 'calc(32px + 64px + 4px)' : 'calc(64px + 4px)',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'min(1200px, calc(100vw - 3rem))'
              }}
              onMouseEnter={() => {
                if (hoverTimeoutRef.current) {
                  clearTimeout(hoverTimeoutRef.current);
                  hoverTimeoutRef.current = null;
                }
                setHoveredItem(hoveredItem);
              }}
              onMouseLeave={() => {
                hoverTimeoutRef.current = setTimeout(() => {
                  setHoveredItem((prev) => prev === hoveredItem ? null : prev);
                  hoverTimeoutRef.current = null;
                }, 150);
              }}
            >
              {/* 小三角形指示器 */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45 -mt-2"></div>
              
              {/* 三列布局 */}
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                {/* 左侧：二级链接列表 */}
                <div className="p-6 md:p-8">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-5">
                    浏览分类
                  </h3>
                  <ul className="space-y-2">
                    {hoveredNavItem.children.map((child) => (
                      <li key={child.id}>
                        <Link
                          href={getHref(child)}
                          target={child.openInNewTab ? "_blank" : "_self"}
                          className="block px-4 py-2.5 text-sm text-gray-800 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all duration-150"
                          onClick={() => setHoveredItem(null)}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 中间：主推产品 */}
                <div className="p-6 md:p-8">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    主推产品
                  </h3>
                  {loadingMenuData ? (
                    <div className="text-sm text-gray-400">加载中...</div>
                  ) : featuredProducts.length > 0 ? (
                    <div className="space-y-5">
                      {featuredProducts.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug}`}
                          className="flex gap-4 group"
                          onClick={() => setHoveredItem(null)}
                        >
                          <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                            {product.mainImage ? (
                              <Image
                                src={product.mainImage}
                                alt={product.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-200"
                                sizes="80px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                无图
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 group-hover:text-gray-700 line-clamp-2">
                              {product.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
                              {product.shortDescription || ""}
                            </p>
                            <p className="text-base font-semibold text-gray-900 mt-2">
                              {formatPrice(product.priceCents)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">暂无主推产品</div>
                  )}
                </div>

                {/* 右侧：品牌介绍 */}
                <div className="p-6 md:p-8">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    品牌介绍
                  </h3>
                  {loadingMenuData ? (
                    <div className="text-sm text-gray-400">加载中...</div>
                  ) : brandStory ? (
                    <div className="space-y-4">
                      <h4 className="text-base font-semibold text-gray-900">
                        {brandStory.heroTitle || "In Nutri"}
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {brandStory.mission || parseStoryBlocks(brandStory.storyBlocks || null) || "我们只做一件事：把\"超级食物\"还原成看得见的好原料。"}
                      </p>
                      <Link
                        href="/#philosophy"
                        className="inline-block text-sm font-medium text-gray-700 hover:text-gray-900 underline mt-2"
                        onClick={() => setHoveredItem(null)}
                      >
                        了解更多 →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h4 className="text-base font-semibold text-gray-900">
                        In Nutri
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        我们只做一件事：把"超级食物"还原成看得见的好原料。保持真实与克制，是因纽粹的独特态度。
                      </p>
                      <Link
                        href="/#philosophy"
                        className="inline-block text-sm font-medium text-gray-700 hover:text-gray-900 underline mt-2"
                        onClick={() => setHoveredItem(null)}
                      >
                        了解更多 →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        );
      })()}
    </>
  );
}
