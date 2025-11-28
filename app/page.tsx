// 完全静态的首页，逐步排查问题
export default function Home() {
  return (
    <div className="bg-[var(--color-cream)] text-[var(--color-forest)]">
      {/* Hero 区域 - 完全静态 */}
      <header className="relative isolate overflow-hidden text-white min-h-screen" style={{ backgroundColor: '#082317' }}>
        <div className="absolute inset-0 z-0" style={{
          background: 'linear-gradient(135deg, #0E4F2E 0%, #1a6b3f 50%, #082317 100%)',
        }} />
        <div className="absolute inset-0 bg-[#082317]/50 z-10" />
        
        <div className="page-shell relative z-30 flex min-h-screen flex-col items-center justify-center gap-10 py-24 text-center">
          <h1 className="text-4xl font-light leading-tight tracking-wide sm:text-5xl lg:text-6xl">
            In-nutri · 有态度的超级食物
          </h1>
          <div className="text-2xl font-semibold text-[#e9ffec]">
            源自真实原料
          </div>
          <p className="text-base text-white/80 sm:text-lg max-w-3xl">
            我们用看得见的原料，而不是听起来很厉害的噱头。让自然成分在城市生活中重新被看见。
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a
              href="#products"
              className="rounded-full bg-[#2fb54a] px-10 py-3 font-medium text-[#0b2113] shadow-xl transition hover:-translate-y-0.5"
            >
              了解更多
            </a>
            <a
              href="#philosophy"
              className="rounded-full border border-white/30 px-10 py-3 font-medium text-white transition hover:-translate-y-0.5 hover:border-white hover:bg-white/10"
            >
              了解因纽粹的态度
            </a>
          </div>
        </div>
      </header>

      {/* 品牌故事区域 - 完全静态 */}
      <section id="philosophy" className="bg-white">
        <div className="page-shell grid gap-12 py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="space-y-4 max-w-3xl">
              <p className="text-xs uppercase tracking-[0.4em] text-[#2fb54a]">BRAND ATTITUDE</p>
              <h2 className="text-3xl font-light text-[#0e4f2e] sm:text-[40px] sm:leading-snug">
                我们只做一件事：把"超级食物"还原成看得见的好原料。
              </h2>
              <p className="text-base leading-relaxed text-[#222222]/70">
                保持真实与克制，是因纽粹的独特态度。我们以国际视角挑选原料，再以科学方式呈现其价值。
              </p>
            </div>
            <ul className="space-y-4 rounded-3xl bg-[#f0f9f3]/70 p-6">
              <li className="text-base text-[#222222]/80">🌱 原产地严选：印尼可可、锡兰肉桂、秘鲁姜黄、巴西莓等</li>
              <li className="text-base text-[#222222]/80">🧪 公开检测与关键营养数据，不玩概念游戏</li>
              <li className="text-base text-[#222222]/80">🍃 少加工、无蔗糖添加、不额外加香精</li>
              <li className="text-base text-[#222222]/80">⚖️ 让控糖、轻体、养护变成可坚持的日常习惯</li>
            </ul>
          </div>

          <div className="space-y-6">
            <article className="rounded-3xl border border-[#e7f6ec]/60 bg-white p-6 shadow-lg transition hover:-translate-y-1">
              <p className="text-xs uppercase tracking-[0.35em] text-[#2fb54a]/80">植物活性科学</p>
              <p className="mt-3 text-lg font-medium text-[#0e4f2e]">甄选 18 种高纯度植物活性分子，联合冷萃与低温冻干技术，保留营养完整结构。</p>
            </article>
            <article className="rounded-3xl border border-[#e7f6ec]/60 bg-white p-6 shadow-lg transition hover:-translate-y-1">
              <p className="text-xs uppercase tracking-[0.35em] text-[#2fb54a]/80">精准配方矩阵</p>
              <p className="mt-3 text-lg font-medium text-[#0e4f2e]">基于亚洲人基因数据库，构建水溶、脂溶双通道吸收路径，提升 32% 功效稳定性。</p>
            </article>
            <article className="rounded-3xl border border-[#e7f6ec]/60 bg-white p-6 shadow-lg transition hover:-translate-y-1">
              <p className="text-xs uppercase tracking-[0.35em] text-[#2fb54a]/80">临床验证体系</p>
              <p className="mt-3 text-lg font-medium text-[#0e4f2e]">与三甲医院共建营养实验室，持续输出双盲测试报告，保障真实有效。</p>
            </article>
          </div>
        </div>
      </section>

      {/* 服务区域 - 完全静态 */}
      <section className="bg-white">
        <div className="page-shell py-24">
          <div className="space-y-4 text-center max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-[0.4em] text-[#2fb54a]">SIGNATURE SERVICE</p>
            <h2 className="text-3xl font-light text-[#0e4f2e] sm:text-[40px] sm:leading-snug">不仅是产品，更是可执行的超级食物日程</h2>
            <p className="text-base leading-relaxed text-[#222222]/70">
              In-nutri 团队持续迭代冲泡方式、数据追踪工具与生活方式指南，让"坚持"更轻松。
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <article className="rounded-[28px] border border-[#e7f6ec]/60 bg-[#f0f9f3] p-6 transition hover:-translate-y-1 hover:bg-white">
              <h3 className="text-xl font-semibold text-[#0e4f2e]">1v1 功能营养师</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#222222]/70">专属营养档案 + 指标跟踪，提供控糖、轻体、修护三大模块方案。</p>
            </article>
            <article className="rounded-[28px] border border-[#e7f6ec]/60 bg-[#f0f9f3] p-6 transition hover:-translate-y-1 hover:bg-white">
              <h3 className="text-xl font-semibold text-[#0e4f2e]">超级食物冲泡指南</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#222222]/70">以日程表形式拆解早午晚冲泡方式，附带科学依据与注意事项。</p>
            </article>
            <article className="rounded-[28px] border border-[#e7f6ec]/60 bg-[#f0f9f3] p-6 transition hover:-translate-y-1 hover:bg-white">
              <h3 className="text-xl font-semibold text-[#0e4f2e]">可持续补充体系</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#222222]/70">可回收补充装、轻量包装与绿色物流，减少每一次补给的环境足迹。</p>
            </article>
          </div>
        </div>
      </section>

      {/* 产品展示区域 - 完全静态 */}
      <section id="products" className="bg-[#e7f6ec]/40">
        <div className="page-shell py-24">
          <div className="space-y-4 text-center max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-[0.4em] text-[#2fb54a]">SUPERFOOD COLLECTION</p>
            <h2 className="text-3xl font-light text-[#0e4f2e] sm:text-[40px] sm:leading-snug">三大功能线，覆盖全天候的超级食物补能</h2>
            <p className="text-base leading-relaxed text-[#222222]/70">
              晨间控糖、午间防护、夜间修护，In-nutri 将原料与真实场景紧密相连。
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <article className="group flex flex-col rounded-3xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:shadow-xl overflow-hidden h-full">
              <div className="relative flex-1 min-h-[280px] overflow-hidden bg-gradient-to-b from-gray-50 to-white px-6 pt-8 pb-4">
                <div className="relative h-full w-full flex items-center justify-center z-10">
                  <div className="text-4xl">🥑</div>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-semibold text-[#0e4f2e]">巴西莓粉</h3>
                <p className="text-sm text-[#222222]/70">高ORAC抗氧化值，富含花青素</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 text-xs rounded-full bg-[#e7f6ec] text-[#0e4f2e]">高抗氧化</span>
                  <span className="px-3 py-1 text-xs rounded-full bg-[#e7f6ec] text-[#0e4f2e]">能量提升</span>
                </div>
                <a href="#" className="block w-full mt-4 text-center rounded-full bg-[#2fb54a] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#28a042]">
                  点击购买
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 科学数据区域 - 完全静态 */}
      <section id="science" className="bg-[#0e4f2e] text-[#f7f5ef]">
        <div className="page-shell py-20">
          <div className="flex flex-col gap-4 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-[#2fb54a]/90">SCIENCE BACKED</p>
            <h2 className="text-3xl font-light sm:text-4xl">真实营养数据，更安心的超级食物体系</h2>
            <p className="text-[#f7f5ef]/70">
              我们以透明配方与关键指标呈现每一款原料的底气，让每一次冲泡都心里有数。
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-3xl border border-white/15 bg-white/5 p-6 text-left transition hover:-translate-y-1 hover:bg-white/10">
              <p className="text-sm uppercase tracking-[0.3em] text-[#2fb54a]">巴西莓粉</p>
              <p className="mt-3 text-xl font-semibold text-white">ORAC≈蓝莓 3-5 倍</p>
              <p className="mt-3 text-sm text-white/70">冷冻干燥方式保留抗氧化力，可搭配酸奶 / 冰沙作为午后慢补。</p>
            </article>
            <article className="rounded-3xl border border-white/15 bg-white/5 p-6 text-left transition hover:-translate-y-1 hover:bg-white/10">
              <p className="text-sm uppercase tracking-[0.3em] text-[#2fb54a]">锡兰肉桂粉</p>
              <p className="mt-3 text-xl font-semibold text-white">C5 等级 · 控糖搭档</p>
              <p className="mt-3 text-sm text-white/70">挥发油含量更高，适合加在代糖拿铁或燕麦中，平衡血糖波动。</p>
            </article>
            <article className="rounded-3xl border border-white/15 bg-white/5 p-6 text-left transition hover:-translate-y-1 hover:bg-white/10">
              <p className="text-sm uppercase tracking-[0.3em] text-[#2fb54a]">姜黄粉</p>
              <p className="mt-3 text-xl font-semibold text-white">3% 以上姜黄素</p>
              <p className="mt-3 text-sm text-white/70">搭配胡椒碱与植物奶，支持抗氧化与运动后修护。</p>
            </article>
            <article className="rounded-3xl border border-white/15 bg-white/5 p-6 text-left transition hover:-translate-y-1 hover:bg-white/10">
              <p className="text-sm uppercase tracking-[0.3em] text-[#2fb54a]">菊粉</p>
              <p className="mt-3 text-xl font-semibold text-white">膳食纤维 ＞ 85%</p>
              <p className="mt-3 text-sm text-white/70">可溶性纤维帮助肠道菌群与糖代谢，是轻体阶段的隐藏王牌。</p>
            </article>
          </div>
        </div>
      </section>

      {/* 预约区域 - 完全静态 */}
      <section className="bg-[#e7f6ec]">
        <div className="page-shell flex flex-col items-center gap-6 py-20 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-[#2fb54a]">BOOK A TASTING</p>
          <h3 className="text-3xl font-light text-[#0e4f2e] sm:text-4xl">
            预约线下感官工作坊，体验 45 分钟的超级食物诊断
          </h3>
          <p className="text-sm text-[#0e4f2e]/70">
            上海 · 北京快闪工作室限时开放，发送邮件至 hello@innutri.com 或扫描二维码即可预约。
          </p>
          <button className="rounded-full bg-[#0e4f2e] px-8 py-3 text-sm font-medium text-[#f7f5ef] transition hover:-translate-y-0.5">
            立即预约体验
          </button>
        </div>
      </section>

      {/* 页脚 - 完全静态 */}
      <footer className="bg-[#0e4f2e] text-[#f7f5ef]">
        <div className="page-shell py-16">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <p className="text-sm font-medium mb-4">关于 In-nutri</p>
              <p className="text-sm text-[#f7f5ef]/70">
                我们用看得见的原料，而不是听起来很厉害的噱头。
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-4">产品系列</p>
              <ul className="space-y-2 text-sm text-[#f7f5ef]/70">
                <li><a href="#" className="hover:text-[#f7f5ef]">超级食物粉</a></li>
                <li><a href="#" className="hover:text-[#f7f5ef]">功能营养</a></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium mb-4">联系方式</p>
              <p className="text-sm text-[#f7f5ef]/70">hello@innutri.com</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-4">关注我们</p>
              <div className="flex gap-4">
                <a href="#" className="text-[#f7f5ef]/70 hover:text-[#f7f5ef]">抖音</a>
                <a href="#" className="text-[#f7f5ef]/70 hover:text-[#f7f5ef]">小红书</a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-[#f7f5ef]/20 text-center text-sm text-[#f7f5ef]/70">
            <p>© 2024 In-nutri. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
