const highlights = [
  {
    title: "巴西莓粉",
    metric: "ORAC≈蓝莓 3-5 倍",
    description: "冷冻干燥方式保留抗氧化力，可搭配酸奶 / 冰沙作为午后慢补。",
  },
  {
    title: "锡兰肉桂粉",
    metric: "C5 等级 · 控糖搭档",
    description: "挥发油含量更高，适合加在代糖拿铁或燕麦中，平衡血糖波动。",
  },
  {
    title: "姜黄粉",
    metric: "3% 以上姜黄素",
    description: "搭配胡椒碱与植物奶，支持抗氧化与运动后修护。",
  },
  {
    title: "菊粉",
    metric: "膳食纤维 ＞ 85%",
    description: "可溶性纤维帮助肠道菌群与糖代谢，是轻体阶段的隐藏王牌。",
  },
];

export function ScienceHighlights() {
  return (
    <section id="science" className="relative z-0 bg-[var(--color-forest)] text-[var(--color-cream)]">
      <div className="page-shell py-20">
        <div className="flex flex-col gap-4 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-primary)]/90">SCIENCE BACKED</p>
          <h2 className="text-3xl font-light sm:text-4xl">真实营养数据，更安心的超级食物体系</h2>
          <p className="text-[var(--color-cream)]/70">
            我们以透明配方与关键指标呈现每一款原料的底气，让每一次冲泡都心里有数。
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-white/15 bg-white/5 p-6 text-left transition hover:-translate-y-1 hover:bg-white/10"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-primary)]">{item.title}</p>
              <p className="mt-3 text-xl font-semibold text-white">{item.metric}</p>
              <p className="mt-3 text-sm text-white/70">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

