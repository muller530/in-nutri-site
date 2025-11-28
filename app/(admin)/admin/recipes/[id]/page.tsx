"use client";
export const runtime = 'nodejs'; // 使用 Node.js runtime，因为需要数据库连接

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recipeId, setRecipeId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    slug: "",
    name: "",
    description: "",
    ingredients: "[]",
    steps: "[]",
    heroImage: "",
    relatedProductSlugs: "[]",
    difficulty: "",
  });

  useEffect(() => {
    async function loadRecipe() {
      const resolvedParams = await params;
      const id = resolvedParams.id;
      setRecipeId(id);
      try {
        const res = await fetch(`/api/admin/recipes/${id}`);
        const data = await res.json();
        if (data.data) {
          setFormData({
            slug: data.data.slug || "",
            name: data.data.name || "",
            description: data.data.description || "",
            ingredients: data.data.ingredients || "[]",
            steps: data.data.steps || "[]",
            heroImage: data.data.heroImage || "",
            relatedProductSlugs: data.data.relatedProductSlugs || "[]",
            difficulty: data.data.difficulty || "",
          });
        }
      } catch {
        alert("加载食谱失败");
      } finally {
        setLoading(false);
      }
    }
    loadRecipe();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/recipes/${recipeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.error) alert("错误: " + JSON.stringify(data.error));
      else {
        router.push("/admin/recipes");
        router.refresh();
      }
    } catch {
      alert("更新食谱失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>加载中...</div>;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">编辑食谱</h1>
      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">Slug *</label>
          <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">名称 *</label>
          <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">描述</label>
          <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" rows={3} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">难度</label>
          <select value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2">
            <option value="">请选择...</option>
            <option value="easy">简单</option>
            <option value="normal">普通</option>
            <option value="hard">困难</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">主图 URL</label>
          <input type="text" value={formData.heroImage} onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
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

