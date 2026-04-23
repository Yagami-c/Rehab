"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward,
  CheckCircle,
  AlertCircle,
  Volume2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const EXERCISES = [
  {
    id: 1,
    name: "颈部屈伸",
    description: "缓慢将头向前低下，再向后仰，保持流畅动作",
    duration: 30,
    reps: 5,
    targetAngle: 45,
  },
  {
    id: 2,
    name: "肩部外展",
    description: "双臂自然下垂，缓慢向两侧抬起至与肩平齐",
    duration: 30,
    reps: 5,
    targetAngle: 90,
  },
  {
    id: 3,
    name: "腰部旋转",
    description: "双脚与肩同宽站立，双手叉腰，缓慢左右旋转上身",
    duration: 30,
    reps: 5,
    targetAngle: 30,
  },
]

export default function AssessmentPage() {
  const router = useRouter()
  const [currentExercise, setCurrentExercise] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentRep, setCurrentRep] = useState(0)
  const [score, setScore] = useState(0)
  const [angle, setAngle] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [showComplete, setShowComplete] = useState(false)
  const [cameraPermission, setCameraPermission] = useState<"granted" | "denied" | "prompt">("prompt")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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
        // 模拟角度变化
        const newAngle = Math.floor(Math.random() * 20) + exercise.targetAngle - 10
        setAngle(newAngle)
        
        // 模拟评分
        const accuracy = Math.abs(newAngle - exercise.targetAngle) / exercise.targetAngle
        const newScore = Math.max(0, Math.floor((1 - accuracy) * 100))
        setScore((prev) => Math.floor((prev + newScore) / 2))
        
        // 生成反馈
        if (newAngle < exercise.targetAngle - 15) {
          setFeedback("请再抬高一些")
        } else if (newAngle > exercise.targetAngle + 15) {
          setFeedback("幅度稍微小一点")
        } else {
          setFeedback("动作标准，保持住")
        }
        
        // 模拟完成一个重复
        if (Math.random() > 0.8 && currentRep < exercise.reps) {
          setCurrentRep((prev) => prev + 1)
        }
      }, 500)
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
  }

  const handleSkip = () => {
    setIsPlaying(false)
    if (currentExercise < EXERCISES.length - 1) {
      setCurrentExercise(currentExercise + 1)
      setCurrentRep(0)
      setScore(0)
      setFeedback("")
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
      totalScore: Math.floor((score + 85 + 90) / 3),
      completedAt: new Date().toISOString(),
    }))
    router.push("/report")
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border">
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

      {/* Camera View */}
      <div className="relative aspect-[3/4] bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
        
        {/* Overlay UI */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top Info */}
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
            <Card className="bg-card/90 backdrop-blur p-3 pointer-events-auto">
              <p className="text-xs text-muted-foreground">当前动作</p>
              <p className="font-semibold">{exercise.name}</p>
            </Card>
            
            <Card className="bg-card/90 backdrop-blur p-3">
              <p className="text-xs text-muted-foreground text-center">实时评分</p>
              <p className="text-2xl font-bold text-primary text-center">{score}</p>
            </Card>
          </div>
          
          {/* Angle Display */}
          {isPlaying && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Card className="bg-card/90 backdrop-blur p-3 min-w-[80px]">
                <p className="text-xs text-muted-foreground">角度</p>
                <p className="text-xl font-bold">{angle}°</p>
                <p className="text-xs text-muted-foreground">目标 {exercise.targetAngle}°</p>
              </Card>
            </div>
          )}
          
          {/* Feedback */}
          {feedback && (
            <div className="absolute bottom-32 left-4 right-4">
              <Card className={`p-3 text-center ${
                feedback.includes("标准") 
                  ? "bg-accent/90 text-accent-foreground" 
                  : "bg-card/90"
              } backdrop-blur`}>
                <div className="flex items-center justify-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  <span className="font-medium">{feedback}</span>
                </div>
              </Card>
            </div>
          )}
          
          {/* Progress */}
          <div className="absolute bottom-20 left-4 right-4">
            <Card className="bg-card/90 backdrop-blur p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">完成进度</span>
                <span className="text-sm font-medium">{currentRep}/{exercise.reps}</span>
              </div>
              <Progress value={(currentRep / exercise.reps) * 100} className="h-2" />
            </Card>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="flex-1 bg-card p-4">
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
            <div className="bg-muted rounded-xl p-4 mb-6">
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
