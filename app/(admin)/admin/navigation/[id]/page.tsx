"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditNavigationPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parentMenus, setParentMenus] = useState<Array<{ id: number; label: string; type: string }>>([]);
  const [formData, setFormData] = useState({
    label: "",
    url: "",
    type: "link",
    pageType: "",
    pageSlug: "",
    position: "left",
    sortOrder: "0",
    parentId: "",
    isActive: true,
    openInNewTab: false,
  });

  // 加载父菜单列表（只显示 dropdown 类型的一级菜单，排除当前编辑的菜单）
  useEffect(() => {
    async function loadParentMenus() {
      try {
        const res = await fetch("/api/admin/navigation");
        const data = await res.json();
        if (data.data) {
          // 只显示类型为 dropdown 且没有父菜单的一级菜单，排除当前编辑的菜单
          const dropdownMenus = data.data.filter(
            (item: any) => item.type === "dropdown" && !item.parentId && item.id !== parseInt(id)
          );
          setParentMenus(dropdownMenus);
        }
      } catch (error) {
        console.error("Failed to load parent menus:", error);
      }
    }
    if (id) {
      loadParentMenus();
    }
  }, [id]);

  // 当选择父菜单时，自动继承父菜单的位置
  useEffect(() => {
    if (formData.parentId) {
      async function getParentPosition() {
        try {
          const res = await fetch(`/api/admin/navigation/${formData.parentId}`);
          const data = await res.json();
          if (data.data && data.data.position) {
            setFormData((prev) => ({ ...prev, position: data.data.position }));
          }
        } catch (error) {
          console.error("Failed to get parent position:", error);
        }
      }
      getParentPosition();
    }
  }, [formData.parentId]);

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
      fetchItem(p.id);
    });
  }, [params]);

  async function fetchItem(itemId: string) {
    try {
      const res = await fetch(`/api/admin/navigation/${itemId}`);
      const data = await res.json();
      if (data.data) {
        const item = data.data;
        
        // 如果是子菜单，需要获取父菜单的位置
        let position = item.position || "left";
        if (item.parentId) {
          try {
            const parentRes = await fetch(`/api/admin/navigation/${item.parentId}`);
            const parentData = await parentRes.json();
            if (parentData.data) {
              position = parentData.data.position || "left";
            }
          } catch {
            // 忽略错误，使用默认位置
          }
        }
        
        setFormData({
          label: item.label || "",
          url: item.url || "",
          type: item.type || "link",
          pageType: item.pageType || "",
          pageSlug: item.pageSlug || "",
          position: position,
          sortOrder: String(item.sortOrder || 0),
          parentId: item.parentId ? String(item.parentId) : "",
          isActive: item.isActive !== false,
          openInNewTab: item.openInNewTab || false,
        });
      }
    } catch (error) {
      console.error("Failed to fetch navigation item:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 如果是子菜单，位置从父菜单继承
      let position = formData.position;
      if (formData.parentId) {
        try {
          const parentRes = await fetch(`/api/admin/navigation/${formData.parentId}`);
          const parentData = await parentRes.json();
          if (parentData.data && parentData.data.position) {
            position = parentData.data.position;
          }
        } catch {
          // 忽略错误，使用表单中的位置
        }
      }

      const payload: any = {
        label: formData.label,
        position: position,
        sortOrder: parseInt(formData.sortOrder) || 0,
        isActive: formData.isActive,
        openInNewTab: formData.openInNewTab,
      };

      if (formData.type === "link") {
        payload.type = "link";
        payload.url = formData.url || null;
      } else if (formData.type === "page") {
        payload.type = "page";
        payload.pageType = formData.pageType;
        payload.pageSlug = formData.pageSlug || null;
        // 如果是自定义路径，使用 url 字段
        if (formData.pageType === "custom") {
          payload.url = formData.url || null;
        } else {
          payload.url = null;
        }
      } else if (formData.type === "dropdown") {
        payload.type = "dropdown";
        // dropdown 类型不需要 URL 或页面设置
        payload.url = null;
        payload.pageType = null;
        payload.pageSlug = null;
      }

      if (formData.parentId) {
        payload.parentId = parseInt(formData.parentId);
      } else {
        payload.parentId = null;
      }

      const res = await fetch(`/api/admin/navigation/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.error) {
        alert("错误: " + JSON.stringify(data.error));
      } else {
        router.push("/admin/navigation");
        router.refresh();
      }
    } catch {
      alert("更新导航项失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">加载中...</div>;
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">编辑导航项</h1>
      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">标签 *</label>
          <input
            type="text"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">位置 *</label>
          <select
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            required
            disabled={!!formData.parentId}
          >
            <option value="left">左侧（最多2个）</option>
            <option value="right">右侧（最多2个）</option>
          </select>
          {formData.parentId && (
            <p className="mt-1 text-xs text-gray-500">子菜单的位置继承自父菜单</p>
          )}
        </div>

        {/* 父菜单选择 - 如果选择父菜单，则这是子菜单 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">父菜单</label>
          <select
            value={formData.parentId}
            onChange={(e) => {
              const newParentId = e.target.value;
              setFormData({ 
                ...formData, 
                parentId: newParentId,
                // 如果是子菜单，重置类型为 link
                type: newParentId ? "link" : formData.type,
                // 清除 URL 和页面设置
                url: "",
                pageType: "",
                pageSlug: "",
              });
            }}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          >
            <option value="">无（一级菜单）</option>
            {parentMenus.map((menu) => (
              <option key={menu.id} value={menu.id}>
                {menu.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            {formData.parentId 
              ? "当前编辑的是子菜单，只能选择外链或内部页面" 
              : "留空则为一级菜单，可以选择外链、内部页面或下拉菜单"}
          </p>
        </div>

        {/* 类型选择 - 根据是否为子菜单显示不同选项 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">类型 *</label>
          <select
            value={formData.type}
            onChange={(e) => {
              const newType = e.target.value;
              setFormData({ 
                ...formData, 
                type: newType,
                // 切换类型时清除相关字段
                url: newType !== "link" ? "" : formData.url,
                pageType: newType !== "page" ? "" : formData.pageType,
                pageSlug: newType !== "page" ? "" : formData.pageSlug,
              });
            }}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            required
          >
            {formData.parentId ? (
              // 子菜单：只能选择外链或内部页面
              <>
                <option value="link">外链</option>
                <option value="page">网站的二级页面</option>
              </>
            ) : (
              // 一级菜单：可以选择外链、内部页面或下拉菜单
              <>
                <option value="link">外链</option>
                <option value="page">网站的二级页面</option>
                <option value="dropdown">下拉二级菜单</option>
              </>
            )}
          </select>
        </div>

        {/* 外链设置 */}
        {formData.type === "link" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">链接地址 *</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              placeholder="https://example.com"
              required
            />
          </div>
        )}

        {/* 内部页面设置 */}
        {formData.type === "page" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">页面类型 *</label>
              <select
                value={formData.pageType}
                onChange={(e) => setFormData({ ...formData, pageType: e.target.value })}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                required
              >
                <option value="">请选择</option>
                <option value="products">产品</option>
                <option value="videos">达人种草（视频）</option>
                <option value="recipes">食谱</option>
                <option value="articles">文章</option>
                <option value="custom">自定义路径</option>
              </select>
            </div>
            {formData.pageType && formData.pageType !== "custom" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">页面 Slug（可选）</label>
                <input
                  type="text"
                  value={formData.pageSlug}
                  onChange={(e) => setFormData({ ...formData, pageSlug: e.target.value })}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  placeholder="留空则跳转到列表页"
                />
                <p className="mt-1 text-xs text-gray-500">
                  例如：product-slug（产品slug）或留空跳转到产品列表
                </p>
              </div>
            )}
            {formData.pageType === "custom" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">自定义路径 *</label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  placeholder="/custom-path"
                  required
                />
              </div>
            )}
          </>
        )}

        {/* 下拉菜单提示 */}
        {formData.type === "dropdown" && !formData.parentId && (
          <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">下拉菜单说明：</p>
            <p>选择"下拉二级菜单"后，此菜单项将作为父菜单。创建子菜单时，请在"父菜单"中选择此菜单项。</p>
            <p className="mt-2">下拉菜单不需要设置链接地址或页面。</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">排序顺序</label>
          <input
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">激活</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.openInNewTab}
              onChange={(e) => setFormData({ ...formData, openInNewTab: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">在新标签页打开</span>
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-[var(--color-primary)] px-6 py-2 text-white hover:bg-[#2fb54a] disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存更改"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}

