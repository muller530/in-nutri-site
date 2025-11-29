"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
}

export default function NavigationPage() {
  const router = useRouter();
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const res = await fetch("/api/admin/navigation");
      const data = await res.json();
      if (data.data) {
        setItems(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch navigation items:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("确定要删除这个导航项吗？")) return;

    try {
      const res = await fetch(`/api/admin/navigation/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        alert("删除失败: " + data.error);
      } else {
        fetchItems();
      }
    } catch (error) {
      alert("删除失败");
    }
  }

  async function handleToggleActive(id: number, currentStatus: boolean) {
    try {
      const res = await fetch(`/api/admin/navigation/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.error) {
        alert("更新失败: " + data.error);
      } else {
        fetchItems();
      }
    } catch (error) {
      alert("更新失败");
    }
  }

  const leftItems = items.filter((item) => item.position === "left" && !item.parentId);
  const rightItems = items.filter((item) => item.position === "right" && !item.parentId);

  const getChildren = (parentId: number) => {
    return items.filter((item) => item.parentId === parentId);
  };

  if (loading) {
    return <div className="p-6">加载中...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">导航菜单管理</h1>
        <Link
          href="/admin/navigation/new"
          className="rounded bg-[var(--color-primary)] px-6 py-2 text-white hover:bg-[#2fb54a]"
        >
          新建导航项
        </Link>
      </div>

      <div className="space-y-6">
        {/* 左侧导航 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">左侧导航（最多2个）</h2>
          {leftItems.length === 0 ? (
            <p className="text-gray-500">暂无左侧导航项</p>
          ) : (
            <div className="space-y-2">
              {leftItems.map((item) => (
                <NavigationItemRow
                  key={item.id}
                  item={item}
                  children={getChildren(item.id)}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                  onEdit={() => router.push(`/admin/navigation/${item.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* 右侧导航 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">右侧导航（最多2个）</h2>
          {rightItems.length === 0 ? (
            <p className="text-gray-500">暂无右侧导航项</p>
          ) : (
            <div className="space-y-2">
              {rightItems.map((item) => (
                <NavigationItemRow
                  key={item.id}
                  item={item}
                  children={getChildren(item.id)}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                  onEdit={() => router.push(`/admin/navigation/${item.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NavigationItemRow({
  item,
  children,
  onDelete,
  onToggleActive,
  onEdit,
}: {
  item: NavigationItem;
  children: NavigationItem[];
  onDelete: (id: number) => void;
  onToggleActive: (id: number, currentStatus: boolean) => void;
  onEdit: () => void;
}) {
  const getDisplayUrl = () => {
    if (item.type === "page" && item.pageType) {
      return `页面: ${item.pageType}${item.pageSlug ? ` / ${item.pageSlug}` : ""}`;
    }
    return item.url || "无链接";
  };

  return (
    <div className="rounded border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{item.label}</span>
            {!item.isActive && (
              <span className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-600">未激活</span>
            )}
            {item.type === "dropdown" && (
              <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">下拉菜单</span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">{getDisplayUrl()}</p>
          {children.length > 0 && (
            <div className="mt-2 ml-4 space-y-1">
              {children.map((child) => (
                <div key={child.id} className="text-sm text-gray-600">
                  └ {child.label}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onToggleActive(item.id, item.isActive)}
            className={`rounded px-3 py-1 text-sm ${
              item.isActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {item.isActive ? "激活" : "未激活"}
          </button>
          <button
            onClick={onEdit}
            className="rounded bg-blue-100 px-3 py-1 text-sm text-blue-700 hover:bg-blue-200"
          >
            编辑
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="rounded bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
}

