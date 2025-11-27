"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [articleId, setArticleId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    summary: "",
    content: "",
    coverImage: "",
    published: false,
  });

  useEffect(() => {
    async function loadArticle() {
      const resolvedParams = await params;
      const id = resolvedParams.id;
      setArticleId(id);
      try {
        const res = await fetch(`/api/admin/articles/${id}`);
        const data = await res.json();
        if (!res.ok) {
          alert(`加载文章失败: ${data.error || "未知错误"}`);
          return;
        }
        if (data.data) {
          setFormData({
            slug: data.data.slug || "",
            title: data.data.title || "",
            summary: data.data.summary || "",
            content: data.data.content || "",
            coverImage: data.data.coverImage || "",
            published: data.data.published || false,
          });
        } else {
          alert("文章未找到");
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Network error";
        alert(`加载文章失败: ${message}`);
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/articles/${articleId}`, {
        method: "PUT",
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
      alert("更新文章失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>加载中...</div>;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">编辑文章</h1>
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

