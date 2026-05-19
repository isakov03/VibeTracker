"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteTask } from "@/lib/actions/tasks"

export function DeleteTaskButton({
  taskId,
  title,
  variant = "ghost",
  onSuccess,
}: {
  taskId: string
  title?: string
  variant?: "ghost" | "destructive" | "outline",
  onSuccess?: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteTask(taskId)
      if (res?.success) {
        setOpen(false)
        onSuccess ? onSuccess() : router.refresh()
      }
    })
  }

  const triggerClassName = cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
    variant === "ghost" && "hover:bg-accent hover:text-accent-foreground h-9 w-9 p-0",
    variant === "destructive" && "bg-red-600 text-white hover:bg-red-700 h-9 px-3",
    variant === "outline" && "border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
  )

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        className={triggerClassName}
        disabled={isPending}
        aria-label={title ? `Удалить задачу: ${title}` : "Удалить задачу"}
      >
        <Trash2 className="h-4 w-4" />
        {variant !== "ghost" && <span className="ml-2">Удалить</span>}
      </AlertDialogTrigger>
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить задачу?</AlertDialogTitle>
          <AlertDialogDescription>
            Вы уверены, что хотите удалить <strong>{title || "эту задачу"}?</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isPending ? "Удаление..." : "Удалить"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}