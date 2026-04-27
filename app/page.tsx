"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Phone, Mail, Eye, EyeOff, Check, MessageCircle } from "lucide-react"
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

  const handleSocialLogin = (type: "wechat" | "whatsapp") => {
    if (!agreed) return
    localStorage.setItem("token", `mock-${type}-token`)
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
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-6">
        {/* Logo */}
        <div className="mb-4">
          <Image 
            src="/logo.jpg" 
            alt="光年瑞康 Aiyovita" 
            width={180} 
            height={80}
            className="object-contain"
            priority
          />
        </div>

        <p className="text-sm text-gray-500 mb-8">智能康复评估服务平台</p>

        {/* Login Method Tabs */}
        <div className="w-full max-w-sm">
          <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
            <button
              onClick={() => setLoginMethod("phone")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
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
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
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
                <label className="block text-sm text-gray-600 mb-1">手机号码</label>
                <Input
                  type="tel"
                  placeholder="13800138000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10 bg-gray-50 border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">验证码</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="输入验证码"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 h-10 bg-gray-50 border-gray-200 rounded-lg"
                    maxLength={6}
                  />
                  <Button
                    variant="outline"
                    onClick={sendCode}
                    disabled={countdown > 0}
                    className="px-3 h-10 rounded-lg border-[#2066A2] text-[#2066A2] hover:bg-[#2066A2]/5 text-sm"
                  >
                    {countdown > 0 ? `${countdown}s` : "获取验证码"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Email Login */}
          {loginMethod === "email" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">邮箱地址</label>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 bg-gray-50 border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">密码</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 bg-gray-50 border-gray-200 rounded-lg pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Agreement */}
          <div className="flex items-start gap-2 mt-5">
            <Checkbox
              id="agreement"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
              className="mt-0.5 rounded data-[state=checked]:bg-[#2066A2] data-[state=checked]:border-[#2066A2]"
            />
            <label htmlFor="agreement" className="text-xs text-gray-500 leading-relaxed">
              我已阅读并同意
              <button onClick={() => setShowAgreement("service")} className="text-[#2066A2] mx-0.5">
                《服务协议》
              </button>
              和
              <button onClick={() => setShowAgreement("privacy")} className="text-[#2066A2] mx-0.5">
                《隐私政策》
              </button>
            </label>
          </div>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            disabled={!canLogin}
            className="w-full h-10 mt-4 rounded-lg text-sm font-medium bg-[#2066A2] hover:bg-[#1a5585]"
          >
            登录
          </Button>

          {/* Social Login Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">其他方式登录</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Social Login Buttons */}
          <div className="flex justify-center gap-6">
            <button
              onClick={() => handleSocialLogin("wechat")}
              disabled={!agreed}
              className="flex flex-col items-center gap-1.5 disabled:opacity-50"
            >
              <div className="w-12 h-12 rounded-full bg-[#07C160] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.328.328 0 00.186-.059l1.808-1.044a.59.59 0 01.587-.023c1.01.416 2.135.649 3.32.649.202 0 .401-.008.599-.022-.189-.544-.293-1.118-.293-1.714 0-3.635 3.477-6.587 7.768-6.587.269 0 .534.012.796.035C16.628 4.593 13.009 2.188 8.691 2.188zm-2.29 4.401a.987.987 0 11.001 1.973.987.987 0 01-.001-1.973zm4.867 0a.987.987 0 110 1.974.987.987 0 010-1.974zm4.774 4.532c-3.688 0-6.687 2.505-6.687 5.594 0 3.088 2.999 5.593 6.687 5.593.691 0 1.358-.089 1.988-.252a.49.49 0 01.486.019l1.46.843a.266.266 0 00.15.047.237.237 0 00.236-.238c0-.058-.023-.116-.039-.172l-.315-1.197a.488.488 0 01.176-.553c1.488-1.094 2.445-2.73 2.445-4.562.001-3.089-2.998-5.593-6.687-5.593zm-2.11 3.161a.789.789 0 11.001 1.578.789.789 0 01-.001-1.578zm4.221 0a.789.789 0 110 1.577.789.789 0 010-1.577z"/>
                </svg>
              </div>
              <span className="text-xs text-gray-500">微信</span>
            </button>

            <button
              onClick={() => handleSocialLogin("whatsapp")}
              disabled={!agreed}
              className="flex flex-col items-center gap-1.5 disabled:opacity-50"
            >
              <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-500">WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 text-center">
        <p className="text-xs text-gray-400">光年瑞康 Aiyovita v1.0</p>
      </div>

      {/* Agreement Modal */}
      {showAgreement && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-2xl max-h-[75vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">
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
                    : "欢迎使用光年瑞康康复评估平台服务。使用我们的服务即表示您同意受本协议的约束。"
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
                className="w-full h-10 rounded-lg bg-[#2066A2] hover:bg-[#1a5585]"
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
