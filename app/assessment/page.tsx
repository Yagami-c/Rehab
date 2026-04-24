"use client"

import { useState, useEffect, useRef, Suspense, useCallback } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward,
  CheckCircle,
  AlertCircle,
  Maximize2,
  Minimize2,
  Activity,
  RotateCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const Knee3DModel = dynamic(() => import("@/components/knee-3d-model"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-800">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  ),
})

const EXERCISES = [
  { id: 1, name: "膝关节屈伸", description: "缓慢弯曲膝关节，再伸直", duration: 30, reps: 5, targetAngle: 90, type: "knee" },
  { id: 2, name: "膝关节外展", description: "保持膝关节弯曲，缓慢向外侧张开", duration: 30, reps: 5, targetAngle: 30, type: "knee" },
  { id: 3, name: "膝关节旋转", description: "保持膝关节弯曲90度，进行内外旋转", duration: 30, reps: 5, targetAngle: 15, type: "knee" },
]

interface KneeMetrics {
  flexion: number
  valgus: number
  rotation: number
  velocity: number
  stability: number
}

export default function AssessmentPage() {
  const router = useRouter()
  const [currentExercise, setCurrentExercise] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentRep, setCurrentRep] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [showComplete, setShowComplete] = useState(false)
  const [cameraPermission, setCameraPermission] = useState<"granted" | "denied" | "prompt">("prompt")
  const [show3DView, setShow3DView] = useState(true)
  const [is3DFullscreen, setIs3DFullscreen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const [kneeMetrics, setKneeMetrics] = useState<KneeMetrics>({
    flexion: 0, valgus: 0, rotation: 0, velocity: 0, stability: 85,
  })

  const exercise = EXERCISES[currentExercise]

  useEffect(() => {
    const requestCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } })
        if (videoRef.current) videoRef.current.srcObject = stream
        setCameraPermission("granted")
      } catch {
        setCameraPermission("denied")
      }
    }
    requestCamera()
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isPlaying) {
      interval = setInterval(() => {
        const time = Date.now() / 1000
        const baseFlexion = exercise.targetAngle * 0.8
        const newFlexion = Math.max(0, Math.min(140, baseFlexion + Math.sin(time * 2) * 20))
        const newValgus = Math.sin(time * 1.5) * 5
        const newRotation = Math.sin(time * 0.8) * 8
        const newVelocity = Math.abs(Math.cos(time * 2) * 45) + 10
        const newStability = Math.max(60, 85 - Math.abs(newValgus) - Math.abs(newRotation) / 2)

        setKneeMetrics({ flexion: newFlexion, valgus: newValgus, rotation: newRotation, velocity: newVelocity, stability: newStability })
        
        const angleError = Math.abs(newFlexion - exercise.targetAngle)
        const newScore = Math.max(0, Math.floor(100 - angleError * 0.5 - Math.abs(newValgus) * 2))
        setScore((prev) => Math.floor((prev * 0.7 + newScore * 0.3)))
        
        if (newFlexion < exercise.targetAngle - 20) setFeedback("请再弯曲一些")
        else if (newFlexion > exercise.targetAngle + 20) setFeedback("弯曲幅度过大")
        else if (Math.abs(newValgus) > 8) setFeedback("注意膝关节对位")
        else if (newVelocity > 50) setFeedback("动作太快")
        else setFeedback("动作标准")
        
        if (Math.random() > 0.92 && currentRep < exercise.reps) setCurrentRep((prev) => prev + 1)
      }, 150)
    }
    
    return () => clearInterval(interval)
  }, [isPlaying, exercise, currentRep])

  useEffect(() => {
    if (currentRep >= exercise.reps && isPlaying) {
      setIsPlaying(false)
      if (currentExercise < EXERCISES.length - 1) {
        setTimeout(() => {
          setCurrentExercise(currentExercise + 1)
          setCurrentRep(0)
          setScore(0)
        }, 1500)
      } else {
        setShowComplete(true)
      }
    }
  }, [currentRep, exercise.reps, currentExercise, isPlaying])

  const handleStart = useCallback(() => { setIsPlaying(true); setFeedback("开始检测...") }, [])
  const handlePause = useCallback(() => { setIsPlaying(false); setFeedback("") }, [])
  const handleRetry = useCallback(() => {
    setCurrentRep(0); setScore(0); setIsPlaying(false); setFeedback("")
    setKneeMetrics({ flexion: 0, valgus: 0, rotation: 0, velocity: 0, stability: 85 })
  }, [])

  const handleSkip = useCallback(() => {
    setIsPlaying(false)
    if (currentExercise < EXERCISES.length - 1) {
      setCurrentExercise(currentExercise + 1)
      setCurrentRep(0); setScore(0); setFeedback("")
    } else setShowComplete(true)
  }, [currentExercise])

  const handleComplete = useCallback(() => {
    localStorage.setItem("assessmentResult", JSON.stringify({
      exercises: EXERCISES.map((ex, i) => ({ ...ex, completed: i <= currentExercise, score: i === currentExercise ? score : 85 + Math.floor(Math.random() * 10) })),
      kneeMetrics: { maxFlexion: kneeMetrics.flexion, avgStability: kneeMetrics.stability, valgusRange: Math.abs(kneeMetrics.valgus) },
      totalScore: Math.floor((score + 85 + 90) / 3),
      completedAt: new Date().toISOString(),
    }))
    router.push("/report")
  }, [currentExercise, score, kneeMetrics, router])

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return "text-accent"
    if (value <= thresholds.warning) return "text-yellow-500"
    return "text-destructive"
  }

  if (cameraPermission === "denied") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center mb-3">
          <AlertCircle className="w-7 h-7 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold mb-2">需要摄像头权限</h2>
        <p className="text-sm text-muted-foreground text-center mb-4">动作评估需要摄像头来追踪您的动作</p>
        <Button onClick={() => router.back()} className="h-10">返回</Button>
      </div>
    )
  }

  if (is3DFullscreen) {
    return (
      <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
        <header className="bg-slate-800 border-b border-slate-700 shrink-0">
          <div className="flex items-center justify-between h-12 px-4">
            <h1 className="font-semibold text-white text-sm">膝关节三维模型</h1>
            <Button variant="ghost" size="icon" className="w-8 h-8 text-white" onClick={() => setIs3DFullscreen(false)}>
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>
        </header>
        <div className="flex-1 relative">
          <Suspense fallback={<div className="w-full h-full bg-slate-800" />}>
            <Knee3DModel flexionAngle={kneeMetrics.flexion} valgusAngle={kneeMetrics.valgus} rotationAngle={kneeMetrics.rotation} isAnimating={isPlaying} className="w-full h-full" />
          </Suspense>
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <Card className="bg-slate-800/95 backdrop-blur p-3 border-slate-700">
              <div className="grid grid-cols-4 gap-3 text-center">
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">屈曲角度</p>
                  <p className="text-lg font-bold text-primary">{kneeMetrics.flexion.toFixed(1)}°</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">外翻角度</p>
                  <p className={`text-lg font-bold ${getStatusColor(Math.abs(kneeMetrics.valgus), { good: 5, warning: 10 })}`}>{kneeMetrics.valgus.toFixed(1)}°</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">旋转角度</p>
                  <p className="text-lg font-bold text-white">{kneeMetrics.rotation.toFixed(1)}°</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">稳定性</p>
                  <p className={`text-lg font-bold ${getStatusColor(100 - kneeMetrics.stability, { good: 15, warning: 30 })}`}>{kneeMetrics.stability.toFixed(0)}%</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border shrink-0">
        <div className="flex items-center h-12 px-4">
          <button onClick={() => router.back()} className="p-2 -ml-2"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="flex-1 text-center font-semibold text-base">动作评估</h1>
          <span className="text-sm text-muted-foreground">{currentExercise + 1}/{EXERCISES.length}</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="relative aspect-[4/3] bg-slate-900">
          <video ref={videoRef} autoPlay playsInline muted className={`absolute inset-0 w-full h-full object-cover transition-opacity ${show3DView ? 'opacity-0' : 'opacity-100'}`} />
          
          {show3DView && (
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800">
              <Suspense fallback={<div className="w-full h-full" />}>
                <Knee3DModel flexionAngle={kneeMetrics.flexion} valgusAngle={kneeMetrics.valgus} rotationAngle={kneeMetrics.rotation} isAnimating={isPlaying} className="w-full h-full" />
              </Suspense>
            </div>
          )}
          
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2">
              <Card className="bg-card/90 backdrop-blur p-2 pointer-events-auto">
                <p className="text-[10px] text-muted-foreground">当前动作</p>
                <p className="font-semibold text-xs">{exercise.name}</p>
              </Card>
              
              <div className="flex gap-1.5 pointer-events-auto">
                <Button variant="secondary" size="icon" className="w-8 h-8 bg-card/90" onClick={() => setShow3DView(!show3DView)}>
                  <RotateCw className="w-4 h-4" />
                </Button>
                {show3DView && (
                  <Button variant="secondary" size="icon" className="w-8 h-8 bg-card/90" onClick={() => setIs3DFullscreen(true)}>
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <Card className="bg-card/90 backdrop-blur p-2">
                <p className="text-[10px] text-muted-foreground text-center">评分</p>
                <p className="text-xl font-bold text-primary text-center">{score}</p>
              </Card>
            </div>
            
            {isPlaying && (
              <div className="absolute left-2 top-14">
                <Card className="bg-card/90 backdrop-blur p-2 space-y-1.5 min-w-[80px]">
                  <div>
                    <p className="text-[9px] text-muted-foreground flex items-center gap-0.5"><Activity className="w-2.5 h-2.5" /> 屈曲</p>
                    <p className="text-base font-bold text-primary">{kneeMetrics.flexion.toFixed(1)}°</p>
                  </div>
                  <div className="border-t border-border pt-1.5">
                    <p className="text-[9px] text-muted-foreground">外翻</p>
                    <p className={`text-xs font-semibold ${getStatusColor(Math.abs(kneeMetrics.valgus), { good: 5, warning: 10 })}`}>{kneeMetrics.valgus.toFixed(1)}°</p>
                  </div>
                  <div className="border-t border-border pt-1.5">
                    <p className="text-[9px] text-muted-foreground">旋转</p>
                    <p className="text-xs font-semibold">{kneeMetrics.rotation.toFixed(1)}°</p>
                  </div>
                </Card>
              </div>
            )}

            {isPlaying && (
              <div className="absolute right-2 top-14">
                <Card className="bg-card/90 backdrop-blur p-2 min-w-[70px]">
                  <p className="text-[9px] text-muted-foreground text-center mb-1">稳定性</p>
                  <div className="relative w-12 h-12 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted" />
                      <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${kneeMetrics.stability * 1.26} 126`} className={kneeMetrics.stability > 80 ? "text-accent" : kneeMetrics.stability > 60 ? "text-yellow-500" : "text-destructive"} />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{kneeMetrics.stability.toFixed(0)}%</span>
                  </div>
                </Card>
              </div>
            )}
            
            {feedback && (
              <div className="absolute bottom-20 left-2 right-2">
                <Card className={`p-2 text-center ${feedback.includes("标准") ? "bg-accent/90 text-accent-foreground" : "bg-card/90"} backdrop-blur`}>
                  <span className="font-medium text-xs">{feedback}</span>
                </Card>
              </div>
            )}
            
            <div className="absolute bottom-10 left-2 right-2">
              <Card className="bg-card/90 backdrop-blur p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px]">完成进度</span>
                  <span className="text-[10px] font-medium">{currentRep}/{exercise.reps}</span>
                </div>
                <Progress value={(currentRep / exercise.reps) * 100} className="h-1" />
              </Card>
            </div>
          </div>
        </div>

        <div className="bg-card p-3 border-t border-border shrink-0">
          <p className="text-xs text-muted-foreground text-center mb-3">{exercise.description}</p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" size="icon" className="w-10 h-10 rounded-full" onClick={handleRetry}><RotateCcw className="w-4 h-4" /></Button>
            <Button size="icon" className="w-14 h-14 rounded-full" onClick={isPlaying ? handlePause : handleStart}>
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </Button>
            <Button variant="outline" size="icon" className="w-10 h-10 rounded-full" onClick={handleSkip}><SkipForward className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>

      {showComplete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-xs p-5 text-center">
            <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-7 h-7 text-accent" />
            </div>
            <h2 className="text-lg font-semibold mb-2">评估完成</h2>
            <p className="text-sm text-muted-foreground mb-4">已完成 {EXERCISES.length} 项动作评估</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-muted p-2 rounded-lg">
                <p className="text-xl font-bold text-primary">{score}</p>
                <p className="text-[10px] text-muted-foreground">综合评分</p>
              </div>
              <div className="bg-muted p-2 rounded-lg">
                <p className="text-xl font-bold text-accent">{kneeMetrics.stability.toFixed(0)}%</p>
                <p className="text-[10px] text-muted-foreground">稳定性</p>
              </div>
              <div className="bg-muted p-2 rounded-lg">
                <p className="text-xl font-bold">{kneeMetrics.flexion.toFixed(0)}°</p>
                <p className="text-[10px] text-muted-foreground">最大屈曲</p>
              </div>
            </div>
            <Button onClick={handleComplete} className="w-full h-10">查看详细报告</Button>
          </Card>
        </div>
      )}
    </div>
  )
}
