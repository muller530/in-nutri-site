"use client";
export const runtime = 'nodejs'; // 使用 Node.js runtime，因为需要数据库连接

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditBrandStoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    heroTitle: "",
    heroSubtitle: "",
    mission: "",
    vision: "",
    brandTone: "",
    storyBlocks: "[]",
  });

  useEffect(() => {
    async function loadBrandStory() {
      try {
        const res = await fetch("/api/admin/brand-story");
        const data = await res.json();
        if (data.data) {
          setFormData({
            heroTitle: data.data.heroTitle || "",
            heroSubtitle: data.data.heroSubtitle || "",
            mission: data.data.mission || "",
            vision: data.data.vision || "",
            brandTone: data.data.brandTone || "",
            storyBlocks: data.data.storyBlocks || "[]",
          });
        }
      } catch {
        alert("加载品牌故事失败");
      } finally {
        setLoading(false);
      }
    }
    loadBrandStory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 处理 storyBlocks：如果是字符串，尝试解析为数组
      let storyBlocksArray: any[] = [];
      if (formData.storyBlocks) {
        try {
          storyBlocksArray = typeof formData.storyBlocks === "string" ? JSON.parse(formData.storyBlocks) : formData.storyBlocks;
          // 确保是数组
          if (!Array.isArray(storyBlocksArray)) {
            storyBlocksArray = [];
          }
        } catch {
          // 如果解析失败，使用空数组
          storyBlocksArray = [];
        }
      }

      const res = await fetch("/api/admin/brand-story", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          storyBlocks: storyBlocksArray,
        }),
      });
      const data = await res.json();
      if (data.error) alert("错误: " + JSON.stringify(data.error));
      else {
        router.push("/admin/brand-story");
        router.refresh();
      }
    } catch {
      alert("更新品牌故事失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>加载中...</div>;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">编辑品牌故事</h1>
      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">主标题</label>
          <input type="text" value={formData.heroTitle} onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">副标题</label>
          <input type="text" value={formData.heroSubtitle} onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">使命</label>
          <textarea value={formData.mission} onChange={(e) => setFormData({ ...formData, mission: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" rows={4} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">愿景</label>
          <textarea value={formData.vision} onChange={(e) => setFormData({ ...formData, vision: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" rows={4} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">品牌调性</label>
          <textarea value={formData.brandTone} onChange={(e) => setFormData({ ...formData, brandTone: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" rows={4} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">故事块（JSON 格式）</label>
          <textarea value={formData.storyBlocks} onChange={(e) => setFormData({ ...formData, storyBlocks: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm" rows={6} placeholder='[{&quot;title&quot;:&quot;标题&quot;,&quot;body&quot;:&quot;内容&quot;}]' />
          <p className="mt-1 text-xs text-gray-500">
            JSON 数组格式，例如: [{`{`}&quot;title&quot;:&quot;原产地严选&quot;,&quot;body&quot;:&quot;印尼可可、锡兰肉桂等&quot;{`}`}]
          </p>
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

