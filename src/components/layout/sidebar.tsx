"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ListTodo, LogIn, UserPlus, LogOut, User, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSession, signOut } from "next-auth/react"

export function Sidebar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"

  const mainNav = [
    { href: "/", label: "Доска", icon: LayoutDashboard },
    { href: "/tasks", label: "Все задачи", icon: ListTodo },
    { href: "/analytics", label: "Аналитика", icon: BarChart3 }
  ]

  return (
    <aside className="fixed left-0 top-0 z-20 flex h-screen w-64 flex-col border-r bg-card p-4">
      {/* Логотип */}
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">V</div>
        <span className="text-xl font-bold tracking-tight">VibeTracker</span>
      </div>

      {/* Основная навигация */}
      <nav className="flex flex-1 flex-col gap-1">
        {mainNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
              pathname === item.href ? "bg-muted text-foreground" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="my-3 border-t" />

      {/* Блок авторизации / Профиль */}
      {status === "loading" ? (
        <div className="animate-pulse px-3 py-2 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      ) : isAuthenticated ? (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 px-3 py-2">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">
                {session.user?.name || "Пользователь"}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {session.user?.email}
              </span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-red-500"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <Link
            href="/auth/signin"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
              pathname === "/auth/signin" ? "bg-muted text-foreground" : "text-muted-foreground"
            )}
          >
            <LogIn className="h-4 w-4" />
            Вход
          </Link>
          <Link
            href="/auth/signup"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
              pathname === "/auth/signup" ? "bg-muted text-foreground" : "text-muted-foreground"
            )}
          >
            <UserPlus className="h-4 w-4" />
            Регистрация
          </Link>
        </div>
      )}
    </aside>
  )
}