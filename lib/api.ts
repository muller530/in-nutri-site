export function getApiUrl(path: string): string {
  // 在服务器端（Server Component），需要绝对 URL
  if (typeof window === "undefined") {
    // 本地开发环境
    if (process.env.NODE_ENV === "development") {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      return `${baseUrl}${path}`;
    }
    // 生产环境（Cloudflare Pages），使用相对路径
    return path;
  }
  // 客户端，使用相对路径
  return path;
}

