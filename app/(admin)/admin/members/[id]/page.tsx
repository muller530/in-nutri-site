"use client";
export const runtime = 'edge';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    role: "admin",
    isActive: true,
  });

  useEffect(() => {
    async function loadMember() {
      const resolvedParams = await params;
      const id = resolvedParams.id;
      setMemberId(id);
      try {
        const res = await fetch(`/api/admin/members/${id}`);
        const data = await res.json();
        if (data.data) {
          setFormData({
            email: data.data.email || "",
            name: data.data.name || "",
            password: "", // Don't show existing password
            role: data.data.role || "admin",
            isActive: data.data.isActive || false,
          });
        }
      } catch {
        alert("加载成员失败");
      } finally {
        setLoading(false);
      }
    }
    loadMember();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) return;
    setSaving(true);
    try {
      const updateData: {
        email: string;
        name: string;
        role: string;
        isActive: boolean;
        password?: string;
      } = {
        email: formData.email,
        name: formData.name,
        role: formData.role,
        isActive: formData.isActive,
      };
      // Only include password if it's been changed
      if (formData.password) {
        updateData.password = formData.password;
      }
      const res = await fetch(`/api/admin/members/${memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      const data = await res.json();
      if (data.error) alert("错误: " + JSON.stringify(data.error));
      else {
        router.push("/admin/members");
        router.refresh();
      }
    } catch {
      alert("更新成员失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>加载中...</div>;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">编辑成员</h1>
      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">邮箱 *</label>
          <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">姓名</label>
          <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">新密码（留空则保持当前密码）</label>
          <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">角色</label>
          <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2">
            <option value="admin">管理员</option>
            <option value="editor">编辑</option>
            <option value="viewer">查看者</option>
          </select>
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

