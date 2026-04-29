"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  ChevronLeft, 
  Share2, 
  Activity, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Zap, 
  User 
} from "lucide-react"
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts"

const PAD_MODES: Record<string, string> = {
  "1": "L1 温和放松模式",
  "2": "L2 基础舒缓模式",
  "3": "L3 中度深层模式",
  "4": "H1 强化疏通模式",
  "5": "H2 深度高压模式",
  "6": "H3 强效恢复模式"
}

const radarData = [
  { subject: "力量", A: 80, fullMark: 100 },
  { subject: "柔韧度", A: 65, fullMark: 100 },
  { subject: "稳定性", A: 75, fullMark: 100 },
  { subject: "疼痛控制", A: 50, fullMark: 100 },
  { subject: "关节活动度", A: 85, fullMark: 100 },
  { subject: "步态平衡", A: 70, fullMark: 100 },
]

const trendData = [
  { name: "10-01", score: 62 },
  { name: "10-05", score: 65 },
  { name: "10-10", score: 70 },
  { name: "10-15", score: 68 },
  { name: "10-20", score: 75 },
  { name: "10-25", score: 82 },
  { name: "10-27", score: 86 },
]

export default function ReportPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<{
    nickname?: string
    birthDate?: string
    gender?: string
    height?: string
    weight?: string
  }>({})

  // 模拟评估数据
  const preAssessment = { squatPainBefore: 4 }
  const postAssessment = { 
    squatPainAfter: 2, 
    globalFeeling: "感觉很轻松，肌肉没有紧绷感了。", 
    intensityFeeling: "力度刚刚好，适合我", 
    nextComputedLevel: 2, 
    nextAdvice: "下一次建议保持目前力度，重点关注肩关节。" 
  }

  useEffect(() => {
    const savedProfile = localStorage.getItem("profile")
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile))
    }
  }, [])

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return 65
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const calculateBMI = (height?: string, weight?: string) => {
    if (!height || !weight) return 22.8
    const h = parseFloat(height) / 100
    const w = parseFloat(weight)
    return (w / (h * h)).toFixed(1)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24 max-w-md mx-auto">
      {/* Header */}
      <header className="bg-white sticky top-0 z-10 px-4 h-14 flex items-center justify-between shadow-sm">
        <button 
          onClick={() => router.back()} 
          className="p-2 -ml-2 text-gray-700 active:bg-gray-100 rounded-full"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">个人报告</h1>
        <button className="p-2 -mr-2 text-gray-700 active:bg-gray-100 rounded-full">
          <Share2 size={20} />
        </button>
      </header>

      <div className="p-5 space-y-5">
        {/* Overall Score */}
        <div className="bg-[#2066A2] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="flex items-center justify-between relative z-10 mt-1">
            <div className="flex flex-col">
              <div className="text-blue-100 text-[13px] font-medium mb-1">本月综合评分</div>
              <div className="flex items-baseline gap-1.5 mb-2.5">
                <span className="text-[52px] font-bold leading-none tabular-nums tracking-tighter">85</span>
                <span className="text-[17px] text-blue-200 font-medium">分</span>
              </div>
              <div>
                <div className="text-[11px] bg-white/20 inline-flex px-2.5 py-1 rounded-md border border-white/20 items-center gap-1.5">
                  <span className="text-green-300 font-bold leading-none">↑</span> 
                  <span className="leading-none mt-0.5">较上周 +2 分</span>
                </div>
              </div>
            </div>
            
            <div className="w-[72px] h-[72px] rounded-full overflow-hidden border-[3px] border-white/20 bg-blue-500 shrink-0 shadow-xl self-end mb-2 flex items-center justify-center">
              <User className="w-8 h-8 text-white/60" />
            </div>
          </div>
        </div>

        {/* Personal Info Block */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-full -mr-4 -mt-4 pointer-events-none"></div>
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
              <span className="text-[14px] text-gray-500 flex items-center gap-1.5">
                <User size={14} className="text-[#2066A2]" /> 姓名
              </span>
              <span className="text-[15px] font-bold text-gray-900">{profile.nickname || "用户"}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
              <span className="text-[14px] text-gray-500">年龄</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[15px] font-bold text-gray-900">{calculateAge(profile.birthDate)}</span>
                <span className="text-[12px] font-normal text-gray-500">岁</span>
              </div>
            </div>
            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
              <span className="text-[14px] text-gray-500">身高</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[15px] font-bold text-gray-900">{profile.height || "175"}</span>
                <span className="text-[12px] font-normal text-gray-500">cm</span>
              </div>
            </div>
            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
              <span className="text-[14px] text-gray-500">体重</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[15px] font-bold text-gray-900">{profile.weight || "70"}</span>
                <span className="text-[12px] font-normal text-gray-500">kg</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-gray-500">BMI</span>
              <span className="text-[15px] font-bold text-gray-900">{calculateBMI(profile.height, profile.weight)}</span>
            </div>
          </div>
        </div>

        {/* Therapy Effect Summary */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-[15px] font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Zap size={18} className="text-yellow-500" /> 本次理疗效果总结
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
              <div className="text-[11px] text-gray-500 mb-1">理疗前疼痛</div>
              <div className="text-xl font-bold text-gray-900">
                {preAssessment.squatPainBefore} <span className="text-sm font-normal text-gray-500">分</span>
              </div>
            </div>
            <div className="bg-green-50/50 p-3 rounded-xl border border-green-100">
              <div className="text-[11px] text-gray-500 mb-1">理疗后疼痛</div>
              <div className="text-xl font-bold text-green-600">
                {postAssessment.squatPainAfter} <span className="text-sm font-normal text-gray-500">分</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3 mt-4 text-sm bg-gray-50 p-4 rounded-xl">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-gray-500">整体感受</span>
              <span className="font-medium text-gray-900 text-right text-xs max-w-[60%]">{postAssessment.globalFeeling}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-gray-500">强度反馈</span>
              <span className="font-medium text-gray-900">{postAssessment.intensityFeeling}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs">系统建议下一次参数</span>
              <span className="font-bold text-[#2066A2] text-xs">
                {PAD_MODES[postAssessment.nextComputedLevel.toString()]}
              </span>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500 bg-orange-50/50 p-2 rounded-lg border border-orange-100/50 flex gap-1.5 items-start">
            <AlertCircle size={14} className="text-orange-500 shrink-0 mt-0.5" />
            <span>{postAssessment.nextAdvice}</span>
          </div>
        </div>

        {/* Assessment Details */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-[16px] font-bold text-gray-800 mb-4 border-l-4 border-[#2066A2] pl-2 flex items-center justify-between">
            <span>评估详情</span>
          </h3>
          
          <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100 mb-4 flex items-center justify-between">
            <span className="text-[14px] text-gray-700 font-medium">肩关节活动度</span>
            <span className="text-[13px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded shadow-sm">正常</span>
          </div>

          <h4 className="text-[14px] font-bold text-gray-800 mb-2 mt-4 flex items-center gap-2">
            <Activity size={16} className="text-[#2066A2]" /> 各项指标分析
          </h4>
          <div className="h-[220px] w-full mt-2 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#6b7280", fontSize: 11 }} />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: "transparent" }} 
                />
                <Radar 
                  name="Score" 
                  dataKey="A" 
                  stroke="#2066A2" 
                  fill="#2066A2" 
                  fillOpacity={0.3} 
                  strokeWidth={2} 
                  isAnimationActive={false} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="bg-orange-50 rounded-xl p-3 border border-orange-100/50">
              <div className="text-[11px] text-orange-600 mb-1 flex items-center gap-1">
                <AlertCircle size={12}/> 需重点改善
              </div>
              <div className="text-sm font-bold text-gray-800">疼痛控制 (50分)</div>
            </div>
            <div className="bg-green-50 rounded-xl p-3 border border-green-100/50">
              <div className="text-[11px] text-green-600 mb-1 flex items-center gap-1">
                <CheckCircle2 size={12}/> 表现优秀
              </div>
              <div className="text-sm font-bold text-gray-800">关节活动度 (85分)</div>
            </div>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
          <h3 className="text-[15px] font-bold text-gray-800 mb-2 border-l-4 border-[#2066A2] pl-2">问题诊断</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            根据本次评估，您的膝关节屈伸活动度已恢复至正常水平。但
            <span className="text-red-500 font-medium">深蹲时仍伴有轻微疼痛（VAS评分4分）</span>
            ，髌骨运动轨迹存在轻度外移，下肢肌肉力量（特别是股内侧肌）仍显不足。
          </p>
        </div>

        {/* Historical Trends */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-[15px] font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity size={18} className="text-[#2066A2]" /> 历史趋势
          </h3>
          <div className="h-[180px] w-full mt-2 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: "#9ca3af" }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: "#9ca3af" }} 
                  width={30} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: "8px", 
                    border: "none", 
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)", 
                    fontSize: "12px" 
                  }}
                  itemStyle={{ color: "#2066A2", fontWeight: 600 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#2066A2" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: "#fff", stroke: "#2066A2", strokeWidth: 2 }} 
                  activeDot={{ r: 6 }} 
                  isAnimationActive={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommended Action */}
        <button 
          onClick={() => router.push("/exercises")}
          className="w-full bg-gray-900 text-white rounded-xl p-4 flex items-center justify-between shadow-lg active:scale-95 transition-all"
        >
          <div className="text-left">
            <div className="font-bold text-base mb-0.5">查看推荐训练方案</div>
            <div className="text-xs text-gray-400">基于本次评估为您定制</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <ArrowRight size={20} />
          </div>
        </button>
      </div>
    </div>
  )
}
