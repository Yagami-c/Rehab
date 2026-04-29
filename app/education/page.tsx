"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  ChevronRight,
  BookOpen,
  Video,
  FileText,
  CheckCircle2,
  Lock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const EDUCATION_MODULES = [
  {
    id: 1,
    title: "膝关节解剖基础",
    type: "video",
    duration: "5分钟",
    description: "了解膝关节的基本结构，包括骨骼、韧带、软骨等",
    completed: true,
    locked: false,
  },
  {
    id: 2,
    title: "骨关节炎是什么",
    type: "article",
    duration: "3分钟",
    description: "认识骨关节炎的病因、症状和发展过程",
    completed: true,
    locked: false,
  },
  {
    id: 3,
    title: "PAD设备使用指南",
    type: "video",
    duration: "8分钟",
    description: "详细了解PAD设备的原理、使用方法和注意事项",
    completed: false,
    locked: false,
  },
  {
    id: 4,
    title: "日常膝盖保护",
    type: "article",
    duration: "4分钟",
    description: "学习日常生活中保护膝盖的方法和习惯",
    completed: false,
    locked: false,
  },
  {
    id: 5,
    title: "康复训练原则",
    type: "video",
    duration: "6分钟",
    description: "掌握科学康复训练的基本原则和方法",
    completed: false,
    locked: false,
  },
  {
    id: 6,
    title: "疼痛管理技巧",
    type: "article",
    duration: "5分钟",
    description: "了解如何正确应对和管理膝关节疼痛",
    completed: false,
    locked: true,
  },
]

const FAQ_LIST = [
  {
    q: "PAD设备每天可以使用几次？",
    a: "建议每天使用1-2次，每次间隔至少4小时，让膝关节有充分的休息时间。"
  },
  {
    q: "使用后膝盖发红正常吗？",
    a: "轻微发红是正常现象，通常30分钟内消退。如果持续发红或伴有疼痛，请暂停使用并咨询医生。"
  },
  {
    q: "什么情况下应该停止使用？",
    a: "出现剧烈疼痛、明显肿胀、皮肤破损或过敏反应时应立即停止使用，并及时就医。"
  },
  {
    q: "康复训练应该多久做一次？",
    a: "建议每天进行15-30分钟的康复训练，可以分2-3次完成，保持规律性很重要。"
  },
]

export default function EducationPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"courses" | "faq">("courses")
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const completedCount = EDUCATION_MODULES.filter(m => m.completed).length
  const totalCount = EDUCATION_MODULES.length

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return Video
      case "article":
        return FileText
      default:
        return BookOpen
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-card z-10 border-b border-border">
        <div className="flex items-center h-12 px-4">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-base">康复宣教</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Progress Card */}
        <Card className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">学习进度</p>
              <p className="text-2xl font-bold mt-1">{completedCount}/{totalCount} 课程</p>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="6"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="white"
                  strokeWidth="6"
                  strokeDasharray={`${(completedCount / totalCount) * 176} 176`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                {Math.round((completedCount / totalCount) * 100)}%
              </span>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveTab("courses")}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === "courses"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            课程学习
          </button>
          <button
            onClick={() => setActiveTab("faq")}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === "faq"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            常见问题
          </button>
        </div>

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <div className="space-y-3">
            {EDUCATION_MODULES.map((module) => {
              const TypeIcon = getTypeIcon(module.type)
              return (
                <Card
                  key={module.id}
                  className={`p-4 cursor-pointer transition-all active:scale-[0.98] ${
                    module.locked ? "opacity-60" : ""
                  }`}
                  onClick={() => !module.locked && router.push(`/education/${module.id}`)}
                >
                  <div className="flex gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      module.completed 
                        ? "bg-green-100" 
                        : module.locked 
                          ? "bg-gray-100" 
                          : "bg-primary/10"
                    }`}>
                      {module.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : module.locked ? (
                        <Lock className="w-5 h-5 text-gray-400" />
                      ) : (
                        <TypeIcon className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-medium text-sm">{module.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          module.type === "video" 
                            ? "bg-blue-100 text-blue-600" 
                            : "bg-orange-100 text-orange-600"
                        }`}>
                          {module.type === "video" ? "视频" : "图文"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                        {module.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{module.duration}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 self-center" />
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === "faq" && (
          <div className="space-y-2">
            {FAQ_LIST.map((faq, index) => (
              <Card
                key={index}
                className="overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full p-4 text-left flex items-start justify-between gap-3"
                >
                  <span className="font-medium text-sm">{faq.q}</span>
                  <ChevronRight className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${
                    expandedFaq === index ? "rotate-90" : ""
                  }`} />
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4 pt-0">
                    <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                      {faq.a}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
        <Button
          onClick={() => router.push("/training")}
          className="w-full h-11 text-base font-medium"
        >
          <Play className="w-4 h-4 mr-2" />
          开始康复训练
        </Button>
      </div>
    </div>
  )
}
