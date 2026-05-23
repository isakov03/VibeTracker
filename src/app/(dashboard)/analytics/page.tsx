import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3, CheckCircle2, Clock, AlertCircle, Tag, TrendingUp } from "lucide-react"
import { getAnalytics } from "@/lib/actions/analytics"

export default async function AnalyticsPage() {
  const analytics = await getAnalytics(30) // Последние 30 дней

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Аналитика</h1>
        <Badge variant="secondary" className="text-xs">
          📅 {analytics.period.from.toLocaleDateString("ru-RU")} — {analytics.period.to.toLocaleDateString("ru-RU")}
        </Badge>
      </div>

      {/* Карточки сводки */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Всего задач" 
          value={analytics.total} 
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />} 
        />
        <StatCard 
          title="Завершено" 
          value={analytics.completed} 
          icon={<CheckCircle2 className="h-4 w-4 text-green-500" />} 
          // trend={analytics.trend}
        />
        <StatCard 
          title="В работе" 
          value={analytics.inProgress} 
          icon={<Clock className="h-4 w-4 text-blue-500" />} 
        />
        <StatCard 
          title="Просрочено" 
          value={analytics.overdue} 
          icon={<AlertCircle className="h-4 w-4 text-red-500" />} 
        />
      </div>

      {/* Графики распределения */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* По статусам */}
        <Card>
          <CardHeader>
            <CardTitle>Распределение по статусам</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.statusDistribution.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${item.color}`} />
                    {item.label}
                  </span>
                  <span className="font-medium">{item.value}</span>
                </div>
                <Progress 
                  value={analytics.total > 0 ? (item.value / analytics.total) * 100 : 0} 
                  className="h-2" 
                />
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
            {analytics.priorityDistribution.map((item) => (
              <div key={item.label} className={`flex items-center justify-between rounded-lg border p-3 ${item.color}`}>
                <span className="font-medium">{item.label}</span>
                <span className="text-xl font-bold">{item.count}</span>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Общий прогресс выполнения</span>
                <span className="font-medium">{analytics.completionRate}%</span>
              </div>
              <Progress value={analytics.completionRate} className="mt-2 h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Популярные теги */}
      <Card>
        <CardHeader>
          <CardTitle>Популярные теги</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.popularTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {analytics.popularTags.map((tag) => (
                <Badge key={tag} variant="outline" className="px-3 py-1 hover:bg-muted cursor-default transition-colors">
                  <Tag className="mr-1 h-3 w-3" /> {tag}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Теги пока не добавлены</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ title, value, icon, trend }: { 
  title: string; 
  value: number; 
  icon: React.ReactNode; 
  trend?: string 
}) {
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