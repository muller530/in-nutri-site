// 诊断页面 - 检查各个组件和 API 是否正常工作
export default async function DebugPage() {
  const checks = [];

  // 检查 1: 基本渲染
  checks.push({ name: "基本渲染", status: "ok", message: "页面可以渲染" });

  // 检查 2: API 路由
  try {
    const res = await fetch("http://localhost:3000/api/banners", {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      checks.push({ 
        name: "Banners API", 
        status: "ok", 
        message: `返回了 ${data.data?.length || 0} 个横幅` 
      });
    } else {
      checks.push({ 
        name: "Banners API", 
        status: "error", 
        message: `HTTP ${res.status}` 
      });
    }
  } catch (error: any) {
    checks.push({ 
      name: "Banners API", 
      status: "error", 
      message: error.message || "连接失败" 
    });
  }

  // 检查 3: 数据库连接
  try {
    const { db } = await import("@/db");
    const result = await db.select().from((await import("@/db/schema")).banners).limit(1);
    checks.push({ 
      name: "数据库连接", 
      status: "ok", 
      message: "数据库连接正常" 
    });
  } catch (error: any) {
    checks.push({ 
      name: "数据库连接", 
      status: "error", 
      message: error.message || "连接失败" 
    });
  }

  return (
    <div style={{ padding: "40px", fontFamily: "monospace" }}>
      <h1 style={{ marginBottom: "30px" }}>诊断页面</h1>
      <div style={{ display: "grid", gap: "10px" }}>
        {checks.map((check, index) => (
          <div
            key={index}
            style={{
              padding: "15px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              backgroundColor: check.status === "ok" ? "#d4edda" : "#f8d7da",
            }}
          >
            <strong>{check.name}:</strong> {check.message}
          </div>
        ))}
      </div>
      <div style={{ marginTop: "30px", padding: "15px", backgroundColor: "#e7f3ff", borderRadius: "5px" }}>
        <h2>环境信息</h2>
        <p>NODE_ENV: {process.env.NODE_ENV}</p>
        <p>DATABASE_URL: {process.env.DATABASE_URL || "未设置"}</p>
      </div>
    </div>
  );
}

