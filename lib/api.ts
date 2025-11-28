export function getApiUrl(path: string): string {
  // 在服务器端（Server Component），需要绝对 URL
  if (typeof window === "undefined") {
    // 本地开发环境
    if (process.env.NODE_ENV === "development") {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      return `${baseUrl}${path}`;
    }
    // Cloudflare Pages 生产环境
    // 在 Cloudflare Pages 上，Server Component 中的 fetch 可以使用相对路径
    // 但为了确保兼容性，我们检查是否有 CF_PAGES 环境变量
    if (process.env.CF_PAGES) {
      // 在 Cloudflare Pages 上，使用相对路径
      return path;
    }
    // 其他生产环境，尝试使用相对路径
    return path;
  }
  // 客户端，使用相对路径
  return path;
}

