"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewNavigationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        label: formData.label,
        position: formData.position,
        sortOrder: parseInt(formData.sortOrder) || 0,
        isActive: formData.isActive,
        openInNewTab: formData.openInNewTab,
      };

      if (formData.type === "link") {
        payload.type = "link";
        payload.url = formData.url;
      } else if (formData.type === "page") {
        payload.type = "page";
        payload.pageType = formData.pageType;
        payload.pageSlug = formData.pageSlug || null;
      } else if (formData.type === "dropdown") {
        payload.type = "dropdown";
      }

      if (formData.parentId) {
        payload.parentId = parseInt(formData.parentId);
      }

      const res = await fetch("/api/admin/navigation", {
        method: "POST",
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
      alert("创建导航项失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">新建导航项</h1>
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
          >
            <option value="left">左侧（最多2个）</option>
            <option value="right">右侧（最多2个）</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">类型 *</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            required
          >
            <option value="link">外部链接</option>
            <option value="page">内部页面</option>
            <option value="dropdown">下拉菜单</option>
          </select>
        </div>

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

        <div>
          <label className="block text-sm font-medium text-gray-700">排序顺序</label>
          <input
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            defaultValue="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">父菜单（用于创建子菜单）</label>
          <input
            type="number"
            value={formData.parentId}
            onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            placeholder="留空则为顶级菜单"
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
            disabled={loading}
            className="rounded bg-[var(--color-primary)] px-6 py-2 text-white hover:bg-[#2fb54a] disabled:opacity-50"
          >
            {loading ? "创建中..." : "创建导航项"}
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

