"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/api";
import { ensureUrlProtocol } from "@/lib/urlUtils";

export default function NewPartnerBrandPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    logoUrl: "",
    websiteUrl: "",
    sortOrder: 0,
    isActive: true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // 自动为 URL 添加协议前缀
      const processedData = {
        ...formData,
        logoUrl: formData.logoUrl ? ensureUrlProtocol(formData.logoUrl) : formData.logoUrl,
        websiteUrl: formData.websiteUrl ? ensureUrlProtocol(formData.websiteUrl) : null,
      };

      const res = await fetch(getApiUrl("/api/admin/partner-brands"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(processedData),
      });

      if (res.ok) {
        router.push("/admin/partner-brands");
      } else {
        const data = await res.json();
        alert(data.error || "创建失败");
      }
    } catch (error) {
      console.error("Failed to create partner brand:", error);
      alert("创建失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">添加合作品牌</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">品牌名称 *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-[var(--color-primary)]"
            placeholder="例如：Forbes"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Logo URL *</label>
          <input
            type="url"
            required
            value={formData.logoUrl}
            onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-[var(--color-primary)]"
            placeholder="example.com/logo.png 或 https://example.com/logo.png"
          />
          {formData.logoUrl && (
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-2">预览：</p>
              <div className="relative h-16 w-48 border border-gray-200 rounded bg-gray-50 flex items-center justify-center">
                <img
                  src={formData.logoUrl}
                  alt="预览"
                  className="max-h-12 max-w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">网站链接（可选）</label>
          <input
            type="url"
            value={formData.websiteUrl}
            onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-[var(--color-primary)]"
            placeholder="example.com 或 https://example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">排序顺序</label>
          <input
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-[var(--color-primary)]"
          />
          <p className="mt-1 text-sm text-gray-500">数字越小越靠前</p>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            />
            <span className="ml-2 text-sm text-gray-700">激活</span>
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-[var(--color-primary)] px-4 py-2 text-white hover:bg-[#2fb54a] disabled:opacity-50"
          >
            {loading ? "创建中..." : "创建"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}



