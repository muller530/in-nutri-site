"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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
          const imageUrl = data.data.image || "";
          setFormData({
            key: data.data.key || "",
            title: data.data.title || "",
            subtitle: data.data.subtitle || "",
            description: data.data.description || "",
            image: imageUrl,
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

  const handleVideoUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload-video", {
        method: "POST",
        credentials: "include", // 确保发送认证 cookie
        body: formData,
      });

      const data = await res.json();
      if (data.error) {
        alert("视频上传失败: " + data.error);
        return;
      }

      const newImageUrl = data.url;
      if (!newImageUrl) {
        alert("视频上传失败：未返回 URL");
        return;
      }
      setFormData((prev) => {
        const updated = { ...prev, image: newImageUrl };
        console.log("formData 已更新，新的 image 值:", updated.image);
        return updated;
      });
      console.log("视频上传成功，URL 已更新:", newImageUrl);
      alert(`视频上传成功！URL: ${newImageUrl}\n请点击"保存更改"按钮保存到数据库。`);
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
    if (!bannerId) return;
    setSaving(true);
    try {
      // 确保 image 字段被包含在提交数据中
      const submitData = {
        ...formData,
        position: parseInt(formData.position) || 0,
        image: formData.image || "", // 确保 image 字段存在
      };
      
      console.log("提交的数据:", submitData); // 调试信息
      
      const res = await fetch(`/api/admin/banners/${bannerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 确保发送认证 cookie
        body: JSON.stringify(submitData),
      });
      const data = await res.json();
      if (data.error) {
        console.error("更新错误:", data.error);
        alert("错误: " + JSON.stringify(data.error));
      } else {
        console.log("更新成功:", data.data);
        console.log("保存的 image 值:", data.data?.image);
        // 确保保存成功后再跳转
        if (data.data?.image) {
          alert(`保存成功！视频 URL: ${data.data.image}`);
        }
        router.push("/admin/banners");
        router.refresh();
      }
    } catch (error) {
      console.error("更新横幅失败:", error);
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            首页视频（用于首页第一屏背景视频）
          </label>
          <div>
            {formData.image && (
              <div className="mb-3 p-3 bg-gray-50 rounded border">
                <p className="text-sm text-gray-700 mb-1">当前视频：</p>
                <p className="text-xs text-gray-500 break-all">{formData.image}</p>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                  className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                >
                  删除当前视频
                </button>
              </div>
            )}
            <input
              type="file"
              accept="video/mp4,video/mpeg,video/quicktime,video/x-msvideo,video/webm"
              onChange={handleFileChange}
              disabled={uploading}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
            {uploading && <p className="mt-2 text-sm text-blue-600">上传中...</p>}
            {formData.image && !uploading && (
              <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                <p className="text-sm text-green-600 font-medium">✓ 视频已上传</p>
                <p className="text-xs text-gray-600 mt-1 break-all">URL: {formData.image}</p>
                <p className="text-xs text-amber-600 mt-1 font-medium">⚠️ 重要：请点击下方的"保存更改"按钮保存到数据库</p>
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">
              支持格式：MP4、MOV、AVI、WEBM。最大文件大小：100MB。
            </p>
          </div>
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

