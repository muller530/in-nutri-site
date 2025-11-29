"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";

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

interface NavigationProps {
  transparent?: boolean;
}

export function Navigation({ transparent = true }: NavigationProps) {
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNavigation() {
      try {
        const apiUrl = getApiUrl("/api/navigation");
        console.log("Navigation: 获取导航数据，URL:", apiUrl);
        
        const res = await fetch(apiUrl, {
          cache: "no-store",
        });
        
        console.log("Navigation: API 响应状态:", res.status);
        
        if (!res.ok) {
          console.error("Navigation: API 返回错误状态:", res.status);
          setLoading(false);
          return;
        }
        
        const data = await res.json();
        console.log("Navigation: 接收到的数据:", data);
        
        if (data.data && Array.isArray(data.data)) {
          // 构建层级结构
          const items = data.data as NavigationItem[];
          console.log("Navigation: 原始导航项数量:", items.length);
          
          const parentItems = items.filter((item) => !item.parentId);
          console.log("Navigation: 顶级导航项数量:", parentItems.length);
          
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

          const sortedItems = parentItems.map(buildTree).sort((a, b) => a.sortOrder - b.sortOrder);
          console.log("Navigation: 处理后的导航项:", sortedItems);
          setNavItems(sortedItems);
        } else {
          console.warn("Navigation: 数据格式不正确或为空");
        }
      } catch (error) {
        console.error("Navigation: 获取导航数据失败:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNavigation();
  }, []);

  const getHref = (item: NavigationItem): string => {
    if (item.type === "page" && item.pageType) {
      // 内部页面链接
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

  // 调试信息
  useEffect(() => {
    console.log("Navigation: 当前导航项状态:", {
      total: navItems.length,
      left: leftItems.length,
      right: rightItems.length,
      items: navItems,
    });
  }, [navItems, leftItems, rightItems]);

  const renderMenuItem = (item: NavigationItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const href = getHref(item);

    if (hasChildren) {
      return (
        <div
          key={item.id}
          className="relative"
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              transparent
                ? "text-white hover:text-white/80"
                : "text-gray-900 hover:text-gray-600"
            }`}
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
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          transparent
            ? "text-white hover:text-white/80"
            : "text-gray-900 hover:text-gray-600"
        }`}
      >
        {item.label}
      </Link>
    );
  };

  // 即使没有导航项，也显示导航栏（至少显示 Logo）
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all ${
        transparent
          ? "bg-transparent backdrop-blur-sm"
          : "bg-white/95 backdrop-blur-sm shadow-sm"
      }`}
    >
      <div className="page-shell">
        <div className="flex items-center justify-between h-16">
          {/* 左侧导航 */}
          <div className="flex items-center gap-2 min-w-[120px]">
            {loading ? (
              <span className={`text-xs ${transparent ? "text-white/60" : "text-gray-400"}`}>
                加载中...
              </span>
            ) : (
              leftItems.slice(0, 2).map((item) => renderMenuItem(item))
            )}
          </div>

          {/* Logo 居中 */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo.png"
              width={120}
              height={40}
              alt="In Nutri 标志"
              className="h-10 w-auto"
              priority
              unoptimized={true}
            />
          </Link>

          {/* 右侧导航 */}
          <div className="flex items-center gap-2 min-w-[120px] justify-end">
            {loading ? (
              <span className={`text-xs ${transparent ? "text-white/60" : "text-gray-400"}`}>
                加载中...
              </span>
            ) : (
              rightItems.slice(0, 2).map((item) => renderMenuItem(item))
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

