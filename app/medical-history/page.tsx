"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const GENETIC_CONDITIONS = [
  { id: "none", label: "无" },
  { id: "hypertension", label: "高血压相关遗传" },
  { id: "diabetes", label: "糖尿病相关遗传" },
  { id: "heart_disease", label: "心脏病/冠心病" },
  { id: "stroke_family", label: "脑卒中家族史" },
  { id: "cancer_family", label: "癌症家族史" },
  { id: "ankylosing", label: "强直性脊柱炎" },
  { id: "hemophilia", label: "血友病" },
  { id: "thalassemia", label: "地中海贫血" },
  { id: "other_genetic", label: "其他遗传性疾病" },
]

const MEDICAL_HISTORY = [
  { id: "none", label: "无" },
  { id: "fracture", label: "骨折/骨裂" },
  { id: "dislocation", label: "关节脱位/半脱位" },
  { id: "arthroscopy", label: "关节镜手术" },
  { id: "joint_replacement", label: "关节置换术" },
  { id: "disc_herniation", label: "椎间盘突出/腰椎手术" },
  { id: "stroke", label: "脑卒中（中风）" },
  { id: "heart_surgery", label: "心肌梗死/心脏手术" },
  { id: "chronic_pain", label: "慢性疼痛综合征" },
  { id: "sports_injury", label: "运动损伤手术史" },
  { id: "other_history", label: "其他" },
]

export default function MedicalHistoryPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [geneticConditions, setGeneticConditions] = useState<string[]>([])
  const [medicalHistory, setMedicalHistory] = useState<string[]>([])
  const [otherGenetic, setOtherGenetic] = useState("")
  const [otherHistory, setOtherHistory] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("medicalHistory")
    if (saved) {
      const data = JSON.parse(saved)
      setGeneticConditions(data.geneticConditions || [])
      setMedicalHistory(data.medicalHistory || [])
      setOtherGenetic(data.otherGenetic || "")
      setOtherHistory(data.otherHistory || "")
    }
    setIsLoaded(true)
  }, [])

  const toggleCondition = (id: string, type: "genetic" | "history") => {
    if (type === "genetic") {
      if (id === "none") {
        setGeneticConditions(["none"])
      } else {
        setGeneticConditions((prev) => {
          const filtered = prev.filter((c) => c !== "none")
          return filtered.includes(id)
            ? filtered.filter((c) => c !== id)
            : [...filtered, id]
        })
      }
    } else {
      if (id === "none") {
        setMedicalHistory(["none"])
      } else {
        setMedicalHistory((prev) => {
          const filtered = prev.filter((c) => c !== "none")
          return filtered.includes(id)
            ? filtered.filter((c) => c !== id)
            : [...filtered, id]
        })
      }
    }
  }

  const handleSubmit = () => {
    localStorage.setItem("medicalHistory", JSON.stringify({
      geneticConditions,
      medicalHistory,
      otherGenetic,
      otherHistory,
    }))
    localStorage.setItem("medicalHistoryCompleted", "true")
    router.push("/home")
  }

  const canProceed = step === 1 
    ? geneticConditions.length > 0 
    : medicalHistory.length > 0

  if (!isLoaded) {
    return <div className="min-h-screen bg-background" />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-card z-10 border-b border-border">
        <div className="flex items-center h-12 px-4">
          <button 
            onClick={() => step === 1 ? router.back() : setStep(1)} 
            className="p-2 -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-base">
            病史填写 ({step}/2)
          </h1>
          <button 
            onClick={() => router.push("/home")}
            className="text-sm text-muted-foreground"
          >
            跳过
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>
      </header>

      <main className="p-4 pb-24">
        {step === 1 ? (
          <>
            {/* Genetic Conditions */}
            <div className="mb-4">
              <h2 className="text-xl font-bold text-foreground mb-2">
                遗传病史
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                请选择您的家族遗传病史（可多选）
              </p>
            </div>

            <div className="space-y-2">
              {GENETIC_CONDITIONS.map((condition) => (
                <button
                  key={condition.id}
                  onClick={() => toggleCondition(condition.id, "genetic")}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    geneticConditions.includes(condition.id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{condition.label}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      geneticConditions.includes(condition.id)
                        ? "border-primary-foreground bg-primary-foreground"
                        : "border-muted-foreground"
                    }`}>
                      {geneticConditions.includes(condition.id) && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {geneticConditions.includes("other_genetic") && (
              <div className="mt-4">
                <Input
                  placeholder="请填写其他遗传性疾病"
                  value={otherGenetic}
                  onChange={(e) => setOtherGenetic(e.target.value)}
                  className="h-12"
                />
              </div>
            )}
          </>
        ) : (
          <>
            {/* Medical History */}
            <div className="mb-4">
              <h2 className="text-xl font-bold text-foreground mb-2">
                既往病史
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                请选择您的既往病史，这将帮助我们制定更安全的康复方案（可多选）
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                如有手术史或严重疾病，建议在专业医师指导下进行康复训练
              </p>
            </div>

            <div className="space-y-2">
              {MEDICAL_HISTORY.map((history) => (
                <button
                  key={history.id}
                  onClick={() => toggleCondition(history.id, "history")}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    medicalHistory.includes(history.id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{history.label}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      medicalHistory.includes(history.id)
                        ? "border-primary-foreground bg-primary-foreground"
                        : "border-muted-foreground"
                    }`}>
                      {medicalHistory.includes(history.id) && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {medicalHistory.includes("other_history") && (
              <div className="mt-4">
                <Input
                  placeholder="请填写其他病史"
                  value={otherHistory}
                  onChange={(e) => setOtherHistory(e.target.value)}
                  className="h-12"
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
        <Button
          onClick={() => step === 1 ? setStep(2) : handleSubmit()}
          disabled={!canProceed}
          className="w-full h-12 text-base font-medium"
        >
          {step === 1 ? "下一步" : "完成"}
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  )
}
