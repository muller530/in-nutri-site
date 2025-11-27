"use client";
export const runtime = 'edge';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    summary: "",
    content: "",
    coverImage: "",
    published: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.error) alert("错误: " + JSON.stringify(data.error));
      else {
        router.push("/admin/articles");
        router.refresh();
      }
    } catch {
      alert("创建文章失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">创建文章</h1>
      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">Slug *</label>
          <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">标题 *</label>
          <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">摘要</label>
          <textarea value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" rows={3} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">内容</label>
          <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" rows={10} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">封面图片 URL</label>
          <input type="text" value={formData.coverImage} onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="flex items-center">
            <input type="checkbox" checked={formData.published} onChange={(e) => setFormData({ ...formData, published: e.target.checked })} className="mr-2" />
            <span className="text-sm font-medium text-gray-700">已发布</span>
          </label>
        </div>
        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="rounded bg-[var(--color-primary)] px-6 py-2 text-white hover:bg-[#2fb54a] disabled:opacity-50">
            {loading ? "创建中..." : "创建文章"}
          </button>
          <button type="button" onClick={() => router.back()} className="rounded border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50">
            取消
          </button>
        </div>
      </form>
    </div>
  );
}

