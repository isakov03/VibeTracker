"use server"

import prisma from "../prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { z } from "zod"

const signupSchema = z.object({
  name: z.string().min(2, "Имя минимум 2 символа"),
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Пароль минимум 6 символов"),
})

export async function signup(prevState: any, formData: FormData) {
  // ✅ Логирование для отладки (удалишь потом)
  console.log("🔍 FormData received:", {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password") ? "***" : undefined,
  })

  // ✅ Явно извлекаем и приводим к строке (null → "")
  const raw = {
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim().toLowerCase(),
    password: String(formData.get("password") || ""),
  }

  console.log("🔍 Parsed raw data:", raw)

  const parsed = signupSchema.safeParse(raw)
  
  if (!parsed.success) {
    console.log("❌ Validation errors:", parsed.error.flatten().fieldErrors)
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { name, email, password } = parsed.data
  const hashed = await bcrypt.hash(password, 10)

  try {
    await prisma.user.create({
       data: { name, email, password: hashed },
    })
  } catch (e: any) {
    console.error("💥 Prisma error:", e)
    if (e.code === "P2002") {
      return { error: "Пользователь с таким email уже существует" }
    }
    return { error: "Ошибка при регистрации. Попробуйте позже." }
  }

  console.log("✅ User created, redirecting...")
  redirect("/auth/signin")
}