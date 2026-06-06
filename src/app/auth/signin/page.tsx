"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignInPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)

    const form = e.currentTarget
    const res = await signIn("credentials", {
      email: (form.email as HTMLInputElement).value,
      password: (form.password as HTMLInputElement).value,
      redirect: false,
    })

    setIsPending(false)

    if (res?.error) {
      setError("Неверный email или пароль")
    } else {
      router.push("/")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Вход в VibeTracker</CardTitle>
          <CardDescription>Введите ваш email и пароль для продолжения</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                disabled={isPending}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Пароль</Label>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isPending}
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Входим..." : "Войти"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Нет аккаунта?{" "}
            <a href="/auth/signup" className="text-blue-500 hover:underline font-medium">
              Зарегистрироваться
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}