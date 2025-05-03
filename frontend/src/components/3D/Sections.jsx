import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, useTexture } from '@react-three/drei'
import * as THREE from 'three'

// 3D elements for each section
export const Sections = ({ sections, scroll }) => {
  return (
    <group>
      {sections.map((section, index) => (
        <Section 
          key={index} 
          index={index} 
          title={section.title}
          type={section.type}
          scroll={scroll}
          totalSections={sections.length}
        />
      ))}
    </group>
  )
}

// Individual section 3D elements
const Section = ({ index, title, type, scroll, totalSections }) => {
  const group = useRef()
  
  // Different 3D elements based on section type
  useFrame((state, delta) => {
    if (!group.current) return
    
    // Calculate visibility based on scroll position
    const scrollOffset = scroll.offset
    const sectionStart = index / totalSections
    const sectionEnd = (index + 1) / totalSections
    const sectionVisibility = Math.max(0, 
      1 - Math.abs((scrollOffset - (sectionStart + (sectionEnd - sectionStart) / 2)) * totalSections * 2)
    )
    
    // Position based on section index
    const yPos = -index * 2
    group.current.position.y = yPos
    
    // Scale and opacity based on visibility
    group.current.scale.setScalar(0.8 + sectionVisibility * 0.2)
    group.current.children.forEach(child => {
      if (child.material) {
        child.material.opacity = sectionVisibility
      }
    })
    
    // Rotation animation
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
  })
  
  // Different 3D elements based on section type
  const renderSectionElement = () => {
    switch (type) {
      case 'hero':
        return <HeroSection title={title} />
      case 'services':
        return <ServicesSection title={title} />
      case 'contact':
        return <ContactSection title={title} />
      case 'booking':
        return <BookingSection title={title} />
      default:
        return <DefaultSection title={title} />
    }
  }
  
  return (
    <group ref={group}>
      {renderSectionElement()}
    </group>
  )
}

// Hero section 3D elements
const HeroSection = ({ title }) => {
  const mesh = useRef()
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
      mesh.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.2) * 0.1
    }
  })
  
  return (
    <group>
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
        material-transparent={true}
      >
        {title}
      </Text>
      
      <mesh ref={mesh} position={[0, -0.5, 0]}>
        <torusKnotGeometry args={[0.7, 0.2, 128, 32]} />
        <meshStandardMaterial 
          color="#4080ff" 
          metalness={0.5} 
          roughness={0.2} 
          transparent 
          opacity={0.8}
        />
      </mesh>
    </group>
  )
}

// Services section 3D elements
const ServicesSection = ({ title }) => {
  const group = useRef()
  
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })
  
  // Create multiple floating cubes
  const cubes = Array.from({ length: 5 }).map((_, i) => {
    const angle = (i / 5) * Math.PI * 2
    const radius = 1.5
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    
    return (
      <mesh key={i} position={[x, 0, z]} scale={[0.3, 0.3, 0.3]}>
        <boxGeometry />
        <meshStandardMaterial 
          color={new THREE.Color().setHSL(i / 5, 0.8, 0.5)} 
          transparent 
          opacity={0.8}
        />
      </mesh>
    )
  })
  
  return (
    <group>
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
        material-transparent={true}
      >
        {title}
      </Text>
      
      <group ref={group}>
        {cubes}
      </group>
    </group>
  )
}

// Contact section 3D elements
const ContactSection = ({ title }) => {
  const sphere = useRef()
  
  useFrame((state) => {
    if (sphere.current) {
      sphere.current.rotation.y = state.clock.elapsedTime * 0.2
      sphere.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
    }
  })
  
  return (
    <group>
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
        material-transparent={true}
      >
        {title}
      </Text>
      
      <mesh ref={sphere} position={[0, -0.3, 0]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial 
          color="#00a0ff" 
          metalness={0.2} 
          roughness={0.1} 
          transparent 
          opacity={0.6}
          wireframe
        />
      </mesh>
    </group>
  )
}

// Booking section 3D elements
const BookingSection = ({ title }) => {
  const group = useRef()
  
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
    }
  })
  
  // Create a calendar-like structure
  const calendarCells = Array.from({ length: 16 }).map((_, i) => {
    const row = Math.floor(i / 4)
    const col = i % 4
    const x = (col - 1.5) * 0.4
    const y = (row - 1.5) * 0.4
    
    return (
      <mesh key={i} position={[x, -y - 0.3, 0]} scale={[0.18, 0.18, 0.05]}>
        <boxGeometry />
        <meshStandardMaterial 
          color={i % 7 === 0 ? "#ff4080" : "#ffffff"} 
          transparent 
          opacity={0.7}
        />
      </mesh>
    )
  })
  
  return (
    <group>
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
        material-transparent={true}
      >
        {title}
      </Text>
      
      <group ref={group}>
        {calendarCells}
      </group>
    </group>
  )
}

// Default section 3D elements
const DefaultSection = ({ title }) => {
  const mesh = useRef()
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })
  
  return (
    <group>
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
        material-transparent={true}
      >
        {title}
      </Text>
      
      <mesh ref={mesh} position={[0, -0.5, 0]}>
        <octahedronGeometry args={[0.7]} />
        <meshStandardMaterial 
          color="#40a0ff" 
          metalness={0.3} 
          roughness={0.4} 
          transparent 
          opacity={0.7}
        />
      </mesh>
    </group>
  )
}
