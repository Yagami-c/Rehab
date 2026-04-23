"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Camera, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const REHAB_GOALS = [
  { id: "pain", label: "疼痛缓解" },
  { id: "surgery", label: "术后恢复" },
  { id: "posture", label: "体态改善" },
  { id: "flexibility", label: "柔韧性提升" },
  { id: "strength", label: "力量恢复" },
  { id: "balance", label: "平衡能力" },
]

export default function ProfilePage() {
  const router = useRouter()
  const [nickname, setNickname] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("")
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [goals, setGoals] = useState<string[]>([])

  const calculateBMI = () => {
    const h = parseFloat(height) / 100
    const w = parseFloat(weight)
    if (h > 0 && w > 0) {
      const bmi = w / (h * h)
      return bmi.toFixed(1)
    }
    return null
  }

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { text: "偏瘦", color: "text-blue-500" }
    if (bmi < 24) return { text: "正常", color: "text-accent" }
    if (bmi < 28) return { text: "偏胖", color: "text-yellow-500" }
    return { text: "肥胖", color: "text-destructive" }
  }

  const toggleGoal = (goalId: string) => {
    setGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    )
  }

  const handleSubmit = () => {
    // 保存个人档案
    localStorage.setItem("profile", JSON.stringify({
      nickname,
      birthDate,
      gender,
      height,
      weight,
      goals,
    }))
    router.push("/home")
  }

  const isValid = nickname && gender && height && weight && goals.length > 0

  const bmi = calculateBMI()
  const bmiStatus = bmi ? getBMIStatus(parseFloat(bmi)) : null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-card z-10 border-b border-border">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-center font-semibold">完善个人档案</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="p-6 space-y-6 pb-24">
        {/* Avatar */}
        <div className="flex justify-center">
          <button className="relative">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-3xl text-primary font-semibold">
                {nickname ? nickname[0].toUpperCase() : "U"}
              </span>
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Camera className="w-4 h-4 text-primary-foreground" />
            </div>
          </button>
        </div>

        {/* Nickname */}
        <div className="space-y-2">
          <Label htmlFor="nickname">昵称 *</Label>
          <Input
            id="nickname"
            placeholder="请输入您的昵称"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="h-12 bg-card"
          />
        </div>

        {/* Birth Date */}
        <div className="space-y-2">
          <Label htmlFor="birthDate">出生日期</Label>
          <Input
            id="birthDate"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="h-12 bg-card"
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label>性别 *</Label>
          <div className="flex gap-3">
            {[
              { value: "male", label: "男" },
              { value: "female", label: "女" },
              { value: "other", label: "其他" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setGender(option.value as typeof gender)}
                className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${
                  gender === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground border border-border"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Height & Weight */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="height">身高 (cm) *</Label>
            <Input
              id="height"
              type="number"
              placeholder="170"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="h-12 bg-card"
              min={50}
              max={250}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">体重 (kg) *</Label>
            <Input
              id="weight"
              type="number"
              placeholder="65"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="h-12 bg-card"
              min={20}
              max={300}
            />
          </div>
        </div>

        {/* BMI Display */}
        {bmi && bmiStatus && (
          <div className="bg-card p-4 rounded-xl border border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">BMI 指数</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">{bmi}</span>
                <span className={`text-sm font-medium ${bmiStatus.color}`}>
                  {bmiStatus.text}
                </span>
              </div>
            </div>
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 via-accent to-destructive"
                style={{ width: `${Math.min(parseFloat(bmi) / 35 * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>18.5</span>
              <span>24</span>
              <span>28</span>
            </div>
          </div>
        )}

        {/* Rehab Goals */}
        <div className="space-y-3">
          <Label>康复目标 * (可多选)</Label>
          <div className="grid grid-cols-2 gap-3">
            {REHAB_GOALS.map((goal) => (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`p-4 rounded-xl text-sm font-medium transition-colors text-left ${
                  goals.includes(goal.id)
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground border border-border"
                }`}
              >
                {goal.label}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
        <Button
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-full h-12 text-base font-medium"
        >
          保存并继续
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  )
}
