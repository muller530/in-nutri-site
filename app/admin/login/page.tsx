"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        // 登录成功，跳转到管理后台
        router.push("/admin");
        router.refresh();
      } else {
        // 显示具体错误信息，提供更友好的提示
        let errorMessage = data.error || `登录失败 (HTTP ${res.status})`;
        
        // 根据错误类型提供更详细的提示
        if (errorMessage.includes("数据库连接失败")) {
          errorMessage = "数据库连接失败。请检查：\n1. 数据库文件是否存在\n2. 数据库文件权限是否正确\n3. 环境变量配置是否正确";
        } else if (errorMessage.includes("EdgeOne")) {
          errorMessage = "EdgeOne 环境不支持 SQLite。请配置云数据库（MySQL/PostgreSQL）或使用腾讯云服务器部署。";
        } else if (errorMessage.includes("邮箱或密码错误")) {
          errorMessage = "邮箱或密码错误。默认管理员账号：\n邮箱: admin@in-nutri.com\n密码: inNutriAdmin123";
        } else if (errorMessage.includes("账户已被禁用")) {
          errorMessage = "账户已被禁用，请联系系统管理员。";
        } else if (errorMessage.includes("创建会话失败")) {
          errorMessage = "创建会话失败。请检查 SESSION_SECRET 环境变量是否正确配置。";
        }
        
        setError(errorMessage);
        console.error("登录失败:", {
          status: res.status,
          error: data.error,
          response: data
        });
      }
    } catch (err: any) {
      const errorMessage = err?.message || "网络错误，请检查网络连接";
      setError(errorMessage);
      console.error("登录请求异常:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">In-nutri 管理后台登录</h1>
        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700 whitespace-pre-line">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
              required
            />
          </div>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-[var(--color-primary)] px-4 py-2 font-medium text-white hover:bg-[#2fb54a] disabled:opacity-50"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>
      </div>
    </div>
  );
}

