import Link from "next/link";
export const runtime = 'nodejs'; // 使用 Node.js runtime，因为需要数据库连接
export const dynamic = 'force-dynamic'; // 强制动态渲染，因为需要数据库访问
import { db } from "@/db";
import { banners } from "@/db/schema";

async function getBanners() {
  try {
    return await db.select().from(banners);
  } catch (error) {
    console.error("Error fetching banners:", error);
    // 如果数据库表不存在或连接失败，返回空数组
    return [];
  }
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
            {bannerList.map((banner: any) => (
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

