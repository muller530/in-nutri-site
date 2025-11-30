"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Milestone {
  id: number;
  year?: string | null;
  month?: string | null;
  title: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function MilestonesAdminPage() {
  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Milestone>>({
    year: "",
    month: "",
    title: "",
    description: "",
    color: "#10B981",
    icon: "",
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    loadMilestones();
  }, []);

  async function loadMilestones() {
    try {
      const res = await fetch("/api/admin/milestones");
      const data = await res.json();
      if (data.data) {
        setMilestones(data.data);
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
        const res = await fetch(`/api/admin/milestones/${editingId}`, {
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
          loadMilestones();
        }
      } else {
        const res = await fetch("/api/admin/milestones", {
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
          loadMilestones();
        }
      }
    } catch (error) {
      alert("操作失败");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("确定要删除这个里程碑吗？")) return;
    try {
      const res = await fetch(`/api/admin/milestones/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("删除成功！");
        loadMilestones();
      } else {
        alert("删除失败");
      }
    } catch (error) {
      alert("删除失败");
    }
  }

  function startEdit(milestone: Milestone) {
    setEditingId(milestone.id);
    setShowNewForm(false);
    setFormData({
      year: milestone.year || "",
      month: milestone.month || "",
      title: milestone.title,
      description: milestone.description || "",
      color: milestone.color || "#10B981",
      icon: milestone.icon || "",
      sortOrder: milestone.sortOrder,
      isActive: milestone.isActive,
    });
  }

  function resetForm() {
    setFormData({
      year: "",
      month: "",
      title: "",
      description: "",
      color: "#10B981",
      icon: "",
      sortOrder: milestones.length,
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
          <h1 className="text-3xl font-bold text-gray-900">里程碑管理</h1>
        </div>
        <button
          onClick={() => {
            setShowNewForm(true);
            setEditingId(null);
            resetForm();
          }}
          className="rounded bg-[var(--color-primary)] px-4 py-2 text-white hover:bg-[#2fb54a]"
        >
          添加里程碑
        </button>
      </div>

      {/* 编辑/新建表单 */}
      {(editingId !== null || showNewForm) && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            {editingId ? "编辑里程碑" : "新建里程碑"}
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">年份</label>
                <input
                  type="text"
                  value={formData.year || ""}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  placeholder="例如: 2017"
                />
              </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">月份/季度</label>
              <input
                type="text"
                value={formData.month || ""}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                placeholder="例如: MARCH 或 Q1'25"
              />
              <p className="mt-1 text-xs text-gray-500">支持月份（如 MARCH）或季度（如 Q1'25, Q4'24）</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">标题 *</label>
            <input
              type="text"
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              placeholder="例如: ClickUp 成立"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">描述</label>
            <textarea
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              rows={3}
              placeholder="描述（可选）"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">年份颜色</label>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="color"
                  value={formData.color || "#10B981"}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color || "#10B981"}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 rounded border border-gray-300 px-3 py-2"
                  placeholder="#10B981"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">用于区分不同年份的颜色</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">图标（可选）</label>
              <select
                value={formData.icon || ""}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value || null })}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              >
                <option value="">无图标</option>
                <option value="rocket">🚀 火箭 (Rocket)</option>
                <option value="unicorn">🦄 独角兽 (Unicorn)</option>
                <option value="globe">🌍 地球 (Globe)</option>
                <option value="star">⭐ 星星 (Star)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">选择显示在标题旁的图标</p>
            </div>
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
                年份/月份
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                标题
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                颜色
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                图标
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
            {milestones.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  暂无里程碑，点击"添加里程碑"创建
                </td>
              </tr>
            ) : (
              milestones.map((milestone) => (
                <tr key={milestone.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {milestone.year && milestone.month
                      ? `${milestone.year} ${milestone.month}`
                      : milestone.year || milestone.month || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{milestone.title}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: milestone.color || "#10B981" }}
                      ></div>
                      <span className="text-gray-600">{milestone.color || "#10B981"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {milestone.icon ? (
                      <span className="capitalize">{milestone.icon}</span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {milestone.sortOrder}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {milestone.isActive ? (
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
                      onClick={() => startEdit(milestone)}
                      className="mr-3 text-blue-600 hover:text-blue-900"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(milestone.id)}
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

