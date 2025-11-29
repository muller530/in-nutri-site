import Link from "next/link";
import { NavigationServer } from "@/components/NavigationServer";
import { SiteFooter } from "@/components/SiteFooter";
import { PageContentWrapper } from "@/components/PageContentWrapper";

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-white">
      <NavigationServer />
      
      <PageContentWrapper>
        <div className="page-shell py-24">
          <div className="text-center">
            <h1 className="text-4xl font-semibold text-gray-900 mb-4">
              产品未找到
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              抱歉，您要查找的产品不存在或已被移除。
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/products"
                className="rounded bg-[var(--color-forest)] px-6 py-3 text-base font-medium text-white transition-colors hover:bg-[var(--color-primary)]"
              >
                查看所有产品
              </Link>
              <Link
                href="/"
                className="rounded border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </PageContentWrapper>

      <SiteFooter />
    </div>
  );
}

