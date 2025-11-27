"use client";
export const runtime = 'edge';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditGalleryImagePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageId, setImageId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    alt: "",
    url: "",
    category: "",
    sortOrder: "0",
  });

  useEffect(() => {
    async function loadImage() {
      const resolvedParams = await params;
      const id = resolvedParams.id;
      setImageId(id);
      try {
        const res = await fetch(`/api/admin/gallery/${id}`);
        const data = await res.json();
        if (data.data) {
          setFormData({
            title: data.data.title || "",
            alt: data.data.alt || "",
            url: data.data.url || "",
            category: data.data.category || "",
            sortOrder: data.data.sortOrder?.toString() || "0",
          });
        }
      } catch {
        alert("加载图片失败");
      } finally {
        setLoading(false);
      }
    }
    loadImage();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/gallery/${imageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sortOrder: parseInt(formData.sortOrder) || 0,
        }),
      });
      const data = await res.json();
      if (data.error) alert("错误: " + JSON.stringify(data.error));
      else {
        router.push("/admin/gallery");
        router.refresh();
      }
    } catch {
      alert("更新图片失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>加载中...</div>;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">编辑图库图片</h1>
      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">URL *</label>
          <input type="text" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">标题</label>
          <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Alt 文本</label>
          <input type="text" value={formData.alt} onChange={(e) => setFormData({ ...formData, alt: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">分类</label>
          <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2">
            <option value="">请选择...</option>
            <option value="product">产品</option>
            <option value="lifestyle">生活方式</option>
            <option value="ingredient">原料</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">排序</label>
          <input type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
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

