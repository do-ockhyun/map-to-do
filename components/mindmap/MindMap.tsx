"use client"

import type React from "react"
import { useCallback, useState, useEffect } from "react"
import ReactFlow, {
  type Node,
  type Edge,
  addEdge,
  Background,
  BackgroundVariant,
  type Connection,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type NodeProps,
  type NodeChange,
  type EdgeChange,
} from "reactflow"
import "reactflow/dist/style.css"
import { Input } from "@/components/ui/input"
import MindMapNode from "./MindMapNode"

// 기존 파스텔 색상 팔레트를 shadcn 스타일로 교체
const shadcnColors = [
  { bg: "#f8fafc", border: "#64748b", text: "#334155" }, // slate
  { bg: "#f1f5f9", border: "#475569", text: "#1e293b" }, // slate-dark
  { bg: "#eff6ff", border: "#3b82f6", text: "#1e40af" }, // blue
  { bg: "#f0f9ff", border: "#0ea5e9", text: "#0c4a6e" }, // sky
  { bg: "#ecfdf5", border: "#10b981", text: "#065f46" }, // emerald
  { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" }, // amber
  { bg: "#fce7f3", border: "#ec4899", text: "#be185d" }, // pink
]

// 초기 마인드맵 데이터 - 논리적 구조도 스타일
const initialNodes: Node[] = [
  {
    id: "1",
    type: "mindMapNode",
    position: { x: 50, y: 300 },
    data: {
      label: "오늘 할일",
      level: 0,
      color: "#f8fafc",
      borderColor: "#64748b",
      textColor: "#334155",
      isEditing: false,
    },
    selected: true,
  },
]

const initialEdges: Edge[] = []

// MindMapComponent의 props 타입 정의 추가
interface MindMapComponentProps {
  nodes: Node[]
  edges: Edge[]
  onChange: (nodes: Node[], edges: Edge[]) => void
}

const nodeTypes = {
  mindMapNode: MindMapNode,
}

export default function MindMapComponent({ nodes: initialNodes, edges: initialEdges, onChange }: MindMapComponentProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [nodeId, setNodeId] = useState(
    initialNodes.length > 0 ? Math.max(...initialNodes.map((n) => Number(n.id))) + 1 : 2
  )
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)

  // props로 받은 nodes/edges가 바뀌면 내부 상태도 동기화 (다를 때만)
  useEffect(() => {
    if (JSON.stringify(nodes) !== JSON.stringify(initialNodes)) setNodes(initialNodes)
    if (JSON.stringify(edges) !== JSON.stringify(initialEdges)) setEdges(initialEdges)
    // eslint-disable-next-line
  }, [initialNodes, initialEdges])

  // initialNodes가 바뀔 때마다 nodeId도 재설정
  useEffect(() => {
    setNodeId(
      initialNodes.length > 0 ? Math.max(...initialNodes.map((n) => Number(n.id))) + 1 : 2
    )
  }, [initialNodes])

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  const startEdit = useCallback(
    (id: string) => {
      setEditingNodeId(id)
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: { ...node.data, isEditing: node.id === id },
        })),
      )
    },
    [setNodes],
  )

  const finishEdit = useCallback(
    (id: string, newLabel: string) => {
      setEditingNodeId(null)
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: {
            ...node.data,
            label: node.id === id ? newLabel : node.data.label,
            isEditing: false,
          },
        })),
      )
    },
    [setNodes],
  )

  // 노드 데이터에 편집 함수들 추가
  const nodesWithEditHandlers = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onStartEdit: startEdit,
      onFinishEdit: finishEdit,
    },
  }))

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // 편집 중일 때는 키보드 단축키 비활성화
      if (editingNodeId) return

      const selectedNodes = nodes.filter((node) => node.selected)
      if (selectedNodes.length !== 1) return

      const selectedNode = selectedNodes[0]

      if (event.key === "Tab") {
        event.preventDefault()
        addChildNode(selectedNode)
      } else if (event.key === "Enter") {
        event.preventDefault()
        addSiblingNode(selectedNode)
      }
    },
    [nodes, editingNodeId],
  )

  const addChildNode = useCallback(
    (parentNode: Node) => {
      const nodeColor = shadcnColors[Math.floor(Math.random() * shadcnColors.length)]

      // 자식 노드들의 개수를 세어서 위치 계산
      const childNodes = nodes.filter((node) =>
        edges.some((edge) => edge.source === parentNode.id && edge.target === node.id),
      )

      const newLevel = Math.min(parentNode.data.level + 1, 3)

      // 논리적 구조도 스타일 위치 계산
      const baseX = parentNode.position.x + 200 // 우측으로 200px
      const baseY = parentNode.position.y - childNodes.length * 80 + (childNodes.length * 160) / 2
      const newY = baseY + childNodes.length * 80

      const newNode: Node = {
        id: nodeId.toString(),
        type: "mindMapNode",
        position: { x: baseX, y: newY },
        data: {
          label: `새 항목 ${nodeId}`,
          level: newLevel,
          color: nodeColor.bg,
          borderColor: nodeColor.border,
          textColor: nodeColor.text,
          isEditing: true,
        },
        selected: true,
      }

      const newEdge: Edge = {
        id: `e${parentNode.id}-${nodeId}`,
        source: parentNode.id,
        target: nodeId.toString(),
        type: "straight", // smoothstep에서 straight로 변경
        style: { stroke: nodeColor.border, strokeWidth: 1.5 },
      }

      setNodes((nds) => nds.map((n) => ({ ...n, selected: false })).concat({ ...newNode, selected: !!newNode.selected }))
      setEdges((eds) => eds.concat(newEdge))
      setEditingNodeId(nodeId.toString())
      setNodeId((id) => id + 1)
    },
    [nodeId, setNodes, setEdges, nodes, edges],
  )

  const addSiblingNode = useCallback(
    (siblingNode: Node) => {
      const parentEdge = edges.find((edge) => edge.target === siblingNode.id)
      if (!parentEdge) return

      const parentNode = nodes.find((node) => node.id === parentEdge.source)
      if (!parentNode) return

      // 형제 노드는 같은 색상 사용
      const nodeColor = {
        bg: siblingNode.data.color,
        border: siblingNode.data.borderColor,
        text: siblingNode.data.textColor,
      }

      const siblingNodes = nodes.filter((node) =>
        edges.some((edge) => edge.source === parentNode.id && edge.target === node.id),
      )

      const level = siblingNode.data.level
      const baseX = parentNode.position.x + 200
      const newY = parentNode.position.y + siblingNodes.length * 80 - ((siblingNodes.length - 1) * 80) / 2

      const newNode: Node = {
        id: nodeId.toString(),
        type: "mindMapNode",
        position: { x: baseX, y: newY },
        data: {
          label: `새 항목 ${nodeId}`,
          level: level,
          color: nodeColor.bg,
          borderColor: nodeColor.border,
          textColor: nodeColor.text,
          isEditing: true,
        },
        selected: true,
      }

      const newEdge: Edge = {
        id: `e${parentNode.id}-${nodeId}`,
        source: parentNode.id,
        target: nodeId.toString(),
        type: "straight", // smoothstep에서 straight로 변경
        style: { stroke: nodeColor.border, strokeWidth: 1.5 },
      }

      setNodes((nds) => nds.map((n) => ({ ...n, selected: false })).concat({ ...newNode, selected: !!newNode.selected }))
      setEdges((eds) => eds.concat(newEdge))
      setEditingNodeId(nodeId.toString())
      setNodeId((id) => id + 1)
    },
    [nodeId, setNodes, setEdges, nodes, edges],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[] }) => {
      // 선택 변경 시 편집 모드 종료
      if (editingNodeId && selectedNodes.length > 0 && !selectedNodes.some((n) => n.id === editingNodeId)) {
        const editingNode = nodes.find((n) => n.id === editingNodeId)
        if (editingNode) {
          finishEdit(editingNodeId, editingNode.data.label)
        }
      }
    },
    [editingNodeId, nodes, finishEdit],
  )

  // 노드/에지 변경 핸들러에서만 onChange 호출
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const updated = nds.map((node) => {
          const change = changes.find((c) => 'id' in c && c.id === node.id)
          return change ? { ...node, ...change } : node
        })
        return updated
      })
    },
    []
  )

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        const updated = eds.map((edge) => {
          const change = changes.find((c) => 'id' in c && c.id === edge.id)
          return change ? { ...edge, ...change } : edge
        })
        return updated
      })
    },
    []
  )

  // nodes/edges가 바뀔 때만 onChange 호출 (props와 다를 때만)
  useEffect(() => {
    if (
      JSON.stringify(nodes) !== JSON.stringify(initialNodes) ||
      JSON.stringify(edges) !== JSON.stringify(initialEdges)
    ) {
      onChange(nodes, edges)
    }
    // eslint-disable-next-line
  }, [nodes, edges])

  return (
    <div className="w-full h-screen relative">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <div className="bg-white p-3 rounded-lg shadow-md text-sm">
          <div className="font-semibold mb-2 text-gray-800">📝 마인드맵 사용법</div>
          <div className="space-y-1 text-gray-600">
            <div>• 더블클릭: 텍스트 편집</div>
            <div>• Tab: 하위 항목 추가</div>
            <div>• Enter: 같은 레벨 항목 추가</div>
            <div>• 클릭: 노드 선택</div>
          </div>
        </div>
      </div>

      <ReactFlow
        nodes={nodesWithEditHandlers}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.5}
        maxZoom={2}
      >
        <Controls />
        <MiniMap nodeColor={(node) => node.data.color || "#ffffff"} className="bg-white border border-gray-200" />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
      </ReactFlow>
    </div>
  )
}
