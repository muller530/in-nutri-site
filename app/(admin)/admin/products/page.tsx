import Link from "next/link";
export const runtime = 'nodejs'; // 使用 Node.js runtime，因为需要数据库连接
export const dynamic = 'force-dynamic'; // 强制动态渲染，因为需要数据库访问
import { db } from "@/db";
import { products } from "@/db/schema";

async function getProducts() {
  try {
    return await db.select().from(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    // 如果数据库表不存在或连接失败，返回空数组
    return [];
  }
}

export default async function AdminProductsPage() {
  const productList = await getProducts();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">产品</h1>
        <Link
          href="/admin/products/new"
          className="rounded bg-[var(--color-primary)] px-4 py-2 text-white hover:bg-[#2fb54a]"
        >
          创建产品
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">价格</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">更新时间</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {productList.map((product: any) => (
              <tr key={product.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{product.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{product.slug}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {product.priceCents !== null && product.priceCents !== undefined 
                    ? `¥${(product.priceCents / 100).toFixed(2)}` 
                    : "-"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : "-"}
                </td>
                <td className="px-6 py-4 text-sm">
                  <Link href={`/admin/products/${product.id}`} className="text-blue-600 hover:text-blue-900">
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

