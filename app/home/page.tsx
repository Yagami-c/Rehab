"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Activity, 
  ClipboardList, 
  FileText, 
  Settings, 
  User,
  ChevronRight,
  CheckCircle2,
  Clock
} from "lucide-react"
import { Card } from "@/components/ui/card"

const FEATURES = [
  {
    id: "assessment",
    icon: Activity,
    title: "开始康复评估",
    description: "动作评估与分析",
    href: "/questionnaire",
    color: "bg-primary",
  },
  {
    id: "plan",
    icon: ClipboardList,
    title: "我的康复计划",
    description: "推荐动作训练",
    href: "/exercises",
    color: "bg-accent",
  },
  {
    id: "report",
    icon: FileText,
    title: "健康报告",
    description: "历史报告查看",
    href: "/reports",
    color: "bg-chart-3",
  },
  {
    id: "device",
    icon: Settings,
    title: "设备配置",
    description: "蓝牙设备连接",
    href: "/device",
    color: "bg-chart-4",
  },
]

const BANNERS = [
  { id: 1, color: "bg-gradient-to-r from-primary to-primary/80" },
  { id: 2, color: "bg-gradient-to-r from-accent to-accent/80" },
]

export default function HomePage() {
  const router = useRouter()
  const [currentBanner, setCurrentBanner] = useState(0)
  const [profile, setProfile] = useState<{ nickname?: string; goals?: string[] } | null>(null)

  useEffect(() => {
    const savedProfile = localStorage.getItem("profile")
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile))
    }
    
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const todayTasks = [
    { id: 1, title: "完成肩部评估", status: "pending" },
    { id: 2, title: "颈部放松训练", status: "completed" },
    { id: 3, title: "腰部伸展运动", status: "pending" },
  ]

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">
                您好，{profile?.nickname || "用户"}
              </h1>
              <p className="text-sm text-primary-foreground/80">
                今天是开始康复的好日子
              </p>
            </div>
          </div>
          <button 
            onClick={() => router.push("/profile")}
            className="p-2 rounded-full bg-white/10"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Banner */}
        <div className="relative h-32 rounded-xl overflow-hidden">
          <div
            className={`absolute inset-0 ${BANNERS[currentBanner].color} flex items-center px-6`}
          >
            <div>
              <p className="text-sm text-primary-foreground/90 mb-1">个性化建议</p>
              <h2 className="text-lg font-semibold">
                建议每日完成肩部放松训练
              </h2>
              <p className="text-sm text-primary-foreground/80 mt-1">
                根据您的康复目标为您推荐
              </p>
            </div>
          </div>
          {/* Banner Indicators */}
          <div className="absolute bottom-3 right-4 flex gap-1.5">
            {BANNERS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentBanner ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="px-6 -mt-4">
        {/* Feature Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {FEATURES.map((feature) => (
            <Card
              key={feature.id}
              onClick={() => router.push(feature.href)}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
            >
              <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-3`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Today Tasks */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">今日待办</h2>
            <button className="text-sm text-primary flex items-center">
              全部 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <Card className="divide-y divide-border">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 p-4"
              >
                {task.status === "completed" ? (
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                ) : (
                  <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
                )}
                <span className={`flex-1 ${
                  task.status === "completed" 
                    ? "text-muted-foreground line-through" 
                    : "text-foreground"
                }`}>
                  {task.title}
                </span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            ))}
          </Card>
        </section>

        {/* Quick Stats */}
        <section>
          <h2 className="text-lg font-semibold mb-4">本周概览</h2>
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">3</p>
              <p className="text-xs text-muted-foreground mt-1">完成评估</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-accent">5</p>
              <p className="text-xs text-muted-foreground mt-1">训练次数</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-chart-3">85%</p>
              <p className="text-xs text-muted-foreground mt-1">完成率</p>
            </Card>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex">
          {[
            { icon: Activity, label: "首页", href: "/home", active: true },
            { icon: ClipboardList, label: "计划", href: "/exercises", active: false },
            { icon: FileText, label: "报告", href: "/reports", active: false },
            { icon: User, label: "我的", href: "/profile", active: false },
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
