"use client";
export const runtime = 'nodejs'; // 使用 Node.js runtime，因为需要数据库连接

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    slug: "",
    name: "",
    shortDescription: "",
    longDescription: "",
    priceYuan: "",
    mainImage: "",
    gallery: "[]",
    tags: "",
    category: "",
    purchaseUrl: "",
    viewCount: "0",
    isFeatured: false,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("不支持的文件类型。仅支持 JPG、PNG、WEBP 格式");
      return;
    }

    // 验证文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("文件大小超过限制。最大支持 5MB");
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "include", // 确保发送认证 cookie
        body: uploadFormData,
      });

      const data = await res.json();
      if (data.error) {
        alert("上传失败: " + data.error);
      } else if (data.url) {
        setFormData({ ...formData, mainImage: data.url });
        alert("图片上传成功！");
      }
    } catch {
      alert("图片上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 将元转换为分
      const priceCents = Math.round(parseFloat(formData.priceYuan) * 100) || 0;

      // 处理tags：将逗号分隔的字符串转换为数组
      const tagsArray = formData.tags
        ? formData.tags.split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0)
        : [];

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          priceCents,
          tags: tagsArray,
        }),
      });

      const data = await res.json();
      if (data.error) {
        alert("错误: " + JSON.stringify(data.error));
      } else {
        router.push("/admin/products");
        router.refresh();
      }
    } catch {
      alert("创建产品失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">创建产品</h1>
      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">Slug *</label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">名称 *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">简短描述</label>
          <textarea
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">详细描述</label>
          <textarea
            value={formData.longDescription}
            onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            rows={5}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">价格（元） *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.priceYuan}
            onChange={(e) => setFormData({ ...formData, priceYuan: e.target.value })}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            placeholder="例如: 328.00"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">主图 *</label>
          <div className="mt-1 space-y-2">
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)] file:text-white hover:file:bg-[#2fb54a] disabled:opacity-50"
              />
              {uploading && <span className="text-sm text-gray-500">上传中...</span>}
            </div>
            {formData.mainImage && (
              <div className="mt-2">
                <div className="relative h-32 w-32">
                  <Image
                    src={formData.mainImage}
                    alt="预览"
                    fill
                    className="rounded border border-gray-300 object-cover"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">当前图片: {formData.mainImage}</p>
              </div>
            )}
            <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-800">
              <p className="font-semibold mb-1">图片要求：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>格式：JPG、PNG、WEBP</li>
                <li>尺寸：建议 800x800 像素或以上（正方形）</li>
                <li>大小：最大 5MB</li>
                <li>比例：建议 1:1（正方形）以获得最佳显示效果</li>
              </ul>
            </div>
            <div className="mt-2">
              <label className="block text-xs text-gray-500 mb-1">或手动输入图片 URL：</label>
              <input
                type="text"
                value={formData.mainImage}
                onChange={(e) => setFormData({ ...formData, mainImage: e.target.value })}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">标签</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            placeholder="用逗号分隔，例如：无蔗糖添加, 轻加工, 可可多酚"
          />
          <p className="mt-1 text-xs text-gray-500">多个标签请用逗号分隔</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">分类</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            placeholder="e.g. powder, drink, combo"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">购买链接 *</label>
          <input
            type="url"
            value={formData.purchaseUrl}
            onChange={(e) => setFormData({ ...formData, purchaseUrl: e.target.value })}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            placeholder="https://example.com/purchase"
            required
          />
          <p className="mt-1 text-xs text-gray-500">用户点击&ldquo;点击购买&rdquo;按钮后跳转的链接</p>
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">推荐</span>
          </label>
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-[var(--color-primary)] px-6 py-2 text-white hover:bg-[#2fb54a] disabled:opacity-50"
          >
            {loading ? "创建中..." : "创建产品"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}

