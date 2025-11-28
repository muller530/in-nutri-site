"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewBannerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [inputMethod, setInputMethod] = useState<"url" | "upload">("url");
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

  const handleVideoUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload-video", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.error) {
        alert("视频上传失败: " + data.error);
        return;
      }

      setFormData((prev) => ({ ...prev, image: data.url }));
      alert("视频上传成功！");
    } catch (error) {
      console.error("视频上传错误:", error);
      alert("视频上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 验证文件类型
      const allowedTypes = ["video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo", "video/webm"];
      if (!allowedTypes.includes(file.type)) {
        alert("不支持的文件类型。仅支持 MP4、MOV、AVI、WEBM 格式。");
        return;
      }

      // 验证文件大小 (最大 100MB)
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("文件大小超过限制。最大支持 100MB。");
        return;
      }

      handleVideoUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
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
      alert("创建横幅失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">创建横幅</h1>
      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">标识 * (例如: home-hero)</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            首页视频/图片 URL（用于首页第一屏背景视频）
          </label>
          <div className="mb-3 flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="inputMethod"
                value="url"
                checked={inputMethod === "url"}
                onChange={() => setInputMethod("url")}
                className="mr-2"
              />
              <span className="text-sm">输入 URL</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="inputMethod"
                value="upload"
                checked={inputMethod === "upload"}
                onChange={() => setInputMethod("upload")}
                className="mr-2"
              />
              <span className="text-sm">上传视频文件</span>
            </label>
          </div>

          {inputMethod === "url" ? (
            <div>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="输入视频或图片 URL（例如：https://example.com/video.mp4 或 /uploads/videos/video.mp4）"
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              />
              <p className="mt-1 text-xs text-gray-500">
                支持视频格式：MP4、MOV、AVI、WEBM。如果输入图片 URL，将显示为静态背景。
              </p>
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept="video/mp4,video/mpeg,video/quicktime,video/x-msvideo,video/webm"
                onChange={handleFileChange}
                disabled={uploading}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              />
              {uploading && <p className="mt-2 text-sm text-blue-600">上传中...</p>}
              {formData.image && (
                <div className="mt-2">
                  <p className="text-sm text-green-600">✓ 视频已上传</p>
                  <p className="text-xs text-gray-500 mt-1">URL: {formData.image}</p>
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                支持格式：MP4、MOV、AVI、WEBM。最大文件大小：100MB。
              </p>
            </div>
          )}
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
          <button type="submit" disabled={loading} className="rounded bg-[var(--color-primary)] px-6 py-2 text-white hover:bg-[#2fb54a] disabled:opacity-50">
            {loading ? "创建中..." : "创建横幅"}
          </button>
          <button type="button" onClick={() => router.back()} className="rounded border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50">
            取消
          </button>
        </div>
      </form>
    </div>
  );
}

