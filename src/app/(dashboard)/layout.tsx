// src/app/(dashboard)/layout.tsx
import { auth } from "@/lib/auth"
import { AuthPrompt } from "@/components/auth/auth-prompt"

export default async function ProtectedLayout({ children }:{ children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user?.id) {
    return <AuthPrompt />
  }

  return <>{children}</>
}