"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Phone, Mail, Eye, EyeOff, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

type LoginMethod = "phone" | "email"

export default function LoginPage() {
  const router = useRouter()
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("phone")
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [showAgreement, setShowAgreement] = useState<"privacy" | "service" | null>(null)

  const sendCode = () => {
    if (countdown > 0) return
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleLogin = () => {
    if (!agreed) return
    localStorage.setItem("token", "mock-token")
    router.push("/profile")
  }

  // 跳过验证：只需输入任意验证码即可登录
  const canLogin = agreed && (
    (loginMethod === "phone" && code.length >= 1) ||
    (loginMethod === "email" && email && password)
  )

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Logo Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        {/* Logo */}
        <div className="mb-6">
          <svg viewBox="0 0 120 40" className="h-10">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22C55E" />
                <stop offset="100%" stopColor="#16A34A" />
              </linearGradient>
            </defs>
            <text x="0" y="28" fill="url(#logoGradient)" fontSize="20" fontWeight="600" fontFamily="system-ui">
              Aiyovita
            </text>
            <text x="0" y="38" fill="#9CA3AF" fontSize="8" fontFamily="system-ui">
              艾悦维
            </text>
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-gray-900 mb-1">康复评估平台</h1>
        <p className="text-sm text-gray-500 mb-10">科学的数字康复服务</p>

        {/* Login Method Tabs */}
        <div className="w-full max-w-sm">
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setLoginMethod("phone")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                loginMethod === "phone"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              <Phone className="w-4 h-4" />
              验证码登录
            </button>
            <button
              onClick={() => setLoginMethod("email")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                loginMethod === "email"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              <Mail className="w-4 h-4" />
              邮箱密码
            </button>
          </div>

          {/* Phone Login */}
          {loginMethod === "phone" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">手机号码</label>
                <Input
                  type="tel"
                  placeholder="13800138000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 bg-gray-50 border-gray-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">验证码</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="输入验证码"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 h-11 bg-gray-50 border-gray-200 rounded-xl"
                    maxLength={6}
                  />
                  <Button
                    variant="outline"
                    onClick={sendCode}
                    disabled={countdown > 0}
                    className="px-4 h-11 rounded-xl border-primary text-primary hover:bg-primary/5"
                  >
                    {countdown > 0 ? `${countdown}s` : "发送验证码"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Email Login */}
          {loginMethod === "email" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">邮箱地址</label>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-gray-50 border-gray-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">密码</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 bg-gray-50 border-gray-200 rounded-xl pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Agreement */}
          <div className="flex items-start gap-2 mt-6">
            <Checkbox
              id="agreement"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
              className="mt-0.5 rounded"
            />
            <label htmlFor="agreement" className="text-xs text-gray-500 leading-relaxed">
              我已阅读并同意
              <button onClick={() => setShowAgreement("service")} className="text-primary mx-0.5">
                《服务协议》
              </button>
              和
              <button onClick={() => setShowAgreement("privacy")} className="text-primary mx-0.5">
                《隐私政策》
              </button>
            </label>
          </div>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            disabled={!canLogin}
            className="w-full h-11 mt-5 rounded-xl text-sm font-medium bg-primary hover:bg-primary/90"
          >
            登录
          </Button>
        </div>
      </div>

      {/* Agreement Modal */}
      {showAgreement && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold">
                {showAgreement === "privacy" ? "隐私政策" : "服务协议"}
              </h3>
              <button onClick={() => setShowAgreement(null)} className="text-gray-400 text-sm">
                关闭
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="text-sm text-gray-600 space-y-3">
                <p>
                  {showAgreement === "privacy" 
                    ? "本隐私政策旨在向您说明我们如何收集、使用、存储和保护您的个人信息。"
                    : "欢迎使用康复评估平台服务。使用我们的服务即表示您同意受本协议的约束。"
                  }
                </p>
                <h4 className="text-gray-900 font-medium pt-2">1. 信息收集</h4>
                <p>我们会收集您主动提供的信息，包括但不限于：姓名、联系方式、健康数据等。</p>
                <h4 className="text-gray-900 font-medium pt-2">2. 信息使用</h4>
                <p>我们收集的信息将用于为您提供康复评估服务、改善用户体验和服务质量。</p>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100">
              <Button
                onClick={() => {
                  setAgreed(true)
                  setShowAgreement(null)
                }}
                className="w-full h-11 rounded-xl"
              >
                <Check className="w-4 h-4 mr-2" />
                我已阅读并同意
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
