"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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

export default function EditPartnerBrandPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<PartnerBrand>({
    id: 0,
    name: "",
    logoUrl: "",
    websiteUrl: "",
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchBrand();
  }, [id]);

  async function fetchBrand() {
    try {
      const res = await fetch(getApiUrl("/api/admin/partner-brands"), {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        const brand = data.data.find((b: PartnerBrand) => b.id === parseInt(id));
        if (brand) {
          setFormData(brand);
        }
      }
    } catch (error) {
      console.error("Failed to fetch partner brand:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      // 自动为 URL 添加协议前缀
      const processedData = {
        ...formData,
        logoUrl: formData.logoUrl ? ensureUrlProtocol(formData.logoUrl) : formData.logoUrl,
        websiteUrl: formData.websiteUrl ? ensureUrlProtocol(formData.websiteUrl) : null,
      };

      const res = await fetch(getApiUrl(`/api/admin/partner-brands/${id}`), {
        method: "PUT",
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
        alert(data.error || "更新失败");
      }
    } catch (error) {
      console.error("Failed to update partner brand:", error);
      alert("更新失败");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-6">加载中...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">编辑合作品牌</h1>
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
            value={formData.websiteUrl || ""}
            onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-[var(--color-primary)]"
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
            disabled={saving}
            className="rounded bg-[var(--color-primary)] px-4 py-2 text-white hover:bg-[#2fb54a] disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存"}
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



