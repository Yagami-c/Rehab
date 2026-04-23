"use client"

import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  FileText, 
  ChevronRight,
  Calendar,
  TrendingUp
} from "lucide-react"
import { Card } from "@/components/ui/card"

const REPORTS = [
  {
    id: 1,
    date: "2024-01-15",
    score: 85,
    type: "全身评估",
    trend: "up",
    issues: ["颈部活动受限", "肩关节灵活性不足"],
  },
  {
    id: 2,
    date: "2024-01-08",
    score: 78,
    type: "上肢评估",
    trend: "up",
    issues: ["肩部肌力不足"],
  },
  {
    id: 3,
    date: "2024-01-01",
    score: 72,
    type: "全身评估",
    trend: "same",
    issues: ["腰部旋转受限", "核心稳定性不足", "下肢力量不均"],
  },
]

export default function ReportsPage() {
  const router = useRouter()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-accent"
    if (score >= 60) return "text-yellow-600"
    return "text-destructive"
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-card z-10 border-b border-border">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-center font-semibold">健康报告</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{REPORTS.length}</p>
            <p className="text-xs text-muted-foreground mt-1">总报告数</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-accent">85</p>
            <p className="text-xs text-muted-foreground mt-1">最高评分</p>
          </Card>
          <Card className="p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span className="text-lg font-bold text-accent">+13</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">本月提升</p>
          </Card>
        </div>

        {/* Report List */}
        <h2 className="font-semibold mb-4">历史报告</h2>
        
        {REPORTS.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">暂无评估报告</p>
            <button
              onClick={() => router.push("/questionnaire")}
              className="text-primary font-medium"
            >
              去完成首次评估
            </button>
          </Card>
        ) : (
          <div className="space-y-3">
            {REPORTS.map((report) => (
              <Card
                key={report.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push("/report")}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{report.type}</h3>
                      <span className={`text-lg font-bold ${getScoreColor(report.score)}`}>
                        {report.score}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(report.date)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {report.issues.slice(0, 2).map((issue, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground"
                        >
                          {issue}
                        </span>
                      ))}
                      {report.issues.length > 2 && (
                        <span className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">
                          +{report.issues.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex">
          {[
            { icon: Calendar, label: "首页", href: "/home", active: false },
            { icon: FileText, label: "计划", href: "/exercises", active: false },
            { icon: TrendingUp, label: "报告", href: "/reports", active: true },
            { icon: FileText, label: "我的", href: "/profile", active: false },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className={`flex-1 py-3 flex flex-col items-center gap-1 ${
                item.active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
