import { getApiUrl } from "@/lib/api";
import { Navigation } from "./Navigation";

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

async function getNavigationData() {
  try {
    const navRes = await fetch(getApiUrl("/api/navigation"), {
      next: { revalidate: 60 },
    });
    if (navRes.ok) {
      const navData = await navRes.json();
      const items = navData.data || [];
      
      // 构建导航树结构
      const parentItems = items.filter((item: NavigationItem) => !item.parentId);
      const childrenMap = new Map<number, NavigationItem[]>();
      
      items.forEach((item: NavigationItem) => {
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

      return parentItems.map(buildTree).sort((a, b) => a.sortOrder - b.sortOrder);
    }
  } catch {
    // 忽略错误
  }
  return [];
}

async function getSiteSettings() {
  try {
    const settingsRes = await fetch(getApiUrl("/api/site-settings"), {
      next: { revalidate: 60 },
    });
    if (settingsRes.ok) {
      const settingsData = await settingsRes.json();
      return settingsData.data || null;
    }
  } catch {
    // 忽略错误
  }
  return null;
}

export async function NavigationServer() {
  const navItems = await getNavigationData();
  const siteSettings = await getSiteSettings();

  return <Navigation initialNavItems={navItems} initialSiteSettings={siteSettings} />;
}

