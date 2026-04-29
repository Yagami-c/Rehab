"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, XCircle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// PAD模式参数库
const PAD_MODES: Record<string, {
  pressure: number
  application: number
  rest: number
  cycles: number
  userExplain: string
  detailExplain: string
  dailyAdvice: string
}> = {
  L1: {
    pressure: 100, application: 15, rest: 10, cycles: 10,
    userExplain: "你的膝关节不敏感，无紧张，建议从最低强度开始。",
    detailExplain: "你的膝关节评估显示无明显敏感和紧张，我们推荐温和的低强度方案（L1）。该模式压力很低，适合初次使用或完全无不适者。",
    dailyAdvice: "每天1次，每次5分钟，使用后观察变化。"
  },
  L2: {
    pressure: 125, application: 15, rest: 10, cycles: 10,
    userExplain: "你的膝盖有一定敏感，同时伴随轻度紧张，建议从中等偏低强度开始。",
    detailExplain: "根据你的情况，你的膝关节存在一定程度的紧张，同时伴随一定的敏感性。我们为你推荐从中等偏低强度开始（L2）。",
    dailyAdvice: "每天1-2次，每次5-10分钟，使用后观察变化。"
  },
  L3: {
    pressure: 125, application: 30, rest: 10, cycles: 5,
    userExplain: "你的膝盖有明显紧张感，建议从中等强度开始，适当延长作用时间。",
    detailExplain: "评估显示你的膝关节紧张程度较明显，但敏感性中等。推荐L3模式，在保持中等负压的基础上延长施加时间至30秒，帮助缓解僵硬。",
    dailyAdvice: "每天1-2次，每次约10分钟，使用后注意放松。"
  },
  H1: {
    pressure: 150, application: 90, rest: 10, cycles: 3,
    userExplain: "你的膝关节有较强的紧张和一定敏感性，建议从高压短周期模式开始。",
    detailExplain: "你的僵硬程度较高，且下蹲疼痛评分不低，不适合长时间低速脉冲。推荐H1模式：较高负压、较短作用时间，以快速疏通不适区域。",
    dailyAdvice: "每天1次，每次约5分钟，使用后评估反应。"
  },
  H2: {
    pressure: 150, application: 180, rest: 10, cycles: 3,
    userExplain: "你的膝关节紧张明显且适应性较好，建议采用高压中长持续模式。",
    detailExplain: "你的僵硬程度突出，但已经有耐受基础，推荐H2模式：中等高压、持续180秒，实现深层按压。",
    dailyAdvice: "每天1次，每次约10分钟，注意观察皮肤反应。"
  },
  H3: {
    pressure: 200, application: 180, rest: 10, cycles: 3,
    userExplain: "你的膝关节僵硬显著且需求较高，建议采用最强高压强化模式。",
    detailExplain: "你的僵硬和不适程度较高，需要强力刺激。推荐H3模式：200 mmHg高压，持久作用，适合有明确机械需求者。",
    dailyAdvice: "每天1次，每次约10分钟，使用前后可冰敷。"
  },
}

// 红旗征选项
const RED_FLAGS = [
  { id: "injury", label: "最近2周内有明显受伤" },
  { id: "swelling", label: "膝盖明显肿胀" },
  { id: "wound", label: "有伤口或皮肤问题" },
  { id: "doctor", label: "医生建议避免使用类似设备" },
  { id: "none", label: "以上都没有" },
]

// 疼痛诱因选项
const PAIN_TRIGGERS = [
  { id: "stairs", label: "上下楼梯" },
  { id: "sitting", label: "久坐后站起" },
  { id: "running", label: "跑步/运动" },
  { id: "none", label: "没有明显诱因" },
]

// 体型选项
const BODY_TYPES = [
  { id: "thin", label: "偏瘦", delta: -1, desc: "软组织较薄，负压传导直接" },
  { id: "normal", label: "标准", delta: 0, desc: "中等体型，负压传导适中" },
  { id: "thick", label: "偏厚", delta: 1, desc: "软组织较厚，需要更高负压" },
]

// 疼痛等级表情
const PAIN_EMOJIS = [
  { range: [0, 0], emoji: "😄", label: "无痛", color: "#22C55E" },
  { range: [1, 2], emoji: "😊", label: "轻微疼痛", color: "#84CC16" },
  { range: [3, 4], emoji: "🙂", label: "轻度疼痛", color: "#EAB308" },
  { range: [5, 6], emoji: "😐", label: "中度疼痛", color: "#F97316" },
  { range: [7, 8], emoji: "😣", label: "重度疼痛", color: "#EF4444" },
  { range: [9, 10], emoji: "😫", label: "剧烈疼痛", color: "#DC2626" },
]

