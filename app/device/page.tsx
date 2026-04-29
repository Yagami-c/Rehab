"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Bluetooth,
  BluetoothOff,
  RefreshCw,
  Battery,
  Signal,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  Zap,
  Timer,
  RotateCcw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Device {
  id: string
  name: string
  rssi: number
  connected: boolean
  battery?: number
  firmware?: string
}

interface PADAssessment {
  level: number
  mode: string
  params: {
    pressure: number
    application: number
    rest: number
    cycles: number
    userExplain: string
    detailExplain: string
    dailyAdvice: string
  }
  stiffness: number
  squatPain: number
  bodyType: string
  isFirstTime: boolean
}

const MOCK_DEVICES: Device[] = [
  { id: "1", name: "PAD-Knee-A1B2", rssi: -45, connected: false },
  { id: "2", name: "PAD-Pro-C3D4", rssi: -62, connected: false },
]

export default function DevicePage() {
  const router = useRouter()
  const [scanning, setScanning] = useState(false)
  const [devices, setDevices] = useState<Device[]>([])
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null)
  const [padAssessment, setPadAssessment] = useState<PADAssessment | null>(null)
  
  // 治疗状态
  const [isRunning, setIsRunning] = useState(false)
  const [currentCycle, setCurrentCycle] = useState(0)
  const [phase, setPhase] = useState<"idle" | "application" | "rest">("idle")
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    // 加载PAD评估结果
    const saved = localStorage.getItem("padAssessment")
    if (saved) {
      setPadAssessment(JSON.parse(saved))
    }
  }, [])

  // 治疗计时器
  useEffect(() => {
    if (!isRunning || !padAssessment) return

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // 切换阶段
          if (phase === "application") {
            if (currentCycle >= padAssessment.params.cycles) {
              // 治疗完成
              setIsRunning(false)
              setPhase("idle")
              setCurrentCycle(0)
              return 0
            }
            setPhase("rest")
            return padAssessment.params.rest
          } else if (phase === "rest") {
            setCurrentCycle(c => c + 1)
            setPhase("application")
            return padAssessment.params.application
          }
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, phase, currentCycle, padAssessment])

  const startScan = () => {
    setScanning(true)
    setDevices([])
    setTimeout(() => {
      setDevices(MOCK_DEVICES)
      setScanning(false)
    }, 2000)
  }

  const connectDevice = (device: Device) => {
    const connected: Device = {
      ...device,
      connected: true,
      battery: 85,
      firmware: "v2.1.0",
    }
    setConnectedDevice(connected)
  }

  const disconnectDevice = () => {
    setConnectedDevice(null)
    setIsRunning(false)
    setPhase("idle")
  }

  const startTreatment = () => {
    if (!padAssessment) return
    setIsRunning(true)
    setPhase("application")
    setCurrentCycle(1)
    setCountdown(padAssessment.params.application)
  }

  const stopTreatment = () => {
    setIsRunning(false)
    setPhase("idle")
    setCurrentCycle(0)
    setCountdown(0)
  }

  const getSignalStrength = (rssi: number) => {
    if (rssi > -50) return { text: "强", color: "text-green-600" }
    if (rssi > -70) return { text: "中", color: "text-yellow-600" }
    return { text: "弱", color: "text-red-600" }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-card z-10 border-b border-border">
        <div className="flex items-center h-12 px-4">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-base">PAD设备控制</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="p-4 space-y-4 pb-6">
        {/* PAD推荐模式卡片 */}
        {padAssessment && (
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">{padAssessment.mode}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">推荐模式</h3>
                <p className="text-xs text-muted-foreground">
                  {padAssessment.level <= 3 ? "低压" : "高压"}模式 · 基于您的评估结果
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-card rounded-lg p-2">
                <Zap className="w-4 h-4 mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">压力</p>
                <p className="text-sm font-medium">{padAssessment.params.pressure}</p>
              </div>
              <div className="bg-card rounded-lg p-2">
                <Timer className="w-4 h-4 mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">时长</p>
                <p className="text-sm font-medium">{padAssessment.params.application}s</p>
              </div>
              <div className="bg-card rounded-lg p-2">
                <RotateCcw className="w-4 h-4 mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">休息</p>
                <p className="text-sm font-medium">{padAssessment.params.rest}s</p>
              </div>
              <div className="bg-card rounded-lg p-2">
                <RefreshCw className="w-4 h-4 mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">循环</p>
                <p className="text-sm font-medium">{padAssessment.params.cycles}次</p>
              </div>
            </div>
          </Card>
        )}

        {/* Connected Device */}
        {connectedDevice ? (
          <>
            <Card className="p-4 bg-primary text-primary-foreground">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center">
                  <Bluetooth className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{connectedDevice.name}</h3>
                    <CheckCircle2 className="w-4 h-4 text-green-300" />
                  </div>
                  <p className="text-xs text-primary-foreground/80">已连接</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-primary-foreground/20">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Battery className="w-3.5 h-3.5" />
                    <span className="font-semibold text-sm">{connectedDevice.battery}%</span>
                  </div>
                  <p className="text-xs text-primary-foreground/70">电量</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Signal className="w-3.5 h-3.5" />
                    <span className="font-semibold text-sm">强</span>
                  </div>
                  <p className="text-xs text-primary-foreground/70">信号</p>
                </div>
                <div className="text-center">
                  <span className="font-semibold text-sm">{connectedDevice.firmware}</span>
                  <p className="text-xs text-primary-foreground/70">固件</p>
                </div>
              </div>
            </Card>

            {/* Treatment Control */}
            {padAssessment && (
              <Card className="p-4">
                <h2 className="font-semibold text-sm mb-4">治疗控制</h2>
                
                {/* Status Display */}
                <div className="text-center mb-4">
                  {isRunning ? (
                    <>
                      <div className="w-24 h-24 mx-auto mb-3 relative">
                        <svg className="w-full h-full -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="44"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="6"
                            className="text-muted"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="44"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="6"
                            strokeLinecap="round"
                            className={phase === "application" ? "text-primary" : "text-green-500"}
                            strokeDasharray={`${(countdown / (phase === "application" ? padAssessment.params.application : padAssessment.params.rest)) * 276.5} 276.5`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold">{formatTime(countdown)}</span>
                          <span className="text-xs text-muted-foreground">
                            {phase === "application" ? "施压中" : "休息中"}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        第 {currentCycle} / {padAssessment.params.cycles} 循环
                      </p>
                    </>
                  ) : (
                    <div className="py-6">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Play className="w-8 h-8 text-primary ml-1" />
                      </div>
                      <p className="text-sm text-muted-foreground">点击开始治疗</p>
                    </div>
                  )}
                </div>

                {/* Control Buttons */}
                <div className="flex gap-3">
                  {isRunning ? (
                    <>
                      <Button
                        variant="outline"
                        className="flex-1 h-11"
                        onClick={stopTreatment}
                      >
                        <Square className="w-4 h-4 mr-2" />
                        停止
                      </Button>
                      <Button
                        variant="destructive"
                        className="h-11 px-6"
                        onClick={stopTreatment}
                      >
                        急停
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="flex-1 h-11"
                      onClick={startTreatment}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      开始治疗
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {/* Mode Description */}
            {padAssessment && (
              <Card className="p-4 bg-muted/50">
                <h3 className="font-medium text-sm mb-2">使用说明</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {padAssessment.params.detailExplain}
                </p>
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{padAssessment.params.dailyAdvice}</p>
                </div>
              </Card>
            )}

            <Button
              variant="outline"
              className="w-full text-destructive border-destructive h-10"
              onClick={disconnectDevice}
            >
              断开连接
            </Button>
          </>
        ) : (
          <>
            {/* Scan Button */}
            <Card className="p-5 text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                {scanning ? (
                  <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                ) : (
                  <Bluetooth className="w-6 h-6 text-primary" />
                )}
              </div>
              <h2 className="font-semibold text-sm mb-1">
                {scanning ? "正在搜索设备..." : "搜索PAD设备"}
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                请确保设备已开启并处于可发现状态
              </p>
              <Button 
                onClick={startScan} 
                disabled={scanning}
                className="w-full h-10"
              >
                {scanning ? "搜索中..." : "开始搜索"}
              </Button>
            </Card>

            {/* Device List */}
            {devices.length > 0 && (
              <section>
                <h2 className="font-semibold text-sm mb-3">发现的设备</h2>
                <div className="space-y-2">
                  {devices.map((device) => {
                    const signal = getSignalStrength(device.rssi)
                    return (
                      <Card
                        key={device.id}
                        className="p-3.5 cursor-pointer active:scale-[0.98] transition-transform"
                        onClick={() => connectDevice(device)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Bluetooth className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">{device.name}</h3>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Signal className="w-3 h-3" />
                              <span className={signal.color}>信号{signal.text}</span>
                            </div>
                          </div>
                          <Button size="sm" className="h-8 px-3 text-xs">连接</Button>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Empty State */}
            {!scanning && devices.length === 0 && (
              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <BluetoothOff className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  点击上方按钮搜索附近的PAD设备
                </p>
              </Card>
            )}

            {/* Tips */}
            <Card className="p-3 bg-muted/50">
              <div className="flex gap-2.5">
                <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">连接提示</p>
                  <ul className="space-y-0.5">
                    <li>确保设备电量充足</li>
                    <li>保持设备在 3 米范围内</li>
                    <li>如连接失败，请重启设备后重试</li>
                  </ul>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* 使用后反馈入口 */}
        {connectedDevice && !isRunning && (
          <Button
            variant="outline"
            className="w-full h-10"
            onClick={() => router.push("/feedback")}
          >
            填写使用后反馈
          </Button>
        )}
      </main>
    </div>
  )
}
