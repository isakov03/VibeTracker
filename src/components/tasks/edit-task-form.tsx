"use client"

import { useState, useTransition } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { CalendarIcon, ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { updateTask } from "@/lib/actions/tasks"
import { DeleteTaskButton } from "@/components/tasks/delete-task-button"

type Task = {
  id: string
  title: string
  description?: string | null
  status: "TODO" | "IN_PROGRESS" | "DONE" | "ARCHIVED" | undefined
  priority: "LOW" | "MEDIUM" | "HIGH" | undefined
  dueDate?: Date | null
  tags: { id: string; name: string }[]
}

const taskSchema = z.object({
  title: z.string().min(1, "Название задачи обязательно"),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "ARCHIVED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.string().optional(),
  tags: z.string().optional(),
})

type EditTaskFormProps = {
  task: Task
}

export function EditTaskForm({ task }: EditTaskFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : "",
      tags: task.tags.map(t => t.name).join(", "),
    },
  })

  const { control } = form

  const onSubmit = async (data: z.infer<typeof taskSchema>) => {
    setServerError(null)
    startTransition(async () => {
      const res = await updateTask(task.id, data)
      if (res?.error) {
        setServerError(res.error)
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg text-center">
          {serverError}
        </p>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Основные данные</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldGroup>
            {/* Название */}
            <Controller
              name="title"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Название</FieldLabel>
                  <Input
                    {...field}
                    placeholder="Например: Подготовить презентацию"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {/* Описание */}
            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Описание</FieldLabel>
                  <Textarea
                    {...field}
                    placeholder="Дополнительные детали, контекст, ссылки..."
                    className="min-h-[100px] resize-y"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Параметры</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {/* Статус */}
          <Controller
            name="status"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Статус</FieldLabel>
                <Select 
                  value={field.value ?? ""}
                  onValueChange={(val) => field.onChange(val)} 
                >
                  <SelectTrigger aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">К выполнению</SelectItem>
                    <SelectItem value="IN_PROGRESS">В работе</SelectItem>
                    <SelectItem value="DONE">Готово</SelectItem>
                    <SelectItem value="ARCHIVED">Архив</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          {/* Приоритет */}
          <Controller
            name="priority"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Приоритет</FieldLabel>
                <Select 
                  value={field.value ?? ""}
                  onValueChange={(val) => field.onChange(val)} 
                >
                  <SelectTrigger aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Выберите приоритет" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Низкий</SelectItem>
                    <SelectItem value="MEDIUM">Средний</SelectItem>
                    <SelectItem value="HIGH">Высокий</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          {/* Дедлайн */}
          <Controller
            name="dueDate"
            control={control}
            render={({ field, fieldState }) => {
              const [popoverOpen, setPopoverOpen] = useState(false)
              
              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Дедлайн</FieldLabel>
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger
                    // @ts-expect-error
                      as="button"
                      type="button"
                      className={cn(
                        "inline-flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        !field.value && "text-muted-foreground",
                        fieldState.invalid && "border-red-500 focus:ring-red-500"
                      )}
                      aria-invalid={fieldState.invalid}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <CalendarIcon className="h-4 w-4 opacity-50" />
                        {field.value ? (
                          format(new Date(field.value), "PPP", { locale: ru })
                        ) : (
                          <span>Выберите дату</span>
                        )}
                      </span>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          field.onChange(date?.toISOString())
                          setPopoverOpen(false)
                        }}
                        disabled={(date) => 
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        // @ts-expect-error
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )
            }}
          />

          {/* Теги */}
          <Controller
            name="tags"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Теги</FieldLabel>
                <Input
                  {...field}
                  placeholder="проект, дизайн, срочно"
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription>
                  Перечислите через запятую. Будут созданы автоматически.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-4 border-t">
        {/* Удаление (слева) */}
        <DeleteTaskButton 
          taskId={task.id} 
          title={task.title} 
          variant="destructive"
          onSuccess={() => router.push("/tasks")}
        />
        
        {/* Действия */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => router.back()} 
            disabled={isPending}
          >
            Отмена
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              "Сохранить изменения"
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}