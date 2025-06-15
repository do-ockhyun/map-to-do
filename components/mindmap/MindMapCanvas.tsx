import MindMapComponent from "./MindMap"

interface MindMapCanvasProps {
  nodes: any[]
  edges: any[]
  onChange: (nodes: any[], edges: any[]) => void
  isEmpty: boolean
  emptyMessage?: React.ReactNode
}

export default function MindMapCanvas({ nodes, edges, onChange, isEmpty, emptyMessage }: MindMapCanvasProps) {
  if (isEmpty) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          {emptyMessage || (
            <>
              <div className="text-lg font-medium mb-2">마인드맵을 선택하세요</div>
              <div className="text-sm">왼쪽에서 기존 맵을 선택하거나 새 맵을 생성하세요</div>
            </>
          )}
        </div>
      </div>
    )
  }
  return <MindMapComponent nodes={nodes} edges={edges} onChange={onChange} />
} 