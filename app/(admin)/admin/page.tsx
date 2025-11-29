import { db } from "@/db";
export const runtime = 'nodejs'; // 使用 Node.js runtime，因为需要数据库连接
export const dynamic = 'force-dynamic'; // 强制动态渲染，因为需要数据库访问
import { products, articles, recipes, banners, videos, galleryImages } from "@/db/schema";

async function getStats() {
  try {
    const [productCount, articleCount, recipeCount, bannerCount, videoCount, galleryCount] = await Promise.all([
      db.select().from(products).catch(() => []),
      db.select().from(articles).catch(() => []),
      db.select().from(recipes).catch(() => []),
      db.select().from(banners).catch(() => []),
      db.select().from(videos).catch(() => []),
      db.select().from(galleryImages).catch(() => []),
    ]);

    return {
      products: productCount.length,
      articles: articleCount.length,
      recipes: recipeCount.length,
      banners: bannerCount.length,
      videos: videoCount.length,
      gallery: galleryCount.length,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    // 如果数据库表不存在或连接失败，返回零值
    return {
      products: 0,
      articles: 0,
      recipes: 0,
      banners: 0,
      videos: 0,
      gallery: 0,
    };
  }
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-gray-900">仪表盘</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-700">产品</h2>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.products}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-700">文章</h2>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.articles}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-700">食谱</h2>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.recipes}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-700">横幅</h2>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.banners}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-700">视频</h2>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.videos}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-700">图库图片</h2>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.gallery}</p>
        </div>
      </div>
    </div>
  );
}

