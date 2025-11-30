"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ensureUrlProtocol } from "@/lib/urlUtils";

interface SocialPlatform {
  id: number;
  name: string;
  iconType: "svg" | "image" | "emoji";
  iconSvg?: string | null;
  iconImage?: string | null;
  iconEmoji?: string | null;
  url?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function SocialPlatformsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState<Partial<SocialPlatform>>({
    name: "",
    iconType: "svg",
    iconSvg: "",
    iconImage: "",
    iconEmoji: "",
    url: "",
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    loadPlatforms();
  }, []);

  async function loadPlatforms() {
    try {
      const res = await fetch("/api/admin/social-platforms");
      const data = await res.json();
      if (data.data) {
        setPlatforms(data.data);
      }
    } catch (error) {
      alert("加载平台列表失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    // 验证表单数据
    if (!formData.name || formData.name.trim() === "") {
      alert("请输入平台名称");
      return;
    }

    try {
      if (editingId) {
        // 更新 - 自动为 URL 添加协议前缀
        const updateData = {
          ...formData,
          iconImage: formData.iconType === "image" && formData.iconImage ? ensureUrlProtocol(formData.iconImage) : formData.iconImage,
          url: formData.url ? ensureUrlProtocol(formData.url) : formData.url,
        };
        const res = await fetch(`/api/admin/social-platforms/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });
        const data = await res.json();
        if (data.error) {
          const errorMsg = typeof data.error === "string" 
            ? data.error 
            : data.error.message || JSON.stringify(data.error);
          const details = data.details ? `\n\n详细信息: ${data.details}` : "";
          alert(`保存失败: ${errorMsg}${details}`);
        } else {
          alert("保存成功！");
          setEditingId(null);
          setShowNewForm(false);
          setFormData({
            name: "",
            iconType: "svg",
            iconSvg: "",
            iconImage: "",
            iconEmoji: "",
            url: "",
            sortOrder: 0,
            isActive: true,
          });
          loadPlatforms();
        }
      } else {
        // 创建
        // 准备提交的数据，确保所有字段都正确
        const submitData = {
          name: formData.name?.trim() || "",
          iconType: formData.iconType || "svg",
          iconSvg: formData.iconType === "svg" ? (formData.iconSvg || "") : "",
          iconImage: formData.iconType === "image" ? (formData.iconImage ? ensureUrlProtocol(formData.iconImage) : "") : "",
          iconEmoji: formData.iconType === "emoji" ? (formData.iconEmoji || "") : "",
          url: formData.url ? ensureUrlProtocol(formData.url) : "",
          sortOrder: formData.sortOrder ?? 0,
          isActive: formData.isActive ?? true,
        };

        console.log("提交数据:", submitData);

        const res = await fetch("/api/admin/social-platforms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          console.error("API 响应错误:", data);
        }
        if (data.error) {
          const errorMsg = typeof data.error === "string" 
            ? data.error 
            : data.error.message || JSON.stringify(data.error);
          const details = data.details ? `\n\n详细信息: ${data.details}` : "";
          alert(`创建失败: ${errorMsg}${details}`);
        } else {
          alert("创建成功！");
          setShowNewForm(false);
          setFormData({
            name: "",
            iconType: "svg",
            iconSvg: "",
            iconImage: "",
            iconEmoji: "",
            url: "",
            sortOrder: 0,
            isActive: true,
          });
          loadPlatforms();
        }
      }
    } catch (error) {
      alert("操作失败");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("确定要删除这个平台吗？")) return;

    try {
      const res = await fetch(`/api/admin/social-platforms/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        alert("删除失败: " + JSON.stringify(data.error));
      } else {
        alert("删除成功！");
        loadPlatforms();
      }
    } catch (error) {
      alert("删除失败");
    }
  }

  function startEdit(platform: SocialPlatform) {
    setEditingId(platform.id);
    setShowNewForm(false);
    setFormData({
      name: platform.name,
      iconType: platform.iconType,
      iconSvg: platform.iconSvg || "",
      iconImage: platform.iconImage || "",
      iconEmoji: platform.iconEmoji || "",
      url: platform.url || "",
      sortOrder: platform.sortOrder,
      isActive: platform.isActive,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setShowNewForm(false);
    setFormData({
      name: "",
      iconType: "svg",
      iconSvg: "",
      iconImage: "",
      iconEmoji: "",
      url: "",
      sortOrder: 0,
      isActive: true,
    });
  }

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">社交媒体平台管理</h1>
        <button
          onClick={() => {
            setShowNewForm(true);
            setEditingId(null);
            setFormData({
              name: "",
              iconType: "svg",
              iconSvg: "",
              iconImage: "",
              iconEmoji: "",
              url: "",
              sortOrder: platforms.length,
              isActive: true,
            });
          }}
          className="rounded bg-[var(--color-primary)] px-4 py-2 text-white hover:bg-[#2fb54a]"
        >
          添加平台
        </button>
      </div>

      {/* 编辑/新建表单 */}
      {(editingId !== null || showNewForm) && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            {editingId ? "编辑平台" : "新建平台"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">平台名称 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                placeholder="例如: Facebook"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">图标类型 *</label>
              <select
                value={formData.iconType}
                onChange={(e) =>
                  setFormData({ ...formData, iconType: e.target.value as "svg" | "image" | "emoji" })
                }
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              >
                <option value="svg">SVG 代码</option>
                <option value="image">图片 URL</option>
                <option value="emoji">Emoji</option>
              </select>
            </div>

            {formData.iconType === "svg" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">SVG 代码</label>
                <textarea
                  value={formData.iconSvg || ""}
                  onChange={(e) => setFormData({ ...formData, iconSvg: e.target.value })}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm"
                  rows={4}
                  placeholder='例如: <svg width="24" height="24">...</svg>'
                />
                <p className="mt-1 text-xs text-gray-500">
                  输入 SVG 代码，图标大小建议 24x24px
                </p>
              </div>
            )}

            {formData.iconType === "image" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">图片 URL</label>
                <input
                  type="url"
                  value={formData.iconImage || ""}
                  onChange={(e) => setFormData({ ...formData, iconImage: e.target.value })}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  placeholder="example.com/icon.png 或 https://example.com/icon.png"
                />
              </div>
            )}

            {formData.iconType === "emoji" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Emoji</label>
                <input
                  type="text"
                  value={formData.iconEmoji || ""}
                  onChange={(e) => setFormData({ ...formData, iconEmoji: e.target.value })}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-2xl"
                  placeholder="例如: 📱"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">链接 URL</label>
              <input
                type="url"
                value={formData.url || ""}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                placeholder="www.facebook.com/yourpage 或 https://www.facebook.com/yourpage"
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

      {/* 平台列表 */}
      <div className="rounded-lg bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                平台名称
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                图标预览
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                链接
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                排序
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                状态
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {platforms.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  暂无平台，点击"添加平台"创建
                </td>
              </tr>
            ) : (
              platforms.map((platform) => (
                <tr key={platform.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {platform.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex h-8 w-8 items-center justify-center text-gray-600">
                      {platform.iconType === "svg" && platform.iconSvg && (
                        <div
                          className="h-6 w-6"
                          dangerouslySetInnerHTML={{ __html: platform.iconSvg }}
                        />
                      )}
                      {platform.iconType === "image" && platform.iconImage && (
                        <img
                          src={platform.iconImage}
                          alt={platform.name}
                          className="h-6 w-6 object-contain"
                        />
                      )}
                      {platform.iconType === "emoji" && platform.iconEmoji && (
                        <span className="text-xl">{platform.iconEmoji}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <a
                      href={platform.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {platform.url ? "查看链接" : "未设置"}
                    </a>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {platform.sortOrder}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {platform.isActive ? (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                        启用
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                        禁用
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => startEdit(platform)}
                      className="mr-3 text-blue-600 hover:text-blue-900"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(platform.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

