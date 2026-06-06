import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Lock, LogIn, UserPlus } from "lucide-react"

export function AuthPrompt() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
      <Card className="w-full max-w-md text-center shadow-xl border-muted/60">
        <CardHeader className="pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Доступ ограничен</CardTitle>
          <CardDescription>
            Для использования сервиса Vibetracker необходимо войти в аккаунт или создать новый.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center pt-4">
          <Button className="gap-2">
            <Link href="/auth/signin">
              <LogIn className="h-4 w-4" /> Войти
            </Link>
          </Button>
          <Button variant="outline" className="gap-2">
            <Link href="/auth/signup">
              <UserPlus className="h-4 w-4" /> Регистрация
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}