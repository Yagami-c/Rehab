"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Share2, 
  Download, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface AssessmentResult {
  exercises: Array<{
    id: number
    name: string
    completed: boolean
    score: number
  }>
  totalScore: number
  completedAt: string
}

const METRICS = [
  { id: "mobility", name: "关节活动度", score: 78, trend: "up" },
  { id: "symmetry", name: "动作对称性", score: 85, trend: "same" },
  { id: "stability", name: "核心稳定性", score: 72, trend: "up" },
  { id: "strength", name: "肌力水平", score: 80, trend: "down" },
  { id: "flexibility", name: "柔韧性", score: 75, trend: "up" },
]

const DIAGNOSES = [
  { id: 1, title: "颈部活动受限", severity: "mild", description: "颈部前屈和后伸角度略低于正常范围" },
  { id: 2, title: "肩关节灵活性不足", severity: "moderate", description: "肩部外展角度低于标准值约15%" },
  { id: 3, title: "腰部旋转轻度受限", severity: "mild", description: "腰部左右旋转幅度存在轻微不对称" },
]

const RECOMMENDATIONS = [
  { id: 1, name: "颈部拉伸操", duration: "5分钟", difficulty: "简单" },
  { id: 2, name: "肩关节环绕", duration: "8分钟", difficulty: "简单" },
  { id: 3, name: "猫牛式伸展", duration: "6分钟", difficulty: "中等" },
  { id: 4, name: "骨盆稳定训练", duration: "10分钟", difficulty: "中等" },
]

export default function ReportPage() {
  const router = useRouter()
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)

  useEffect(() => {
    const savedResult = localStorage.getItem("assessmentResult")
    if (savedResult) {
      setResult(JSON.parse(savedResult))
    }
  }, [])

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "mild":
        return "bg-accent/10 text-accent"
      case "moderate":
        return "bg-yellow-100 text-yellow-700"
      case "severe":
        return "bg-destructive/10 text-destructive"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "mild":
        return "轻度"
      case "moderate":
        return "中度"
      case "severe":
        return "重度"
      default:
        return severity
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-accent" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-destructive" />
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const profile = typeof window !== "undefined" 
    ? JSON.parse(localStorage.getItem("profile") || "{}") 
    : {}

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-card z-10 border-b border-border">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => router.push("/home")} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-center font-semibold">诊断报告</h1>
          <button onClick={() => setShowShareModal(true)} className="p-2 -mr-2">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Report Header */}
        <Card className="p-6 bg-primary text-primary-foreground">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-primary-foreground/80 text-sm">评估用户</p>
              <p className="text-xl font-semibold">{profile.nickname || "用户"}</p>
            </div>
            <div className="text-right">
              <p className="text-primary-foreground/80 text-sm">评估日期</p>
              <p className="font-medium">
                {result ? formatDate(result.completedAt) : "-"}
              </p>
            </div>
          </div>
          <div className="text-center pt-4 border-t border-primary-foreground/20">
            <p className="text-primary-foreground/80 text-sm mb-1">综合评分</p>
            <p className="text-5xl font-bold">{result?.totalScore || 0}</p>
            <p className="text-sm text-primary-foreground/80 mt-1">
              {result && result.totalScore >= 80 ? "状态良好" : 
               result && result.totalScore >= 60 ? "需要改善" : "建议就医"}
            </p>
          </div>
        </Card>

        {/* Radar Chart Placeholder */}
        <Card className="p-6">
          <h2 className="font-semibold mb-4">各项指标</h2>
          <div className="space-y-3">
            {METRICS.map((metric) => (
              <div key={metric.id} className="flex items-center gap-3">
                <span className="w-24 text-sm text-muted-foreground">
                  {metric.name}
                </span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${metric.score}%` }}
                  />
                </div>
                <span className="w-10 text-sm font-medium text-right">
                  {metric.score}
                </span>
                {getTrendIcon(metric.trend)}
              </div>
            ))}
          </div>
        </Card>

        {/* Historical Trend */}
        <Card className="p-6">
          <h2 className="font-semibold mb-4">历史趋势</h2>
          <div className="h-40 flex items-end justify-between gap-2">
            {[65, 70, 68, 75, 78, result?.totalScore || 85].map((score, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-sm ${
                    i === 5 ? "bg-primary" : "bg-muted"
                  }`}
                  style={{ height: `${score}%` }}
                />
                <span className="text-xs text-muted-foreground">
                  {i === 5 ? "今日" : `${6 - i}周前`}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Diagnoses */}
        <section>
          <h2 className="font-semibold mb-4">问题诊断</h2>
          <div className="space-y-3">
            {DIAGNOSES.map((diagnosis) => (
              <Card key={diagnosis.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium">{diagnosis.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityStyle(diagnosis.severity)}`}>
                    {getSeverityText(diagnosis.severity)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {diagnosis.description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Recommendations */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">推荐训练</h2>
            <button 
              onClick={() => router.push("/exercises")}
              className="text-sm text-primary flex items-center"
            >
              全部 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {RECOMMENDATIONS.map((rec) => (
              <Card 
                key={rec.id} 
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push("/exercises")}
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-lg font-semibold text-primary">{rec.id}</span>
                </div>
                <h3 className="font-medium text-sm mb-1">{rec.name}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{rec.duration}</span>
                  <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                  <span>{rec.difficulty}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1 h-12"
            onClick={() => setShowShareModal(true)}
          >
            <Share2 className="w-4 h-4 mr-2" />
            分享报告
          </Button>
          <Button 
            className="flex-1 h-12"
            onClick={() => router.push("/exercises")}
          >
            开始训练
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <Card className="w-full rounded-t-2xl p-6">
            <h3 className="font-semibold text-lg mb-4">分享报告</h3>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { name: "微信", color: "bg-green-500" },
                { name: "朋友圈", color: "bg-green-600" },
                { name: "保存图片", color: "bg-primary" },
                { name: "复制链接", color: "bg-muted" },
              ].map((item) => (
                <button key={item.name} className="flex flex-col items-center gap-2">
                  <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center`}>
                    {item.name === "保存图片" ? (
                      <Download className="w-5 h-5 text-white" />
                    ) : (
                      <Share2 className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </button>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full h-12"
              onClick={() => setShowShareModal(false)}
            >
              取消
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}
