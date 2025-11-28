// 最简单的测试页面
export default function Home() {
  return (
    <div style={{ padding: "40px", backgroundColor: "#f7f5ef", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ color: "#0e4f2e", fontSize: "32px", margin: 0, marginBottom: "20px" }}>测试页面</h1>
      <p style={{ color: "#222222", fontSize: "16px", margin: 0, marginBottom: "20px" }}>
        如果你能看到这个页面，说明基本渲染正常。
      </p>
      <div style={{ 
        marginTop: "20px", 
        padding: "20px", 
        backgroundColor: "#2fb54a", 
        color: "white", 
        borderRadius: "8px" 
      }}>
        <p style={{ margin: 0 }}>这是一个完全静态的测试页面，不依赖任何组件或 API。</p>
        <p style={{ margin: "10px 0 0 0", fontSize: "14px" }}>
          开发服务器地址：<a href="http://localhost:3000" style={{ color: "white", textDecoration: "underline" }}>http://localhost:3000</a>
        </p>
      </div>
    </div>
  );
}
