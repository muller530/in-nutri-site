// Cloudflare R2 存储适配器

// 获取 R2 存储桶
export function getR2Bucket(bucketName: "UPLOADS_BUCKET" | "VIDEOS_BUCKET" | "REPORTS_BUCKET"): any | null {
  if (typeof (globalThis as any)[bucketName] !== "undefined") {
    return (globalThis as any)[bucketName];
  }
  return null;
}

// 上传文件到 R2
export async function uploadToR2(
  bucket: any,
  file: File,
  path: string
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const contentType = file.type || "application/octet-stream";
  
  await bucket.put(path, arrayBuffer, {
    httpMetadata: {
      contentType,
    },
  });

  // 返回公共访问 URL
  // 注意：实际部署时需要配置 R2 的公共访问或使用自定义域名
  // 这里返回相对路径，前端需要根据实际配置调整
  const baseUrl = process.env.R2_PUBLIC_URL || "";
  return baseUrl ? `${baseUrl}/${path}` : `/uploads/${path}`;
}

// 检查是否在 Cloudflare 环境
export function isCloudflare(): boolean {
  return typeof (globalThis as any).UPLOADS_BUCKET !== "undefined" || 
         typeof (globalThis as any).DB !== "undefined" ||
         process.env.CF_PAGES === "1";
}
