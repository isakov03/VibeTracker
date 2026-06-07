"use server"

import { unstable_cache } from "next/cache"
import { randomUUID } from "crypto"
import { getTasksDueInDays } from "@/lib/actions/tasks"

const getCachedToken = unstable_cache(
  async () => {
    const clientId = process.env.GIGACHAT_CLIENT_ID
    const clientSecret = process.env.GIGACHAT_CLIENT_SECRET
    const scope = process.env.GIGACHAT_SCOPE || "GIGACHAT_API_PERS"
    const authUrl = process.env.GIGACHAT_AUTH_URL

    if (!clientId || !clientSecret) {
      throw new Error("GIGACHAT_CLIENT_ID или GIGACHAT_CLIENT_SECRET не настроены")
    }

    const response = await fetch(authUrl!, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        RqUID: randomUUID(), // Уникальный ID запроса
        Authorization: `Basic ${clientSecret}`,
      },
      body: new URLSearchParams({ scope }),
      next: { revalidate: 1500 }, // Кэш на 25 минут (1500 сек)
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(`GigaChat auth error: ${error.message || response.statusText}`)
    }

    const data = await response.json()
    return {
      token: data.access_token,
      expiresAt: data.expires_at,
    }
  },
  ["gigachat-token"],
  { revalidate: 1500 } // 25 минут
)

// Основная функция предсказания
export async function predictTaskTimeWithGigaChat(params: {
  taskTitle: string
  taskDescription?: string
  currentTasksCount?: number
}) {
  const { taskTitle, taskDescription = "", currentTasksCount } = params
  const tasksCount = currentTasksCount ?? await getTasksDueInDays(7)
  const { token } = await getCachedToken()

  // Формируем промпт строго по ТЗ
  const prompt = `Я хочу узнать сколько мне понадобится времени для выполнения задачи "${taskTitle}", вот, ее детальное описание: ${taskDescription}. Сейчас у меня есть ${tasksCount} задач на этот месяц. Сколько мне нужно целых дней для ее выполнения? В ответе пришли строго одно целое число - количество дней для ее выполнения. Если название и описание задачи покажутся тебе некорректными или не имеющими смысл, то не пришли ошибку. Во всех остальных случаях пришли только целое число и ничего больше.`

  const response = await fetch(process.env.GIGACHAT_CHAT_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: "GigaChat",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1, // Низкая температура для детерминированного ответа
      max_tokens: 50,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`GigaChat API error: ${error.error?.message || response.statusText}`)
  }

  const data = await response.json()
  const rawAnswer = data.choices?.[0]?.message?.content?.trim()

  // Извлекаем целое число из ответа (на случай, если модель добавит текст)
  const numberMatch = rawAnswer?.match(/\d+/)
  const days = numberMatch ? parseInt(numberMatch[0], 10) : null

  if (!days || days <= 0) {
    throw new Error(`Не удалось распарсить ответ GigaChat: "${rawAnswer}"`)
  }

  return {
    days,
    rawAnswer,
    model: data.model,
  }
}