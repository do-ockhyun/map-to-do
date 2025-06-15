export default function MapTodoPage() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Left: MapList */}
      <div style={{ width: 320, borderRight: '1px solid #e5e7eb', background: '#fff' }}>
        {/* MapList 컴포넌트 자리 */}
      </div>
      {/* Center: MapCanvas */}
      <div style={{ flex: 1, background: '#f8fafc' }}>
        {/* MapCanvas 컴포넌트 자리 */}
      </div>
      {/* Right: TodoList */}
      <div style={{ width: 320, borderLeft: '1px solid #e5e7eb', background: '#fff' }}>
        {/* TodoList 컴포넌트 자리 */}
      </div>
    </div>
  )
} 