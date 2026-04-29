"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, TrendingDown, TrendingUp, Minus, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"

interface PADAssessment {
  level: number
  mode: string
  squatPain: number
  params: {
    pressure: number
    application: number
    rest: number
    cycles: number
  }
}

const ADVERSE_OPTIONS = [
  { id: "pain_worse", label: "明显疼痛加重" },
  { id: "skin_issue", label: "皮肤明显不适" },
  { id: "swelling", label: "膝盖更肿/更胀" },
  { id: "none", label: "没有以上情况" },
]

export default function FeedbackPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [assessment, setAssessment] = useState<PADAssessment | null>(null)

  // 反馈数据
  const [painAfter, setPainAfter] = useState([5])
  const [globalEffect, setGlobalEffect] = useState<string | null>(null)
  const [intensityFeel, setIntensityFeel] = useState<string | null>(null)
  const [adverse, setAdverse] = useState<string[]>([])

  // 结果
  const [nextLevel, setNextLevel] = useState(2)
  const [adjustReason, setAdjustReason] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem("padAssessment")
    if (saved) {
      const data = JSON.parse(saved)
      setAssessment(data)
      setPainAfter([data.squatPain])
    }
  }, [])

  const toggleAdverse = (id: string) => {
    if (id === "none") {
      setAdverse(["none"])
    } else {
      setAdverse(prev => {
        const filtered = prev.filter(a => a !== "none")
        return filtered.includes(id)
          ? filtered.filter(a => a !== id)
          : [...filtered, id]
      })
    }
  }

  const calculateNextLevel = () => {
    if (!assessment) return

    let newLevel = assessment.level
    let reason = ""
    const hasAdverse = adverse.some(a => a !== "none")
    const deltaPain = assessment.squatPain - painAfter[0]

    // 规则1: 有不良反应 → 降级
    if (hasAdverse) {
      newLevel = Math.max(1, newLevel - 1)
      reason = "出现不良反应，建议降低强度"
    }
    // 规则2: 疼痛加重 → 降级
    else if (deltaPain < 0) {
      newLevel = Math.max(1, newLevel - 1)
      reason = "使用后疼痛有所加重，建议降低强度"
    }
    // 规则3: 感觉太强 → 降级
    else if (intensityFeel === "strong") {
      newLevel = Math.max(1, newLevel - 1)
      reason = "强度感觉偏强，建议适当降低"
    }
    // 规则4: 疼痛明显改善 + 感觉太轻 → 升级
    else if (deltaPain >= 2 && intensityFeel === "light") {
      newLevel = Math.min(6, newLevel + 1)
      reason = "效果良好且强度偏轻，可尝试更高强度"
    }
    // 规则5: 轻度改善或无变化 + 整体更舒服 → 维持或升级
    else if (globalEffect === "better" && deltaPain >= 0) {
      if (intensityFeel === "light") {
        newLevel = Math.min(6, newLevel + 1)
        reason = "整体感觉良好且强度偏轻，建议升级"
      } else {
        reason = "当前强度合适，建议维持使用"
      }
    }
    // 默认维持
    else {
      reason = "建议维持当前强度继续使用"
    }

    setNextLevel(newLevel)
    setAdjustReason(reason)
  }

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      calculateNextLevel()
      setStep(5)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1: return true
      case 2: return globalEffect !== null
      case 3: return intensityFeel !== null
      case 4: return adverse.length > 0
      default: return true
    }
  }

  const getModeByLevel = (lvl: number) => {
    const modeMap: Record<number, string> = { 1: "L1", 2: "L2", 3: "L3", 4: "H1", 5: "H2", 6: "H3" }
    return modeMap[lvl] || "L1"
  }

  const getPainChange = () => {
    if (!assessment) return { text: "", icon: null, color: "" }
    const delta = assessment.squatPain - painAfter[0]
    if (delta >= 2) return { text: "明显改善", icon: TrendingDown, color: "text-green-600" }
    if (delta === 1) return { text: "轻度改善", icon: TrendingDown, color: "text-green-500" }
    if (delta === 0) return { text: "无变化", icon: Minus, color: "text-gray-500" }
    return { text: "有所加重", icon: TrendingUp, color: "text-red-500" }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-card z-10 border-b border-border">
        <div className="flex items-center h-12 px-4">
          <button onClick={() => step > 1 && step < 5 ? setStep(step - 1) : router.back()} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-base">使用后反馈</h1>
          {step < 5 && <span className="text-sm text-muted-foreground">{step}/4</span>}
        </div>
        {step < 5 && (
          <div className="h-1 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        )}
      </header>

      <main className="flex-1 p-4 pb-24 overflow-auto">
        {/* Step 1: 下蹲疼痛后测 */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold mb-1">下蹲疼痛后测</h2>
              <p className="text-sm text-muted-foreground">
                现在再做一次下蹲，你的膝盖不适程度是？
              </p>
            </div>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">使用前</span>
                <span className="text-sm font-medium">{assessment?.squatPain || 0} 分</span>
              </div>
              
              <div className="text-center mb-5">
                <span className="text-4xl font-bold text-primary">{painAfter[0]}</span>
                <p className="text-sm text-muted-foreground mt-1">使用后评分</p>
              </div>
              
              <Slider
                value={painAfter}
                onValueChange={setPainAfter}
                min={0}
                max={10}
                step={1}
                className="mb-3"
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 无痛</span>
                <span>5 中度</span>
                <span>10 剧痛</span>
              </div>
            </Card>

            {assessment && (
              <Card className={`p-3 ${getPainChange().color} bg-opacity-10`}>
                <div className="flex items-center gap-2">
                  {getPainChange().icon && <getPainChange().icon className={`w-4 h-4 ${getPainChange().color}`} />}
                  <span className={`text-sm font-medium ${getPainChange().color}`}>
                    {getPainChange().text}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {assessment.squatPain} → {painAfter[0]} 分
                  </span>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Step 2: 整体感觉 */}
        {step === 2 && (
          <div>
            <h2 className="text-base font-semibold mb-1">整体感觉</h2>
            <p className="text-sm text-muted-foreground mb-4">
              使用后整体感觉如何？
            </p>

            <div className="space-y-2">
              {[
                { id: "better", label: "更舒服", icon: "😊", desc: "膝盖感觉轻松了" },
                { id: "same", label: "没变化", icon: "😐", desc: "和之前差不多" },
                { id: "worse", label: "更不适", icon: "😣", desc: "感觉不太舒服" },
              ].map((item) => (
                <Card
                  key={item.id}
                  onClick={() => setGlobalEffect(item.id)}
                  className={`p-4 cursor-pointer transition-all active:scale-[0.98] ${
                    globalEffect === item.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: 强度感觉 */}
        {step === 3 && (
          <div>
            <h2 className="text-base font-semibold mb-1">强度感觉</h2>
            <p className="text-sm text-muted-foreground mb-4">
              你觉得刚才的强度怎么样？
            </p>

            <div className="space-y-2">
              {[
                { id: "light", label: "太轻", desc: "几乎感觉不到" },
                { id: "right", label: "刚好", desc: "强度适中" },
                { id: "strong", label: "有点强", desc: "略有不适" },
              ].map((item) => (
                <Card
                  key={item.id}
                  onClick={() => setIntensityFeel(item.id)}
                  className={`p-4 cursor-pointer transition-all active:scale-[0.98] ${
                    intensityFeel === item.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.id === "light" ? "bg-blue-100" :
                      item.id === "right" ? "bg-green-100" : "bg-orange-100"
                    }`}>
                      <div className={`w-4 h-4 rounded-full ${
                        item.id === "light" ? "bg-blue-400" :
                        item.id === "right" ? "bg-green-500" : "bg-orange-500"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: 不良反应 */}
        {step === 4 && (
          <div>
            <h2 className="text-base font-semibold mb-1">不良反应检查</h2>
            <p className="text-sm text-muted-foreground mb-4">
              使用后有没有出现以下情况？（可多选）
            </p>

            <div className="space-y-2">
              {ADVERSE_OPTIONS.map((item) => (
                <Card
                  key={item.id}
                  onClick={() => toggleAdverse(item.id)}
                  className={`p-3.5 cursor-pointer transition-all active:scale-[0.98] ${
                    adverse.includes(item.id)
                      ? item.id === "none"
                        ? "border-green-500 bg-green-50 ring-1 ring-green-500"
                        : "border-destructive bg-destructive/5 ring-1 ring-destructive"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      adverse.includes(item.id)
                        ? item.id === "none"
                          ? "border-green-500 bg-green-500"
                          : "border-destructive bg-destructive"
                        : "border-muted-foreground/30"
                    }`}>
                      {adverse.includes(item.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: 总结和建议 */}
        {step === 5 && assessment && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <h2 className="text-lg font-semibold">反馈已记录</h2>
            </div>

            {/* 数据变化总结 */}
            <Card className="p-4">
              <h3 className="font-medium text-sm mb-3">数据变化</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">疼痛变化</span>
                  <span className={`font-medium ${getPainChange().color}`}>
                    {assessment.squatPain} → {painAfter[0]} ({getPainChange().text})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">整体感觉</span>
                  <span className="font-medium">
                    {globalEffect === "better" ? "更舒服" : globalEffect === "same" ? "没变化" : "更不适"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">强度感受</span>
                  <span className="font-medium">
                    {intensityFeel === "light" ? "太轻" : intensityFeel === "right" ? "刚好" : "有点强"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">不良反应</span>
                  <span className={`font-medium ${adverse.includes("none") ? "text-green-600" : "text-red-500"}`}>
                    {adverse.includes("none") ? "无" : "有"}
                  </span>
                </div>
              </div>
            </Card>

            {/* 调整建议 */}
            <Card className="p-4 bg-primary/5 border-primary/20">
              <h3 className="font-medium text-sm mb-2">下次建议</h3>
              <p className="text-sm text-muted-foreground mb-3">{adjustReason}</p>
              
              <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-foreground">
                    {getModeByLevel(nextLevel)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-sm">推荐模式</p>
                  <p className="text-xs text-muted-foreground">
                    {nextLevel === assessment.level ? "维持当前" : 
                     nextLevel > assessment.level ? "升级一档" : "降低一档"}
                  </p>
                </div>
              </div>
            </Card>

            {/* 警告提示 */}
            {adverse.some(a => a !== "none") && (
              <Card className="p-3 bg-destructive/5 border-destructive/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive">
                    检测到不良反应，如症状持续或加重，请暂停使用并咨询医疗专业人员。
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
        {step < 5 ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="w-full h-11 text-base font-medium"
          >
            {step === 4 ? "提交反馈" : "下一步"}
          </Button>
        ) : (
          <Button
            onClick={() => router.push("/home")}
            className="w-full h-11 text-base font-medium"
          >
            返回首页
          </Button>
        )}
      </div>
    </div>
  )
}
