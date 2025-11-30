// 最小化测试页面 - 不依赖任何组件或 API
export default function MinimalPage() {
  return (
    <div style={{ 
      padding: '40px', 
      backgroundColor: '#f7f5ef', 
      minHeight: '100vh',
      color: '#0e4f2e'
    }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>
        最小化测试页面
      </h1>
      <p style={{ fontSize: '16px', marginBottom: '20px' }}>
        如果你能看到这个页面，说明基本渲染正常。
      </p>
      <div style={{ 
        marginTop: '20px', 
        padding: '20px', 
        backgroundColor: '#2fb54a', 
        color: 'white', 
        borderRadius: '8px' 
      }}>
        <p>这个页面不依赖任何组件、API 或数据库。</p>
        <p>如果这个页面能正常显示，但首页不行，说明问题在于某个组件。</p>
      </div>
    </div>
  );
}






