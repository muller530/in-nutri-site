"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AboutUs {
  id?: number;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  heroVideoUrl?: string | null;
  missionTitle?: string | null;
  missionContent?: string | null;
  motto?: string | null;
}

interface CoreValue {
  id: number;
  number?: string | null;
  title: string;
  hashtag?: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface Milestone {
  id: number;
  year?: string | null;
  month?: string | null;
  title: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface GalleryImage {
  id: number;
  imageUrl: string;
  alt?: string | null;
  sortOrder: number;
  isActive: boolean;
}

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

export default function AboutUsAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aboutUs, setAboutUs] = useState<AboutUs>({});
  const [coreValues, setCoreValues] = useState<CoreValue[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [mapLocations, setMapLocations] = useState<MapLocation[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // 加载所有数据
      const [aboutRes, valuesRes, milestonesRes, galleryRes, locationsRes] = await Promise.all([
        fetch("/api/admin/about-us"),
        fetch("/api/admin/core-values"),
        fetch("/api/admin/milestones"),
        fetch("/api/admin/about-gallery"),
        fetch("/api/admin/map-locations"),
      ]);

      if (aboutRes.ok) {
        const aboutData = await aboutRes.json();
        setAboutUs(aboutData.data || {});
      }
      if (valuesRes.ok) {
        const valuesData = await valuesRes.json();
        setCoreValues(valuesData.data || []);
      }
      if (milestonesRes.ok) {
        const milestonesData = await milestonesRes.json();
        setMilestones(milestonesData.data || []);
      }
      if (galleryRes.ok) {
        const galleryData = await galleryRes.json();
        setGallery(galleryData.data || []);
      }
      if (locationsRes.ok) {
        const locationsData = await locationsRes.json();
        setMapLocations(locationsData.data || []);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      alert("加载数据失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveAboutUs(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/about-us", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aboutUs),
      });
      const data = await res.json();
      if (data.error) {
        alert("保存失败: " + data.error);
      } else {
        alert("保存成功！");
      }
    } catch (error) {
      alert("保存失败");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-6">加载中...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">关于我们管理</h1>
        <Link
          href="/about"
          target="_blank"
          className="text-sm text-blue-600 hover:underline"
        >
          查看前台页面 →
        </Link>
      </div>

      {/* 主信息编辑 */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">主信息</h2>
        <form onSubmit={handleSaveAboutUs} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hero 标题
            </label>
            <input
              type="text"
              value={aboutUs.heroTitle || ""}
              onChange={(e) => setAboutUs({ ...aboutUs, heroTitle: e.target.value })}
              className="w-full rounded border border-gray-300 px-3 py-2"
              placeholder="例如：我们是谁"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hero 副标题
            </label>
            <textarea
              value={aboutUs.heroSubtitle || ""}
              onChange={(e) => setAboutUs({ ...aboutUs, heroSubtitle: e.target.value })}
              className="w-full rounded border border-gray-300 px-3 py-2"
              rows={2}
              placeholder="例如：通过真实原料，让自然成分在城市生活中重新被看见。"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              视频 URL（可选）
            </label>
            <input
              type="text"
              value={aboutUs.heroVideoUrl || ""}
              onChange={(e) => setAboutUs({ ...aboutUs, heroVideoUrl: e.target.value })}
              className="w-full rounded border border-gray-300 px-3 py-2"
              placeholder="视频链接地址"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              使命标题
            </label>
            <input
              type="text"
              value={aboutUs.missionTitle || ""}
              onChange={(e) => setAboutUs({ ...aboutUs, missionTitle: e.target.value })}
              className="w-full rounded border border-gray-300 px-3 py-2"
              placeholder="例如：我们的使命"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              使命内容
            </label>
            <textarea
              value={aboutUs.missionContent || ""}
              onChange={(e) => setAboutUs({ ...aboutUs, missionContent: e.target.value })}
              className="w-full rounded border border-gray-300 px-3 py-2"
              rows={4}
              placeholder="使命描述"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              口号
            </label>
            <input
              type="text"
              value={aboutUs.motto || ""}
              onChange={(e) => setAboutUs({ ...aboutUs, motto: e.target.value })}
              className="w-full rounded border border-gray-300 px-3 py-2"
              placeholder="例如：每周节省一天时间"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-[var(--color-primary)] px-6 py-2 text-white hover:bg-[#2fb54a] disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存主信息"}
          </button>
        </form>
      </div>

      {/* 核心价值管理 */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">核心价值</h2>
          <Link
            href="/admin/about-us/core-values"
            className="rounded bg-[var(--color-primary)] px-4 py-2 text-white hover:bg-[#2fb54a] text-sm"
          >
            管理核心价值
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coreValues.slice(0, 6).map((value) => (
            <div key={value.id} className="border border-gray-200 rounded p-4">
              <div className="text-sm font-bold text-[var(--color-primary)]">
                {value.number || String(value.id).padStart(2, '0')}
              </div>
              <div className="font-semibold text-gray-900">{value.title}</div>
              {value.hashtag && (
                <div className="text-xs text-gray-500">{value.hashtag}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 里程碑管理 */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">里程碑</h2>
          <Link
            href="/admin/about-us/milestones"
            className="rounded bg-[var(--color-primary)] px-4 py-2 text-white hover:bg-[#2fb54a] text-sm"
          >
            管理里程碑
          </Link>
        </div>
        <div className="space-y-3">
          {milestones.slice(0, 5).map((milestone) => (
            <div key={milestone.id} className="border border-gray-200 rounded p-4">
              <div className="flex items-center gap-3">
                {milestone.year && (
                  <span className="font-bold text-[var(--color-forest)]">
                    {milestone.year}
                  </span>
                )}
                {milestone.month && (
                  <span className="text-sm text-gray-600 uppercase">
                    {milestone.month}
                  </span>
                )}
                <span className="font-semibold text-gray-900">{milestone.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 地图位置管理 */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">地图位置</h2>
          <Link
            href="/admin/about-us/map-locations"
            className="rounded bg-[var(--color-primary)] px-4 py-2 text-white hover:bg-[#2fb54a] text-sm"
          >
            管理位置
          </Link>
        </div>
        <div className="text-sm text-gray-600">
          {mapLocations.length > 0 ? (
            <p>已设置 {mapLocations.length} 个位置标记</p>
          ) : (
            <p>暂无位置标记</p>
          )}
        </div>
      </div>

      {/* 图片画廊管理 */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">图片画廊</h2>
          <Link
            href="/admin/about-us/gallery"
            className="rounded bg-[var(--color-primary)] px-4 py-2 text-white hover:bg-[#2fb54a] text-sm"
          >
            管理图片
          </Link>
        </div>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.slice(0, 8).map((item) => (
            <div key={item.id} className="relative aspect-square rounded overflow-hidden border border-gray-200">
              <img
                src={item.imageUrl}
                alt={item.alt || "画廊图片"}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

