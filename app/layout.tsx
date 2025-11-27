import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ScrollReset } from "@/components/ScrollReset";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "In Nutri | 功能营养品牌官网",
  description: "In Nutri 以精准营养科技打造全天候能量管理方案，包含复合营养粉、胶原饮与植萃片等产品系列。",
  keywords: [
    "营养品牌",
    "功能营养",
    "健康食品",
    "胶原饮",
    "复合营养粉",
    "In Nutri",
  ],
  metadataBase: new URL("https://example.com"),
  openGraph: {
    title: "In Nutri 功能营养 - 唤醒身体自我修复力",
    description:
      "以植物活性与临床数据打造的功能营养品牌，覆盖晨间代谢、日间防护与夜间修护三大场景。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} antialiased bg-[var(--color-cream)]`}>
        <ScrollReset />
        {children}
      </body>
    </html>
  );
}
