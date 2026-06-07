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
import { createTask } from "@/lib/actions/tasks"
import { predictTaskTimeWithGigaChat } from "@/lib/actions/gigachat"

// Валидация на клиенте
const taskSchema = z.object({
  title: z.string().min(1, "Название задачи обязательно"),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z.string().optional(),
  tags: z.string().optional(),
})

export default function NewTaskPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPredicting, setIsPredicting] = useState(false)
  const [predictionMsg, setPredictionMsg] = useState<string | null>(null)

  const form = useForm<z.infer<typeof taskSchema>>({
    // @ts-expect-error
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "TODO",
      dueDate: "",
      priority: "MEDIUM",
      tags: "",
    },
  })

  const onSubmit = async (data: z.infer<typeof taskSchema>) => {
    setServerError(null)
    startTransition(async () => {
      const res = await createTask(data)
      if (res?.error) {
        setServerError(res.error)
      }
    })
  }

  const handlePredict = async () => {
  const title = form.getValues("title")
  const description = form.getValues("description") || ""
  
  if (!title || title.length < 3) {
    setPredictionMsg("Введите название задачи для прогноза")
    return
  }
  
  setIsPredicting(true)
  setPredictionMsg(null)
  
  try {
    const res = await predictTaskTimeWithGigaChat({
      taskTitle: title,
      taskDescription: description,
    })
    
    // Считаем новую дату: сегодня + N дней
    const newDate = new Date()
    newDate.setDate(newDate.getDate() + res.days)
    
    // Обновляем поле dueDate в форме
    form.setValue("dueDate", newDate.toISOString())
    
    setPredictionMsg(`✅ Установлено: ~${res.days} дн. (ответ модели: "${res.rawAnswer}")`)
  } catch (error: any) {
    setPredictionMsg(`❌ Ошибка: ${error.message || "Не удалось получить прогноз"}`)
  } finally {
    setIsPredicting(false)
  }
}

  const { control, formState: { errors } } = form

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Новая задача</h1>
      </div>
      {/* @ts-expect-error */}
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
                    <FieldLabel htmlFor="title">Название</FieldLabel>
                    <Input
                      {...field}
                      id="title"
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
                    <FieldLabel htmlFor="description">Описание</FieldLabel>
                    <Textarea
                      {...field}
                      id="description"
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
        </SelectContent>
      </Select>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
        value={field.value}
        onValueChange={field.onChange}
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
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
        <Controller
          name="dueDate"
          control={control}
          render={({ field, fieldState }) => {
            const [popoverOpen, setPopoverOpen] = useState(false)

            return (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center justify-between mb-2">
                  <FieldLabel>Дедлайн</FieldLabel>
                  <button
                    type="button"
                    onClick={handlePredict}
                    className="inline-flex h-7 items-center justify-center rounded-md border border-input bg-background px-2.5 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPredicting ? "⏳ Прогноз..." : "🤖 Предсказать через GigaChat"}
                  </button>
                </div>
                <Popover 
                  open={popoverOpen} 
                  onOpenChange={setPopoverOpen}
                >
                  <PopoverTrigger
                  // @ts-expect-error
                    as="button"
                    type="button"
                    className={cn(
                      "inline-flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
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
                {predictionMsg && (
                  <p className={`mt-2 text-xs ${predictionMsg.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>
                    {predictionMsg}
                  </p>
                )}
        <FieldDescription>Выберите дату вручную или используйте AI-прогноз через GigaChat.</FieldDescription>
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

        <div className="flex justify-end gap-3 pt-4 border-t">
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
              "Создать задачу"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}