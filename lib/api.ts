export function getApiUrl(path: string): string {
  // 在服务器端（Server Component），需要绝对 URL
  if (typeof window === "undefined") {
    // 本地开发环境
    if (process.env.NODE_ENV === "development") {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      return `${baseUrl}${path}`;
    }
    // Cloudflare Pages 生产环境
    // 在 Edge Runtime 中，Server Component 的 fetch 需要绝对 URL
    // 尝试从请求头获取，如果没有则使用相对路径（Next.js 会自动处理）
    // 注意：在 Cloudflare Pages 上，相对路径应该可以工作
    // 但如果不行，我们需要使用环境变量或请求头
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    process.env.CF_PAGES_URL || 
                    "";
    
    if (baseUrl) {
      return `${baseUrl}${path}`;
    }
    
    // 如果没有配置 base URL，使用相对路径
    // Next.js 在 Edge Runtime 中应该能处理相对路径的 fetch
    return path;
  }
  // 客户端，使用相对路径
  return path;
}

