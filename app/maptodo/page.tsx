"use client"

import dynamic from "next/dynamic"
import React, { useState, useEffect } from "react"
import MapList from "@/components/maptodo/MapList"
import TodoList, { TodoItem } from "@/components/maptodo/TodoList"
import { Node, Edge } from "reactflow"

const MapCanvas = dynamic(() => import("@/components/maptodo/MapCanvas"), { ssr: false })

// MindMap 데이터 타입 정의 (간단화)
interface MindMap {
  id: string
  title: string
  nodes: Node[]
  edges: Edge[]
  createdAt: string
}

export default function MapTodoPage() {
  const [maps, setMaps] = useState<MindMap[]>([])
  const [currentMapId, setCurrentMapId] = useState<string | null>(null)
  const [todos, setTodos] = useState<TodoItem[]>([])

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

  // 맵별 ToDo 저장 키
  function getTodosStorageKey(mapId: string) {
    return `todos_${mapId}`
  }

  // 맵 변경 시 해당 맵의 todos 불러오기
  useEffect(() => {
    if (!currentMapId) return
    const saved = localStorage.getItem(getTodosStorageKey(currentMapId))
    if (saved) {
      setTodos(JSON.parse(saved))
    } else {
      setTodos([])
    }
  }, [currentMapId])

  // todos 변경 시 localStorage에 저장
  useEffect(() => {
    if (!currentMapId) return
    localStorage.setItem(getTodosStorageKey(currentMapId), JSON.stringify(todos))
  }, [todos, currentMapId])

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
  function handleMapChange(nodes: Node[], edges: Edge[]) {
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

  // ToDo Export: 리프노드 → ToDo 변환 (indent 포함)
  function handleExportToTodos() {
    if (!currentMap) return
    const { nodes, edges } = currentMap
    const nodeMap: Record<string, Node> = Object.fromEntries(nodes.map((n) => [n.id, n]))
    const childSet = new Set(edges.map((e) => e.source))
    function getLevel(id: string): number {
      let level = 0
      let cur = id
      while (true) {
        const parentEdge = edges.find((e) => e.target === cur)
        if (!parentEdge) break
        cur = parentEdge.source
        level++
      }
      return level
    }
    const leafNodes = nodes.filter((n) => !childSet.has(n.id) && n.id !== "1")
    const todos: TodoItem[] = leafNodes.map((leaf) => {
      const parentEdge = edges.find((e) => e.target === leaf.id)
      const parent = parentEdge ? nodeMap[parentEdge.source] : null
      return {
        id: leaf.id,
        text: (leaf.data as { label: string }).label,
        group: parent ? (parent.data as { label: string }).label : "",
        done: false,
        indent: getLevel(leaf.id) - 2 > 0 ? getLevel(leaf.id) - 2 : 0
      }
    })
    setTodos(todos)
    if (currentMapId) {
      localStorage.setItem(getTodosStorageKey(currentMapId), JSON.stringify(todos))
    }
  }

  // 체크박스 토글 핸들러
  function handleToggleDone(id: string) {
    setTodos(todos => todos.map(todo => todo.id === id ? { ...todo, done: !todo.done } : todo))
  }

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
        {currentMap && <MapCanvas key={currentMap.id} {...currentMap} onChange={handleMapChange} onRootLabelChange={handleRootLabelChange} onExportToTodos={handleExportToTodos} />}
      </div>
      {/* Right: TodoList */}
      <div style={{ width: 320, borderLeft: '1px solid #e5e7eb', background: '#fff' }}>
        <TodoList title={currentMap?.title || "ToDo"} todos={todos} onToggleDone={handleToggleDone} />
      </div>
    </div>
  )
} 