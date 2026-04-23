"use client"

import { useState } from "react"
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
  Wifi
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"

interface Device {
  id: string
  name: string
  rssi: number
  connected: boolean
  battery?: number
  firmware?: string
}

const MOCK_DEVICES: Device[] = [
  { id: "1", name: "RehabSensor-A1B2", rssi: -45, connected: false },
  { id: "2", name: "RehabBand-C3D4", rssi: -62, connected: false },
  { id: "3", name: "MotionTracker-E5F6", rssi: -78, connected: false },
]

export default function DevicePage() {
  const router = useRouter()
  const [scanning, setScanning] = useState(false)
  const [devices, setDevices] = useState<Device[]>([])
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null)
  const [massageMode, setMassageMode] = useState("relax")
  const [massageIntensity, setMassageIntensity] = useState([5])
  const [massageRunning, setMassageRunning] = useState(false)

  const startScan = () => {
    setScanning(true)
    setDevices([])
    
    // 模拟扫描过程
    setTimeout(() => {
      setDevices(MOCK_DEVICES)
      setScanning(false)
    }, 2000)
  }

  const connectDevice = (device: Device) => {
    // 模拟连接
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
    setMassageRunning(false)
  }

  const getSignalStrength = (rssi: number) => {
    if (rssi > -50) return { text: "强", color: "text-accent" }
    if (rssi > -70) return { text: "中", color: "text-yellow-600" }
    return { text: "弱", color: "text-destructive" }
  }

  const MASSAGE_MODES = [
    { id: "relax", name: "放松模式" },
    { id: "deep", name: "深层按摩" },
    { id: "pulse", name: "脉冲模式" },
    { id: "warm", name: "温热舒缓" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-card z-10 border-b border-border">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-center font-semibold">设备配置</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Connected Device */}
        {connectedDevice ? (
          <>
            <Card className="p-6 bg-primary text-primary-foreground">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <Bluetooth className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{connectedDevice.name}</h3>
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                  </div>
                  <p className="text-sm text-primary-foreground/80">已连接</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-primary-foreground/20">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Battery className="w-4 h-4" />
                    <span className="font-semibold">{connectedDevice.battery}%</span>
                  </div>
                  <p className="text-xs text-primary-foreground/70">电量</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Signal className="w-4 h-4" />
                    <span className="font-semibold">强</span>
                  </div>
                  <p className="text-xs text-primary-foreground/70">信号</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Wifi className="w-4 h-4" />
                    <span className="font-semibold">{connectedDevice.firmware}</span>
                  </div>
                  <p className="text-xs text-primary-foreground/70">固件</p>
                </div>
              </div>
            </Card>

            {/* Massage Control */}
            <Card className="p-6">
              <h2 className="font-semibold mb-4">按摩控制</h2>
              
              <div className="space-y-6">
                {/* Mode Selection */}
                <div>
                  <p className="text-sm text-muted-foreground mb-3">按摩模式</p>
                  <div className="grid grid-cols-2 gap-2">
                    {MASSAGE_MODES.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setMassageMode(mode.id)}
                        className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                          massageMode === mode.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {mode.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Intensity */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-muted-foreground">强度</p>
                    <span className="text-sm font-medium">{massageIntensity[0]}/10</span>
                  </div>
                  <Slider
                    value={massageIntensity}
                    onValueChange={setMassageIntensity}
                    min={1}
                    max={10}
                    step={1}
                  />
                </div>

                {/* Control Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant={massageRunning ? "destructive" : "default"}
                    className="flex-1 h-12"
                    onClick={() => setMassageRunning(!massageRunning)}
                  >
                    {massageRunning ? "停止" : "启动"}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 px-6 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => setMassageRunning(false)}
                  >
                    急停
                  </Button>
                </div>
              </div>
            </Card>

            {/* Calibration */}
            <Card className="p-6">
              <h2 className="font-semibold mb-4">设备校准</h2>
              <p className="text-sm text-muted-foreground mb-4">
                将设备放置在水平面上，点击下方按钮进行零点校准
              </p>
              <Button variant="outline" className="w-full">
                开始校准
              </Button>
            </Card>

            <Button
              variant="outline"
              className="w-full text-destructive border-destructive"
              onClick={disconnectDevice}
            >
              断开连接
            </Button>
          </>
        ) : (
          <>
            {/* Scan Button */}
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                {scanning ? (
                  <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                ) : (
                  <Bluetooth className="w-8 h-8 text-primary" />
                )}
              </div>
              <h2 className="font-semibold mb-2">
                {scanning ? "正在搜索设备..." : "搜索蓝牙设备"}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                请确保设备已开启并处于可发现状态
              </p>
              <Button 
                onClick={startScan} 
                disabled={scanning}
                className="w-full h-12"
              >
                {scanning ? "搜索中..." : "开始搜索"}
              </Button>
            </Card>

            {/* Device List */}
            {devices.length > 0 && (
              <section>
                <h2 className="font-semibold mb-4">发现的设备</h2>
                <div className="space-y-3">
                  {devices.map((device) => {
                    const signal = getSignalStrength(device.rssi)
                    return (
                      <Card
                        key={device.id}
                        className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => connectDevice(device)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Bluetooth className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{device.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Signal className="w-3 h-3" />
                              <span className={signal.color}>信号{signal.text}</span>
                            </div>
                          </div>
                          <Button size="sm">连接</Button>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Empty State */}
            {!scanning && devices.length === 0 && (
              <Card className="p-8 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <BluetoothOff className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  点击上方按钮搜索附近的康复设备
                </p>
              </Card>
            )}

            {/* Tips */}
            <Card className="p-4 bg-muted/50">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">连接提示</p>
                  <ul className="space-y-1">
                    <li>确保设备电量充足</li>
                    <li>保持设备在 3 米范围内</li>
                    <li>如连接失败，请重启设备后重试</li>
                  </ul>
                </div>
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
