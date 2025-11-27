import Link from "next/link";
import { db } from "@/db";
import { articles } from "@/db/schema";

async function getArticles() {
  return await db.select().from(articles);
}

export default async function AdminArticlesPage() {
  const articleList = await getArticles();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">文章</h1>
        <Link
          href="/admin/articles/new"
          className="rounded bg-[var(--color-primary)] px-4 py-2 text-white hover:bg-[#2fb54a]"
        >
          创建文章
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">标题</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">已发布</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">更新时间</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {articleList.map((article: any) => (
              <tr key={article.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{article.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{article.title}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{article.slug}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{article.published ? "是" : "否"}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {article.updatedAt ? new Date(article.updatedAt).toLocaleDateString() : "-"}
                </td>
                <td className="px-6 py-4 text-sm">
                  <Link href={`/admin/articles/${article.id}`} className="text-blue-600 hover:text-blue-900">
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

