export function getApiUrl(path: string): string {
  // In server components, we can use absolute URL
  if (typeof window === "undefined") {
    // Server-side: use environment variable or default to localhost
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    return `${baseUrl}${path}`;
  }
  // Client-side: use relative path
  return path;
}

