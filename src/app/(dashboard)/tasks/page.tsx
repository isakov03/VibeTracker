import { getTasks } from "@/lib/actions/tasks"
import { TasksList } from "@/components/tasks/tasks-list"

export default async function TasksPage() {
  const tasks = await getTasks()
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Все задачи</h1>
      <TasksList initialTasks={tasks} />
    </div>
  )
}