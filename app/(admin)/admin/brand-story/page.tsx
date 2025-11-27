import { db } from "@/db";
export const runtime = 'edge';
import { brandStory } from "@/db/schema";
import Link from "next/link";

async function getBrandStory() {
  const story = await db.select().from(brandStory).limit(1);
  if (story.length === 0) {
    // Create default if empty
    const defaultStory = await db
      .insert(brandStory)
      .values({
        heroTitle: "In-nutri · 有态度的超级食物",
        heroSubtitle: "源自真实原料",
        mission: "",
        vision: "",
        brandTone: "",
        storyBlocks: "[]",
      })
      .returning();
    return defaultStory[0];
  }
  return story[0];
}

export default async function AdminBrandStoryPage() {
  const story = await getBrandStory();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">品牌故事</h1>
        <Link
          href="/admin/brand-story/edit"
          className="rounded bg-[var(--color-primary)] px-4 py-2 text-white hover:bg-[#2fb54a]"
        >
          编辑品牌故事
        </Link>
      </div>
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">主标题</label>
            <p className="mt-1 text-gray-900">{story.heroTitle || "-"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">副标题</label>
            <p className="mt-1 text-gray-900">{story.heroSubtitle || "-"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">使命</label>
            <p className="mt-1 text-gray-900">{story.mission || "-"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">愿景</label>
            <p className="mt-1 text-gray-900">{story.vision || "-"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">品牌调性</label>
            <p className="mt-1 text-gray-900">{story.brandTone || "-"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">最后更新</label>
            <p className="mt-1 text-gray-900">
              {story.updatedAt ? new Date(story.updatedAt).toLocaleString() : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

