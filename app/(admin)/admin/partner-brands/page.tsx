"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/api";

interface PartnerBrand {
  id: number;
  name: string;
  logoUrl: string;
  websiteUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPartnerBrandsPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<PartnerBrand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrands();
  }, []);

  async function fetchBrands() {
    try {
      const res = await fetch(getApiUrl("/api/admin/partner-brands"), {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setBrands(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch partner brands:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("确定要删除这个合作品牌吗？")) {
      return;
    }

    try {
      const res = await fetch(getApiUrl(`/api/admin/partner-brands/${id}`), {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        fetchBrands();
      } else {
        alert("删除失败");
      }
    } catch (error) {
      console.error("Failed to delete partner brand:", error);
      alert("删除失败");
    }
  }

  async function handleToggleActive(id: number, currentStatus: boolean) {
    try {
      const brand = brands.find((b) => b.id === id);
      if (!brand) return;

      const res = await fetch(getApiUrl(`/api/admin/partner-brands/${id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...brand,
          isActive: !currentStatus,
        }),
      });

      if (res.ok) {
        fetchBrands();
      } else {
        alert("更新失败");
      }
    } catch (error) {
      console.error("Failed to toggle active status:", error);
      alert("更新失败");
    }
  }

  if (loading) {
    return <div className="p-6">加载中...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">合作品牌</h1>
        <Link
          href="/admin/partner-brands/new"
          className="rounded bg-[var(--color-primary)] px-4 py-2 text-white hover:bg-[#2fb54a]"
        >
          添加合作品牌
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Logo</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">品牌名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">网站链接</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">排序</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {brands.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  暂无合作品牌
                </td>
              </tr>
            ) : (
              brands.map((brand) => (
                <tr key={brand.id}>
                  <td className="px-6 py-4">
                    <div className="relative h-12 w-32 flex items-center justify-center">
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="max-h-12 max-w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{brand.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {brand.websiteUrl ? (
                      <a
                        href={brand.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {brand.websiteUrl}
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{brand.sortOrder}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleToggleActive(brand.id, brand.isActive)}
                      className={`rounded px-2 py-1 text-xs font-medium ${
                        brand.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {brand.isActive ? "激活" : "未激活"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/partner-brands/${brand.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        编辑
                      </Link>
                      <button
                        onClick={() => handleDelete(brand.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        删除
                      </button>
                    </div>
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

