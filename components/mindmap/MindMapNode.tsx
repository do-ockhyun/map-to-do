import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Handle, Position, type NodeProps } from "reactflow"

// 커스텀 마인드맵 노드 컴포넌트
export default function MindMapNode({ data, id, selected }: NodeProps) {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 편집 중일 때는 Tab과 Enter의 기본 동작을 막음
    if (e.key === "Tab" || e.key === "Enter") {
      e.stopPropagation()
    }
  }

  const handleBlur = () => {
    data.onFinishEdit?.(id, label)
  }

  const nodeStyle = {
    background: data.color || "#ffffff",
    border: `1px solid ${data.borderColor || "#e2e8f0"}`,
    borderRadius: data.level === 0 ? "8px" : "6px",
    padding: data.level === 0 ? "12px 16px" : "8px 12px",
    fontSize: data.level === 0 ? "14px" : data.level === 1 ? "13px" : "12px",
    fontWeight: data.level === 0 ? "600" : data.level === 1 ? "500" : "400",
    minWidth: data.level === 0 ? "120px" : data.level === 1 ? "100px" : "80px",
    textAlign: "center" as const,
    boxShadow: selected
      ? "0 0 0 2px hsl(var(--ring))"
      : "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    transform: selected ? "scale(1.02)" : "scale(1)",
    transition: "all 0.2s ease",
    color: data.textColor || "#374151",
  }

  return (
    <div style={nodeStyle} onDoubleClick={handleDoubleClick}>
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />

      {isEditing ? (
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyPress={handleKeyPress}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          autoFocus
          className="border-none p-0 text-center bg-transparent"
          style={{ fontSize: "inherit", fontWeight: "inherit" }}
        />
      ) : (
        <div>{data.label}</div>
      )}
    </div>
  )
} 