import Image from "next/image";
import { getApiUrl } from "@/lib/api";

async function getRecipes() {
  try {
    const res = await fetch(getApiUrl("/api/recipes"), {
      cache: "no-store",
    });
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function LifestyleGrid() {
  const recipes = await getRecipes();
  const displayRecipes = recipes.slice(0, 4);

  // Fallback to default scenarios if no data
  const defaultScenarios = [
    {
      title: "控糖早餐搭配",
      copy: "印尼可可粉 + 无糖杏仁奶，摇匀即得暖胃热巧，控糖仍然有幸福感。",
      image: "https://images.unsplash.com/photo-1483918793747-5adbf82956c4?auto=format&fit=crop&w=900&q=80",
    },
    {
      title: "健身后恢复",
      copy: "在蛋白奶昔里加一勺巴西莓奇亚籽粉，补回抗氧化与健康脂肪酸。",
      image: "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?auto=format&fit=crop&w=900&q=80",
    },
    {
      title: "下午茶代替奶茶",
      copy: "姜黄菊粉 Golden Latte，顺滑又带一点香料感，精神与身体同步放松。",
      image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=80",
    },
    {
      title: "熬夜后的轻体调理",
      copy: "加菊粉的藕粉晚安杯，补充纤维并帮助肠道菌群恢复元气。",
      image: "https://images.unsplash.com/photo-1464306076886-da185f6a9d12?auto=format&fit=crop&w=900&q=80",
    },
  ];

  interface Recipe {
    name?: string;
    description?: string;
    heroImage?: string;
  }

  const scenarios = displayRecipes.length > 0
    ? displayRecipes.map((recipe: Recipe) => ({
        title: recipe.name || "",
        copy: recipe.description || "",
        image: recipe.heroImage || "https://images.unsplash.com/photo-1483918793747-5adbf82956c4?auto=format&fit=crop&w=900&q=80",
      }))
    : defaultScenarios;

  return (
    <section className="relative z-0 bg-white">
      <div className="page-shell py-24">
        <div className="flex flex-col gap-4 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-primary)]">LIFESTYLE</p>
          <h2 className="text-3xl font-light text-[var(--color-forest)] sm:text-[40px]">
            让真实生活拥有轻盈、好喝、好坚持的仪式感
          </h2>
          <p className="text-[var(--color-ink)]/70">
            In-nutri 不卖虚拟概念，只提供对生活有用的冲泡方案。
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {scenarios.map((scenario: { title: string; copy: string; image: string }, index: number) => (
            <article
              key={scenario.title || index}
              className="group overflow-hidden rounded-[32px] border border-[var(--color-mint)]/60 bg-[var(--color-soft-mint)]"
            >
              <div className="relative h-60 w-full overflow-hidden">
                <Image
                  src={scenario.image}
                  unoptimized={true}
                  alt={scenario.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="space-y-3 p-6">
                <h3 className="text-xl font-semibold text-[var(--color-forest)]">{scenario.title}</h3>
                <p className="text-sm text-[var(--color-ink)]/75">{scenario.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

