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
  const [phone, setPhone] = useState("13800138000")
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
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Header with Logo Card */}
      <div className="pt-12 pb-4 flex flex-col items-center px-6">
        {/* Logo Card - 参照Figma设计 */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-5 w-24 h-24 flex items-center justify-center">
          <Image 
            src="/logo.jpg" 
            alt="光年瑞康 Aiyovita" 
            width={70} 
            height={70}
            className="object-contain"
            priority
          />
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-gray-900 mb-1">康复评估平台</h1>
        <p className="text-sm text-gray-500">科学的数字康复服务</p>
      </div>

      {/* Login Form */}
      <div className="flex-1 px-6">
        <div className="bg-white rounded-2xl shadow-sm p-5 max-w-sm mx-auto">
          {/* Login Method Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
            <button
              onClick={() => setLoginMethod("phone")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
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
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">手机号码</label>
                <Input
                  type="tel"
                  placeholder="请输入手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 bg-gray-50 border-0 rounded-xl text-base"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">验证码</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="请输入验证码"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 h-11 bg-gray-50 border-0 rounded-xl text-base"
                    maxLength={6}
                  />
                  <Button
                    variant="outline"
                    onClick={sendCode}
                    disabled={countdown > 0}
                    className="px-4 h-11 rounded-xl border-[#2066A2] text-[#2066A2] hover:bg-[#2066A2]/5 text-sm whitespace-nowrap"
                  >
                    {countdown > 0 ? `${countdown}s` : "获取验证码"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Email Login */}
          {loginMethod === "email" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">邮箱地址</label>
                <Input
                  type="email"
                  placeholder="请输入邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-gray-50 border-0 rounded-xl text-base"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">密码</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 bg-gray-50 border-0 rounded-xl text-base pr-10"
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
            className="w-full h-11 mt-5 rounded-xl text-base font-medium bg-[#2066A2] hover:bg-[#1a5585] disabled:bg-gray-300"
          >
            登录
          </Button>
        </div>

        {/* Social Login */}
        <div className="max-w-sm mx-auto mt-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">其他方式登录</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="flex justify-center gap-8">
            <button
              onClick={() => handleSocialLogin("wechat")}
              disabled={!agreed}
              className="flex flex-col items-center gap-2 disabled:opacity-50"
            >
              <div className="w-14 h-14 rounded-full bg-[#07C160] flex items-center justify-center shadow-sm">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-current">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.328.328 0 00.186-.059l1.808-1.044a.59.59 0 01.587-.023c1.01.416 2.135.649 3.32.649.202 0 .401-.008.599-.022-.189-.544-.293-1.118-.293-1.714 0-3.635 3.477-6.587 7.768-6.587.269 0 .534.012.796.035C16.628 4.593 13.009 2.188 8.691 2.188zm-2.29 4.401a.987.987 0 11.001 1.973.987.987 0 01-.001-1.973zm4.867 0a.987.987 0 110 1.974.987.987 0 010-1.974zm4.774 4.532c-3.688 0-6.687 2.505-6.687 5.594 0 3.088 2.999 5.593 6.687 5.593.691 0 1.358-.089 1.988-.252a.49.49 0 01.486.019l1.46.843a.266.266 0 00.15.047.237.237 0 00.236-.238c0-.058-.023-.116-.039-.172l-.315-1.197a.488.488 0 01.176-.553c1.488-1.094 2.445-2.73 2.445-4.562.001-3.089-2.998-5.593-6.687-5.593zm-2.11 3.161a.789.789 0 11.001 1.578.789.789 0 01-.001-1.578zm4.221 0a.789.789 0 110 1.577.789.789 0 010-1.577z"/>
                </svg>
              </div>
              <span className="text-xs text-gray-500">微信</span>
            </button>

            <button
              onClick={() => handleSocialLogin("whatsapp")}
              disabled={!agreed}
              className="flex flex-col items-center gap-2 disabled:opacity-50"
            >
              <div className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-sm">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs text-gray-500">WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-5 text-center">
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
              {showAgreement === "service" ? (
                <div className="text-sm text-gray-600 space-y-3">
                  <p className="font-medium text-gray-900">
                    欢迎使用康复AI服务。请您务必审慎阅读、充分理解本协议各条款内容。一旦您勾选&quot;同意&quot;并登录，即视为您已充分理解并接受本协议全部条款。
                  </p>
                  <h4 className="text-gray-900 font-medium pt-2">一、服务说明</h4>
                  <p>1. 本服务是由光年瑞康提供的基于人工智能技术的康复辅助指导工具，包括但不限于康复动作评估、训练计划生成、进展追踪等功能。</p>
                  <p>2. 本服务不构成医疗诊断、处方或治疗，所有内容仅供参考，不能替代专业医师、康复治疗师的面诊与指导。</p>
                  <h4 className="text-gray-900 font-medium pt-2">二、用户义务</h4>
                  <p>1. 您应提供真实、准确的健康信息，并在身体状况发生变化时及时更新。</p>
                  <p>2. 您确认在使用本服务前，已咨询专业医疗人员，明确自身适合进行相关康复活动。若在训练中出现疼痛、不适等异常反应，请立即停止，并及时就医。</p>
                  <h4 className="text-gray-900 font-medium pt-2">三、风险提示与免责</h4>
                  <p>1. 康复训练存在固有风险，包括但不限于肌肉酸痛、关节损伤、跌伤等。您自愿承担使用本服务可能产生的一切风险。</p>
                  <p>2. 本服务AI模型基于通用数据训练，不针对个体特殊病情，其输出可能存在偏差。我方不对服务的准确性、完整性、时效性做任何明示或默示保证。</p>
                  <h4 className="text-gray-900 font-medium pt-2">四、知识产权</h4>
                  <p>本服务包含的软件、算法、图文、界面设计等知识产权均归我方所有，未经许可，您不得复制、修改、逆向工程或用于商业用途。</p>
                </div>
              ) : (
                <div className="text-sm text-gray-600 space-y-3">
                  <p className="font-medium text-gray-900">
                    我们深知健康信息、个人信息对您的重要性，并会尽全力保护您的隐私安全。勾选同意即表示您已阅读并同意我们按照本协议收集、使用和存储您的信息。
                  </p>
                  <h4 className="text-gray-900 font-medium pt-2">一、我们收集的信息</h4>
                  <p>为提供AI康复评估与训练指导服务，我们会收集以下必要信息：</p>
                  <p>- 账户信息：手机号、用户名、头像等登录凭证</p>
                  <p>- 健康数据：您主动填写的年龄、身高、体重、病史、损伤部位、疼痛程度、康复目标等</p>
                  <p>- 运动数据：经您授权后，通过摄像头采集的关节角度、姿态视频片段、运动时长等，仅用于实时动作分析与反馈</p>
                  <h4 className="text-gray-900 font-medium pt-2">二、信息如何使用</h4>
                  <p>- 用于提供、维护和改进AI康复算法，生成个性化训练方案</p>
                  <p>- 用于与您沟通，如发送训练提醒、服务更新通知</p>
                  <p>- 用于数据分析与模型训练（经匿名化或去标识化处理后，无法关联到您个人）</p>
                  <h4 className="text-gray-900 font-medium pt-2">三、敏感信息特别提示</h4>
                  <p>您提供的健康数据、运动影像属于个人敏感信息，一旦泄露可能导致对您的歧视或人身安全隐患。我们会采取严格措施保护，仅用于为您提供AI康复服务，未经您的单独同意，不会用于其他商业目的。</p>
                  <h4 className="text-gray-900 font-medium pt-2">四、您的权利</h4>
                  <p>您可以随时登录账户查阅、更正、删除您的个人信息，或撤回同意并注销账户。撤回同意不影响此前已进行的处理的合法性。</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100">
              <Button
                onClick={() => {
                  setAgreed(true)
                  setShowAgreement(null)
                }}
                className="w-full h-11 rounded-xl bg-[#2066A2] hover:bg-[#1a5585]"
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
