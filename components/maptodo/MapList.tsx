import React from "react"

export interface MapListItem {
  id: string
  title: string
  createdAt: string
}

interface MapListProps {
  maps: MapListItem[]
  currentMapId: string | null
  onSelectMap: (id: string) => void
  onCreateMap: () => void
}

export default function MapList({ maps, currentMapId, onSelectMap, onCreateMap }: MapListProps) {
  return (
    <div style={{ width: 320, height: '100%', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e5e7eb', background: '#fff' }}>
      <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
        <button onClick={onCreateMap} style={{ width: '100%', padding: 8, fontWeight: 600, borderRadius: 6, background: '#3b82f6', color: '#fff', border: 'none' }}>+ New Map</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 12 }}>마인드맵 목록</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {maps.map(map => (
            <button
              key={map.id}
              onClick={() => onSelectMap(map.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: 12,
                borderRadius: 8,
                border: currentMapId === map.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                background: currentMapId === map.id ? '#eff6ff' : '#f8fafc',
                color: currentMapId === map.id ? '#1d4ed8' : '#374151',
                fontWeight: 500,
                transition: 'all 0.15s',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: 15 }}>{map.title}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{new Date(map.createdAt).toLocaleDateString()}</div>
            </button>
          ))}
          {maps.length === 0 && (
            <div style={{ textAlign: 'center', color: '#64748b', fontSize: 14, marginTop: 32 }}>
              마인드맵이 없습니다.<br />새 맵을 생성해보세요!
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 