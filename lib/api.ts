/**
 * 检查是否是构建时
 */
export function isBuildTime(): boolean {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.NEXT_PHASE === "phase-production-compile" ||
    process.env.NEXT_PHASE === "phase-export" ||
    // 如果没有配置 NEXT_PUBLIC_BASE_URL，可能是构建时
    (!process.env.NEXT_PUBLIC_BASE_URL && process.env.NODE_ENV === "production")
  );
}

export function getApiUrl(path: string): string {
  // 在服务器端（Server Component）
  if (typeof window === "undefined") {
    // 本地开发环境
    if (process.env.NODE_ENV === "development") {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      return `${baseUrl}${path}`;
    }
    
    // 构建时：返回 null 标记（调用者应该检查）
    // 注意：这个函数不应该在构建时被调用，应该在调用前检查 isBuildTime()
    if (isBuildTime()) {
      // 构建时如果没有配置 base URL，抛出错误提示应该跳过 fetch
      throw new Error("Cannot fetch during build time without NEXT_PUBLIC_BASE_URL");
    }
    
    // 运行时：优先使用环境变量配置的 base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    process.env.EDGEONE_URL ||
                    process.env.CF_PAGES_URL || 
                    "";
    
    // 如果 baseUrl 存在且包含协议，使用它
    if (baseUrl && (baseUrl.startsWith("http://") || baseUrl.startsWith("https://"))) {
      return `${baseUrl}${path}`;
    }
    
    // 如果 baseUrl 存在但不包含协议，添加 https://
    if (baseUrl && !baseUrl.startsWith("http")) {
      return `https://${baseUrl}${path}`;
    }
    
    // 运行时：如果没有配置 base URL，使用相对路径
    // Next.js 在 Node.js Runtime 中可以处理相对路径的 fetch
    return path;
  }
  // 客户端，使用相对路径
  return path;
}

