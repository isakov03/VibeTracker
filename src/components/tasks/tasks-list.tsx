"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DeleteTaskButton } from "@/components/tasks/delete-task-button"
import { TaskStatus, Priority } from "@prisma/client"
import { useRouter } from "next/navigation"

type Task = {
  id: string
  title: string
  description?: string | null
  status: TaskStatus
  priority: Priority
  dueDate?: Date | null
  tags: { id: string; name: string }[]
}

type TasksListProps = {
  initialTasks: Task[]
}

export function TasksList({ initialTasks }: TasksListProps) {
  const [titleFilter, setTitleFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "">("")
  const [priorityFilter, setPriorityFilter] = useState<Priority | "">("")
  const router = useRouter()

  const filteredTasks = useMemo(() => {
    return initialTasks.filter((task) => {
      const matchesTitle = task.title.toLowerCase().includes(titleFilter.toLowerCase())
      const matchesStatus = !statusFilter || task.status === statusFilter
      const matchesPriority = !priorityFilter || task.priority === priorityFilter
      return matchesTitle && matchesStatus && matchesPriority
    })
  }, [initialTasks, titleFilter, statusFilter, priorityFilter])

  const clearFilters = () => {
    setTitleFilter("")
    setStatusFilter("")
    setPriorityFilter("")
  }

  const hasActiveFilters = titleFilter || statusFilter || priorityFilter
  console.log(filteredTasks)

  return (
    <div className="space-y-4">
      {/* Фильтры */}
      <div className="flex flex-wrap items-end gap-3 p-4 border rounded-lg bg-card">
        <div className="flex flex-col gap-2 min-w-[200px]">
          <label className="text-sm font-medium">Поиск по названию</label>
          <Input
            placeholder="Например: презентация"
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
            className="h-10"
          />
        </div>

        <div className="flex flex-col gap-2 min-w-[160px]">
          <label className="text-sm font-medium">Статус</label>
          <Select 
            value={statusFilter} 
            onValueChange={(val) => setStatusFilter(val as TaskStatus | "")}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Все статусы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все статусы</SelectItem>
              <SelectItem value="TODO">К выполнению</SelectItem>
              <SelectItem value="IN_PROGRESS">В работе</SelectItem>
              <SelectItem value="DONE">Готово</SelectItem>
              <SelectItem value="ARCHIVED">Архив</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2 min-w-[160px]">
          <label className="text-sm font-medium">Приоритет</label>
          <Select 
            value={priorityFilter} 
            onValueChange={(val) => setPriorityFilter(val as Priority | "")}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Все приоритеты" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все приоритеты</SelectItem>
              <SelectItem value="LOW">Низкий</SelectItem>
              <SelectItem value="MEDIUM">Средний</SelectItem>
              <SelectItem value="HIGH">Высокий</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10">
            Сбросить фильтры
          </Button>
        )}

        <div className="ml-auto text-sm text-muted-foreground">
          Найдено: <span className="font-medium text-foreground">{filteredTasks.length}</span> из {initialTasks.length}
        </div>
      </div>

      {/* Таблица */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Задача</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Приоритет</TableHead>
              <TableHead>Теги</TableHead>
              <TableHead>Срок</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  {hasActiveFilters ? "По вашему запросу ничего не найдено" : "Задачи не найдены"}
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow key={task.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium truncate max-w-[250px]">
                    <Link 
                      href={`/tasks/${task.id}/edit`}
                      className="hover:text-primary hover:underline transition-colors cursor-pointer"
                      title={task.title}
                    >
                      {task.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={task.status === "DONE" ? "default" : "secondary"}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        task.priority === "HIGH" 
                          ? "bg-red-100 text-red-800 border-red-200" 
                          : task.priority === "MEDIUM" 
                            ? "bg-yellow-100 text-yellow-800 border-yellow-200" 
                            : "bg-green-100 text-green-800 border-green-200"
                      } 
                      variant="secondary"
                    >
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {task.tags.map((t) => (
                        <Badge key={t.id} variant="outline" className="text-[10px]">
                          {t.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {task.dueDate 
                      ? new Date(task.dueDate).toLocaleDateString("ru-RU", {
                          day: "numeric",
                          month: "short",
                        })
                      : "—"
                    }
                  </TableCell>
                  <TableCell>
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => router.push(`/tasks/${task.id}/edit`)}
                        className="h-8 px-2"
                    >
                        ✏️
                    </Button>
                    <DeleteTaskButton taskId={task.id} title={task.title} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}