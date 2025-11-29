import Link from "next/link";
export const runtime = 'nodejs'; // 使用 Node.js runtime，因为需要数据库连接
export const dynamic = 'force-dynamic'; // 强制动态渲染，因为需要数据库访问
import { db } from "@/db";
import { galleryImages } from "@/db/schema";
import { asc } from "drizzle-orm";

async function getGalleryImages() {
  try {
    return await db.select().from(galleryImages).orderBy(asc(galleryImages.sortOrder));
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    // 如果数据库表不存在或连接失败，返回空数组
    return [];
  }
}

export default async function AdminGalleryPage() {
  const imageList = await getGalleryImages();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">图库图片</h1>
        <Link
          href="/admin/gallery/new"
          className="rounded bg-[var(--color-primary)] px-4 py-2 text-white hover:bg-[#2fb54a]"
        >
          添加图片
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">标题</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">分类</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">URL</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">排序</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {imageList.map((image: any) => (
              <tr key={image.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{image.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{image.title || "-"}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{image.category || "-"}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <a href={image.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    查看
                  </a>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{image.sortOrder}</td>
                <td className="px-6 py-4 text-sm">
                  <Link href={`/admin/gallery/${image.id}`} className="text-blue-600 hover:text-blue-900">
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

