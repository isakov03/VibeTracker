"use server"

import prisma from "../prisma"
import { auth } from "@/lib/auth"
import { TaskStatus, Priority } from "@prisma/client"

export async function getAnalytics(days: number = 30) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Необходима авторизация")
  }

  const userId = session.user.id
  const now = new Date()
  const fromDate = new Date(now)
  fromDate.setDate(fromDate.getDate() - days)

  const tasks = await prisma.task.findMany({
    where: {
      userId,
      createdAt: { gte: fromDate },
    },
    include: { tags: true },
  })

  const total = tasks.length
  const completed = tasks.filter(t => t.status === "DONE").length
  const inProgress = tasks.filter(t => t.status === "IN_PROGRESS").length
  const overdue = tasks.filter(t => 
    t.dueDate && t.dueDate < now && t.status !== "DONE"
  ).length

  const completionRate = total > 0 
    ? Math.round((completed / total) * 1000) / 10 
    : 0

  const statusDistribution = Object.values(TaskStatus).map(status => ({
    label: status === "TODO" ? "К выполнению" 
           : status === "IN_PROGRESS" ? "В работе" 
           : status === "DONE" ? "Готово" 
           : "Архив",
    value: tasks.filter(t => t.status === status).length,
    color: status === "TODO" ? "bg-slate-400"
           : status === "IN_PROGRESS" ? "bg-blue-500"
           : status === "DONE" ? "bg-green-500"
           : "bg-gray-400",
  }))

  const priorityDistribution = Object.values(Priority).map(priority => ({
    label: priority === "HIGH" ? "Высокий" 
           : priority === "MEDIUM" ? "Средний" 
           : "Низкий",
    count: tasks.filter(t => t.priority === priority).length,
    color: priority === "HIGH" 
      ? "bg-red-50 text-red-700 border-red-200" 
      : priority === "MEDIUM" 
        ? "bg-yellow-50 text-yellow-700 border-yellow-200" 
        : "bg-green-50 text-green-700 border-green-200",
  }))

  const tagCounts = new Map<string, number>()
  tasks.forEach(task => {
    task.tags.forEach(tag => {
      tagCounts.set(tag.name, (tagCounts.get(tag.name) || 0) + 1)
    })
  })
  const popularTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name]) => name)

  const prevFromDate = new Date(fromDate)
  prevFromDate.setDate(prevFromDate.getDate() - days)
  
  const prevTasks = await prisma.task.count({
    where: {
      userId,
      createdAt: { gte: prevFromDate, lt: fromDate },
    },
  })
  
  const trend = prevTasks > 0 
    ? `${Math.round(((total - prevTasks) / prevTasks) * 100)}%`
    : total > 0 ? "100%" : "0%"

  return {
    total,
    completed,
    inProgress,
    overdue,
    completionRate,
    statusDistribution,
    priorityDistribution,
    popularTags,
    trend: total >= prevTasks ? `+${trend}` : trend,
    period: { from: fromDate, to: now },
  }
}