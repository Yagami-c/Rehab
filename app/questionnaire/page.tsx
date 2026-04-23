"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"

const BODY_PARTS = [
  { id: "neck", label: "颈部", x: 50, y: 12 },
  { id: "shoulder_l", label: "左肩", x: 30, y: 18 },
  { id: "shoulder_r", label: "右肩", x: 70, y: 18 },
  { id: "upper_back", label: "上背", x: 50, y: 25 },
  { id: "lower_back", label: "下背/腰", x: 50, y: 38 },
  { id: "elbow_l", label: "左肘", x: 22, y: 35 },
  { id: "elbow_r", label: "右肘", x: 78, y: 35 },
  { id: "wrist_l", label: "左腕", x: 18, y: 48 },
  { id: "wrist_r", label: "右腕", x: 82, y: 48 },
  { id: "hip_l", label: "左髋", x: 38, y: 50 },
  { id: "hip_r", label: "右髋", x: 62, y: 50 },
  { id: "knee_l", label: "左膝", x: 38, y: 68 },
  { id: "knee_r", label: "右膝", x: 62, y: 68 },
  { id: "ankle_l", label: "左踝", x: 38, y: 88 },
  { id: "ankle_r", label: "右踝", x: 62, y: 88 },
]

const MEDICAL_HISTORY = [
  { id: "surgery", label: "既往手术史" },
  { id: "fracture", label: "骨折史" },
  { id: "chronic", label: "慢性疾病" },
  { id: "allergy", label: "药物过敏" },
  { id: "hereditary", label: "遗传病史" },
  { id: "cardiovascular", label: "心血管疾病" },
]

const QUESTIONNAIRE = [
  { id: "q1", question: "疼痛是否影响您的日常活动？", options: ["完全不影响", "轻微影响", "中度影响", "严重影响", "无法进行"] },
  { id: "q2", question: "疼痛持续多长时间了？", options: ["小于1周", "1-4周", "1-3个月", "3-6个月", "超过6个月"] },
  { id: "q3", question: "什么动作会加重疼痛？", options: ["弯腰", "站立", "行走", "坐立", "举重物"] },
  { id: "q4", question: "疼痛是否会放射到其他部位？", options: ["不会", "偶尔", "经常", "总是"] },
]

