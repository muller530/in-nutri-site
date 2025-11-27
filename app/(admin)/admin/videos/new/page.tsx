"use client";
export const runtime = 'edge';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  mainImage?: string;
}

export default function NewVideoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [inputMethod, setInputMethod] = useState<"url" | "upload">("upload");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    type: "",
    platform: "",
    url: "",
    coverImage: "",
    durationSec: "",
    productId: "",
    isActive: true,
  });

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/admin/products");
        const data = await res.json();
        if (data.data) {
          setProducts(data.data);
        }
      } catch {
        console.error("加载产品列表失败");
      } finally {
        setLoadingProducts(false);
      }
    }
    loadProducts();
  }, []);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    const allowedTypes = ["video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo", "video/webm"];
    if (!allowedTypes.includes(file.type)) {
      alert("不支持的文件类型。仅支持 MP4、MOV、AVI、WEBM 格式");
      return;
    }

    // 验证文件大小 (100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("文件大小超过限制。最大支持 100MB");
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const res = await fetch("/api/admin/upload-video", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await res.json();
      if (data.error) {
        alert("上传失败: " + data.error);
      } else if (data.url) {
        setInputMethod("upload"); // 确保切换到上传模式
        setFormData({ ...formData, url: data.url });
        alert("视频上传成功！");
      }
    } catch {
      alert("视频上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 验证至少有一种方式提供了视频URL
      if (!formData.url || formData.url.trim() === "") {
        alert("请填写视频 URL 或上传视频文件");
        setLoading(false);
        return;
      }

      console.log("提交的视频数据:", formData); // 调试信息

      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          durationSec: formData.durationSec ? parseInt(formData.durationSec) : null,
          productId: formData.productId ? parseInt(formData.productId) : null,
        }),
      });
      const data = await res.json();
      if (data.error) {
        console.error("保存错误:", data.error);
        alert("错误: " + JSON.stringify(data.error));
      } else {
        console.log("保存成功:", data.data);
        router.push("/admin/videos");
        router.refresh();
      }
    } catch (error) {
      console.error("保存失败:", error);
      alert("创建视频失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">创建视频</h1>
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
          <label className="block text-sm font-medium text-gray-700">类型</label>
          <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2">
            <option value="">请选择...</option>
            <option value="hero">首屏</option>
            <option value="howto">教程</option>
            <option value="brand">品牌</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">平台</label>
          <select value={formData.platform} onChange={(e) => setFormData({ ...formData, platform: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2">
            <option value="">请选择...</option>
            <option value="mp4">MP4</option>
            <option value="bilibili">Bilibili</option>
            <option value="douyin">抖音</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">视频 *</label>
          <div className="mt-1 space-y-3">
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="inputMethod"
                  value="upload"
                  checked={inputMethod === "upload"}
                  onChange={(e) => {
                    setInputMethod("upload");
                    // 如果当前URL不是上传的文件路径，清空URL
                    if (formData.url && !formData.url.startsWith("/uploads/videos/")) {
                      setFormData({ ...formData, url: "" });
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">上传视频文件</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="inputMethod"
                  value="url"
                  checked={inputMethod === "url"}
                  onChange={(e) => {
                    setInputMethod("url");
                    // 如果当前URL是上传的文件路径，清空URL
                    if (formData.url && formData.url.startsWith("/uploads/videos/")) {
                      setFormData({ ...formData, url: "" });
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">填写视频 URL</span>
              </label>
            </div>
            {inputMethod === "url" ? (
              <input
                type="text"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full rounded border border-gray-300 px-3 py-2"
                placeholder="https://example.com/video.mp4 或 /uploads/videos/xxx.mp4"
                required={inputMethod === "url"}
              />
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="video/mp4,video/mpeg,video/quicktime,video/x-msvideo,video/webm"
                    onChange={handleVideoUpload}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)] file:text-white hover:file:bg-[#2fb54a] disabled:opacity-50"
                  />
                  {uploading && <span className="text-sm text-gray-500">上传中...</span>}
                </div>
                {formData.url && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">已上传: {formData.url}</p>
                    <p className="text-xs text-green-600">✓ 视频已上传，点击创建即可</p>
                  </div>
                )}
                {!formData.url && (
                  <p className="text-xs text-orange-600">⚠ 请先上传视频文件</p>
                )}
                <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-800">
                  <p className="font-semibold mb-1">视频要求：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>格式：MP4、MOV、AVI、WEBM</li>
                    <li>大小：最大 100MB</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">封面图片 URL</label>
          <input type="text" value={formData.coverImage} onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">关联产品（用于显示产品小图）</label>
          <select
            value={formData.productId}
            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            disabled={loadingProducts}
          >
            <option value="">不关联产品</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">选择产品后，视频左下角会显示该产品的图片</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">时长（秒）</label>
          <input type="number" value={formData.durationSec} onChange={(e) => setFormData({ ...formData, durationSec: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="flex items-center">
            <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="mr-2" />
            <span className="text-sm font-medium text-gray-700">激活</span>
          </label>
        </div>
        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="rounded bg-[var(--color-primary)] px-6 py-2 text-white hover:bg-[#2fb54a] disabled:opacity-50">
            {loading ? "创建中..." : "创建视频"}
          </button>
          <button type="button" onClick={() => router.back()} className="rounded border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50">
            取消
          </button>
        </div>
      </form>
    </div>
  );
}

