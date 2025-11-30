"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface MapLocation {
  id: number;
  name: string;
  label?: string | null;
  latitude: string;
  longitude: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
}

export default function MapLocationsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState<Partial<MapLocation>>({
    name: "",
    label: "",
    latitude: "",
    longitude: "",
    color: "#7C3AED",
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    loadLocations();
  }, []);

  async function loadLocations() {
    try {
      const res = await fetch("/api/admin/map-locations");
      const data = await res.json();
      if (data.data) {
        setLocations(data.data);
      }
    } catch (error) {
      alert("加载失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!formData.name || formData.name.trim() === "") {
      alert("请输入位置名称");
      return;
    }
    if (!formData.latitude || !formData.longitude) {
      alert("请输入纬度和经度");
      return;
    }

    try {
      if (editingId) {
        const res = await fetch(`/api/admin/map-locations/${editingId}`, {
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
          loadLocations();
        }
      } else {
        const res = await fetch("/api/admin/map-locations", {
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
          loadLocations();
        }
      }
    } catch (error) {
      alert("操作失败");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("确定要删除这个位置吗？")) return;
    try {
      const res = await fetch(`/api/admin/map-locations/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("删除成功！");
        loadLocations();
      } else {
        alert("删除失败");
      }
    } catch (error) {
      alert("删除失败");
    }
  }

  function startEdit(location: MapLocation) {
    setEditingId(location.id);
    setShowNewForm(false);
    setFormData({
      name: location.name,
      label: location.label || "",
      latitude: location.latitude,
      longitude: location.longitude,
      color: location.color,
      sortOrder: location.sortOrder,
      isActive: location.isActive,
    });
  }

  function resetForm() {
    setFormData({
      name: "",
      label: "",
      latitude: "",
      longitude: "",
      color: "#7C3AED",
      sortOrder: locations.length,
      isActive: true,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setShowNewForm(false);
    resetForm();
  }

  // 预设位置快速选择
  const presetLocations = [
    { name: "SAN DIEGO", label: "HQ", latitude: "32.7157", longitude: "-117.1611", color: "#7C3AED" },
    { name: "北京", label: "总部", latitude: "39.9042", longitude: "116.4074", color: "#3B82F6" },
    { name: "上海", latitude: "31.2304", longitude: "121.4737", color: "#10B981" },
    { name: "深圳", latitude: "22.5431", longitude: "114.0579", color: "#F59E0B" },
    { name: "纽约", latitude: "40.7128", longitude: "-74.0060", color: "#EF4444" },
    { name: "伦敦", latitude: "51.5074", longitude: "-0.1278", color: "#8B5CF6" },
    { name: "东京", latitude: "35.6762", longitude: "139.6503", color: "#EC4899" },
    { name: "悉尼", latitude: "-33.8688", longitude: "151.2093", color: "#06B6D4" },
  ];

  function usePreset(preset: typeof presetLocations[0]) {
    setFormData({
      ...formData,
      name: preset.name,
      label: preset.label || "",
      latitude: preset.latitude,
      longitude: preset.longitude,
      color: preset.color,
    });
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
          <h1 className="text-3xl font-bold text-gray-900">地图位置管理</h1>
        </div>
        <button
          onClick={() => {
            setShowNewForm(true);
            setEditingId(null);
            resetForm();
          }}
          className="rounded bg-[var(--color-primary)] px-4 py-2 text-white hover:bg-[#2fb54a]"
        >
          添加位置
        </button>
      </div>

      {/* 编辑/新建表单 */}
      {(editingId !== null || showNewForm) && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            {editingId ? "编辑位置" : "新建位置"}
          </h2>
          
          {/* 预设位置快速选择 */}
          {!editingId && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-3">快速选择预设位置：</p>
            <div className="flex flex-wrap gap-2">
              {presetLocations.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => usePreset(preset)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">位置名称 *</label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                placeholder="例如: 北京"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">标签（可选）</label>
              <input
                type="text"
                value={formData.label || ""}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                placeholder="例如: HQ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择位置 * (点击地图或手动输入坐标)
              </label>
              
              {/* 交互式地图选择器 */}
              <div className="mb-4 relative bg-black rounded-lg overflow-hidden border-2 border-gray-300" style={{ aspectRatio: "2/1", minHeight: "250px" }}>
                <svg
                  viewBox="0 0 1000 500"
                  className="w-full h-full cursor-crosshair"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 1000;
                    const y = ((e.clientY - rect.top) / rect.height) * 500;
                    
                    // 转换为经纬度
                    const longitude = (x / 1000) * 360 - 180;
                    const latitude = 90 - (y / 500) * 180;
                    
                    setFormData({
                      ...formData,
                      longitude: longitude.toFixed(4),
                      latitude: latitude.toFixed(4),
                    });
                  }}
                >
                  {/* 黑色背景 */}
                  <rect width="100%" height="100%" fill="#000000" />
                  
                  {/* 简化的像素风格地图 */}
                  <g opacity="0.3" fill="#9ca3af">
                    {/* 北美洲 */}
                    {Array.from({ length: 50 }).map((_, i) => {
                      const x = 150 + (i % 10) * 20 + Math.random() * 10;
                      const y = 80 + Math.floor(i / 10) * 20 + Math.random() * 10;
                      return <circle key={`na-${i}`} cx={x} cy={y} r="2" />;
                    })}
                    {/* 南美洲 */}
                    {Array.from({ length: 30 }).map((_, i) => {
                      const x = 240 + (i % 5) * 15 + Math.random() * 8;
                      const y = 280 + Math.floor(i / 5) * 20 + Math.random() * 8;
                      return <circle key={`sa-${i}`} cx={x} cy={y} r="2" />;
                    })}
                    {/* 欧洲 */}
                    {Array.from({ length: 25 }).map((_, i) => {
                      const x = 470 + (i % 5) * 20 + Math.random() * 8;
                      const y = 80 + Math.floor(i / 5) * 20 + Math.random() * 8;
                      return <circle key={`eu-${i}`} cx={x} cy={y} r="2" />;
                    })}
                    {/* 非洲 */}
                    {Array.from({ length: 30 }).map((_, i) => {
                      const x = 510 + (i % 5) * 15 + Math.random() * 8;
                      const y = 170 + Math.floor(i / 5) * 20 + Math.random() * 8;
                      return <circle key={`af-${i}`} cx={x} cy={y} r="2" />;
                    })}
                    {/* 亚洲 */}
                    {Array.from({ length: 60 }).map((_, i) => {
                      const x = 640 + (i % 10) * 25 + Math.random() * 10;
                      const y = 80 + Math.floor(i / 10) * 20 + Math.random() * 10;
                      return <circle key={`as-${i}`} cx={x} cy={y} r="2" />;
                    })}
                    {/* 澳大利亚 */}
                    {Array.from({ length: 15 }).map((_, i) => {
                      const x = 790 + (i % 5) * 20 + Math.random() * 8;
                      const y = 310 + Math.floor(i / 5) * 20 + Math.random() * 8;
                      return <circle key={`au-${i}`} cx={x} cy={y} r="2" />;
                    })}
                  </g>
                  
                  {/* 显示当前选择的位置 */}
                  {formData.latitude && formData.longitude && (
                    <g transform={`translate(${(parseFloat(formData.longitude) + 180) / 360 * 1000}, ${(90 - parseFloat(formData.latitude)) / 180 * 500})`}>
                      <circle cx="0" cy="0" r="8" fill="none" stroke={formData.color || "#7C3AED"} strokeWidth="2" strokeDasharray="4 4" />
                      <circle cx="0" cy="0" r="4" fill={formData.color || "#7C3AED"} />
                    </g>
                  )}
                  
                  {/* 显示已有位置 */}
                  {locations.filter(l => l.id !== editingId).map((location) => {
                    const x = (parseFloat(location.longitude) + 180) / 360 * 1000;
                    const y = (90 - parseFloat(location.latitude)) / 180 * 500;
                    return (
                      <g key={location.id} transform={`translate(${x}, ${y})`} opacity="0.5">
                        <circle cx="0" cy="0" r="6" fill={location.color} />
                      </g>
                    );
                  })}
                </svg>
                
                {/* 提示文字 */}
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  点击地图选择位置
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">纬度 *</label>
                  <input
                    type="text"
                    value={formData.latitude || ""}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    placeholder="例如: 39.9042"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">范围: -90 到 90</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">经度 *</label>
                  <input
                    type="text"
                    value={formData.longitude || ""}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    placeholder="例如: 116.4074"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">范围: -180 到 180</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">标记颜色</label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="color"
                    value={formData.color || "#7C3AED"}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color || "#7C3AED"}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 rounded border border-gray-300 px-3 py-2"
                    placeholder="#7C3AED"
                  />
                </div>
              </div>
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
            </div>
            <div className="flex items-center pt-2">
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
                位置名称
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                标签
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                坐标
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                颜色
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
            {locations.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  暂无位置，点击"添加位置"创建
                </td>
              </tr>
            ) : (
              locations.map((location) => (
                <tr key={location.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {location.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{location.label || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {location.latitude}, {location.longitude}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: location.color }}
                      ></div>
                      <span className="text-gray-600">{location.color}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {location.sortOrder}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {location.isActive ? (
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
                      onClick={() => startEdit(location)}
                      className="mr-3 text-blue-600 hover:text-blue-900"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(location.id)}
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

