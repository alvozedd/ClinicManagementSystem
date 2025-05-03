import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

// Simple rotating box component
function Box(props) {
  const meshRef = useRef()

  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.5
    meshRef.current.rotation.y += delta * 0.2
  })

  return (
    <mesh
      {...props}
      ref={meshRef}
    >
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#4080ff" metalness={0.5} roughness={0.2} />
    </mesh>
  )
}

// Simple scene with a box
export default function SimpleScene() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000830' }}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Box position={[0, 0, 0]} />

        {/* Add sphere to confirm 3D is working */}
        <mesh position={[0, 3, 0]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#ff4080" emissive="#ff4080" emissiveIntensity={0.5} />
        </mesh>
      </Canvas>
    </div>
  )
}
