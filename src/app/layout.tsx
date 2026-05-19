import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "VibeTracker",
  description: "Персональный трекер задач",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <Providers>
          <Sidebar />
        
        <main className="ml-64 min-h-screen bg-background p-6 lg:p-8">
          {children}
        </main>
            <Link href="/tasks/new">
              <Button
                size="icon"
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer transition-all z-50 bg-primary text-primary-foreground"
              >
                  <Plus className="h-6 w-6" />
              </Button>
              </Link>
        </Providers>
      </body>
    </html>
  )
}