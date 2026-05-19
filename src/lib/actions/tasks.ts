"use server"

import prisma from "@/lib/prisma"
import { TaskStatus, Priority } from "@prisma/client"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export type TaskFilters = {
  status?: TaskStatus | ""
  priority?: Priority | ""
  tag?: string,
  dueDateFrom?: Date
}

export async function getTasks(filters?: TaskFilters) {
  const session = await auth()
  const userId = session?.user?.id

  const where: any = { userId }

  // @ts-expect-error
  if (filters?.status && filters.status !== "") where.status = filters.status
  // @ts-expect-error
  if (filters?.priority && filters.priority !== "") where.priority = filters.priority
  if (filters?.tag) {
    where.tags = { some: { name: { contains: filters.tag, mode: "insensitive" } } }
  }
  if (filters?.dueDateFrom) {
    where.dueDate = { gte: filters.dueDateFrom }
  }

  return prisma.task.findMany({
    where,
    include: { tags: true },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  })
}

export async function createTask(data: {
  title: string
  description?: string
  status: string
  priority: string
  dueDate?: string
  tags?: string
}) {
  const tagNames = data.tags?.split(",").map(t => t.trim()).filter(Boolean) || []
  const session = await auth()
  const userId = session?.user?.id

  try {
    await prisma.task.create({
      // @ts-expect-error
      data: {
        title: data.title,
        description: data.description || null,
        status: data.status as any,
        priority: data.priority as any,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        tags: {
          connectOrCreate: tagNames.map(name => ({
            where: { name },
            create: { name },
          })),
        },
        userId: userId, 
      },
    })
  } catch (error) {
    console.error("DB Error:", error)
    return { error: "Не удалось сохранить задачу. Попробуйте позже." }
  }

  redirect("/tasks")
}

export async function updateTask(
  taskId: string,
  data: {
    title: string
    description?: string
    status: string
    priority: string
    dueDate?: string
    tags?: string
  }
) {
  // const { prisma } = await import("@/lib/prisma")
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Необходима авторизация")
  }

  const existing = await prisma.task.findUnique({
    where: { id: taskId, userId: session.user.id },
  })
  
  if (!existing) {
    return { error: "Задача не найдена или доступ запрещён" }
  }

  const tagNames = data.tags?.split(",").map(t => t.trim()).filter(Boolean) || []

  try {
    await prisma.task.update({
      where: { id: taskId },
      data: {
        title: data.title,
        description: data.description || null,
        status: data.status as TaskStatus,
        priority: data.priority as Priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        // 🔥 Полная перезапись тегов (удаляем старые, создаём новые)
        tags: {
          set: [], // Удаляем все связи
          connectOrCreate: tagNames.map(name => ({
            where: { name },
            create: { name },
          })),
        },
      },
    })
  } catch (error) {
    console.error("Update error:", error)
    return { error: "Не удалось обновить задачу. Попробуйте позже." }
  }

  redirect("/tasks")
}

export async function getTaskById(taskId: string) {
  // const { prisma } = await import("@/lib/prisma")
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Необходима авторизация")
  }

  return prisma.task.findUnique({
    where: { id: taskId, userId: session.user.id },
    include: { tags: true },
  })
}

export async function deleteTask(taskId: string) {
  // const { prisma } = await import("@/lib/prisma")
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Необходима авторизация" }
  }

  try {
    await prisma.task.delete({
      where: { id: taskId, userId: session.user.id }
    })
  } catch (error) {
    console.error("Delete error:", error)
    return { error: "Не удалось удалить задачу. Возможно, она уже удалена." }
  }

  revalidatePath("/tasks")
  revalidatePath("/")
  return { success: true }
}