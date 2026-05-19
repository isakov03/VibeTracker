import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3, CheckCircle2, Clock, AlertCircle, Tag, TrendingUp } from "lucide-react"

// Фиктивные данные для примера
const MOCK_STATS = {
  total: 142,
  completed: 89,
  inProgress: 31,
  overdue: 12,
  completionRate: 62.7,
}

const STATUS_DATA = [
  { label: "К выполнению", value: 10, color: "bg-slate-400" },
  { label: "В работе", value: 31, color: "bg-blue-500" },
  { label: "Готово", value: 89, color: "bg-green-500" },
  { label: "Архив", value: 12, color: "bg-gray-400" },
]

const PRIORITY_DATA = [
  { label: "Высокий", count: 15, color: "bg-red-50 text-red-700 border-red-200" },
  { label: "Средний", count: 84, color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  { label: "Низкий", count: 43, color: "bg-green-50 text-green-700 border-green-200" },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Аналитика</h1>
        <Badge variant="secondary" className="text-xs">📅 Последние 30 дней</Badge>
      </div>

      {/* Карточки сводки */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Всего задач" value={MOCK_STATS.total} icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Завершено" value={MOCK_STATS.completed} icon={<CheckCircle2 className="h-4 w-4 text-green-500" />} trend="+12%" />
        <StatCard title="В работе" value={MOCK_STATS.inProgress} icon={<Clock className="h-4 w-4 text-blue-500" />} />
        <StatCard title="Просрочено" value={MOCK_STATS.overdue} icon={<AlertCircle className="h-4 w-4 text-red-500" />} trend="-5%" />
      </div>

      {/* Графики распределения */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* По статусам */}
        <Card>
          <CardHeader>
            <CardTitle>Распределение по статусам</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {STATUS_DATA.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${item.color}`} />
                    {item.label}
                  </span>
                  <span className="font-medium">{item.value}</span>
                </div>
                <Progress value={(item.value / MOCK_STATS.total) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* По приоритетам */}
        <Card>
          <CardHeader>
            <CardTitle>По приоритетам</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {PRIORITY_DATA.map((item) => (
              <div key={item.label} className={`flex items-center justify-between rounded-lg border p-3 ${item.color}`}>
                <span className="font-medium">{item.label}</span>
                <span className="text-xl font-bold">{item.count}</span>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Общий прогресс выполнения</span>
                <span className="font-medium">{MOCK_STATS.completionRate}%</span>
              </div>
              <Progress value={MOCK_STATS.completionRate} className="mt-2 h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, trend }: { title: string; value: number; icon: React.ReactNode; trend?: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon}
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-bold">{value}</span>
          {trend && (
            <span className={`flex items-center text-xs font-medium ${trend.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
              <TrendingUp className={`mr-0.5 h-3 w-3 ${trend.startsWith("-") ? "rotate-180" : ""}`} />
              {trend}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}