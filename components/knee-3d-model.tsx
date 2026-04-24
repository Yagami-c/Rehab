"use client"

import { useRef, useMemo, memo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Line } from "@react-three/drei"
import * as THREE from "three"

interface KneeJointProps {
  flexionAngle: number
  valgusAngle: number
  rotationAngle: number
  isAnimating: boolean
}

const BoneSegment = memo(function BoneSegment({ 
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
      <mesh>
        <cylinderGeometry args={[radius, radius * 0.9, length, 12]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[0, length / 2, 0]}>
        <sphereGeometry args={[radius * 1.2, 12, 12]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[0, -length / 2, 0]}>
        <sphereGeometry args={[radius * 1.1, 12, 12]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>
    </group>
  )
})

const KneeJoint = memo(function KneeJoint({ flexionAngle, valgusAngle, rotationAngle, isAnimating }: KneeJointProps) {
  const groupRef = useRef<THREE.Group>(null)
  const tibiaRef = useRef<THREE.Group>(null)
  const currentFlexion = useRef(flexionAngle)

  useFrame((_, delta) => {
    if (groupRef.current && isAnimating) {
      groupRef.current.rotation.y += delta * 0.3
    }

    if (tibiaRef.current) {
      const diff = flexionAngle - currentFlexion.current
      currentFlexion.current += diff * delta * 3

      tibiaRef.current.rotation.x = THREE.MathUtils.degToRad(-currentFlexion.current)
      tibiaRef.current.rotation.z = THREE.MathUtils.degToRad(valgusAngle)
      tibiaRef.current.rotation.y = THREE.MathUtils.degToRad(rotationAngle)
    }
  })

  const angleLinePoints = useMemo(() => {
    const flexRad = THREE.MathUtils.degToRad(-flexionAngle)
    const lineLength = 1.5
    return [
      new THREE.Vector3(0, -0.3, 0),
      new THREE.Vector3(0, -0.3 - lineLength * Math.cos(flexRad), lineLength * Math.sin(flexRad))
    ]
  }, [flexionAngle])

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      <BoneSegment position={[0, 1.2, 0]} rotation={[0, 0, 0]} length={2} radius={0.18} color="#F5E6D3" />
      
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0, 0.2]}>
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshStandardMaterial color="#E8D4C4" roughness={0.5} metalness={0.1} />
        </mesh>
        
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[0.22, 0.08, 8, 16]} />
          <meshStandardMaterial color="#C4E0FF" roughness={0.2} metalness={0.3} transparent opacity={0.7} />
        </mesh>

        <group ref={tibiaRef} position={[0, -0.3, 0]}>
          <BoneSegment position={[0, -1, 0]} rotation={[0, 0, 0]} length={1.8} radius={0.15} color="#F5E6D3" />
          <BoneSegment position={[0.25, -0.9, 0]} rotation={[0, 0, 0.1]} length={1.6} radius={0.06} color="#EDE0D4" />
        </group>
      </group>

      <Line
        points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -1.5, 0)]}
        color="#94A3B8"
        lineWidth={1}
        dashed
        dashSize={0.1}
        gapSize={0.05}
      />
      <Line points={angleLinePoints} color="#2E86DE" lineWidth={2} />
    </group>
  )
})

const AngleArc = memo(function AngleArc({ angle, color }: { angle: number; color: string }) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = []
    const startAngle = -Math.PI / 2
    const endAngle = startAngle - THREE.MathUtils.degToRad(angle)
    const segments = Math.max(Math.abs(angle) / 10, 6)
    const radius = 0.5
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const a = startAngle + (endAngle - startAngle) * t
      pts.push(new THREE.Vector3(0, radius * Math.sin(a), radius * Math.cos(a)))
    }
    return pts
  }, [angle])

  return <Line points={points} color={color} lineWidth={3} />
})

interface Knee3DModelProps {
  flexionAngle: number
  valgusAngle: number
  rotationAngle: number
  isAnimating?: boolean
  className?: string
}

function Knee3DModel({ 
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
        gl={{ antialias: false, powerPreference: "low-power" }}
        dpr={[1, 1.5]}
        frameloop={isAnimating ? "always" : "demand"}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-3, 3, -3]} intensity={0.3} />
        
        <KneeJoint 
          flexionAngle={flexionAngle}
          valgusAngle={valgusAngle}
          rotationAngle={rotationAngle}
          isAnimating={isAnimating}
        />
        
        <group position={[0, 0.2, 0]}>
          <AngleArc angle={flexionAngle} color="#2E86DE" />
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

export default memo(Knee3DModel)
