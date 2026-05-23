import Link from "next/link"
import { getTasks } from "@/lib/actions/tasks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TaskStatus } from "@prisma/client"
import { cn } from "@/lib/utils"

const COLUMNS: { key: TaskStatus; label: string; color: string }[] = [
  { key: "TODO", label: "К выполнению", color: "bg-slate-400" },
  { key: "IN_PROGRESS", label: "В работе", color: "bg-blue-500" },
  { key: "DONE", label: "Готово", color: "bg-green-500" },
]

type Task = {
  id: string
  title: string
  description?: string | null
  status: "TODO" | "IN_PROGRESS" | "DONE" | "ARCHIVED"
  priority: "LOW" | "MEDIUM" | "HIGH"
  dueDate?: Date | null
  tags: { id: string; name: string }[]
}

export default async function BoardPage() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tasks = await getTasks({ dueDateFrom: today })

  const grouped = tasks.reduce((acc, t) => {
    acc[t.status] = acc[t.status] || []
    acc[t.status].push(t)
    return acc
  }, {} as Record<TaskStatus, typeof tasks>)

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {COLUMNS.map((col) => (
        <Card key={col.key} className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <span className={cn("h-2.5 w-2.5 rounded-full", col.color)} />
              {col.label}
              <Badge variant="secondary" className="ml-auto">{grouped[col.key]?.length || 0}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-0">
            {grouped[col.key]?.length ? grouped[col.key].map((task) => <TaskCard key={task.id} task={task} />) : (
              <p className="text-center py-8 text-xs text-muted-foreground italic">Нет задач</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function TaskCard({ task }: { task: Task }) {
  const prioStyles = {
    LOW: "bg-green-100 text-green-700 border-green-200",
    MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
    HIGH: "bg-red-100 text-red-700 border-red-200",
  }
  return (
    <Card className="p-3 hover:shadow-md transition-all border-muted/60">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-medium leading-tight line-clamp-2">
          <Link 
            href={`/tasks/${task.id}/edit`}
            className="hover:text-primary hover:underline transition-colors cursor-pointer"
          >
            {task.title}
          </Link>
        </h4>
        <Badge variant="outline" className={prioStyles[task.priority] as string}>
          {task.priority}
        </Badge>
      </div>
      {task.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{task.description}</p>}
      <div className="flex flex-wrap gap-1 mb-2">
        {task.tags.map((tag: any) => (
          <Badge key={tag.id} variant="secondary" className="text-[10px] px-1.5 py-0">{tag.name}</Badge>
        ))}
      </div>
      {task.dueDate && (
        <p className="text-[13px] text-muted-foreground mt-auto pt-2 border-t">
          📅 {new Date(task.dueDate).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
        </p>
      )}
    </Card>
  )
}