import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Floating particles that add depth to the scene
export const FloatingParticles = ({ count = 100 }) => {
  const mesh = useRef()
  
  // Generate particles
  const [positions, colors, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      
      // Position particles in a volume
      positions[i3] = (Math.random() - 0.5) * 10
      positions[i3 + 1] = (Math.random() - 0.5) * 10
      positions[i3 + 2] = (Math.random() - 0.5) * 5
      
      // Blue to cyan colors
      colors[i3] = 0.1 + Math.random() * 0.2 // R - low
      colors[i3 + 1] = 0.5 + Math.random() * 0.5 // G - medium to high
      colors[i3 + 2] = 0.8 + Math.random() * 0.2 // B - high
      
      // Random sizes
      sizes[i] = Math.random() * 0.1 + 0.05
    }
    
    return [positions, colors, sizes]
  }, [count])
  
  // Animation
  useFrame((state, delta) => {
    if (mesh.current) {
      // Slow rotation
      mesh.current.rotation.x = state.clock.elapsedTime * 0.02
      mesh.current.rotation.y = state.clock.elapsedTime * 0.01
      
      // Update positions for floating effect
      const positions = mesh.current.geometry.attributes.position.array
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        
        // Subtle movement based on sine waves
        positions[i3 + 1] += Math.sin(state.clock.elapsedTime * 0.2 + i * 0.1) * 0.002
        positions[i3] += Math.cos(state.clock.elapsedTime * 0.2 + i * 0.1) * 0.002
      }
      
      mesh.current.geometry.attributes.position.needsUpdate = true
    }
  })
  
  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
