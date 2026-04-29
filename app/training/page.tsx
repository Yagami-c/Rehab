"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Play, 
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Camera,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Timer,
  Target,
  Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Exercise {
  id: number
  name: string
  duration: number
  reps: number
  description: string
  keyPoints: string[]
  targetAngles: {
    hip?: { min: number; max: number }
    knee?: { min: number; max: number }
    ankle?: { min: number; max: number }
  }
}

const EXERCISES: Exercise[] = [
  {
    id: 1,
    name: "站立位膝屈伸",
    duration: 30,
    reps: 10,
    description: "站立扶稳，缓慢弯曲膝盖后伸直",
    keyPoints: ["背部挺直", "膝盖对准脚尖", "动作缓慢均匀"],
    targetAngles: { knee: { min: 0, max: 90 } }
  },
  {
    id: 2,
    name: "坐位伸膝",
    duration: 30,
    reps: 10,
    description: "坐姿，缓慢伸直膝盖并保持",
    keyPoints: ["大腿贴紧椅面", "脚尖向上勾", "伸直后保持2秒"],
    targetAngles: { knee: { min: 0, max: 15 } }
  },
  {
    id: 3,
    name: "靠墙静蹲",
    duration: 30,
    reps: 3,
    description: "背靠墙壁，缓慢下蹲至大腿与地面平行",
    keyPoints: ["膝盖不超过脚尖", "保持呼吸均匀", "感到酸胀即可"],
    targetAngles: { knee: { min: 60, max: 90 }, hip: { min: 60, max: 90 } }
  },
  {
    id: 4,
    name: "直腿抬高",
    duration: 30,
    reps: 10,
    description: "仰卧，伸直腿缓慢抬起30-45度",
    keyPoints: ["膝盖伸直", "抬起后保持2秒", "缓慢放下"],
    targetAngles: { hip: { min: 30, max: 45 }, knee: { min: 0, max: 10 } }
  },
]

type TrainingState = "ready" | "countdown" | "training" | "rest" | "complete"

