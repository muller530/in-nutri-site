import Link from "next/link";
import { db } from "@/db";
import { banners } from "@/db/schema";

async function getBanners() {
  return await db.select().from(banners);
}

export default async function AdminBannersPage() {
  const bannerList = await getBanners();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">横幅</h1>
        <Link
          href="/admin/banners/new"
          className="rounded bg-[var(--color-primary)] px-4 py-2 text-white hover:bg-[#2fb54a]"
        >
          创建横幅
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">标识</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">标题</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">激活</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">位置</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bannerList.map((banner) => (
              <tr key={banner.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{banner.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{banner.key}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{banner.title || "-"}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{banner.isActive ? "是" : "否"}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{banner.position}</td>
                <td className="px-6 py-4 text-sm">
                  <Link href={`/admin/banners/${banner.id}`} className="text-blue-600 hover:text-blue-900">
                    编辑
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

