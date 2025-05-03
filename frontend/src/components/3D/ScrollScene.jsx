import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useScroll, ScrollControls, Scroll, Environment, PerspectiveCamera, Text3D, Center } from '@react-three/drei'
import * as THREE from 'three'
import { Sections } from './Sections'
import { FloatingParticles } from './FloatingParticles'
import { WaveBackground } from './WaveBackground'

// Main 3D scene component
export const ScrollScene = ({ sections = [] }) => {
  return (
    <div className="scroll-scene-container">
      <Canvas
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]} // Responsive pixel ratio
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh' }}
      >
        <color attach="background" args={['#000830']} />

        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <directionalLight position={[0, 5, 5]} intensity={0.5} />

        {/* Environment map for reflections */}
        <Environment preset="city" />

        {/* Scroll controls with damping */}
        <ScrollControls pages={sections.length} damping={0.25} distance={1}>
          {/* 3D content that will be affected by scroll */}
          <SceneContent sections={sections} />

          {/* HTML content that will be scrolled */}
          <Scroll html>
            {sections.map((section, index) => (
              <div
                key={index}
                className="section-container"
                style={{
                  height: '100vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  top: `${index * 100}vh`
                }}
              >
                <div className="section-content glass-card">
                  {section.content}
                </div>
              </div>
            ))}
          </Scroll>
        </ScrollControls>
      </Canvas>
    </div>
  )
}

// 3D content that responds to scrolling
const SceneContent = ({ sections }) => {
  const { viewport } = useThree()
  const scroll = useScroll()
  const camera = useRef()

  // Animation on scroll
  useFrame((state, delta) => {
    // Get current scroll position (0 to 1)
    const scrollOffset = scroll.offset

    // Calculate which section we're in
    const currentSection = Math.floor(scrollOffset * sections.length)
    const sectionProgress = (scrollOffset * sections.length) % 1

    // Update camera position based on scroll
    if (camera.current) {
      // Move camera along a path
      const targetY = -currentSection * 2 - sectionProgress * 2
      camera.current.position.y = THREE.MathUtils.lerp(
        camera.current.position.y,
        targetY,
        delta * 2
      )

      // Slight rotation for dynamic feel
      camera.current.rotation.x = THREE.MathUtils.lerp(
        camera.current.rotation.x,
        sectionProgress * 0.1,
        delta * 2
      )
    }
  })

  return (
    <>
      <PerspectiveCamera ref={camera} makeDefault position={[0, 0, 5]} fov={50} />

      {/* Background elements */}
      <WaveBackground />
      <FloatingParticles count={100} />

      {/* Section-specific 3D elements */}
      <Sections sections={sections} scroll={scroll} />
    </>
  )
}

export default ScrollScene
