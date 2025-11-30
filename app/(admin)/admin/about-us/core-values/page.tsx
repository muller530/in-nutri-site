"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CoreValue {
  id: number;
  number?: string | null;
  title: string;
  hashtag?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function CoreValuesAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<CoreValue[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState<Partial<CoreValue>>({
    number: "",
    title: "",
    hashtag: "",
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    loadValues();
  }, []);

  async function loadValues() {
    try {
      const res = await fetch("/api/admin/core-values");
      const data = await res.json();
      if (data.data) {
        setValues(data.data);
      }
    } catch (error) {
      alert("加载失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!formData.title || formData.title.trim() === "") {
      alert("请输入标题");
      return;
    }

    try {
      if (editingId) {
        const res = await fetch(`/api/admin/core-values/${editingId}`, {
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
          loadValues();
        }
      } else {
        const res = await fetch("/api/admin/core-values", {
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
          loadValues();
        }
      }
    } catch (error) {
      alert("操作失败");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("确定要删除这个核心价值吗？")) return;
    try {
      const res = await fetch(`/api/admin/core-values/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        alert("删除失败: " + data.error);
      } else {
        alert("删除成功！");
        loadValues();
      }
    } catch (error) {
      alert("删除失败");
    }
  }

  function startEdit(value: CoreValue) {
    setEditingId(value.id);
    setShowNewForm(false);
    setFormData({
      number: value.number || "",
      title: value.title,
      hashtag: value.hashtag || "",
      sortOrder: value.sortOrder,
      isActive: value.isActive,
    });
  }

  function resetForm() {
    setFormData({
      number: "",
      title: "",
      hashtag: "",
      sortOrder: values.length,
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
          <h1 className="text-3xl font-bold text-gray-900">核心价值管理</h1>
        </div>
        <button
          onClick={() => {
            setShowNewForm(true);
            setEditingId(null);
            resetForm();
          }}
          className="rounded bg-[var(--color-primary)] px-4 py-2 text-white hover:bg-[#2fb54a]"
        >
          添加核心价值
        </button>
      </div>

      {/* 编辑/新建表单 */}
      {(editingId !== null || showNewForm) && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            {editingId ? "编辑核心价值" : "新建核心价值"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">编号</label>
              <input
                type="text"
                value={formData.number || ""}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                placeholder="例如: 01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">标题 *</label>
              <input
                type="text"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                placeholder="例如: 正常 f*cking 不行"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">标签</label>
              <input
                type="text"
                value={formData.hashtag || ""}
                onChange={(e) => setFormData({ ...formData, hashtag: e.target.value })}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                placeholder="例如: #SCRAPPY"
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

      {/* 列表 */}
      <div className="rounded-lg bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                编号
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                标题
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                标签
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
            {values.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  暂无核心价值，点击"添加核心价值"创建
                </td>
              </tr>
            ) : (
              values.map((value) => (
                <tr key={value.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {value.number || String(value.id).padStart(2, '0')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{value.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{value.hashtag || "-"}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {value.sortOrder}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {value.isActive ? (
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
                      onClick={() => startEdit(value)}
                      className="mr-3 text-blue-600 hover:text-blue-900"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(value.id)}
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

