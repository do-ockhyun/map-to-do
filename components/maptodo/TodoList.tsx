import React from "react"

export interface TodoItem {
  id: string
  text: string
  group: string
  done?: boolean
  indent?: number
}

interface TodoListProps {
  title: string
  todos: TodoItem[]
  onToggleDone?: (id: string) => void
}

export default function TodoList({ title, todos, onToggleDone }: TodoListProps) {
  // 그룹별로 묶기
  const grouped = todos.reduce((acc, todo) => {
    if (!acc[todo.group]) acc[todo.group] = []
    acc[todo.group].push(todo)
    return acc
  }, {} as { [group: string]: TodoItem[] })

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center text-gray-400 mt-12">ToDo 항목이 없습니다.<br />마인드맵에서 Export 해보세요!</div>
        ) : (
          Object.entries(grouped).map(([group, items]) => {
            // 그룹 타이틀/리스트 들여쓰기: 첫 번째 아이템의 indent 사용
            const groupTitleIndent = Math.min((items[0]?.indent || 0) * 20, 32)
            return (
              <div key={group} className="mb-6">
                <div
                  className="text-base font-semibold text-blue-700 mb-2"
                  style={{ paddingLeft: groupTitleIndent }}
                >
                  {group}
                </div>
                <ul className="space-y-2" style={{ paddingLeft: groupTitleIndent }}>
                  {items.map(todo => (
                    <li
                      key={todo.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-800 flex items-center gap-4"
                      style={{ paddingLeft: Math.min((todo.indent || 0) * 20, 32) }}
                    >
                      <input type="checkbox" checked={!!todo.done} onChange={() => onToggleDone?.(todo.id)} className="accent-blue-500 w-4 h-4" style={{ marginLeft: 4 }} />
                      <span className={todo.done ? "line-through text-gray-400" : ""}>{todo.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
} 