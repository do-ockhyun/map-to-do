"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Download } from "lucide-react"
import MindMapComponent from "./MindMap"
import MindMapSidebar from "./MindMapSidebar"
import MindMapCanvas from "./MindMapCanvas"
import MindMapTodoPanel from "./MindMapTodoPanel"

interface TodoItem {
  id: string
  text: string
  priority: number
  urgency: number
  group: string
}

interface MindMapData {
  id: string
  title: string
  nodes: any[]
  edges: any[]
  createdAt: string
}

type SortOption = "group" | "priority" | "urgency"

export default function MindMapApp() {
  const [mindMaps, setMindMaps] = useState<MindMapData[]>([])
  const [currentMapId, setCurrentMapId] = useState<string | null>(null)
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [sortBy, setSortBy] = useState<SortOption>("group")
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [exportNodes, setExportNodes] = useState<any[]>([])

  // 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    const savedMaps = localStorage.getItem("mindmaps")
    const savedTodos = localStorage.getItem("todos")

    if (savedMaps) {
      setMindMaps(JSON.parse(savedMaps))
    }
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos))
    }
  }, [])

  // 새 마인드맵 생성
  const createNewMap = () => {
    const rootNode = {
      id: "1",
      type: "mindMapNode",
      position: { x: 50, y: 300 },
      data: {
        label: "새 마인드맵",
        level: 0,
        color: "#f8fafc",
        borderColor: "#64748b",
        textColor: "#334155",
        isEditing: false,
      },
      selected: true,
    }
    const newMap: MindMapData = {
      id: Date.now().toString(),
      title: "새 마인드맵",
      nodes: [rootNode],
      edges: [],
      createdAt: new Date().toISOString(),
    }

    const updatedMaps = [...mindMaps, newMap]
    setMindMaps(updatedMaps)
    setCurrentMapId(newMap.id)
    localStorage.setItem("mindmaps", JSON.stringify(updatedMaps))
  }

  // 마인드맵 선택
  const selectMap = (mapId: string) => {
    setCurrentMapId(mapId)
  }

  // Todo 내보내기 모달 열기
  const openExportModal = () => {
    // 현재 마인드맵에서 최하위 노드들 찾기 (임시로 빈 배열)
    setExportNodes([])
    setIsExportModalOpen(true)
  }

  // Todo 내보내기 실행
  const exportToTodos = (nodeData: { [key: string]: { priority: number; urgency: number } }) => {
    const newTodos: TodoItem[] = exportNodes.map((node, index) => ({
      id: `todo-${Date.now()}-${index}`,
      text: node.label || `Todo ${index + 1}`,
      priority: nodeData[node.id]?.priority || 0,
      urgency: nodeData[node.id]?.urgency || 0,
      group: "Group 1", // 임시 그룹
    }))

    const updatedTodos = [...todos, ...newTodos]
    setTodos(updatedTodos)
    localStorage.setItem("todos", JSON.stringify(updatedTodos))
    setIsExportModalOpen(false)
  }

  // Todo 정렬
  const sortedTodos = [...todos].sort((a, b) => {
    switch (sortBy) {
      case "priority":
        return b.priority - a.priority
      case "urgency":
        return b.urgency - a.urgency
      default:
        return a.group.localeCompare(b.group)
    }
  })

  // 그룹별 Todo 분류
  const groupedTodos = sortedTodos.reduce(
    (groups, todo) => {
      const group = todo.group
      if (!groups[group]) {
        groups[group] = []
      }
      groups[group].push(todo)
      return groups
    },
    {} as { [key: string]: TodoItem[] },
  )

  // MindMapComponent에서 변경된 nodes/edges를 받아 mindMaps 갱신
  const handleMapChange = (nodes: any[], edges: any[]) => {
    if (!currentMapId) return
    setMindMaps((prevMaps) => {
      const updated = prevMaps.map((map) =>
        map.id === currentMapId ? { ...map, nodes, edges } : map
      )
      localStorage.setItem("mindmaps", JSON.stringify(updated))
      return updated
    })
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <MindMapSidebar
        mindMaps={mindMaps}
        currentMapId={currentMapId}
        onSelectMap={selectMap}
        onCreateMap={createNewMap}
      />

      <div className="flex-1 relative">
        <div className="absolute top-4 right-4 z-10">
          <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={openExportModal} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Todo Export
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Todo로 내보내기</DialogTitle>
              </DialogHeader>
              <ExportModal nodes={exportNodes} onExport={exportToTodos} onClose={() => setIsExportModalOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        <MindMapCanvas
          nodes={mindMaps.find((m) => m.id === currentMapId)?.nodes || []}
          edges={mindMaps.find((m) => m.id === currentMapId)?.edges || []}
          onChange={handleMapChange}
          isEmpty={!currentMapId}
        />
      </div>
      
      <MindMapTodoPanel
        groupedTodos={groupedTodos}
        sortBy={sortBy}
        onSortChange={setSortBy}
        getPriorityColor={getPriorityColor}
        getUrgencyColor={getUrgencyColor}
      />
    </div>
  )
}

// Export Modal Component
function ExportModal({
  nodes,
  onExport,
  onClose,
}: {
  nodes: any[]
  onExport: (data: { [key: string]: { priority: number; urgency: number } }) => void
  onClose: () => void
}) {
  const [nodeData, setNodeData] = useState<{ [key: string]: { priority: number; urgency: number } }>({})

  const handleSubmit = () => {
    onExport(nodeData)
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">각 항목의 우선순위와 긴급도를 설정하세요 (0-3)</div>

      {nodes.length === 0 ? (
        <div className="text-center text-gray-500 py-4">내보낼 항목이 없습니다.</div>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {nodes.map((node) => (
            <div key={node.id} className="p-3 border border-gray-200 rounded-lg">
              <div className="font-medium text-sm mb-2">{node.label}</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`priority-${node.id}`} className="text-xs">
                    우선순위
                  </Label>
                  <Input
                    id={`priority-${node.id}`}
                    type="number"
                    min="0"
                    max="3"
                    value={nodeData[node.id]?.priority || 0}
                    onChange={(e) =>
                      setNodeData((prev) => ({
                        ...prev,
                        [node.id]: {
                          ...prev[node.id],
                          priority: Number.parseInt(e.target.value) || 0,
                        },
                      }))
                    }
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor={`urgency-${node.id}`} className="text-xs">
                    긴급도
                  </Label>
                  <Input
                    id={`urgency-${node.id}`}
                    type="number"
                    min="0"
                    max="3"
                    value={nodeData[node.id]?.urgency || 0}
                    onChange={(e) =>
                      setNodeData((prev) => ({
                        ...prev,
                        [node.id]: {
                          ...prev[node.id],
                          urgency: Number.parseInt(e.target.value) || 0,
                        },
                      }))
                    }
                    className="h-8"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button onClick={onClose} variant="outline" className="flex-1">
          취소
        </Button>
        <Button onClick={handleSubmit} className="flex-1" disabled={nodes.length === 0}>
          내보내기
        </Button>
      </div>
    </div>
  )
}

// Helper functions for styling
function getPriorityColor(priority: number): string {
  switch (priority) {
    case 3:
      return "bg-red-100 text-red-800"
    case 2:
      return "bg-orange-100 text-orange-800"
    case 1:
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

function getUrgencyColor(urgency: number): string {
  switch (urgency) {
    case 3:
      return "bg-red-100 text-red-800"
    case 2:
      return "bg-orange-100 text-orange-800"
    case 1:
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}