export default function QuestionnairePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  
  // 评估数据
  const [redFlags, setRedFlags] = useState<string[]>([])
  const [deviceConfirmed, setDeviceConfirmed] = useState(false)
  const [stiffness, setStiffness] = useState<number | null>(null)
  const [squatPain, setSquatPain] = useState(0)
  const [painTriggers, setPainTriggers] = useState<string[]>([])
  const [bodyType, setBodyType] = useState<string | null>(null)
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null)
  
  // 计算出的等级
  const [level, setLevel] = useState(2)
  
  // 弹窗
  const [showRedFlagAlert, setShowRedFlagAlert] = useState(false)
  const [showPainAlert, setShowPainAlert] = useState(false)

  const totalSteps = 7 // 增加一步设备确认

  const toggleRedFlag = (id: string) => {
    if (id === "none") {
      setRedFlags(["none"])
    } else {
      setRedFlags(prev => {
        const filtered = prev.filter(f => f !== "none")
        return filtered.includes(id) 
          ? filtered.filter(f => f !== id)
          : [...filtered, id]
      })
    }
  }

  const togglePainTrigger = (id: string) => {
    if (id === "none") {
      setPainTriggers(["none"])
    } else {
      setPainTriggers(prev => {
        const filtered = prev.filter(f => f !== "none")
        return filtered.includes(id)
          ? filtered.filter(f => f !== id)
          : [...filtered, id]
      })
    }
  }

  const getPainColor = (value: number) => {
    const emoji = PAIN_EMOJIS.find(e => value >= e.range[0] && value <= e.range[1])
    return emoji?.color || "#22C55E"
  }

  const getPainLabel = (value: number) => {
    const emoji = PAIN_EMOJIS.find(e => value >= e.range[0] && value <= e.range[1])
    return emoji?.label || "无痛"
  }

  const handleNext = () => {
    // Step 1: 红旗征检查
    if (step === 1) {
      if (redFlags.length === 0) return
      const hasRisk = redFlags.some(f => f !== "none")
      if (hasRisk) {
        setShowRedFlagAlert(true)
        return
      }
    }
    
    // Step 2: 设备佩戴确认
    if (step === 2) {
      if (!deviceConfirmed) return
    }
    
    // Step 3: 僵硬程度 -> 设置初始等级
    if (step === 3 && stiffness !== null) {
      if (stiffness === 0) setLevel(2)
      else if (stiffness === 1) setLevel(3)
      else setLevel(4)
    }
    
    // Step 4: 下蹲疼痛评估
    if (step === 4) {
      if (squatPain >= 7) {
        setShowPainAlert(true)
        return
      }
      adjustLevelByPain(squatPain)
    }
    
    // Step 5: 体型评估
    if (step === 5 && bodyType) {
      const delta = BODY_TYPES.find(b => b.id === bodyType)?.delta || 0
      setLevel(prev => Math.max(1, Math.min(6, prev + delta)))
    }
    
    // Step 6: 初次使用限制
    if (step === 6 && isFirstTime !== null) {
      if (isFirstTime) {
        setLevel(prev => Math.min(prev, 2))
      }
    }

    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      // 保存评估结果
      const modeMap: Record<number, string> = { 1: "L1", 2: "L2", 3: "L3", 4: "H1", 5: "H2", 6: "H3" }
      const mode = modeMap[level] || "L1"
      localStorage.setItem("padAssessment", JSON.stringify({
        level,
        mode,
        params: PAD_MODES[mode],
        stiffness,
        squatPain,
        painTriggers,
        bodyType,
        isFirstTime,
        timestamp: Date.now()
      }))
      router.push("/device")
    }
  }

  const adjustLevelByPain = (pain: number) => {
    if (pain >= 7) {
      setLevel(prev => Math.max(1, prev - 1))
    } else if (pain < 4) {
      setLevel(prev => Math.min(6, prev + 1))
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1: return redFlags.length > 0
      case 2: return deviceConfirmed
      case 3: return stiffness !== null
      case 4: return true
      case 5: return bodyType !== null
      case 6: return isFirstTime !== null
      case 7: return true
      default: return false
    }
  }

  const getModeByLevel = (lvl: number) => {
    const modeMap: Record<number, string> = { 1: "L1", 2: "L2", 3: "L3", 4: "H1", 5: "H2", 6: "H3" }
    return modeMap[lvl] || "L1"
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-card z-10 border-b border-border">
        <div className="flex items-center h-12 px-4">
          <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-base">健康评估 ({step}/{totalSteps})</h1>
          <button onClick={() => router.push("/home")} className="text-sm text-muted-foreground">
            取消
          </button>
        </div>
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </header>

      <main className="flex-1 p-4 pb-24 overflow-auto">
        {/* Step 1: 红旗征筛查 */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">安全筛查</h2>
            <p className="text-sm text-muted-foreground mb-4">
              以下情况是否符合你？（可多选）
            </p>
            
            <div className="space-y-2">
              {RED_FLAGS.map((flag) => (
                <Card
                  key={flag.id}
                  onClick={() => toggleRedFlag(flag.id)}
                  className={`p-3.5 cursor-pointer transition-all active:scale-[0.98] ${
                    redFlags.includes(flag.id)
                      ? flag.id === "none" 
                        ? "border-green-500 bg-green-50 ring-1 ring-green-500"
                        : "border-destructive bg-destructive/5 ring-1 ring-destructive"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      redFlags.includes(flag.id)
                        ? flag.id === "none"
                          ? "border-green-500 bg-green-500"
                          : "border-destructive bg-destructive"
                        : "border-muted-foreground/30"
                    }`}>
                      {redFlags.includes(flag.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="font-medium text-sm">{flag.label}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: 设备佩戴确认 */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">设备佩戴确认</h2>
            <p className="text-sm text-muted-foreground mb-6">
              请确保设备已正确佩戴在膝盖上。
            </p>

            <Card
              onClick={() => setDeviceConfirmed(!deviceConfirmed)}
              className={`p-8 cursor-pointer transition-all active:scale-[0.98] flex flex-col items-center justify-center ${
                deviceConfirmed
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border border-dashed"
              }`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                deviceConfirmed
                  ? "bg-primary"
                  : "bg-muted"
              }`}>
                <Check className={`w-8 h-8 ${deviceConfirmed ? "text-white" : "text-muted-foreground"}`} />
              </div>
              <p className="text-base font-medium text-center">
                {deviceConfirmed ? "已确认佩戴" : "点击确认已佩戴"}
              </p>
            </Card>
          </div>
        )}

        {/* Step 3: 僵硬程度评估 */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">僵硬/紧张程度评估</h2>
            <p className="text-sm text-muted-foreground mb-4">
              你是否感觉膝盖有点紧或活动不开？
            </p>

            <div className="space-y-2">
              {[
                { value: 0, label: "没有", desc: "膝关节活动自如", icon: "😊" },
                { value: 1, label: "有一点", desc: "轻微紧绷感", icon: "😐" },
                { value: 2, label: "明显", desc: "明显僵硬不适", icon: "😣" },
              ].map((item) => (
                <Card
                  key={item.value}
                  onClick={() => setStiffness(item.value)}
                  className={`p-4 cursor-pointer transition-all active:scale-[0.98] ${
                    stiffness === item.value
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
                    {stiffness === item.value && (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: 下蹲疼痛评分 - 优化UI */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">下蹲疼痛评分</h2>
              <p className="text-sm text-muted-foreground">
                当您下蹲时，膝盖不适程度是？（0-10分）
              </p>
            </div>

            {/* 大数字显示 */}
            <div className="text-center py-4">
              <span 
                className="text-6xl font-bold"
                style={{ color: getPainColor(squatPain) }}
              >
                {squatPain}
              </span>
            </div>

            {/* 渐变滑块 */}
            <div className="px-2">
              <div className="relative">
                {/* 渐变背景条 */}
                <div 
                  className="h-2 rounded-full"
                  style={{
                    background: "linear-gradient(to right, #22C55E 0%, #84CC16 20%, #EAB308 40%, #F97316 60%, #EF4444 80%, #DC2626 100%)"
                  }}
                />
                {/* 滑块指示器 */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-4 border-white shadow-lg cursor-pointer"
                  style={{ 
                    left: `calc(${squatPain * 10}% - 12px)`,
                    backgroundColor: getPainColor(squatPain)
                  }}
                />
                {/* 透明滑块用于交互 */}
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={squatPain}
                  onChange={(e) => setSquatPain(Number(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
              
              {/* 刻度数字 */}
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <span 
                    key={n} 
                    className={`w-4 text-center ${squatPain === n ? "font-bold text-foreground" : ""}`}
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>

            {/* 表情等级 */}
            <div className="flex justify-between px-1">
              {PAIN_EMOJIS.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-2xl mb-1">{item.emoji}</span>
                  <span 
                    className="text-xs text-center leading-tight"
                    style={{ color: item.color }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* 疼痛诱因 */}
            <div className="pt-4">
              <h3 className="font-medium text-sm mb-3">以下哪些动作会让您膝盖不舒服？（可多选）</h3>
              <div className="grid grid-cols-2 gap-2">
                {PAIN_TRIGGERS.map((trigger) => (
                  <Card
                    key={trigger.id}
                    onClick={() => togglePainTrigger(trigger.id)}
                    className={`p-3 cursor-pointer text-center transition-all active:scale-[0.98] ${
                      painTriggers.includes(trigger.id)
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border"
                    }`}
                  >
                    <span className="text-sm">{trigger.label}</span>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: 体型评估 */}
        {step === 5 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">体型评估</h2>
            <p className="text-sm text-muted-foreground mb-4">
              请选择最符合你的体型（软组织厚度影响负压传导）
            </p>

            <div className="space-y-2">
              {BODY_TYPES.map((type) => (
                <Card
                  key={type.id}
                  onClick={() => setBodyType(type.id)}
                  className={`p-4 cursor-pointer transition-all active:scale-[0.98] ${
                    bodyType === type.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      type.id === "thin" ? "bg-blue-100" :
                      type.id === "normal" ? "bg-green-100" : "bg-orange-100"
                    }`}>
                      {type.id === "thin" ? "🧍" : type.id === "normal" ? "🧍‍♂️" : "🏋️"}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.desc}</p>
                    </div>
                    {bodyType === type.id && (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: 初次使用 */}
        {step === 6 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">初次使用确认</h2>
            <p className="text-sm text-muted-foreground mb-4">
              你是第一次使用PAD设备吗？
            </p>

            <div className="space-y-2">
              <Card
                onClick={() => setIsFirstTime(true)}
                className={`p-4 cursor-pointer transition-all active:scale-[0.98] ${
                  isFirstTime === true
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🆕</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">是，第一次使用</p>
                    <p className="text-xs text-muted-foreground">强度将限制在L2以下，确保安全</p>
                  </div>
                </div>
              </Card>
              <Card
                onClick={() => setIsFirstTime(false)}
                className={`p-4 cursor-pointer transition-all active:scale-[0.98] ${
                  isFirstTime === false
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✅</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">不是，有使用经验</p>
                    <p className="text-xs text-muted-foreground">可根据评估推荐更高强度</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Step 7: 评估结果预览 */}
        {step === 7 && (
          <div>
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl font-bold text-primary">{getModeByLevel(level)}</span>
              </div>
              <h2 className="text-lg font-semibold">推荐模式</h2>
              <p className="text-sm text-muted-foreground">
                {level <= 3 ? "低压" : "高压"}{getModeByLevel(level)[1]}级
              </p>
            </div>

            <Card className="p-4 mb-4">
              <h3 className="font-medium text-sm mb-2">简要说明</h3>
              <p className="text-sm text-muted-foreground">
                {PAD_MODES[getModeByLevel(level)]?.userExplain}
              </p>
            </Card>

            <Card className="p-4 mb-4 bg-muted/50">
              <h3 className="font-medium text-sm mb-2">使用参数</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>压力：<span className="font-medium">{PAD_MODES[getModeByLevel(level)]?.pressure} mmHg</span></div>
                <div>时长：<span className="font-medium">{PAD_MODES[getModeByLevel(level)]?.application} 秒</span></div>
                <div>休息：<span className="font-medium">{PAD_MODES[getModeByLevel(level)]?.rest} 秒</span></div>
                <div>循环：<span className="font-medium">{PAD_MODES[getModeByLevel(level)]?.cycles} 次</span></div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-medium text-sm mb-2">使用建议</h3>
              <p className="text-sm text-muted-foreground">
                {PAD_MODES[getModeByLevel(level)]?.dailyAdvice}
              </p>
            </Card>

            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                评估依据：{stiffness === 0 ? "无僵硬" : stiffness === 1 ? "轻度僵硬" : "明显僵硬"} | 
                下蹲疼痛: {squatPain}分 | 
                体型: {BODY_TYPES.find(b => b.id === bodyType)?.label || "-"} | 
                {isFirstTime ? "首次使用" : "有使用经验"}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border flex gap-3">
        {step > 1 && (
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            className="flex-1 h-11 text-base"
          >
            上一步
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="flex-1 h-11 text-base font-medium"
        >
          {step === totalSteps ? "前往设备配置" : "下一步"}
        </Button>
      </div>

      {/* 红旗征警告弹窗 */}
      {showRedFlagAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="text-base font-semibold">评估终止</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              检测到红旗征，暂时不推荐使用PAD设备。建议先咨询专业医疗人员。
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRedFlagAlert(false)}
                className="flex-1 h-10"
              >
                返回修改
              </Button>
              <Button
                onClick={() => router.push("/home")}
                className="flex-1 h-10"
              >
                返回首页
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 疼痛警告弹窗 */}
      {showPainAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-xl">⚠️</span>
              </div>
              <h3 className="text-base font-semibold">疼痛较重提示</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              您的下蹲疼痛评分较高（{squatPain}分），建议从低强度开始，如有异常请停止使用并咨询医生。
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPainAlert(false)}
                className="flex-1 h-10"
              >
                返回修改
              </Button>
              <Button
                onClick={() => {
                  setShowPainAlert(false)
                  adjustLevelByPain(squatPain)
                  setStep(step + 1)
                }}
                className="flex-1 h-10"
              >
                我已了解
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
