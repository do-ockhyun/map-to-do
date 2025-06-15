"use client"

import dynamic from "next/dynamic"
import React, { useState, useEffect } from "react"
import MapList, { MapListItem } from "@/components/maptodo/MapList"

const MapCanvas = dynamic(() => import("@/components/maptodo/MapCanvas"), { ssr: false })

// MindMap 데이터 타입 정의 (간단화)
interface MindMap {
  id: string
  title: string
  nodes: any[]
  edges: any[]
  createdAt: string
}

export default function MapTodoPage() {
  const [maps, setMaps] = useState<MindMap[]>([])
  const [currentMapId, setCurrentMapId] = useState<string | null>(null)

  // 마운트 시 localStorage에서 maps 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("maps")
    if (saved) {
      const parsed = JSON.parse(saved)
      setMaps(parsed)
      if (parsed.length > 0) setCurrentMapId(parsed[0].id)
    }
  }, [])

  // maps 상태가 바뀔 때마다 localStorage에 저장
  useEffect(() => {
    if (maps.length > 0) {
      localStorage.setItem("maps", JSON.stringify(maps))
    }
  }, [maps])

  // 맵 생성
  function handleCreateMap() {
    const newMap: MindMap = {
      id: Date.now().toString(),
      title: "새 마인드맵",
      nodes: [
        {
          id: "1",
          type: "mindMapNode",
          position: { x: 100, y: 200 },
          data: { label: "루트 노드", isEditing: false },
          selected: true
        }
      ],
      edges: [],
      createdAt: new Date().toISOString()
    }
    setMaps(prev => [...prev, newMap])
    setCurrentMapId(newMap.id)
  }

  // 맵 선택
  function handleSelectMap(id: string) {
    setCurrentMapId(id)
  }

  // MapCanvas에서 노드/엣지 변경 시 maps 상태에 반영
  function handleMapChange(nodes: any[], edges: any[]) {
    setMaps(prev => prev.map(m =>
      m.id === currentMapId ? { ...m, nodes, edges } : m
    ))
  }

  // 루트노드 텍스트가 바뀌면 맵 타이틀도 변경
  function handleRootLabelChange(label: string) {
    setMaps(prev => prev.map(m =>
      m.id === currentMapId ? { ...m, title: label } : m
    ))
  }

  // 현재 선택된 맵
  const currentMap = maps.find(m => m.id === currentMapId) || maps[0]

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Left: MapList */}
      <MapList
        maps={maps.map(m => ({ id: m.id, title: m.title, createdAt: m.createdAt }))}
        currentMapId={currentMapId}
        onSelectMap={handleSelectMap}
        onCreateMap={handleCreateMap}
      />
      {/* Center: MapCanvas */}
      <div style={{ flex: 1, background: '#f8fafc' }}>
        {currentMap && <MapCanvas key={currentMap.id} {...currentMap} onChange={handleMapChange} onRootLabelChange={handleRootLabelChange} />}
      </div>
      {/* Right: TodoList */}
      <div style={{ width: 320, borderLeft: '1px solid #e5e7eb', background: '#fff' }}>
        {/* TodoList 컴포넌트 자리 */}
      </div>
    </div>
  )
} 