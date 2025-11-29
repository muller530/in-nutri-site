import * as fs from "fs";
import * as path from "path";

// 找到所有 route.ts 文件
const routeFiles: string[] = [];

function findRouteFiles(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findRouteFiles(filePath);
    } else if (file === "route.ts") {
      routeFiles.push(filePath);
    }
  }
}

findRouteFiles("app/api");

console.log(`找到 ${routeFiles.length} 个 route.ts 文件`);

for (const filePath of routeFiles) {
  let content = fs.readFileSync(filePath, "utf-8");
  
  // 移除所有 export const runtime = 'edge'; 声明
  content = content.replace(/export const runtime = 'edge';\s*/g, "");
  
  // 找到第一个 import 语句之后的位置
  const lines = content.split("\n");
  let insertIndex = -1;
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith("import ")) {
      lastImportIndex = i;
    } else if (lastImportIndex !== -1 && !lines[i].trim().startsWith("import ") && lines[i].trim() !== "") {
      insertIndex = i;
      break;
    }
  }
  
  // 如果没有找到 import 语句，在文件开头插入
  if (insertIndex === -1) {
    insertIndex = lastImportIndex !== -1 ? lastImportIndex + 1 : 0;
  }
  
  // 在正确位置插入 runtime 声明
  if (insertIndex > 0 && lines[insertIndex - 1].trim() !== "") {
    lines.splice(insertIndex, 0, "", "export const runtime = 'edge';");
  } else {
    lines.splice(insertIndex, 0, "export const runtime = 'edge';");
  }
  
  const fixedContent = lines.join("\n");
  fs.writeFileSync(filePath, fixedContent, "utf-8");
  console.log(`已修复: ${filePath}`);
}

console.log("完成！");



