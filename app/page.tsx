"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Phone, Mail, MessageCircle, ChevronDown, Eye, EyeOff, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

type LoginMethod = "phone" | "email" | "wechat"

export default function LoginPage() {
  const router = useRouter()
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("phone")
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [countryCode, setCountryCode] = useState("+86")
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
    // 模拟登录成功，跳转到个人档案页
    localStorage.setItem("token", "mock-token")
    router.push("/profile")
  }

  // 跳过验证：只需输入任意验证码即可登录
  const canLogin = agreed && (
    (loginMethod === "phone" && code.length >= 1) ||
    (loginMethod === "email" && email && password) ||
    loginMethod === "wechat"
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 pt-12 pb-8 bg-primary text-primary-foreground">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-8 h-8">
              <circle cx="20" cy="20" r="18" fill="#2E86DE" />
              <path d="M12 20 L18 26 L28 14" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">康复评估</h1>
            <p className="text-sm text-primary-foreground/80">RehabAssess</p>
          </div>
        </div>
        <p className="text-primary-foreground/90">智能康复评估，科学指导恢复</p>
      </header>

      {/* Login Form */}
      <main className="flex-1 px-6 py-8">
        {/* Login Method Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setLoginMethod("phone")}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
              loginMethod === "phone"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground border border-border"
            }`}
          >
            <Phone className="w-4 h-4 inline-block mr-2" />
            手机号
          </button>
          <button
            onClick={() => setLoginMethod("email")}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
              loginMethod === "email"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground border border-border"
            }`}
          >
            <Mail className="w-4 h-4 inline-block mr-2" />
            邮箱
          </button>
          <button
            onClick={() => setLoginMethod("wechat")}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
              loginMethod === "wechat"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground border border-border"
            }`}
          >
            <MessageCircle className="w-4 h-4 inline-block mr-2" />
            微信
          </button>
        </div>

        {/* Phone Login */}
        {loginMethod === "phone" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button className="flex items-center gap-1 px-4 py-3 bg-card rounded-lg border border-border text-sm">
                {countryCode}
                <ChevronDown className="w-4 h-4" />
              </button>
              <Input
                type="tel"
                placeholder="请输入手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 h-12 bg-card"
              />
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="请输入验证码"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 h-12 bg-card"
                maxLength={6}
              />
              <Button
                variant="outline"
                onClick={sendCode}
                disabled={countdown > 0 || !phone}
                className="px-4 h-12 whitespace-nowrap"
              >
                {countdown > 0 ? `${countdown}s` : "获取验证码"}
              </Button>
            </div>
          </div>
        )}

        {/* Email Login */}
        {loginMethod === "email" && (
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="请输入邮箱地址"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-card"
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-card pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        {/* WeChat Login */}
        {loginMethod === "wechat" && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-10 h-10 text-accent" />
            </div>
            <p className="text-muted-foreground text-sm">点击下方按钮使用微信授权登录</p>
          </div>
        )}

        {/* Agreement */}
        <div className="flex items-start gap-3 mt-8">
          <Checkbox
            id="agreement"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked as boolean)}
            className="mt-0.5"
          />
          <label htmlFor="agreement" className="text-sm text-muted-foreground leading-relaxed">
            我已阅读并同意
            <button
              onClick={() => setShowAgreement("service")}
              className="text-primary mx-1"
            >
              《服务协议》
            </button>
            和
            <button
              onClick={() => setShowAgreement("privacy")}
              className="text-primary mx-1"
            >
              《隐私政策》
            </button>
          </label>
        </div>

        {/* Login Button */}
        <Button
          onClick={handleLogin}
          disabled={!canLogin}
          className="w-full h-12 mt-6 text-base font-medium"
        >
          {loginMethod === "wechat" ? "微信授权登录" : "登录"}
        </Button>
      </main>

      {/* Agreement Modal */}
      {showAgreement && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-card w-full rounded-t-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-lg">
                {showAgreement === "privacy" ? "隐私政策" : "服务协议"}
              </h3>
              <button
                onClick={() => setShowAgreement(null)}
                className="text-muted-foreground"
              >
                关闭
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <p>
                  {showAgreement === "privacy" 
                    ? "本隐私政策旨在向您说明我们如何收集、使用、存储和保护您的个人信息。我们承诺严格保护您的隐私安全，未经您的同意不会将您的信息用于任何未经授权的目的。"
                    : "欢迎使用康复评估平台服务。在使用我们的服务之前，请仔细阅读本协议的所有条款。您使用我们的服务即表示您同意受本协议的约束。"
                  }
                </p>
                <h4 className="text-foreground mt-4">1. 信息收集</h4>
                <p>我们会收集您主动提供的信息，包括但不限于：姓名、联系方式、健康数据等。</p>
                <h4 className="text-foreground mt-4">2. 信息使用</h4>
                <p>我们收集的信息将用于为您提供康复评估服务、改善用户体验和服务质量。</p>
                <h4 className="text-foreground mt-4">3. 信息保护</h4>
                <p>我们采用行业标准的安全措施保护您的个人信息，防止未经授权的访问、使用或泄露。</p>
              </div>
            </div>
            <div className="p-4 border-t border-border">
              <Button
                onClick={() => {
                  setAgreed(true)
                  setShowAgreement(null)
                }}
                className="w-full h-12"
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
