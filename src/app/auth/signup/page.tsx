"use client"
import { useActionState } from "react"
import { signup } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignUpPage() {
  // @ts-expect-error
  const [state, formAction, isPending] = useActionState(signup, {})

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Регистрация</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{state.error}</p>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input id="name" name="name" placeholder="Иван" required disabled={isPending} />
              {state?.errors?.name && (
                <p className="text-xs text-red-500">{state.errors.name[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required disabled={isPending} />
              {state?.errors?.email && (
                <p className="text-xs text-red-500">{state.errors.email[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input id="password" name="password" type="password" required disabled={isPending} />
              {state?.errors?.password && (
                <p className="text-xs text-red-500">{state.errors.password[0]}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Создаём..." : "Создать аккаунт"}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Уже есть аккаунт?{" "}
              <a href="/auth/signin" className="text-blue-500 hover:underline">
                Войти
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}