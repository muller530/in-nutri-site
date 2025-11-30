"use client";
export const runtime = 'nodejs'; // 使用 Node.js runtime，因为需要数据库连接

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ensureUrlProtocol } from "@/lib/urlUtils";

export default function SiteSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    douyinUrl: "",
    xiaohongshuUrl: "",
    tmallUrl: "",
    jdUrl: "",
    qualityReportUrl: "",
    promotionalBannerText: "",
    promotionalBannerUrl: "",
    promotionalBannerActive: false,
    logoTagline: "",
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/site-settings");
        const data = await res.json();
        if (data.data) {
          setFormData({
            douyinUrl: data.data.douyinUrl || "",
            xiaohongshuUrl: data.data.xiaohongshuUrl || "",
            tmallUrl: data.data.tmallUrl || "",
            jdUrl: data.data.jdUrl || "",
            qualityReportUrl: data.data.qualityReportUrl || "",
            promotionalBannerText: data.data.promotionalBannerText || "",
            promotionalBannerUrl: data.data.promotionalBannerUrl || "",
            promotionalBannerActive: data.data.promotionalBannerActive || false,
            logoTagline: data.data.logoTagline || "",
          });
        }
      } catch {
        alert("加载设置失败");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleReportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型（PDF）
    if (file.type !== "application/pdf") {
      alert("仅支持 PDF 格式文件");
      return;
    }

    // 验证文件大小 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("文件大小超过限制。最大支持 10MB");
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const res = await fetch("/api/admin/upload-report", {
        method: "POST",
        credentials: "include", // 确保发送认证 cookie
        body: uploadFormData,
      });

      const data = await res.json();
      if (data.error) {
        alert("上传失败: " + data.error);
      } else if (data.url) {
        setFormData({ ...formData, qualityReportUrl: data.url });
        alert("质检报告上传成功！");
      }
    } catch {
      alert("上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 自动为所有 URL 添加协议前缀
      const processedData = {
        ...formData,
        douyinUrl: formData.douyinUrl ? ensureUrlProtocol(formData.douyinUrl) : formData.douyinUrl,
        xiaohongshuUrl: formData.xiaohongshuUrl ? ensureUrlProtocol(formData.xiaohongshuUrl) : formData.xiaohongshuUrl,
        tmallUrl: formData.tmallUrl ? ensureUrlProtocol(formData.tmallUrl) : formData.tmallUrl,
        jdUrl: formData.jdUrl ? ensureUrlProtocol(formData.jdUrl) : formData.jdUrl,
        promotionalBannerUrl: formData.promotionalBannerUrl ? ensureUrlProtocol(formData.promotionalBannerUrl) : formData.promotionalBannerUrl,
        qualityReportUrl: formData.qualityReportUrl ? ensureUrlProtocol(formData.qualityReportUrl) : formData.qualityReportUrl,
      };
      const res = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedData),
      });

      const data = await res.json();
      if (data.error) {
        alert("错误: " + JSON.stringify(data.error));
      } else {
        alert("设置保存成功！");
        router.refresh();
      }
    } catch {
      alert("保存设置失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">站点设置</h1>
      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">社交媒体和店铺链接</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">抖音链接</label>
            <input
              type="url"
              value={formData.douyinUrl}
              onChange={(e) => setFormData({ ...formData, douyinUrl: e.target.value })}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              placeholder="www.douyin.com/user/... 或 https://www.douyin.com/user/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">小红书链接</label>
            <input
              type="url"
              value={formData.xiaohongshuUrl}
              onChange={(e) => setFormData({ ...formData, xiaohongshuUrl: e.target.value })}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              placeholder="www.xiaohongshu.com/user/... 或 https://www.xiaohongshu.com/user/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">天猫链接</label>
            <input
              type="url"
              value={formData.tmallUrl}
              onChange={(e) => setFormData({ ...formData, tmallUrl: e.target.value })}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              placeholder="xxx.tmall.com/... 或 https://xxx.tmall.com/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">京东链接</label>
            <input
              type="url"
              value={formData.jdUrl}
              onChange={(e) => setFormData({ ...formData, jdUrl: e.target.value })}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              placeholder="mall.jd.com/... 或 https://mall.jd.com/..."
            />
          </div>
        </div>

        <div className="space-y-4 border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-800">导航栏设置</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Logo 标语</label>
            <input
              type="text"
              value={formData.logoTagline}
              onChange={(e) => setFormData({ ...formData, logoTagline: e.target.value })}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              placeholder="例如: NATURE-POWERED"
            />
            <p className="mt-1 text-xs text-gray-500">显示在 Logo 上方的标语文字</p>
          </div>
        </div>

        <div className="space-y-4 border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-800">顶部促销横幅</h2>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.promotionalBannerActive}
                onChange={(e) => setFormData({ ...formData, promotionalBannerActive: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">启用促销横幅</span>
            </label>
          </div>
          {formData.promotionalBannerActive && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">横幅文字 *</label>
                <input
                  type="text"
                  value={formData.promotionalBannerText}
                  onChange={(e) => setFormData({ ...formData, promotionalBannerText: e.target.value })}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  placeholder="例如: 30% OFF EVERYTHING // NO CODES NEEDED"
                  required={formData.promotionalBannerActive}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">横幅链接（可选）</label>
                <input
                  type="url"
                  value={formData.promotionalBannerUrl}
                  onChange={(e) => setFormData({ ...formData, promotionalBannerUrl: e.target.value })}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  placeholder="example.com/promo 或 https://example.com/promo"
                />
                <p className="mt-1 text-xs text-gray-500">留空则横幅不可点击</p>
              </div>
            </>
          )}
        </div>

        <div className="space-y-4 border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-800">质检报告</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">质检报告文件</label>
            <div className="mt-1 space-y-2">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleReportUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)] file:text-white hover:file:bg-[#2fb54a] disabled:opacity-50"
                />
                {uploading && <span className="text-sm text-gray-500">上传中...</span>}
              </div>
              {formData.qualityReportUrl && (
                <div className="mt-2">
                  <a
                    href={formData.qualityReportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    当前报告: {formData.qualityReportUrl}
                  </a>
                </div>
              )}
              <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-800">
                <p className="font-semibold mb-1">文件要求：</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>格式：PDF</li>
                  <li>大小：最大 10MB</li>
                </ul>
              </div>
              <div className="mt-2">
                <label className="block text-xs text-gray-500 mb-1">或手动输入文件 URL：</label>
                <input
                  type="text"
                  value={formData.qualityReportUrl}
                  onChange={(e) => setFormData({ ...formData, qualityReportUrl: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  placeholder="example.com/report.pdf 或 https://example.com/report.pdf"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-[var(--color-primary)] px-6 py-2 text-white hover:bg-[#2fb54a] disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存设置"}
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

