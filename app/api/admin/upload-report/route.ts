import { NextRequest, NextResponse } from "next/server";

import { v4 as uuidv4 } from "uuid";

import { requireAdmin } from "@/lib/auth";

import { getR2Bucket, isCloudflare, uploadToR2 } from "@/lib/r2";

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request); // 确保只有管理员可以上传

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "未上传文件。" }, { status: 400 });
    }

    // 验证文件类型（仅 PDF）
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "不支持的文件类型。仅支持 PDF 格式。" }, { status: 400 });
    }

    // 验证文件大小 (最大 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "文件大小超过限制。最大支持 10MB。" }, { status: 400 });
    }

    // 获取文件扩展名（在 Cloudflare 和本地都可用）
    const fileName = file.name;
    const fileExtension = fileName.includes(".") 
      ? "." + fileName.split(".").pop() 
      : ".pdf";
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    const filePath = `reports/${uniqueFileName}`;

    let fileUrl: string;

    // 检查是否在 Cloudflare 环境
    if (isCloudflare()) {
      // 使用 R2 存储
      const bucket = getR2Bucket("REPORTS_BUCKET");
      if (!bucket) {
        return NextResponse.json(
          { error: "R2 报告存储桶未配置" },
          { status: 500 }
        );
      }
      fileUrl = await uploadToR2(bucket, file, filePath);
    } else {
      // 使用本地文件系统（仅在 Node.js 环境下）
      // 使用 Function 构造函数避免静态分析
      const loadFsPromises = new Function('return import("fs/promises")');
      const loadPath = new Function('return import("path")');
      
      const { writeFile, mkdir } = await loadFsPromises();
      const path = await loadPath();
      
      const uploadDir = path.join(process.cwd(), "public", "uploads", "reports");
      await mkdir(uploadDir, { recursive: true });
      const buffer = Buffer.from(await file.arrayBuffer());
      const localFilePath = path.join(uploadDir, uniqueFileName);
      await writeFile(localFilePath, buffer);
      fileUrl = `/uploads/reports/${uniqueFileName}`;
    }
    return NextResponse.json({ url: fileUrl, message: "文件上传成功！" });
  } catch (error) {
    if (error instanceof Response) return error; // 来自 requireAdmin 的未授权响应
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "文件上传失败。" }, { status: 500 });
  }
}

