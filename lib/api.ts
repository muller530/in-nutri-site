/**
 * 检查是否是构建时
 * 只在真正的构建阶段返回 true，运行时应该返回 false
 */
export function isBuildTime(): boolean {
  // 检查 NEXT_PHASE 环境变量（Next.js 构建时设置）
  const nextPhase = process.env.NEXT_PHASE;
  if (nextPhase === "phase-production-build" || 
      nextPhase === "phase-production-compile" ||
      nextPhase === "phase-export") {
    return true;
  }
  
  // 如果不在构建阶段，返回 false（即使没有配置 NEXT_PUBLIC_BASE_URL）
  // 运行时应该尝试 fetch，即使可能失败
  return false;
}

export function getApiUrl(path: string): string {
  // 在服务器端（Server Component）
  if (typeof window === "undefined") {
    // 本地开发环境
    if (process.env.NODE_ENV === "development") {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      return `${baseUrl}${path}`;
    }
    
    // 构建时：不应该调用此函数，应该在调用前检查 isBuildTime()
    // 如果确实在构建时调用，返回相对路径（虽然可能无法使用，但不会报错）
    if (isBuildTime()) {
      return path;
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