export default function TrainingPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [currentExercise, setCurrentExercise] = useState(0)
  const [state, setState] = useState<TrainingState>("ready")
  const [countdown, setCountdown] = useState(3)
  const [timeLeft, setTimeLeft] = useState(30)
  const [repsCount, setRepsCount] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  
  // 实时评估数据
  const [currentAngle, setCurrentAngle] = useState(0)
  const [feedback, setFeedback] = useState<{ type: "good" | "warning" | "error"; message: string } | null>(null)
  const [score, setScore] = useState(100)
  const [repQuality, setRepQuality] = useState<("good" | "fair" | "poor")[]>([])

  const exercise = EXERCISES[currentExercise]

  // 模拟摄像头开启
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: 640, height: 480 } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
      }
    } catch {
      console.log("[v0] Camera access denied or not available")
      setCameraActive(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }, [])

  // 模拟实时姿态评估
  useEffect(() => {
    if (state !== "training" || !cameraActive) return

    const interval = setInterval(() => {
      // 模拟角度变化
      const targetRange = exercise.targetAngles.knee || { min: 0, max: 90 }
      const randomAngle = Math.random() * 120
      setCurrentAngle(Math.round(randomAngle))

      // 评估动作质量
      if (randomAngle >= targetRange.min && randomAngle <= targetRange.max) {
        setFeedback({ type: "good", message: "动作标准，保持住！" })
        setScore(prev => Math.min(100, prev + 1))
      } else if (randomAngle < targetRange.min - 15 || randomAngle > targetRange.max + 15) {
        setFeedback({ type: "error", message: randomAngle < targetRange.min ? "弯曲幅度不够" : "弯曲幅度过大" })
        setScore(prev => Math.max(0, prev - 2))
      } else {
        setFeedback({ type: "warning", message: "接近目标，再调整一下" })
      }

      // 模拟完成一次动作
      if (Math.random() > 0.9 && repsCount < exercise.reps) {
        setRepsCount(prev => prev + 1)
        const quality = score > 80 ? "good" : score > 60 ? "fair" : "poor"
        setRepQuality(prev => [...prev, quality])
      }
    }, 500)

    return () => clearInterval(interval)
  }, [state, cameraActive, exercise, repsCount, score])

  // 倒计时逻辑
  useEffect(() => {
    if (state !== "countdown") return

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setState("training")
      setTimeLeft(exercise.duration)
    }
  }, [state, countdown, exercise.duration])

  // 训练计时
  useEffect(() => {
    if (state !== "training") return

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      // 检查是否还有下一个动作
      if (currentExercise < EXERCISES.length - 1) {
        setState("rest")
        setTimeLeft(10) // 休息时间
      } else {
        setState("complete")
        stopCamera()
      }
    }
  }, [state, timeLeft, currentExercise, stopCamera])

  // 休息计时
  useEffect(() => {
    if (state !== "rest") return

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCurrentExercise(prev => prev + 1)
      setRepsCount(0)
      setRepQuality([])
      setScore(100)
      setState("countdown")
      setCountdown(3)
    }
  }, [state, timeLeft])

  const handleStart = () => {
    startCamera()
    setState("countdown")
    setCountdown(3)
  }

  const handlePause = () => {
    setState("ready")
  }

  const handleReset = () => {
    setState("ready")
    setCurrentExercise(0)
    setRepsCount(0)
    setRepQuality([])
    setScore(100)
    setTimeLeft(30)
    setFeedback(null)
    stopCamera()
  }

  const getScoreColor = () => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between h-12 px-4 bg-[#0a1628]/80 backdrop-blur-sm">
        <button onClick={() => { stopCamera(); router.back() }} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold text-base">康复训练</h1>
        <button onClick={() => setIsMuted(!isMuted)} className="p-2 -mr-2">
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </header>

      {/* Exercise Info Bar */}
      <div className="px-4 py-2 bg-[#1a2d4a]">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">动作 {currentExercise + 1}/{EXERCISES.length}</span>
          <span className="font-medium">{exercise.name}</span>
          <span className="text-white/60">{exercise.reps} 次</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 relative">
        {/* Camera View */}
        <div className="relative h-[45vh] bg-[#0d1f38] overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
          />

          {/* Camera Placeholder */}
          {!cameraActive && state === "ready" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center mb-4">
                <Camera className="w-10 h-10 text-white/50" />
              </div>
              <p className="text-white/60 text-sm">点击开始训练开启摄像头</p>
            </div>
          )}

          {/* Countdown Overlay */}
          {state === "countdown" && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="text-center">
                <div className="text-8xl font-bold text-white mb-4">{countdown}</div>
                <p className="text-white/80 text-lg">准备开始</p>
              </div>
            </div>
          )}

          {/* Rest Overlay */}
          {state === "rest" && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="text-center">
                <p className="text-white/80 text-lg mb-2">休息一下</p>
                <div className="text-6xl font-bold text-white mb-4">{timeLeft}s</div>
                <p className="text-white/60 text-sm">下一个: {EXERCISES[currentExercise + 1]?.name}</p>
              </div>
            </div>
          )}

          {/* Real-time Feedback Overlay */}
          {state === "training" && feedback && (
            <div className={`absolute top-4 left-4 right-4 p-3 rounded-xl backdrop-blur-sm ${
              feedback.type === "good" ? "bg-green-500/20 border border-green-500/50" :
              feedback.type === "warning" ? "bg-yellow-500/20 border border-yellow-500/50" :
              "bg-red-500/20 border border-red-500/50"
            }`}>
              <div className="flex items-center gap-2">
                {feedback.type === "good" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className={`w-5 h-5 ${feedback.type === "warning" ? "text-yellow-400" : "text-red-400"}`} />
                )}
                <span className="text-sm font-medium">{feedback.message}</span>
              </div>
            </div>
          )}

          {/* Angle Display */}
          {state === "training" && cameraActive && (
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
              <p className="text-xs text-white/60 mb-1">膝关节角度</p>
              <p className="text-2xl font-bold">{currentAngle}°</p>
            </div>
          )}

          {/* Score Display */}
          {state === "training" && (
            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
              <p className="text-xs text-white/60 mb-1">动作评分</p>
              <p className={`text-2xl font-bold ${getScoreColor()}`}>{score}</p>
            </div>
          )}
        </div>

        {/* Training Controls */}
        <div className="p-4 space-y-4">
          {/* Timer and Reps */}
          {(state === "training" || state === "countdown") && (
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="flex items-center gap-1 text-white/60 text-xs mb-1">
                  <Timer className="w-3 h-3" />
                  <span>剩余时间</span>
                </div>
                <span className="text-3xl font-bold">{timeLeft}s</span>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="text-center">
                <div className="flex items-center gap-1 text-white/60 text-xs mb-1">
                  <Target className="w-3 h-3" />
                  <span>完成次数</span>
                </div>
                <span className="text-3xl font-bold">{repsCount}/{exercise.reps}</span>
              </div>
            </div>
          )}

          {/* Rep Quality Indicators */}
          {repQuality.length > 0 && (
            <div className="flex items-center justify-center gap-1.5">
              {repQuality.map((quality, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    quality === "good" ? "bg-green-500" :
                    quality === "fair" ? "bg-yellow-500" : "bg-red-500"
                  }`}
                />
              ))}
              {Array.from({ length: exercise.reps - repQuality.length }).map((_, i) => (
                <div key={`empty-${i}`} className="w-3 h-3 rounded-full bg-white/20" />
              ))}
            </div>
          )}

          {/* Key Points */}
          {state === "ready" && (
            <Card className="p-4 bg-[#1a2d4a] border-0">
              <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                动作要点
              </h3>
              <ul className="space-y-2">
                {exercise.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    {point}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Exercise List (Ready State) */}
          {state === "ready" && (
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-white/60">今日训练计划</h3>
              {EXERCISES.map((ex, i) => (
                <Card
                  key={ex.id}
                  className={`p-3 border-0 ${
                    i === currentExercise 
                      ? "bg-primary/20 border border-primary/50" 
                      : "bg-[#1a2d4a]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      i < currentExercise ? "bg-green-500" :
                      i === currentExercise ? "bg-primary" : "bg-white/10"
                    }`}>
                      {i < currentExercise ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{ex.name}</p>
                      <p className="text-xs text-white/60">{ex.reps}次 · {ex.duration}秒</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/40" />
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Complete State */}
          {state === "complete" && (
            <Card className="p-6 bg-[#1a2d4a] border-0 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">训练完成！</h2>
              <p className="text-white/60 text-sm mb-4">
                你完成了 {EXERCISES.length} 个动作的训练
              </p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-2xl font-bold text-green-400">
                    {repQuality.filter(q => q === "good").length}
                  </p>
                  <p className="text-xs text-white/60">优秀</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-2xl font-bold text-yellow-400">
                    {repQuality.filter(q => q === "fair").length}
                  </p>
                  <p className="text-xs text-white/60">良好</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-2xl font-bold text-red-400">
                    {repQuality.filter(q => q === "poor").length}
                  </p>
                  <p className="text-xs text-white/60">需改进</p>
                </div>
              </div>
              <Button
                onClick={() => router.push("/report")}
                className="w-full h-11"
              >
                查看训练报告
              </Button>
            </Card>
          )}
        </div>
      </main>

      {/* Bottom Controls */}
      {state !== "complete" && (
        <div className="p-4 bg-[#0a1628] border-t border-white/10">
          <div className="flex items-center gap-3">
            {state === "ready" ? (
              <Button
                onClick={handleStart}
                className="flex-1 h-12 text-base font-medium bg-primary hover:bg-primary/90"
              >
                <Play className="w-5 h-5 mr-2" />
                开始训练
              </Button>
            ) : state === "training" ? (
              <>
                <Button
                  variant="outline"
                  onClick={handlePause}
                  className="h-12 px-6 border-white/20 text-white hover:bg-white/10"
                >
                  <Pause className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="h-12 px-6 border-white/20 text-white hover:bg-white/10"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
