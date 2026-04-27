"use client"

import { useState, useEffect, memo, Suspense, useCallback } from "react"
import { useRouter } from "next/navigation"
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, Camera, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import dynamic from "next/dynamic"

const Knee3DModel = dynamic(() => import("@/components/knee-3d-model"), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center"><div className="text-cyan-400 text-xs">加载中...</div></div>,
})

const EXERCISES = [
  { id: "squat", name: "深蹲", level: 2, description: "膝盖弯曲至90度，背部挺直" },
  { id: "shoulder", name: "肩外展", level: 1, description: "双臂侧平举至肩膀高度" },
]

// 人形骨架组件
const SkeletonFigure = memo(function SkeletonFigure({ animate = false, exerciseType = "squat" }: { animate?: boolean; exerciseType?: string }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    if (!animate) return
    const interval = setInterval(() => setPhase(p => (p + 1) % 60), 50)
    return () => clearInterval(interval)
  }, [animate])

  const progress = Math.sin((phase / 60) * Math.PI * 2)
  const squatOffset = exerciseType === "squat" ? progress * 18 : 0
  const kneeAngle = exerciseType === "squat" ? 12 + progress * 22 : 0
  const armAngle = exerciseType === "shoulder" ? 40 + progress * 50 : 25

  return (
    <svg viewBox="0 0 200 280" className="w-full h-full">
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <g filter="url(#glow)" stroke="#22D3EE" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <circle cx="100" cy="32" r="16" />
        <line x1="100" y1="48" x2="100" y2="60" />
        <line x1="100" y1="60" x2="100" y2={120 + squatOffset * 0.3} />
        <line x1="68" y1="70" x2="132" y2="70" />
        <g transform={`rotate(${-armAngle}, 68, 70)`}>
          <line x1="68" y1="70" x2="45" y2="100" />
          <line x1="45" y1="100" x2="30" y2="130" />
          <circle cx="30" cy="130" r="4" fill="#22D3EE" />
        </g>
        <g transform={`rotate(${armAngle}, 132, 70)`}>
          <line x1="132" y1="70" x2="155" y2="100" />
          <line x1="155" y1="100" x2="170" y2="130" />
          <circle cx="170" cy="130" r="4" fill="#22D3EE" />
        </g>
        <line x1="78" y1={120 + squatOffset * 0.3} x2="122" y2={120 + squatOffset * 0.3} />
        <line x1="78" y1={120 + squatOffset * 0.3} x2={78 - kneeAngle * 0.25} y2={165 + squatOffset * 0.6} />
        <line x1={78 - kneeAngle * 0.25} y1={165 + squatOffset * 0.6} x2="75" y2={220 + squatOffset * 0.2} />
        <ellipse cx="75" cy={225 + squatOffset * 0.2} rx="10" ry="4" fill="#22D3EE" />
        <line x1="122" y1={120 + squatOffset * 0.3} x2={122 + kneeAngle * 0.25} y2={165 + squatOffset * 0.6} />
        <line x1={122 + kneeAngle * 0.25} y1={165 + squatOffset * 0.6} x2="125" y2={220 + squatOffset * 0.2} />
        <ellipse cx="125" cy={225 + squatOffset * 0.2} rx="10" ry="4" fill="#22D3EE" />
        <circle cx="68" cy="70" r="3.5" fill="#22D3EE" />
        <circle cx="132" cy="70" r="3.5" fill="#22D3EE" />
        <circle cx="78" cy={120 + squatOffset * 0.3} r="3.5" fill="#22D3EE" />
        <circle cx="122" cy={120 + squatOffset * 0.3} r="3.5" fill="#22D3EE" />
        <circle cx={78 - kneeAngle * 0.25} cy={165 + squatOffset * 0.6} r="4" fill="#06B6D4" />
        <circle cx={122 + kneeAngle * 0.25} cy={165 + squatOffset * 0.6} r="4" fill="#06B6D4" />
      </g>
    </svg>
  )
})

