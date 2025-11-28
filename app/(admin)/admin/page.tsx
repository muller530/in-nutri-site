import { db } from "@/db";
export const runtime = 'nodejs'; // 使用 Node.js runtime，因为需要数据库连接
import { products, articles, recipes, banners, videos, galleryImages } from "@/db/schema";

async function getStats() {
  const [productCount, articleCount, recipeCount, bannerCount, videoCount, galleryCount] = await Promise.all([
    db.select().from(products),
    db.select().from(articles),
    db.select().from(recipes),
    db.select().from(banners),
    db.select().from(videos),
    db.select().from(galleryImages),
  ]);

  return {
    products: productCount.length,
    articles: articleCount.length,
    recipes: recipeCount.length,
    banners: bannerCount.length,
    videos: videoCount.length,
    gallery: galleryCount.length,
  };
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

