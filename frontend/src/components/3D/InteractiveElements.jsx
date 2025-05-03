import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, useTexture } from '@react-three/drei'
import * as THREE from 'three'

// Interactive button for 3D scene
export const InteractiveButton = ({ 
  position = [0, 0, 0], 
  scale = [1, 0.3, 0.1], 
  color = '#4080ff', 
  hoverColor = '#60a0ff', 
  text = 'Button',
  onClick = () => {}
}) => {
  const mesh = useRef()
  const [hovered, setHovered] = useState(false)
  
  // Animation
  useFrame((state) => {
    if (mesh.current) {
      // Subtle floating animation
      mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.02
      
      // Scale when hovered
      mesh.current.scale.x = THREE.MathUtils.lerp(
        mesh.current.scale.x, 
        scale[0] * (hovered ? 1.1 : 1), 
        0.1
      )
      mesh.current.scale.y = THREE.MathUtils.lerp(
        mesh.current.scale.y, 
        scale[1] * (hovered ? 1.1 : 1), 
        0.1
      )
    }
  })
  
  return (
    <group position={position}>
      <mesh
        ref={mesh}
        scale={scale}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <roundedBoxGeometry args={[1, 1, 1, 4, 0.1]} />
        <meshStandardMaterial 
          color={hovered ? hoverColor : color} 
          metalness={0.5} 
          roughness={0.2}
          emissive={hovered ? hoverColor : color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
        />
      </mesh>
      
      <Text
        position={[0, 0, scale[2] + 0.01]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
      >
        {text}
      </Text>
    </group>
  )
}

// Interactive card for 3D scene
export const InteractiveCard = ({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  scale = [1, 1.5, 0.1], 
  color = '#ffffff', 
  title = 'Card Title',
  content = 'Card content goes here',
  image = null
}) => {
  const mesh = useRef()
  const [hovered, setHovered] = useState(false)
  
  // Load texture if image is provided
  const texture = image ? useTexture(image) : null
  
  // Animation
  useFrame((state) => {
    if (mesh.current) {
      // Subtle floating animation
      mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.03
      
      // Rotate slightly when hovered
      mesh.current.rotation.y = THREE.MathUtils.lerp(
        mesh.current.rotation.y, 
        rotation[1] + (hovered ? 0.2 : 0), 
        0.1
      )
    }
  })
  
  return (
    <group position={position} rotation={rotation}>
      {/* Card background */}
      <mesh
        ref={mesh}
        scale={scale}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <roundedBoxGeometry args={[1, 1, 1, 4, 0.1]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.1} 
          roughness={0.2}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Card image if provided */}
      {image && (
        <mesh position={[0, scale[1] * 0.25, scale[2] + 0.01]} scale={[scale[0] * 0.8, scale[1] * 0.4, 0.01]}>
          <planeGeometry />
          <meshBasicMaterial map={texture} transparent />
        </mesh>
      )}
      
      {/* Card title */}
      <Text
        position={[0, scale[1] * 0.0, scale[2] + 0.01]}
        fontSize={0.15}
        color="#000000"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
        maxWidth={scale[0] * 0.8}
      >
        {title}
      </Text>
      
      {/* Card content */}
      <Text
        position={[0, -scale[1] * 0.25, scale[2] + 0.01]}
        fontSize={0.1}
        color="#333333"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Regular.woff"
        maxWidth={scale[0] * 0.8}
      >
        {content}
      </Text>
    </group>
  )
}

// Interactive icon for 3D scene
export const InteractiveIcon = ({ 
  position = [0, 0, 0], 
  scale = 0.5, 
  color = '#4080ff', 
  hoverColor = '#60a0ff',
  icon = 'phone', // 'phone', 'email', 'location', 'calendar'
  onClick = () => {}
}) => {
  const mesh = useRef()
  const [hovered, setHovered] = useState(false)
  
  // Animation
  useFrame((state) => {
    if (mesh.current) {
      // Subtle floating animation
      mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.02
      
      // Scale when hovered
      mesh.current.scale.x = THREE.MathUtils.lerp(
        mesh.current.scale.x, 
        scale * (hovered ? 1.2 : 1), 
        0.1
      )
      mesh.current.scale.y = THREE.MathUtils.lerp(
        mesh.current.scale.y, 
        scale * (hovered ? 1.2 : 1), 
        0.1
      )
      mesh.current.scale.z = THREE.MathUtils.lerp(
        mesh.current.scale.z, 
        scale * (hovered ? 1.2 : 1), 
        0.1
      )
    }
  })
  
  // Render different icon shapes based on type
  const renderIcon = () => {
    switch (icon) {
      case 'phone':
        return <torusGeometry args={[0.3, 0.1, 16, 32]} />
      case 'email':
        return <boxGeometry args={[0.6, 0.4, 0.1]} />
      case 'location':
        return <coneGeometry args={[0.3, 0.6, 16]} />
      case 'calendar':
        return <boxGeometry args={[0.5, 0.5, 0.1]} />
      default:
        return <sphereGeometry args={[0.3, 16, 16]} />
    }
  }
  
  return (
    <mesh
      ref={mesh}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {renderIcon()}
      <meshStandardMaterial 
        color={hovered ? hoverColor : color} 
        metalness={0.5} 
        roughness={0.2}
        emissive={hovered ? hoverColor : color}
        emissiveIntensity={hovered ? 0.5 : 0.2}
      />
    </mesh>
  )
}
