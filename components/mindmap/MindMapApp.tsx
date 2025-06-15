"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Download } from "lucide-react"
import MindMapComponent from "./MindMap"

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
      {/* Left Panel - Map List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Button onClick={createNewMap} className="w-full flex items-center gap-2">
            <Plus className="w-4 h-4" />New Map
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">마인드맵 목록</h3>
            <div className="space-y-2">
              {mindMaps.map((map) => (
                <button
                  key={map.id}
                  onClick={() => selectMap(map.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    currentMapId === map.id
                      ? "bg-blue-50 border-blue-200 text-blue-900"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <div className="font-medium text-sm">{map.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{new Date(map.createdAt).toLocaleDateString()}</div>
                </button>
              ))}

              {mindMaps.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-8">
                  마인드맵이 없습니다.
                  <br />새 맵을 생성해보세요!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Center Panel - Mind Map */}
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

        {currentMapId ? (
          <MindMapComponent
            nodes={mindMaps.find((m) => m.id === currentMapId)?.nodes || []}
            edges={mindMaps.find((m) => m.id === currentMapId)?.edges || []}
            onChange={handleMapChange}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="text-lg font-medium mb-2">마인드맵을 선택하세요</div>
              <div className="text-sm">왼쪽에서 기존 맵을 선택하거나 새 맵을 생성하세요</div>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Todo List */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">ToDos</h2>
          </div>

          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="group">그룹별 정렬</SelectItem>
              <SelectItem value="priority">우선순위별 정렬</SelectItem>
              <SelectItem value="urgency">긴급도별 정렬</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {Object.keys(groupedTodos).length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">
                Todo 항목이 없습니다.
                <br />
                마인드맵에서 내보내기를 해보세요!
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedTodos).map(([groupName, groupTodos]) => (
                  <div key={groupName}>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">{groupName}</h3>
                    <div className="space-y-2">
                      {groupTodos.map((todo) => (
                        <div key={todo.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="font-medium text-sm text-gray-900 mb-1">{todo.text}</div>
                          <div className="flex gap-4 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <span className="font-medium">우선순위:</span>
                              <span className={`px-1.5 py-0.5 rounded ${getPriorityColor(todo.priority)}`}>
                                {todo.priority}
                              </span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="font-medium">긴급도:</span>
                              <span className={`px-1.5 py-0.5 rounded ${getUrgencyColor(todo.urgency)}`}>
                                {todo.urgency}
                              </span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
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
