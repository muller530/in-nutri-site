export function getApiUrl(path: string): string {
  // 在服务器端（Server Component），需要绝对 URL
  if (typeof window === "undefined") {
    // 本地开发环境
    if (process.env.NODE_ENV === "development") {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      return `${baseUrl}${path}`;
    }
    // 生产环境（EdgeOne、Cloudflare Pages 等）
    // 优先使用环境变量配置的 base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    process.env.EDGEONE_URL ||
                    process.env.CF_PAGES_URL || 
                    "";
    
    if (baseUrl) {
      return `${baseUrl}${path}`;
    }
    
    // 如果没有配置 base URL，使用相对路径
    // Next.js 在 Node.js Runtime 中可以处理相对路径的 fetch
    return path;
  }
  // 客户端，使用相对路径
  return path;
}

