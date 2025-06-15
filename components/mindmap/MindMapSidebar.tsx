import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface MindMapSidebarProps {
  mindMaps: { id: string; title: string; createdAt: string }[]
  currentMapId: string | null
  onSelectMap: (id: string) => void
  onCreateMap: () => void
}

export default function MindMapSidebar({ mindMaps, currentMapId, onSelectMap, onCreateMap }: MindMapSidebarProps) {
  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <Button onClick={onCreateMap} className="w-full flex items-center gap-2">
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
                onClick={() => onSelectMap(map.id)}
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
  )
} 