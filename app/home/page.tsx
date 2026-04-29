"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Bell,
  User,
  ChevronRight,
  CheckCircle2,
  Circle,
  ClipboardList,
  Video,
  Activity,
  Settings,
  FileText,
  X
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const FEATURES = [
  {
    id: "health",
    icon: ClipboardList,
    title: "健康评估",
    href: "/questionnaire",
    bgColor: "bg-blue-50",
    iconColor: "text-[#2066A2]",
  },
  {
    id: "motion",
    icon: Video,
    title: "动作评估",
    href: "/assessment",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-500",
  },
  {
    id: "training",
    icon: Activity,
    title: "我的训练",
    href: "/training",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-500",
  },
  {
    id: "device",
    icon: Settings,
    title: "设备连接",
    href: "/device",
    bgColor: "bg-green-50",
    iconColor: "text-green-500",
  },
]

export default function HomePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<{ nickname?: string } | null>(null)
  const [showAssessmentModal, setShowAssessmentModal] = useState(false)
  const [notifications, setNotifications] = useState(1)

  useEffect(() => {
    const savedProfile = localStorage.getItem("profile")
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile))
    }

    // 检查是否首次登录，如果是则显示健康评估弹窗
    const hasCompletedFirstAssessment = localStorage.getItem("firstAssessmentCompleted")
    const medicalHistoryCompleted = localStorage.getItem("medicalHistoryCompleted")
    
    if (!hasCompletedFirstAssessment && medicalHistoryCompleted) {
      setShowAssessmentModal(true)
    }
  }, [])

  const handleStartAssessment = () => {
    setShowAssessmentModal(false)
    localStorage.setItem("firstAssessmentCompleted", "true")
    router.push("/questionnaire")
  }

  const handleSkipAssessment = () => {
    setShowAssessmentModal(false)
    localStorage.setItem("firstAssessmentCompleted", "true")
  }

  const todayTasks = [
    { id: 1, title: "完成健康评估", status: "pending", href: "/questionnaire" },
    { id: 2, title: "PAD理疗 15分钟", status: "completed", href: "/device" },
    { id: 3, title: "康复训练打卡", status: "pending", href: "/training" },
  ]

  const completedCount = todayTasks.filter(t => t.status === "completed").length

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20">
      {/* Header - 匹配Figma设计 */}
      <header className="bg-[#2066A2] text-white px-5 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">
                你好，{profile?.nickname || "用户"}
              </h1>
              <p className="text-sm text-white/70">
                今天感觉怎么样？
              </p>
            </div>
          </div>
          <button 
            onClick={() => router.push("/notifications")}
            className="relative w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"
          >
            <Bell className="w-5 h-5" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-[#2066A2] text-xs font-bold rounded-full flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="px-5 -mt-4">
        {/* 常用功能 - 4个图标格子 */}
        <Card className="p-5 mb-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">常用功能</h2>
          <div className="grid grid-cols-4 gap-4">
            {FEATURES.map((feature) => (
              <button
                key={feature.id}
                onClick={() => router.push(feature.href)}
                className="flex flex-col items-center gap-2"
              >
                <div className={`w-14 h-14 ${feature.bgColor} rounded-2xl flex items-center justify-center`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <span className="text-xs text-gray-600">{feature.title}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* 今日待办 */}
        <Card className="p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#2066A2]" />
              <h2 className="text-base font-semibold text-gray-900">今日待办</h2>
            </div>
            <span className="text-sm text-[#2066A2] font-medium">
              完成度 {completedCount}/{todayTasks.length}
            </span>
          </div>
          <div className="space-y-3">
            {todayTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => router.push(task.href)}
                className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
              >
                {task.status === "completed" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 shrink-0" />
                )}
                <span className={`flex-1 text-left text-sm ${
                  task.status === "completed" 
                    ? "text-gray-400 line-through" 
                    : "text-gray-700"
                }`}>
                  {task.title}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>
        </Card>

        {/* 本周概览 */}
        <Card className="p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">本周概览</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-[#2066A2]">3</p>
              <p className="text-xs text-gray-500 mt-1">完成评估</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <p className="text-2xl font-bold text-green-500">5</p>
              <p className="text-xs text-gray-500 mt-1">训练次数</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-xl">
              <p className="text-2xl font-bold text-orange-500">85%</p>
              <p className="text-xs text-gray-500 mt-1">完成率</p>
            </div>
          </div>
        </Card>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100">
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
                item.active ? "text-[#2066A2]" : "text-gray-400"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* 首次登录健康评估弹窗 */}
      {showAssessmentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-[#2066A2] p-6 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <ClipboardList className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">开始健康评估</h3>
              <p className="text-sm text-white/80">
                完成健康评估，获取个性化康复方案
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>评估您的身体状况</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>制定个性化康复计划</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>推荐适合的PAD理疗模式</span>
                </div>
              </div>
              <Button
                onClick={handleStartAssessment}
                className="w-full h-12 bg-[#2066A2] hover:bg-[#1a5485] text-base font-medium mb-3"
              >
                立即开始评估
              </Button>
              <button
                onClick={handleSkipAssessment}
                className="w-full text-sm text-gray-500"
              >
                稍后再说
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
