"use client"

import React, { useCallback, useState, useEffect } from "react"
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  Position,
  Handle,
  type NodeProps,
  BackgroundVariant
} from "reactflow"
import "reactflow/dist/style.css"

// 커스텀 MindMapNode 컴포넌트
function MindMapNode({ data, id, selected }: NodeProps) {
  const [label, setLabel] = useState(data.label)
  const isEditing = data.isEditing

  const handleDoubleClick = () => {
    data.onStartEdit?.(id)
  }
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.stopPropagation()
      data.onFinishEdit?.(id, label)
    }
  }
  const handleBlur = () => {
    data.onFinishEdit?.(id, label)
  }
  return (
    <div style={{
      background: data.color || "#f8fafc",
      border: `1px solid ${data.borderColor || "#64748b"}`,
      borderRadius: 8,
      padding: "12px 16px",
      minWidth: 120,
      textAlign: "center",
      fontWeight: 600,
      color: data.textColor || "#334155",
      boxShadow: selected ? "0 0 0 2px #3b82f6" : undefined,
      transition: "all 0.2s"
    }} onDoubleClick={handleDoubleClick}>
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      {isEditing ? (
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          onKeyDown={handleKeyPress}
          onBlur={handleBlur}
          autoFocus
          style={{ border: "none", background: "transparent", textAlign: "center", fontWeight: 600 }}
        />
      ) : (
        <div>{data.label}</div>
      )}
    </div>
  )
}

const nodeTypes = { mindMapNode: MindMapNode }

const initialNodes: Node[] = [
  {
    id: "1",
    type: "mindMapNode",
    position: { x: 100, y: 200 },
    data: { label: "루트 노드", isEditing: false },
    selected: true
  }
]
const initialEdges: Edge[] = []

