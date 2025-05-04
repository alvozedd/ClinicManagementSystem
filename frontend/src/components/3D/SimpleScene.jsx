import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { WaveBackground } from './WaveBackground'
import { Text3D, Center, Environment } from '@react-three/drei'

// Floating text component
function FloatingText(props) {
  const meshRef = useRef()
  const { size } = useThree()

  // Gentle floating animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05
    }
  })

  return (
    <group ref={meshRef} {...props}>
      <Center>
        <Text3D
          font="/fonts/inter_regular.json"
          size={props.size || 0.5}
          height={0.1}
          curveSegments={12}
        >
          {props.children}
          <meshStandardMaterial
            color="#ffffff"
            emissive="#4080ff"
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </Text3D>
      </Center>
    </group>
  )
}

// Professional clinic scene with fluid wave background
export default function SimpleScene() {
  const [loaded, setLoaded] = useState(false)

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000a20' }}>
      {!loaded ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          color: '#ffffff',
          fontSize: '1.5rem'
        }}>
          Loading...
        </div>
      ) : (
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          {/* Environment lighting */}
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <spotLight position={[0, 10, 0]} intensity={0.5} angle={0.3} penumbra={1} />
          <Environment preset="city" />

          {/* Fluid wave background */}
          <WaveBackground />

          {/* Floating clinic name */}
          <FloatingText position={[0, 1, 0]} size={0.8}>
            UroHealth
          </FloatingText>

          {/* Subtitle */}
          <FloatingText position={[0, 0, 0]} size={0.4}>
            Central Ltd
          </FloatingText>

          {/* Tagline */}
          <FloatingText position={[0, -1, 0]} size={0.25}>
            Specialist Urological Care
          </FloatingText>
        </Canvas>
      )}
    </div>
  )
}