export default function QuestionnairePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedParts, setSelectedParts] = useState<string[]>([])
  const [painLevel, setPainLevel] = useState([5])
  const [description, setDescription] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showWarning, setShowWarning] = useState(false)

  const totalSteps = 4

  const togglePart = (partId: string) => {
    setSelectedParts((prev) =>
      prev.includes(partId)
        ? prev.filter((id) => id !== partId)
        : [...prev, partId]
    )
  }

  const toggleHistory = (historyId: string) => {
    setHistory((prev) =>
      prev.includes(historyId)
        ? prev.filter((id) => id !== historyId)
        : [...prev, historyId]
    )
  }

  const handleNext = () => {
    if (step === 2 && painLevel[0] >= 7) {
      setShowWarning(true)
      return
    }
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      // 保存数据并跳转
      localStorage.setItem("questionnaire", JSON.stringify({
        selectedParts,
        painLevel: painLevel[0],
        description,
        history,
        answers,
      }))
      router.push("/assessment")
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedParts.length > 0
      case 2:
        return true
      case 3:
        return true
      case 4:
        return Object.keys(answers).length === QUESTIONNAIRE.length
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-card z-10 border-b border-border">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-center font-semibold">病情采集</h1>
          <span className="text-sm text-muted-foreground">{step}/{totalSteps}</span>
        </div>
        {/* Progress Bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </header>

      <main className="flex-1 p-6 pb-24 overflow-auto">
        {/* Step 1: Body Part Selection */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">选择不适部位</h2>
            <p className="text-sm text-muted-foreground mb-6">
              请点击下方人体图，选择您感到不适的部位（可多选）
            </p>
            
            <div className="relative bg-card rounded-2xl p-6 border border-border">
              {/* Human Body Silhouette */}
              <svg viewBox="0 0 100 100" className="w-full max-w-xs mx-auto">
                {/* Body outline */}
                <ellipse cx="50" cy="8" rx="8" ry="8" fill="#E5E7EB" /> {/* Head */}
                <rect x="42" y="16" width="16" height="5" rx="2" fill="#E5E7EB" /> {/* Neck */}
                <path d="M30 21 L70 21 L75 45 L60 45 L60 52 L40 52 L40 45 L25 45 Z" fill="#E5E7EB" /> {/* Torso */}
                <path d="M25 45 L15 50 L18 52 L22 48 L25 45" fill="#E5E7EB" /> {/* Left arm */}
                <path d="M75 45 L85 50 L82 52 L78 48 L75 45" fill="#E5E7EB" /> {/* Right arm */}
                <rect x="38" y="52" width="10" height="40" rx="3" fill="#E5E7EB" /> {/* Left leg */}
                <rect x="52" y="52" width="10" height="40" rx="3" fill="#E5E7EB" /> {/* Right leg */}
              </svg>
              
              {/* Clickable points */}
              {BODY_PARTS.map((part) => (
                <button
                  key={part.id}
                  onClick={() => togglePart(part.id)}
                  className={`absolute w-6 h-6 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                    selectedParts.includes(part.id)
                      ? "bg-primary border-primary scale-110"
                      : "bg-white border-muted-foreground/30 hover:border-primary"
                  }`}
                  style={{ left: `${part.x}%`, top: `${part.y + 8}%` }}
                  title={part.label}
                />
              ))}
            </div>

            {/* Selected Parts */}
            {selectedParts.length > 0 && (
              <div className="mt-6">
                <p className="text-sm text-muted-foreground mb-2">已选择：</p>
                <div className="flex flex-wrap gap-2">
                  {selectedParts.map((partId) => {
                    const part = BODY_PARTS.find((p) => p.id === partId)
                    return (
                      <span
                        key={partId}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {part?.label}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Pain Assessment */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">疼痛程度评估</h2>
              <p className="text-sm text-muted-foreground mb-6">
                请滑动下方滑块，选择您目前的疼痛程度
              </p>
            </div>

            <Card className="p-6">
              <div className="text-center mb-6">
                <span className="text-5xl font-bold text-primary">{painLevel[0]}</span>
                <p className="text-sm text-muted-foreground mt-2">
                  {painLevel[0] <= 2 ? "轻微不适" : 
                   painLevel[0] <= 4 ? "轻度疼痛" :
                   painLevel[0] <= 6 ? "中度疼痛" :
                   painLevel[0] <= 8 ? "严重疼痛" : "剧烈疼痛"}
                </p>
              </div>
              
              <Slider
                value={painLevel}
                onValueChange={setPainLevel}
                min={0}
                max={10}
                step={1}
                className="mb-4"
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 无痛</span>
                <span>5 中度</span>
                <span>10 剧痛</span>
              </div>
            </Card>

            <div>
              <h3 className="font-medium mb-3">症状描述（选填）</h3>
              <Textarea
                placeholder="请描述您的症状，如疼痛性质、发作时间等..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px] bg-card"
              />
            </div>
          </div>
        )}

        {/* Step 3: Medical History */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">病史采集</h2>
            <p className="text-sm text-muted-foreground mb-6">
              请选择您的相关病史（可多选）
            </p>

            <div className="space-y-3">
              {MEDICAL_HISTORY.map((item) => (
                <Card
                  key={item.id}
                  onClick={() => toggleHistory(item.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    history.includes(item.id)
                      ? "border-primary bg-primary/5"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={history.includes(item.id)}
                      onCheckedChange={() => toggleHistory(item.id)}
                    />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Questionnaire */}
        {step === 4 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">症状量表</h2>
            <p className="text-sm text-muted-foreground mb-6">
              请根据您的实际情况选择最符合的选项
            </p>

            <div className="space-y-6">
              {QUESTIONNAIRE.map((q, index) => (
                <Card key={q.id} className="p-4">
                  <p className="font-medium mb-3">
                    {index + 1}. {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => setAnswers({ ...answers, [q.id]: option })}
                        className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                          answers[q.id] === option
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="w-full h-12 text-base font-medium"
        >
          {step === totalSteps ? "提交并开始评估" : "下一步"}
        </Button>
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <Card className="w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold">疼痛程度较高</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              您当前的疼痛程度较高（VAS {painLevel[0]}），建议您先咨询专业医生，确认是否适合进行康复评估。
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowWarning(false)}
                className="flex-1"
              >
                返回修改
              </Button>
              <Button
                onClick={() => {
                  setShowWarning(false)
                  setStep(step + 1)
                }}
                className="flex-1"
              >
                继续评估
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
