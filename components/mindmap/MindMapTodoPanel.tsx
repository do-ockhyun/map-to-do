import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TodoItem {
  id: string
  text: string
  priority: number
  urgency: number
  group: string
}

type SortOption = "group" | "priority" | "urgency"

interface MindMapTodoPanelProps {
  groupedTodos: { [key: string]: TodoItem[] }
  sortBy: SortOption
  onSortChange: (value: SortOption) => void
  getPriorityColor: (priority: number) => string
  getUrgencyColor: (urgency: number) => string
}

export default function MindMapTodoPanel({ groupedTodos, sortBy, onSortChange, getPriorityColor, getUrgencyColor }: MindMapTodoPanelProps) {
  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">ToDos</h2>
        </div>
        <Select value={sortBy} onValueChange={onSortChange}>
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
  )
} 