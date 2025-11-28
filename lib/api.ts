export function getApiUrl(path: string): string {
  // Always use relative path for API calls
  // This works in both server and client components
  // In Cloudflare Pages, relative paths work correctly
  return path;
}

