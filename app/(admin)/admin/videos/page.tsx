import Link from "next/link";
import { db } from "@/db";
import { videos } from "@/db/schema";

async function getVideos() {
  return await db.select().from(videos);
}

export default async function AdminVideosPage() {
  const videoList = await getVideos();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">视频</h1>
        <Link
          href="/admin/videos/new"
          className="rounded bg-[var(--color-primary)] px-4 py-2 text-white hover:bg-[#2fb54a]"
        >
          创建视频
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">标题</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">视频 URL</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">类型</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">激活</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {videoList.map((video) => (
              <tr key={video.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{video.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{video.title}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{video.slug}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {video.url ? (
                    <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-xs block">
                      {video.url}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{video.type || "-"}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{video.isActive ? "是" : "否"}</td>
                <td className="px-6 py-4 text-sm">
                  <Link href={`/admin/videos/${video.id}`} className="text-blue-600 hover:text-blue-900">
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

