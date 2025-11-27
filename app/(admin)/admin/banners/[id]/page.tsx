"use client";
export const runtime = 'edge';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bannerId, setBannerId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    key: "",
    title: "",
    subtitle: "",
    description: "",
    image: "",
    linkUrl: "",
    position: "0",
    isActive: true,
  });

  useEffect(() => {
    async function loadBanner() {
      const resolvedParams = await params;
      const id = resolvedParams.id;
      setBannerId(id);
      try {
        const res = await fetch(`/api/admin/banners/${id}`);
        const data = await res.json();
        if (data.data) {
          setFormData({
            key: data.data.key || "",
            title: data.data.title || "",
            subtitle: data.data.subtitle || "",
            description: data.data.description || "",
            image: data.data.image || "",
            linkUrl: data.data.linkUrl || "",
            position: data.data.position?.toString() || "0",
            isActive: data.data.isActive || false,
          });
        }
      } catch {
        alert("加载横幅失败");
      } finally {
        setLoading(false);
      }
    }
    loadBanner();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/banners/${bannerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, position: parseInt(formData.position) || 0 }),
      });
      const data = await res.json();
      if (data.error) alert("错误: " + JSON.stringify(data.error));
      else {
        router.push("/admin/banners");
        router.refresh();
      }
    } catch {
      alert("更新横幅失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>加载中...</div>;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">编辑横幅</h1>
      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">标识 *</label>
          <input type="text" value={formData.key} onChange={(e) => setFormData({ ...formData, key: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">标题</label>
          <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">副标题</label>
          <input type="text" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">图片 URL</label>
          <input type="text" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">链接 URL</label>
          <input type="text" value={formData.linkUrl} onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">位置</label>
          <input type="number" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="flex items-center">
            <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="mr-2" />
            <span className="text-sm font-medium text-gray-700">激活</span>
          </label>
        </div>
        <div className="flex gap-4">
          <button type="submit" disabled={saving} className="rounded bg-[var(--color-primary)] px-6 py-2 text-white hover:bg-[#2fb54a] disabled:opacity-50">
            {saving ? "保存中..." : "保存更改"}
          </button>
          <button type="button" onClick={() => router.back()} className="rounded border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50">
            取消
          </button>
        </div>
      </form>
    </div>
  );
}

