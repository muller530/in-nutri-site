// 临时简化版本 - 逐个组件测试
export default function Home() {
  return (
    <div style={{ padding: "40px", backgroundColor: "#f7f5ef", minHeight: "100vh" }}>
      <h1 style={{ color: "#0e4f2e", fontSize: "32px", marginBottom: "20px" }}>
        In-nutri · 有态度的超级食物
      </h1>
      <p style={{ color: "#222222", fontSize: "16px", marginBottom: "20px" }}>
        我们用看得见的原料，而不是听起来很厉害的噱头。
      </p>
      <div style={{ 
        marginTop: "20px", 
        padding: "20px", 
        backgroundColor: "#2fb54a", 
        color: "white", 
        borderRadius: "8px" 
      }}>
        <p>这是一个临时简化版本，用于测试基本渲染。</p>
        <p>如果你能看到这个页面，说明基本渲染正常。</p>
        <p style={{ marginTop: "10px", fontSize: "14px" }}>
          请访问 <a href="/simple" style={{ color: "white", textDecoration: "underline" }}>/simple</a> 查看另一个测试页面。
        </p>
      </div>
    </div>
  );
}
