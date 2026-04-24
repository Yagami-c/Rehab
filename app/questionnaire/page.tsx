"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"

// 改为选项式的身体部位
const BODY_REGIONS = [
  { id: "neck_shoulder", label: "颈肩部", description: "颈部、肩部" },
  { id: "upper_limb", label: "上肢", description: "肘、腕、手" },
  { id: "back_waist", label: "背腰部", description: "上背、下背、腰部" },
  { id: "hip", label: "髋部", description: "髋关节、骨盆" },
  { id: "knee", label: "膝关节", description: "膝盖、周围韧带" },
  { id: "lower_limb", label: "小腿足踝", description: "小腿、踝、足" },
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
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [painLevel, setPainLevel] = useState([5])
  const [description, setDescription] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showWarning, setShowWarning] = useState(false)

  const totalSteps = 4

  const toggleRegion = (regionId: string) => {
    setSelectedRegions((prev) =>
      prev.includes(regionId)
        ? prev.filter((id) => id !== regionId)
        : [...prev, regionId]
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
      localStorage.setItem("questionnaire", JSON.stringify({
        selectedRegions,
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
        return selectedRegions.length > 0
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
        <div className="flex items-center h-12 px-4">
          <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-base">病情采集</h1>
          <span className="text-sm text-muted-foreground">{step}/{totalSteps}</span>
        </div>
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </header>

      <main className="flex-1 p-4 pb-20 overflow-auto">
        {/* Step 1: Body Region Selection */}
        {step === 1 && (
          <div>
            <h2 className="text-base font-semibold mb-1">选择不适部位</h2>
            <p className="text-sm text-muted-foreground mb-4">
              请选择您感到不适的身体区域（可多选）
            </p>
            
            <div className="space-y-2">
              {BODY_REGIONS.map((region) => (
                <Card
                  key={region.id}
                  onClick={() => toggleRegion(region.id)}
                  className={`p-3.5 cursor-pointer transition-all active:scale-[0.98] ${
                    selectedRegions.includes(region.id)
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selectedRegions.includes(region.id)
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    }`}>
                      {selectedRegions.includes(region.id) && (
                        <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{region.label}</p>
                      <p className="text-xs text-muted-foreground">{region.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {selectedRegions.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">已选择 {selectedRegions.length} 个部位</p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Pain Assessment */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold mb-1">疼痛程度评估</h2>
              <p className="text-sm text-muted-foreground mb-4">
                请选择您目前的疼痛程度
              </p>
            </div>

            <Card className="p-4">
              <div className="text-center mb-5">
                <span className="text-4xl font-bold text-primary">{painLevel[0]}</span>
                <p className="text-sm text-muted-foreground mt-1">
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
                className="mb-3"
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 无痛</span>
                <span>5 中度</span>
                <span>10 剧痛</span>
              </div>
            </Card>

            <div>
              <h3 className="font-medium text-sm mb-2">症状描述（选填）</h3>
              <Textarea
                placeholder="请描述您的症状，如疼痛性质、发作时间等..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] bg-card text-base"
              />
            </div>
          </div>
        )}

        {/* Step 3: Medical History */}
        {step === 3 && (
          <div>
            <h2 className="text-base font-semibold mb-1">病史采集</h2>
            <p className="text-sm text-muted-foreground mb-4">
              请选择您的相关病史（可多选，无则跳过）
            </p>

            <div className="space-y-2">
              {MEDICAL_HISTORY.map((item) => (
                <Card
                  key={item.id}
                  onClick={() => toggleHistory(item.id)}
                  className={`p-3.5 cursor-pointer transition-colors active:scale-[0.98] ${
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
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Questionnaire */}
        {step === 4 && (
          <div>
            <h2 className="text-base font-semibold mb-1">症状量表</h2>
            <p className="text-sm text-muted-foreground mb-4">
              请根据实际情况选择最符合的选项
            </p>

            <div className="space-y-4">
              {QUESTIONNAIRE.map((q, index) => (
                <Card key={q.id} className="p-3.5">
                  <p className="font-medium text-sm mb-2.5">
                    {index + 1}. {q.question}
                  </p>
                  <div className="space-y-1.5">
                    {q.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => setAnswers({ ...answers, [q.id]: option })}
                        className={`w-full text-left p-2.5 rounded-lg text-sm transition-colors active:scale-[0.98] ${
                          answers[q.id] === option
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
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
          className="w-full h-11 text-base font-medium"
        >
          {step === totalSteps ? "提交并开始评估" : "下一步"}
        </Button>
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="text-base font-semibold">疼痛程度较高</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              您当前的疼痛程度较高（VAS {painLevel[0]}），建议先咨询专业医生，确认是否适合进行康复评估。
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowWarning(false)}
                className="flex-1 h-10"
              >
                返回修改
              </Button>
              <Button
                onClick={() => {
                  setShowWarning(false)
                  setStep(step + 1)
                }}
                className="flex-1 h-10"
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
