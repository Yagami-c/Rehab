"use client"

import { useRef, memo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"

interface KneeJointProps {
  flexionAngle: number
  isAnimating: boolean
}

const KneeJoint = memo(function KneeJoint({ flexionAngle, isAnimating }: KneeJointProps) {
  const groupRef = useRef<THREE.Group>(null)
  const tibiaRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current && isAnimating) {
      groupRef.current.rotation.y += delta * 0.4
    }
    if (tibiaRef.current) {
      tibiaRef.current.rotation.x = THREE.MathUtils.degToRad(-flexionAngle)
    }
  })

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      {/* Femur */}
      <group position={[0, 1.2, 0]}>
        <mesh>
          <cylinderGeometry args={[0.16, 0.14, 2, 8]} />
          <meshStandardMaterial color="#F5E6D3" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshStandardMaterial color="#F5E6D3" roughness={0.5} />
        </mesh>
        <mesh position={[0, -1, 0]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color="#F5E6D3" roughness={0.5} />
        </mesh>
      </group>
      
      {/* Knee joint */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[0.2, 0.06, 6, 12]} />
        <meshStandardMaterial color="#60A5FA" roughness={0.3} transparent opacity={0.6} />
      </mesh>

      {/* Tibia group */}
      <group ref={tibiaRef} position={[0, -0.2, 0]}>
        <mesh position={[0, -1, 0]}>
          <cylinderGeometry args={[0.14, 0.12, 1.8, 8]} />
          <meshStandardMaterial color="#F5E6D3" roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <sphereGeometry args={[0.16, 8, 8]} />
          <meshStandardMaterial color="#F5E6D3" roughness={0.5} />
        </mesh>
        <mesh position={[0, -1.9, 0]}>
          <sphereGeometry args={[0.14, 8, 8]} />
          <meshStandardMaterial color="#F5E6D3" roughness={0.5} />
        </mesh>
        {/* Fibula */}
        <mesh position={[0.2, -0.9, 0]} rotation={[0, 0, 0.08]}>
          <cylinderGeometry args={[0.05, 0.04, 1.5, 6]} />
          <meshStandardMaterial color="#EDE0D4" roughness={0.5} />
        </mesh>
      </group>

      {/* Angle indicator */}
      <mesh position={[0, 0, 0.3]}>
        <ringGeometry args={[0.4, 0.42, 16, 1, 0, THREE.MathUtils.degToRad(flexionAngle)]} />
        <meshBasicMaterial color="#22D3EE" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
})

interface Knee3DModelProps {
  flexionAngle?: number
  valgusAngle?: number
  rotationAngle?: number
  isAnimating?: boolean
  className?: string
}

function Knee3DModel({ flexionAngle = 45, isAnimating = false, className = "" }: Knee3DModelProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [2.5, 0, 2.5], fov: 50 }}
        gl={{ antialias: false, powerPreference: "low-power" }}
        dpr={1}
        frameloop={isAnimating ? "always" : "demand"}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 4, 4]} intensity={0.6} />
        <KneeJoint flexionAngle={flexionAngle} isAnimating={isAnimating} />
        <OrbitControls enablePan={false} minDistance={2} maxDistance={5} />
      </Canvas>
    </div>
  )
}

export default memo(Knee3DModel)