export default function AssessmentPage() {
  const router = useRouter()
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [show3D, setShow3D] = useState(false)
  const [score, setScore] = useState(0)
  const [reps, setReps] = useState(0)
  const [showComplete, setShowComplete] = useState(false)

  const exercise = EXERCISES[selectedIdx]

  // 模拟评估进度
  useEffect(() => {
    if (!isPlaying || !showCamera) return
    const interval = setInterval(() => {
      setScore(s => Math.min(95, s + Math.random() * 3))
      if (Math.random() > 0.85) setReps(r => r + 1)
    }, 500)
    return () => clearInterval(interval)
  }, [isPlaying, showCamera])

  useEffect(() => {
    if (reps >= 5) {
      setIsPlaying(false)
      setShowComplete(true)
    }
  }, [reps])

  const handleStart = useCallback(() => { setShowCamera(true); setIsPlaying(true) }, [])
  const handleReset = useCallback(() => { setReps(0); setScore(0); setIsPlaying(false) }, [])

  const handleComplete = useCallback(() => {
    localStorage.setItem("assessmentResult", JSON.stringify({
      exercise: exercise.name, score: Math.floor(score), reps,
      completedAt: new Date().toISOString(),
    }))
    router.push("/report")
  }, [exercise.name, score, reps, router])

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 relative z-10">
        <button onClick={() => router.back()} className="p-1.5 text-white/70">
          <X className="w-5 h-5" />
        </button>
        <div className="flex bg-slate-800 rounded-lg p-0.5">
          {EXERCISES.map((ex, i) => (
            <button
              key={ex.id}
              onClick={() => { setSelectedIdx(i); handleReset() }}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                selectedIdx === i ? "bg-cyan-500 text-white" : "text-slate-400"
              }`}
            >
              {ex.name}
            </button>
          ))}
        </div>
        <div className="w-8" />
      </header>

      {/* Demo Area */}
      <div className="flex-1 relative bg-gradient-to-b from-slate-900 via-slate-800/50 to-slate-900">
        {/* Info */}
        <div className="absolute top-2 left-4 z-10">
          <div className="flex items-center gap-1.5 text-cyan-400 text-sm font-medium">
            {exercise.name}
            <span className="text-slate-500 text-xs">(Level {exercise.level})</span>
          </div>
          <p className="text-slate-400 text-xs mt-0.5">{exercise.description}</p>
        </div>

        {/* 3D Toggle */}
        <button
          onClick={() => setShow3D(!show3D)}
          className="absolute top-2 right-4 z-10 px-2 py-1 bg-slate-800/80 rounded text-[10px] text-slate-300 border border-slate-700"
        >
          {show3D ? "2D骨架" : "3D膝关节"}
        </button>

        {/* Skeleton / 3D */}
        <div className="absolute inset-0 flex items-center justify-center pt-10 pb-16">
          {show3D ? (
            <div className="w-full h-full max-w-[200px]">
              <Suspense fallback={null}>
                <Knee3DModel flexionAngle={45 + (isPlaying ? Math.sin(Date.now()/500)*20 : 0)} isAnimating={isPlaying} />
              </Suspense>
            </div>
          ) : (
            <div className="w-40 h-56">
              <SkeletonFigure animate={isPlaying && showCamera} exerciseType={exercise.id} />
            </div>
          )}
        </div>

        {/* Score (when playing) */}
        {showCamera && (
          <div className="absolute top-2 right-4 mt-8">
            <Card className="bg-slate-800/90 border-slate-700 p-2 text-center min-w-[60px]">
              <p className="text-[10px] text-slate-400">评分</p>
              <p className="text-xl font-bold text-cyan-400">{Math.floor(score)}</p>
            </Card>
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
          <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 bg-slate-800/80 rounded-full border border-slate-700">
            {isPlaying ? <Pause className="w-4 h-4 text-cyan-400" /> : <Play className="w-4 h-4 text-cyan-400" />}
          </button>
          <button onClick={handleReset} className="p-2 bg-slate-800/80 rounded-full border border-slate-700">
            <RotateCcw className="w-4 h-4 text-slate-400" />
          </button>
          <button onClick={() => setIsMuted(!isMuted)} className="p-2 bg-slate-800/80 rounded-full border border-slate-700">
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Camera / Start Section */}
      <div className="h-[42%] bg-slate-950 relative">
        {showCamera ? (
          <div className="absolute inset-0 flex flex-col">
            {/* Camera placeholder */}
            <div className="flex-1 flex items-center justify-center relative">
              <Camera className="w-10 h-10 text-slate-700" />
              <p className="absolute bottom-4 text-slate-500 text-xs">摄像头画面</p>
              {/* Guide overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-28 h-40 border border-dashed border-cyan-500/30 rounded-lg" />
              </div>
            </div>
            {/* Progress */}
            <div className="p-3 bg-slate-900 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span>完成进度</span>
                <span>{reps}/5 次</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 transition-all" style={{ width: `${(reps/5)*100}%` }} />
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
            <div className="w-20 h-28 mb-3 opacity-40">
              <SkeletonFigure animate={false} exerciseType={exercise.id} />
            </div>
            <h3 className="text-white font-medium text-sm mb-1">准备好开始了吗？</h3>
            <p className="text-slate-500 text-xs text-center mb-5">模型加载完成，点击下方按钮开启摄像头</p>
            <Button onClick={handleStart} className="bg-cyan-500 hover:bg-cyan-600 text-white h-10 px-6 rounded-xl text-sm">
              <Camera className="w-4 h-4 mr-2" />
              开启摄像头
            </Button>
          </div>
        )}
      </div>

      {/* Complete Modal */}
      {showComplete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-[280px] p-5 text-center bg-slate-800 border-slate-700">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-cyan-400" />
            </div>
            <h2 className="text-white font-semibold mb-1">评估完成</h2>
            <p className="text-slate-400 text-xs mb-4">已完成 {exercise.name} 评估</p>
            <div className="flex gap-2 mb-4">
              <div className="flex-1 bg-slate-900 p-2 rounded-lg">
                <p className="text-xl font-bold text-cyan-400">{Math.floor(score)}</p>
                <p className="text-[10px] text-slate-500">评分</p>
              </div>
              <div className="flex-1 bg-slate-900 p-2 rounded-lg">
                <p className="text-xl font-bold text-white">{reps}</p>
                <p className="text-[10px] text-slate-500">完成次数</p>
              </div>
            </div>
            <Button onClick={handleComplete} className="w-full h-10 bg-cyan-500 hover:bg-cyan-600 rounded-xl text-sm">
              查看报告
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}
