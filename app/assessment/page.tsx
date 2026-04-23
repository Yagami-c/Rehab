"use client"

import { useState, useEffect, useRef, Suspense } from "react"
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
  Volume2,
  Maximize2,
  Minimize2,
  Activity,
  TrendingUp,
  RotateCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

// 动态加载 3D 组件以避免 SSR 问题
const Knee3DModel = dynamic(() => import("@/components/knee-3d-model"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded-xl">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">加载3D模型...</p>
      </div>
    </div>
  ),
})

const EXERCISES = [
  {
    id: 1,
    name: "膝关节屈伸",
    description: "缓慢弯曲膝关节，再伸直，保持流畅动作",
    duration: 30,
    reps: 5,
    targetAngle: 90,
    type: "knee",
  },
  {
    id: 2,
    name: "膝关节外展",
    description: "保持膝关节弯曲，缓慢向外侧张开",
    duration: 30,
    reps: 5,
    targetAngle: 30,
    type: "knee",
  },
  {
    id: 3,
    name: "膝关节旋转",
    description: "保持膝关节弯曲90度，缓慢进行内外旋转",
    duration: 30,
    reps: 5,
    targetAngle: 15,
    type: "knee",
  },
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
  
  // 膝关节实时数据
  const [kneeMetrics, setKneeMetrics] = useState<KneeMetrics>({
    flexion: 0,
    valgus: 0,
    rotation: 0,
    velocity: 0,
    stability: 85,
  })

  // 历史数据用于趋势显示
  const [metricsHistory, setMetricsHistory] = useState<number[]>([])

  const exercise = EXERCISES[currentExercise]

  useEffect(() => {
    // 请求摄像头权限
    const requestCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setCameraPermission("granted")
      } catch {
        setCameraPermission("denied")
      }
    }
    requestCamera()

    return () => {
      // 清理摄像头
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isPlaying) {
      interval = setInterval(() => {
        // 模拟膝关节运动数据
        const time = Date.now() / 1000
        const baseFlexion = exercise.targetAngle * 0.8
        const flexionVariation = Math.sin(time * 2) * 20
        const newFlexion = Math.max(0, Math.min(140, baseFlexion + flexionVariation))
        
        const newValgus = Math.sin(time * 1.5) * 5 + (Math.random() - 0.5) * 2
        const newRotation = Math.sin(time * 0.8) * 8 + (Math.random() - 0.5) * 3
        const newVelocity = Math.abs(Math.cos(time * 2) * 45) + 10
        
        // 计算稳定性分数
        const stabilityBase = 85
        const stabilityNoise = Math.abs(newValgus) + Math.abs(newRotation) / 2
        const newStability = Math.max(60, stabilityBase - stabilityNoise + (Math.random() - 0.5) * 5)

        setKneeMetrics({
          flexion: newFlexion,
          valgus: newValgus,
          rotation: newRotation,
          velocity: newVelocity,
          stability: newStability,
        })

        // 更新历史数据
        setMetricsHistory(prev => {
          const newHistory = [...prev, newFlexion]
          if (newHistory.length > 20) newHistory.shift()
          return newHistory
        })
        
        // 模拟评分
        const angleError = Math.abs(newFlexion - exercise.targetAngle)
        const newScore = Math.max(0, Math.floor(100 - angleError * 0.5 - Math.abs(newValgus) * 2))
        setScore((prev) => Math.floor((prev * 0.7 + newScore * 0.3)))
        
        // 生成智能反馈
        if (newFlexion < exercise.targetAngle - 20) {
          setFeedback("请再弯曲一些膝关节")
        } else if (newFlexion > exercise.targetAngle + 20) {
          setFeedback("弯曲幅度过大，请稍微伸直")
        } else if (Math.abs(newValgus) > 8) {
          setFeedback("注意膝关节对位，避免内/外翻")
        } else if (newVelocity > 50) {
          setFeedback("动作太快，请放慢速度")
        } else {
          setFeedback("动作标准，保持住")
        }
        
        // 模拟完成一个重复
        if (Math.random() > 0.9 && currentRep < exercise.reps) {
          setCurrentRep((prev) => prev + 1)
        }
      }, 100)
    }
    
    return () => clearInterval(interval)
  }, [isPlaying, exercise, currentRep])

  useEffect(() => {
    // 当完成所有重复次数时
    if (currentRep >= exercise.reps && isPlaying) {
      setIsPlaying(false)
      
      if (currentExercise < EXERCISES.length - 1) {
        // 还有下一个动作
        setTimeout(() => {
          setCurrentExercise(currentExercise + 1)
          setCurrentRep(0)
          setScore(0)
          setMetricsHistory([])
        }, 1500)
      } else {
        // 所有动作完成
        setShowComplete(true)
      }
    }
  }, [currentRep, exercise.reps, currentExercise, isPlaying])

  const handleStart = () => {
    setIsPlaying(true)
    setFeedback("开始检测...")
  }

  const handlePause = () => {
    setIsPlaying(false)
    setFeedback("")
  }

  const handleRetry = () => {
    setCurrentRep(0)
    setScore(0)
    setIsPlaying(false)
    setFeedback("")
    setMetricsHistory([])
    setKneeMetrics({
      flexion: 0,
      valgus: 0,
      rotation: 0,
      velocity: 0,
      stability: 85,
    })
  }

  const handleSkip = () => {
    setIsPlaying(false)
    if (currentExercise < EXERCISES.length - 1) {
      setCurrentExercise(currentExercise + 1)
      setCurrentRep(0)
      setScore(0)
      setFeedback("")
      setMetricsHistory([])
    } else {
      setShowComplete(true)
    }
  }

  const handleComplete = () => {
    // 保存评估结果
    localStorage.setItem("assessmentResult", JSON.stringify({
      exercises: EXERCISES.map((ex, i) => ({
        ...ex,
        completed: i <= currentExercise,
        score: i === currentExercise ? score : 85 + Math.floor(Math.random() * 10),
      })),
      kneeMetrics: {
        maxFlexion: Math.max(...metricsHistory, kneeMetrics.flexion),
        avgStability: kneeMetrics.stability,
        valgusRange: Math.abs(kneeMetrics.valgus),
      },
      totalScore: Math.floor((score + 85 + 90) / 3),
      completedAt: new Date().toISOString(),
    }))
    router.push("/report")
  }

  // 获取状态颜色
  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return "text-accent"
    if (value <= thresholds.warning) return "text-yellow-500"
    return "text-destructive"
  }

  if (cameraPermission === "denied") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold mb-2">需要摄像头权限</h2>
        <p className="text-muted-foreground text-center mb-6">
          动作评估需要使用摄像头来追踪您的动作，请在设置中允许摄像头访问。
        </p>
        <Button onClick={() => router.back()}>返回</Button>
      </div>
    )
  }

  // 3D 全屏视图
  if (is3DFullscreen) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <header className="bg-card border-b border-border shrink-0">
          <div className="flex items-center justify-between h-14 px-4">
            <h1 className="font-semibold">膝关节三维模型</h1>
            <Button variant="ghost" size="icon" onClick={() => setIs3DFullscreen(false)}>
              <Minimize2 className="w-5 h-5" />
            </Button>
          </div>
        </header>
        
        <div className="flex-1 relative">
          <Suspense fallback={<div className="w-full h-full bg-muted" />}>
            <Knee3DModel
              flexionAngle={kneeMetrics.flexion}
              valgusAngle={kneeMetrics.valgus}
              rotationAngle={kneeMetrics.rotation}
              isAnimating={isPlaying}
              className="w-full h-full"
            />
          </Suspense>
          
          {/* 全屏模式下的数据面板 */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <Card className="bg-card/95 backdrop-blur p-4">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">屈曲角度</p>
                  <p className="text-xl font-bold text-primary">{kneeMetrics.flexion.toFixed(1)}°</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">外翻角度</p>
                  <p className={`text-xl font-bold ${getStatusColor(Math.abs(kneeMetrics.valgus), { good: 5, warning: 10 })}`}>
                    {kneeMetrics.valgus.toFixed(1)}°
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">旋转角度</p>
                  <p className="text-xl font-bold">{kneeMetrics.rotation.toFixed(1)}°</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">稳定性</p>
                  <p className={`text-xl font-bold ${getStatusColor(100 - kneeMetrics.stability, { good: 15, warning: 30 })}`}>
                    {kneeMetrics.stability.toFixed(0)}%
                  </p>
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
      {/* Header */}
      <header className="bg-card border-b border-border shrink-0">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-center font-semibold">动作评估</h1>
          <span className="text-sm text-muted-foreground">
            {currentExercise + 1}/{EXERCISES.length}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Camera / 3D View Toggle */}
        <div className="relative aspect-square bg-black">
          {/* Camera View */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover transition-opacity ${show3DView ? 'opacity-0' : 'opacity-100'}`}
          />
          
          {/* 3D Knee Model */}
          {show3DView && (
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800">
              <Suspense fallback={<div className="w-full h-full bg-muted" />}>
                <Knee3DModel
                  flexionAngle={kneeMetrics.flexion}
                  valgusAngle={kneeMetrics.valgus}
                  rotationAngle={kneeMetrics.rotation}
                  isAnimating={isPlaying}
                  className="w-full h-full"
                />
              </Suspense>
            </div>
          )}
          
          {/* Overlay UI */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Top Info */}
            <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
              <Card className="bg-card/90 backdrop-blur p-2.5 pointer-events-auto">
                <p className="text-[10px] text-muted-foreground">当前动作</p>
                <p className="font-semibold text-sm">{exercise.name}</p>
              </Card>
              
              <div className="flex gap-2 pointer-events-auto">
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="w-9 h-9 bg-card/90 backdrop-blur"
                  onClick={() => setShow3DView(!show3DView)}
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
                {show3DView && (
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="w-9 h-9 bg-card/90 backdrop-blur"
                    onClick={() => setIs3DFullscreen(true)}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <Card className="bg-card/90 backdrop-blur p-2.5">
                <p className="text-[10px] text-muted-foreground text-center">实时评分</p>
                <p className="text-2xl font-bold text-primary text-center">{score}</p>
              </Card>
            </div>
            
            {/* Realtime Metrics Panel */}
            {isPlaying && (
              <div className="absolute left-3 top-20">
                <Card className="bg-card/90 backdrop-blur p-3 space-y-2 min-w-[100px]">
                  <div>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Activity className="w-3 h-3" /> 屈曲
                    </p>
                    <p className="text-lg font-bold text-primary">{kneeMetrics.flexion.toFixed(1)}°</p>
                    <p className="text-[10px] text-muted-foreground">目标 {exercise.targetAngle}°</p>
                  </div>
                  <div className="border-t border-border pt-2">
                    <p className="text-[10px] text-muted-foreground">外翻</p>
                    <p className={`text-sm font-semibold ${getStatusColor(Math.abs(kneeMetrics.valgus), { good: 5, warning: 10 })}`}>
                      {kneeMetrics.valgus.toFixed(1)}°
                    </p>
                  </div>
                  <div className="border-t border-border pt-2">
                    <p className="text-[10px] text-muted-foreground">旋转</p>
                    <p className="text-sm font-semibold">{kneeMetrics.rotation.toFixed(1)}°</p>
                  </div>
                  <div className="border-t border-border pt-2">
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> 速度
                    </p>
                    <p className={`text-sm font-semibold ${getStatusColor(kneeMetrics.velocity, { good: 40, warning: 55 })}`}>
                      {kneeMetrics.velocity.toFixed(0)}°/s
                    </p>
                  </div>
                </Card>
              </div>
            )}

            {/* Stability Indicator */}
            {isPlaying && (
              <div className="absolute right-3 top-20">
                <Card className="bg-card/90 backdrop-blur p-3 min-w-[90px]">
                  <p className="text-[10px] text-muted-foreground text-center mb-1">稳定性</p>
                  <div className="relative w-16 h-16 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-muted"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${kneeMetrics.stability * 1.76} 176`}
                        className={kneeMetrics.stability > 80 ? "text-accent" : kneeMetrics.stability > 60 ? "text-yellow-500" : "text-destructive"}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                      {kneeMetrics.stability.toFixed(0)}%
                    </span>
                  </div>
                </Card>
              </div>
            )}
            
            {/* Feedback */}
            {feedback && (
              <div className="absolute bottom-28 left-3 right-3">
                <Card className={`p-2.5 text-center ${
                  feedback.includes("标准") 
                    ? "bg-accent/90 text-accent-foreground" 
                    : "bg-card/90"
                } backdrop-blur`}>
                  <div className="flex items-center justify-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    <span className="font-medium text-sm">{feedback}</span>
                  </div>
                </Card>
              </div>
            )}
            
            {/* Progress */}
            <div className="absolute bottom-16 left-3 right-3">
              <Card className="bg-card/90 backdrop-blur p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs">完成进度</span>
                  <span className="text-xs font-medium">{currentRep}/{exercise.reps}</span>
                </div>
                <Progress value={(currentRep / exercise.reps) * 100} className="h-1.5" />
              </Card>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-card p-4 border-t border-border shrink-0">
          <p className="text-sm text-muted-foreground text-center mb-4">
            {exercise.description}
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full"
              onClick={handleRetry}
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            
            <Button
              size="icon"
              className="w-16 h-16 rounded-full"
              onClick={isPlaying ? handlePause : handleStart}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full"
              onClick={handleSkip}
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Complete Modal */}
      {showComplete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <Card className="w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-xl font-semibold mb-2">评估完成</h2>
            <p className="text-muted-foreground mb-6">
              您已完成所有动作评估，系统正在为您生成诊断报告。
            </p>
            
            {/* 膝关节评估摘要 */}
            <div className="bg-muted rounded-xl p-4 mb-4 text-left">
              <p className="text-sm font-medium mb-3">膝关节评估摘要</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">最大屈曲角度</span>
                  <span className="font-medium">{Math.max(...metricsHistory, kneeMetrics.flexion).toFixed(1)}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">平均稳定性</span>
                  <span className="font-medium text-accent">{kneeMetrics.stability.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">外翻范围</span>
                  <span className="font-medium">±{Math.abs(kneeMetrics.valgus).toFixed(1)}°</span>
                </div>
              </div>
            </div>
            
            <div className="bg-primary/10 rounded-xl p-4 mb-6">
              <p className="text-sm text-muted-foreground">综合评分</p>
              <p className="text-4xl font-bold text-primary">{Math.floor((score + 85 + 90) / 3)}</p>
            </div>
            <Button onClick={handleComplete} className="w-full h-12">
              查看报告
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}
