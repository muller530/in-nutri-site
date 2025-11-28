import { redirect } from "next/navigation";
import { parseAdminFromCookie } from "@/lib/auth";
import { cookies } from "next/headers";
import Link from "next/link";

async function getAdmin() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("in_admin_session");
    return await parseAdminFromCookie(sessionCookie?.value);
  } catch (error) {
    // 如果数据库连接失败，返回 null（允许访问登录页面）
    console.error("Error getting admin:", error);
    return null;
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();
  
  // If not authenticated, redirect to login
  if (!admin) {
    redirect("/admin/login");
  }

  const navItems = [
    { href: "/admin", label: "仪表盘" },
    { href: "/admin/products", label: "产品" },
    { href: "/admin/articles", label: "文章" },
    { href: "/admin/recipes", label: "食谱" },
    { href: "/admin/banners", label: "横幅" },
    { href: "/admin/brand-story", label: "品牌故事" },
    { href: "/admin/videos", label: "视频" },
    { href: "/admin/gallery", label: "图库" },
    { href: "/admin/members", label: "成员" },
    { href: "/admin/site-settings", label: "站点设置" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-6">
          <h1 className="text-xl font-bold">In-nutri 管理后台</h1>
          <p className="mt-1 text-sm text-gray-400">{admin.email}</p>
        </div>
        <nav className="px-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded px-4 py-2 text-sm hover:bg-gray-800"
            >
              {item.label}
            </Link>
          ))}
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="mt-4 w-full rounded px-4 py-2 text-left text-sm hover:bg-gray-800">
              退出登录
            </button>
          </form>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

