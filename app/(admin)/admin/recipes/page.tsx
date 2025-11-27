import Link from "next/link";
import { db } from "@/db";
import { recipes } from "@/db/schema";

async function getRecipes() {
  return await db.select().from(recipes);
}

export default async function AdminRecipesPage() {
  const recipeList = await getRecipes();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">食谱</h1>
        <Link
          href="/admin/recipes/new"
          className="rounded bg-[var(--color-primary)] px-4 py-2 text-white hover:bg-[#2fb54a]"
        >
          创建食谱
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">难度</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">更新时间</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {recipeList.map((recipe) => (
              <tr key={recipe.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{recipe.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{recipe.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{recipe.slug}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{recipe.difficulty || "-"}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {recipe.updatedAt ? new Date(recipe.updatedAt).toLocaleDateString() : "-"}
                </td>
                <td className="px-6 py-4 text-sm">
                  <Link href={`/admin/recipes/${recipe.id}`} className="text-blue-600 hover:text-blue-900">
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

