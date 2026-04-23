"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Html, Line } from "@react-three/drei"
import * as THREE from "three"

interface KneeJointProps {
  flexionAngle: number // 屈曲角度 0-140
  valgusAngle: number // 外翻角度 -15 to 15
  rotationAngle: number // 旋转角度 -20 to 20
  isAnimating: boolean
}

function BoneSegment({ 
  position, 
  rotation, 
  length, 
  radius, 
  color 
}: { 
  position: [number, number, number]
  rotation: [number, number, number]
  length: number
  radius: number
  color: string
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* 骨骼主体 */}
      <mesh>
        <cylinderGeometry args={[radius, radius * 0.9, length, 16]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>
      {/* 骨骼端部 */}
      <mesh position={[0, length / 2, 0]}>
        <sphereGeometry args={[radius * 1.2, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[0, -length / 2, 0]}>
        <sphereGeometry args={[radius * 1.1, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>
    </group>
  )
}

function KneeJoint({ flexionAngle, valgusAngle, rotationAngle, isAnimating }: KneeJointProps) {
  const groupRef = useRef<THREE.Group>(null)
  const tibiaRef = useRef<THREE.Group>(null)
  const targetFlexion = useRef(flexionAngle)
  const currentFlexion = useRef(flexionAngle)

  // 更新目标角度
  targetFlexion.current = flexionAngle

  useFrame((_, delta) => {
    if (groupRef.current && isAnimating) {
      groupRef.current.rotation.y += delta * 0.3
    }

    // 平滑过渡到目标角度
    if (tibiaRef.current) {
      const diff = targetFlexion.current - currentFlexion.current
      currentFlexion.current += diff * delta * 3

      // 将角度转换为弧度并应用
      const flexRad = THREE.MathUtils.degToRad(-currentFlexion.current)
      const valgusRad = THREE.MathUtils.degToRad(valgusAngle)
      const rotRad = THREE.MathUtils.degToRad(rotationAngle)

      tibiaRef.current.rotation.x = flexRad
      tibiaRef.current.rotation.z = valgusRad
      tibiaRef.current.rotation.y = rotRad
    }
  })

  // 计算参考角度线的端点
  const angleLinePoints = useMemo(() => {
    const flexRad = THREE.MathUtils.degToRad(-flexionAngle)
    const lineLength = 1.5
    const startPoint = new THREE.Vector3(0, -0.3, 0)
    const endPoint = new THREE.Vector3(
      0,
      -0.3 - lineLength * Math.cos(flexRad),
      lineLength * Math.sin(flexRad)
    )
    return [startPoint, endPoint]
  }, [flexionAngle])

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      {/* 股骨 (大腿骨) */}
      <BoneSegment
        position={[0, 1.2, 0]}
        rotation={[0, 0, 0]}
        length={2}
        radius={0.18}
        color="#F5E6D3"
      />

      {/* 膝关节 */}
      <group position={[0, 0, 0]}>
        {/* 髌骨 (膝盖骨) */}
        <mesh position={[0, 0, 0.2]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#E8D4C4" roughness={0.5} metalness={0.1} />
        </mesh>
        
        {/* 关节面 */}
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[0.22, 0.08, 8, 24]} />
          <meshStandardMaterial 
            color="#C4E0FF" 
            roughness={0.2} 
            metalness={0.3}
            transparent
            opacity={0.7}
          />
        </mesh>

        {/* 胫骨组 (小腿骨) - 可旋转 */}
        <group ref={tibiaRef} position={[0, -0.3, 0]}>
          <BoneSegment
            position={[0, -1, 0]}
            rotation={[0, 0, 0]}
            length={1.8}
            radius={0.15}
            color="#F5E6D3"
          />
          
          {/* 腓骨 */}
          <BoneSegment
            position={[0.25, -0.9, 0]}
            rotation={[0, 0, 0.1]}
            length={1.6}
            radius={0.06}
            color="#EDE0D4"
          />
        </group>
      </group>

      {/* 角度参考线 */}
      <Line
        points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -1.5, 0)]}
        color="#94A3B8"
        lineWidth={1}
        dashed
        dashSize={0.1}
        gapSize={0.05}
      />
      <Line
        points={angleLinePoints}
        color="#2E86DE"
        lineWidth={2}
      />

      {/* 角度标签 */}
      <Html position={[0.5, -0.8, 0]} center>
        <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
          {flexionAngle.toFixed(1)}°
        </div>
      </Html>
    </group>
  )
}

function AngleArc({ angle, radius, color }: { angle: number; radius: number; color: string }) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = []
    const startAngle = -Math.PI / 2
    const endAngle = startAngle - THREE.MathUtils.degToRad(angle)
    const segments = Math.max(Math.abs(angle) / 5, 8)
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const a = startAngle + (endAngle - startAngle) * t
      pts.push(new THREE.Vector3(0, radius * Math.sin(a), radius * Math.cos(a)))
    }
    return pts
  }, [angle, radius])

  return <Line points={points} color={color} lineWidth={3} />
}

interface Knee3DModelProps {
  flexionAngle: number
  valgusAngle: number
  rotationAngle: number
  isAnimating?: boolean
  className?: string
}

export default function Knee3DModel({ 
  flexionAngle, 
  valgusAngle, 
  rotationAngle,
  isAnimating = false,
  className = ""
}: Knee3DModelProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [3, 0, 3], fov: 45 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-3, 3, -3]} intensity={0.4} />
        <pointLight position={[0, -2, 2]} intensity={0.3} color="#87CEEB" />
        
        <KneeJoint 
          flexionAngle={flexionAngle}
          valgusAngle={valgusAngle}
          rotationAngle={rotationAngle}
          isAnimating={isAnimating}
        />
        
        {/* 角度弧线 */}
        <group position={[0, 0.2, 0]}>
          <AngleArc angle={flexionAngle} radius={0.5} color="#2E86DE" />
        </group>
        
        <OrbitControls 
          enablePan={false}
          minDistance={2}
          maxDistance={6}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI * 3 / 4}
        />
      </Canvas>
    </div>
  )
}
