"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface GalleryImage {
  id: number;
  imageUrl: string;
  alt?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function AboutGalleryAdminPage() {
  const [loading, setLoading] = useState(true);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState<Partial<GalleryImage>>({
    imageUrl: "",
    alt: "",
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    loadGallery();
  }, []);

  async function loadGallery() {
    try {
      const res = await fetch("/api/admin/about-gallery");
      const data = await res.json();
      if (data.data) {
        setGallery(data.data);
      }
    } catch (error) {
      alert("加载失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!formData.imageUrl || formData.imageUrl.trim() === "") {
      alert("请输入图片URL");
      return;
    }

    try {
      if (editingId) {
        const res = await fetch(`/api/admin/about-gallery/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.error) {
          alert("保存失败: " + data.error);
        } else {
          alert("保存成功！");
          setEditingId(null);
          setShowNewForm(false);
          resetForm();
          loadGallery();
        }
      } else {
        const res = await fetch("/api/admin/about-gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.error) {
          alert("创建失败: " + data.error);
        } else {
          alert("创建成功！");
          setShowNewForm(false);
          resetForm();
          loadGallery();
        }
      }
    } catch (error) {
      alert("操作失败");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("确定要删除这张图片吗？")) return;
    try {
      const res = await fetch(`/api/admin/about-gallery/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("删除成功！");
        loadGallery();
      } else {
        alert("删除失败");
      }
    } catch (error) {
      alert("删除失败");
    }
  }

  function startEdit(image: GalleryImage) {
    setEditingId(image.id);
    setShowNewForm(false);
    setFormData({
      imageUrl: image.imageUrl,
      alt: image.alt || "",
      sortOrder: image.sortOrder,
      isActive: image.isActive,
    });
  }

  function resetForm() {
    setFormData({
      imageUrl: "",
      alt: "",
      sortOrder: gallery.length,
      isActive: true,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setShowNewForm(false);
    resetForm();
  }

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/about-us" className="text-blue-600 hover:underline mb-2 inline-block">
            ← 返回关于我们管理
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">图片画廊管理</h1>
        </div>
        <button
          onClick={() => {
            setShowNewForm(true);
            setEditingId(null);
            resetForm();
          }}
          className="rounded bg-[var(--color-primary)] px-4 py-2 text-white hover:bg-[#2fb54a]"
        >
          添加图片
        </button>
      </div>

      {/* 编辑/新建表单 */}
      {(editingId !== null || showNewForm) && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            {editingId ? "编辑图片" : "新建图片"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">图片 URL *</label>
              <input
                type="text"
                value={formData.imageUrl || ""}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                placeholder="图片链接地址"
                required
              />
              {formData.imageUrl && (
                <div className="mt-2">
                  <img
                    src={formData.imageUrl}
                    alt="预览"
                    className="max-w-xs rounded border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Alt 文本</label>
              <input
                type="text"
                value={formData.alt || ""}
                onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                placeholder="图片描述"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">排序顺序</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                  }
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">启用</span>
                </label>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                className="rounded bg-[var(--color-primary)] px-6 py-2 text-white hover:bg-[#2fb54a]"
              >
                保存
              </button>
              <button
                onClick={cancelEdit}
                className="rounded border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 图片网格 */}
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {gallery.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            暂无图片，点击"添加图片"创建
          </div>
        ) : (
          gallery.map((item) => (
            <div key={item.id} className="relative group">
              <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={item.imageUrl}
                  alt={item.alt || "画廊图片"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => startEdit(item)}
                    className="px-4 py-2 bg-white text-gray-900 rounded hover:bg-gray-100"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    删除
                  </button>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {item.alt || "无描述"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

