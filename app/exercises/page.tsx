"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  Flame,
  ChevronRight,
  Calendar,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const EXERCISES = [
  {
    id: 1,
    name: "颈部拉伸操",
    duration: "5分钟",
    difficulty: "简单",
    calories: 15,
    description: "缓解颈部紧张，改善颈椎活动度",
    category: "颈部",
  },
  {
    id: 2,
    name: "肩关节环绕",
    duration: "8分钟",
    difficulty: "简单",
    calories: 25,
    description: "增强肩关节灵活性，预防肩周炎",
    category: "肩部",
  },
  {
    id: 3,
    name: "猫牛式伸展",
    duration: "6分钟",
    difficulty: "中等",
    calories: 20,
    description: "强化脊柱灵活性，缓解腰背疼痛",
    category: "腰背",
  },
  {
    id: 4,
    name: "骨盆稳定训练",
    duration: "10分钟",
    difficulty: "中等",
    calories: 40,
    description: "增强核心稳定性，改善体态",
    category: "核心",
  },
  {
    id: 5,
    name: "髋关节开合",
    duration: "8分钟",
    difficulty: "简单",
    calories: 30,
    description: "提升髋关节活动范围，改善下肢功能",
    category: "髋部",
  },
  {
    id: 6,
    name: "深蹲训练",
    duration: "12分钟",
    difficulty: "较难",
    calories: 60,
    description: "强化下肢力量，提升整体功能",
    category: "下肢",
  },
]

const WEEK_DAYS = ["一", "二", "三", "四", "五", "六", "日"]

export default function ExercisesPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState("全部")
  const [checkedDays, setCheckedDays] = useState([1, 2, 4]) // 模拟已打卡的日期

  const categories = ["全部", ...new Set(EXERCISES.map(e => e.category))]
  
  const filteredExercises = selectedCategory === "全部" 
    ? EXERCISES 
    : EXERCISES.filter(e => e.category === selectedCategory)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "简单":
        return "bg-accent/10 text-accent"
      case "中等":
        return "bg-yellow-100 text-yellow-700"
      case "较难":
        return "bg-destructive/10 text-destructive"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-card z-10 border-b border-border">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-center font-semibold">康复训练</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Weekly Progress */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">本周打卡</h2>
            <span className="text-sm text-muted-foreground">
              {checkedDays.length}/7 天
            </span>
          </div>
          <div className="flex justify-between">
            {WEEK_DAYS.map((day, index) => (
              <div key={day} className="flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  checkedDays.includes(index)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {checkedDays.includes(index) ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <span className="text-sm">{day}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Today's Plan */}
        <Card className="p-4 bg-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-foreground/80 text-sm">今日计划</p>
              <p className="text-xl font-semibold">3 个训练动作</p>
              <p className="text-sm text-primary-foreground/80 mt-1">
                预计用时 23 分钟
              </p>
            </div>
            <Button 
              variant="secondary" 
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => router.push("/assessment")}
            >
              <Play className="w-4 h-4 mr-2" />
              开始训练
            </Button>
          </div>
        </Card>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground border border-border"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Exercise List */}
        <div className="space-y-3">
          {filteredExercises.map((exercise) => (
            <Card
              key={exercise.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {}}
            >
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-2xl font-bold text-primary">{exercise.id}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold">{exercise.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                      {exercise.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                    {exercise.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {exercise.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {exercise.calories} 卡
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 self-center" />
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex">
          {[
            { icon: Calendar, label: "首页", href: "/home", active: false },
            { icon: Play, label: "计划", href: "/exercises", active: true },
            { icon: Clock, label: "报告", href: "/reports", active: false },
            { icon: Flame, label: "我的", href: "/profile", active: false },
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
