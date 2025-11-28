import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";

import { getR2Bucket, isCloudflare, uploadToR2 } from "@/lib/r2";

import { v4 as uuidv4 } from "uuid";

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "没有上传文件" }, { status: 400 });
    }

    // 验证文件类型
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "不支持的文件类型。仅支持 JPG、PNG、WEBP 格式" },
        { status: 400 }
      );
    }

    // 验证文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "文件大小超过限制。最大支持 5MB" },
        { status: 400 }
      );
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split(".").pop();
    const fileName = `${timestamp}-${randomStr}.${fileExtension}`;
    const filePath = `products/${fileName}`;

    let fileUrl: string;

    // 检查是否在 Cloudflare 环境
    if (isCloudflare()) {
      // 使用 R2 存储
      const bucket = getR2Bucket("UPLOADS_BUCKET");
      if (!bucket) {
        return NextResponse.json(
          { error: "R2 存储桶未配置" },
          { status: 500 }
        );
      }
      fileUrl = await uploadToR2(bucket, file, filePath);
    } else {
      // 使用本地文件系统（仅在 Node.js 环境下）
      const { writeFile, mkdir } = await import("fs/promises");
      const { join } = await import("path");
      const { existsSync } = await import("fs");
      
      const uploadDir = join(process.cwd(), "public", "uploads", "products");
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }
      const localFilePath = join(uploadDir, fileName);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(localFilePath, buffer);
      fileUrl = `/uploads/products/${fileName}`;
    }

    return NextResponse.json({ url: fileUrl, success: true });
  } catch (error) {
    console.error("文件上传错误:", error);
    return NextResponse.json(
      { error: "文件上传失败" },
      { status: 500 }
    );
  }
}

