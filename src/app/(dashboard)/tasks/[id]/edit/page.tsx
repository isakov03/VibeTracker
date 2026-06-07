
import { notFound } from "next/navigation"
import { getTaskById } from "@/lib/actions/tasks"
import { EditTaskForm } from "@/components/tasks/edit-task-form"

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const task = await getTaskById(id)

  if (!task) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Редактирование задачи</h1>
      </div>

      <EditTaskForm task={task} />
    </div>
  )
}