export default function MapCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [nodeId, setNodeId] = useState(2)
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  const [showBackground, setShowBackground] = useState(false)

  // 노드 더블클릭 시 편집
  const startEdit = useCallback((id: string) => {
    setEditingNodeId(id)
    setNodes(nds => nds.map(node => ({
      ...node,
      data: { ...node.data, isEditing: node.id === id }
    })))
  }, [setNodes])

  // 편집 완료
  const finishEdit = useCallback((id: string, newLabel: string) => {
    setEditingNodeId(null)
    setNodes(nds => nds.map(node => ({
      ...node,
      data: {
        ...node.data,
        label: node.id === id ? newLabel : node.data.label,
        isEditing: false
      }
    })))
  }, [setNodes])

  // 자식 노드 추가 (위에서 아래로)
  const addChildNode = useCallback((parentNode: Node) => {
    setNodes(nds => {
      // 부모의 자식 노드 개수 파악
      const childCount = nds.filter(n =>
        edges.some(e => e.source === parentNode.id && e.target === n.id)
      ).length;
      const newNode: Node = {
        id: nodeId.toString(),
        type: "mindMapNode",
        position: {
          x: parentNode.position.x + 200,
          y: parentNode.position.y - 80 + childCount * 80
        },
        data: { label: `새 노드 ${nodeId}`, isEditing: false },
        selected: true
      };
      const updatedNodes = nds.map(n => ({ ...n, selected: false }));
      return [...updatedNodes, newNode];
    });
    setEdges(eds => [
      ...eds,
      {
        id: `e${parentNode.id}-${nodeId}`,
        source: parentNode.id,
        target: nodeId.toString(),
        type: "straight"
      }
    ]);
    setNodeId(id => id + 1);
  }, [nodeId, setNodes, setEdges, edges]);

  // 형제 노드 추가 (위에서 아래로)
  const addSiblingNode = useCallback((selectedNode: Node) => {
    if (selectedNode.id === "1") return;
    const parentEdge = edges.find(e => e.target === selectedNode.id);
    if (!parentEdge) return;
    const parentId = parentEdge.source;
    const parentNode = nodes.find(n => n.id === parentId);
    if (!parentNode) return;
    setNodes(nds => {
      // 부모의 자식 노드 개수 파악
      const siblingCount = nds.filter(n =>
        edges.some(e => e.source === parentId && e.target === n.id)
      ).length;
      const newNode: Node = {
        id: nodeId.toString(),
        type: "mindMapNode",
        position: {
          x: parentNode.position.x + 200,
          y: parentNode.position.y - 80 + siblingCount * 80
        },
        data: { label: `새 노드 ${nodeId}`, isEditing: false },
        selected: true
      };
      const updatedNodes = nds.map(n => ({ ...n, selected: false }));
      return [...updatedNodes, newNode];
    });
    setEdges(eds => [
      ...eds,
      {
        id: `e${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId.toString(),
        type: "straight"
      }
    ]);
    setNodeId(id => id + 1);
  }, [nodeId, nodes, edges, setNodes, setEdges]);

  // 키이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (editingNodeId) return // 편집 중엔 무시
      const selectedNodes = nodes.filter(n => n.selected)
      if (selectedNodes.length !== 1) return
      const selectedNode = selectedNodes[0]
      if (event.key === "Tab") {
        event.preventDefault()
        addChildNode(selectedNode)
      } else if (event.key === "Enter") {
        event.preventDefault()
        addSiblingNode(selectedNode)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [nodes, editingNodeId, addChildNode, addSiblingNode])

  // 방향키로 노드 선택 이동
  useEffect(() => {
    const handleArrowKey = (event: KeyboardEvent) => {
      if (editingNodeId) return
      const selectedNodes = nodes.filter(n => n.selected)
      if (selectedNodes.length !== 1) return
      const selectedNode = selectedNodes[0]
      let nextId: string | null = null
      if (event.key === "ArrowRight") {
        // 자식 노드 중 첫 번째
        const childEdge = edges.find(e => e.source === selectedNode.id)
        if (childEdge) nextId = childEdge.target
      } else if (event.key === "ArrowLeft") {
        // 부모 노드
        const parentEdge = edges.find(e => e.target === selectedNode.id)
        if (parentEdge) nextId = parentEdge.source
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        // 형제 노드
        const parentEdge = edges.find(e => e.target === selectedNode.id)
        if (parentEdge) {
          const siblings = nodes.filter(n =>
            edges.some(e => e.source === parentEdge.source && e.target === n.id)
          )
          const idx = siblings.findIndex(n => n.id === selectedNode.id)
          if (event.key === "ArrowDown" && idx < siblings.length - 1) {
            nextId = siblings[idx + 1].id
          } else if (event.key === "ArrowUp" && idx > 0) {
            nextId = siblings[idx - 1].id
          }
        }
      }
      if (nextId) {
        setNodes(nds => nds.map(n => ({ ...n, selected: n.id === nextId })))
        event.preventDefault()
      }
    }
    window.addEventListener("keydown", handleArrowKey)
    return () => window.removeEventListener("keydown", handleArrowKey)
  }, [nodes, edges, editingNodeId, setNodes])

  // 노드에 편집 핸들러 주입
  const nodesWithEdit = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      onStartEdit: startEdit,
      onFinishEdit: finishEdit
    }
  }))

  // 재정렬 버튼 클릭 시 노드 위치 재배치 (왼→오, 위→아래, 부모는 자식의 중간)
  const handleRearrange = useCallback(() => {
    // 트리 구조를 가정하고, 루트에서부터 BFS로 레벨별로 배치
    const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]))
    const childrenMap: { [key: string]: string[] } = {}
    edges.forEach(e => {
      if (!childrenMap[e.source]) childrenMap[e.source] = []
      childrenMap[e.source].push(e.target)
    })
    const rootId = "1"
    const levelGapX = 200
    const nodeGapY = 80
    let positions: { [id: string]: { x: number, y: number } } = {}
    // 1. 트리 구조를 DFS로 순회하며 각 노드의 위치 계산
    function layoutNode(id: string, level: number, yStart: number): number {
      const children = childrenMap[id] || []
      let y = yStart
      if (children.length === 0) {
        // 리프노드: 위치 지정 후 y 증가
        positions[id] = { x: 100 + level * levelGapX, y }
        return y + nodeGapY
      } else {
        // 자식들 먼저 배치
        let childYs: number[] = []
        let nextY = y
        children.forEach(childId => {
          const childY = layoutNode(childId, level + 1, nextY)
          childYs.push((nextY + childY - nodeGapY) / 2)
          nextY = childY
        })
        // 부모는 자식들의 중간에 위치
        const midY = (Math.min(...childYs) + Math.max(...childYs)) / 2
        positions[id] = { x: 100 + level * levelGapX, y: midY }
        return nextY
      }
    }
    layoutNode(rootId, 0, 200)
    const newNodes = nodes.map(n => ({ ...n, position: positions[n.id] || n.position }))
    setNodes(newNodes)
  }, [nodes, edges, setNodes])

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div style={{ position: "absolute", top: 16, left: 16, zIndex: 10, display: 'flex', gap: 8 }}>
        <button onClick={() => setNodeId(id => id + 1)}>노드 추가</button>
        <button onClick={handleRearrange}>재정렬</button>
        <button onClick={() => setShowBackground(v => !v)}>{showBackground ? '점 숨기기' : '점 표시'}</button>
      </div>
      <ReactFlow
        nodes={nodesWithEdit}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={(params: Edge | Connection) => setEdges(eds => addEdge(params, eds))}
        nodeTypes={nodeTypes}
        fitView
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
      >
        {showBackground && <Background variant={BackgroundVariant.Dots} gap={16} size={1} />}
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  )
} 