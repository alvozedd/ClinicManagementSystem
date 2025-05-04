import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Professional Fluid Blue Wave Background

// Main animated component
const FluidWaves = () => {
  const mesh = useRef()

  // Create shader material for the fluid wave effect
  const material = useRef(
    new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(1, 1) },
        // Enhanced color palette for professional look
        primaryBlue: { value: new THREE.Color('#0033aa') },     // Deep blue
        secondaryBlue: { value: new THREE.Color('#0066cc') },   // Medium blue
        accentBlue: { value: new THREE.Color('#00aaff') },      // Bright blue
        highlightBlue: { value: new THREE.Color('#66ccff') },   // Light blue highlight
        darkBlack: { value: new THREE.Color('#000a20') }        // Very dark blue/black
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform float time;

        // Simplex noise functions
        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

        float snoise(vec2 v){
          const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                             -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy) );
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod(i, 289.0);
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
          + i.x + vec3(0.0, i1.x, 1.0 ));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                                dot(x12.zw,x12.zw)), 0.0);
          m = m*m ;
          m = m*m ;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        void main() {
          vUv = uv;
          vPosition = position;

          // Create subtle vertex displacement for fluid 3D effect
          float displacement = snoise(vec2(position.x * 0.03 + time * 0.05, position.y * 0.03 + time * 0.07)) * 0.2;
          displacement += snoise(vec2(position.x * 0.06 - time * 0.08, position.y * 0.06 + time * 0.06)) * 0.1;

          // Apply displacement with smooth time-based variation
          vec3 newPosition = position;
          newPosition.z += displacement * sin(time * 0.1 + position.x * 0.3) * 0.3;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        uniform vec3 primaryBlue;
        uniform vec3 secondaryBlue;
        uniform vec3 accentBlue;
        uniform vec3 highlightBlue;
        uniform vec3 darkBlack;
        varying vec2 vUv;
        varying vec3 vPosition;

        // Hash function for noise generation
        float hash(vec2 p) {
          p = fract(p * vec2(123.34, 456.21));
          p += dot(p, p + 45.32);
          return fract(p.x * p.y);
        }

        // Value noise function
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);

          // Cubic Hermite curve for smooth interpolation
          vec2 u = f * f * (3.0 - 2.0 * f);

          // Mix 4 corners
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));

          return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
        }

        // Fractional Brownian Motion for layered noise
        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 1.0;

          // Add several octaves of noise
          for (int i = 0; i < 5; i++) {
            value += amplitude * noise(p * frequency);
            frequency *= 2.0;
            amplitude *= 0.5;
          }

          return value;
        }

        // Create horizontal wave pattern with fluid motion
        float fluidWave(vec2 p, float speed, float scale, float yOffset) {
          // Create smooth horizontal wave pattern
          float wave = sin(p.x * 6.0 * scale + time * 0.2 * speed + yOffset) * 0.5 + 0.5;
          wave *= sin(p.x * 12.0 * scale - time * 0.15 * speed + yOffset * 2.0) * 0.5 + 0.5;

          // Add smooth vertical offset
          float verticalShift = sin(time * 0.1 + p.x * 1.5) * 0.03;

          // Create smooth transition
          return smoothstep(p.y - 0.05 - verticalShift, p.y + 0.05 - verticalShift, wave);
        }

        void main() {
          // Create coordinate system for waves
          vec2 uv = vUv;

          // Create multiple layers of fluid waves with different speeds and scales
          float wave1 = fluidWave(vec2(uv.x, uv.y * 1.2), 1.0, 1.0, 0.2);
          float wave2 = fluidWave(vec2(uv.x * 0.8, uv.y * 1.1), 0.7, 1.2, 0.5);
          float wave3 = fluidWave(vec2(uv.x * 1.2, uv.y * 0.9), 0.5, 0.8, 0.8);
          float wave4 = fluidWave(vec2(uv.x * 0.7, uv.y * 1.3), 0.9, 0.9, 0.1);

          // Create smooth distortion field
          float distortion = fbm(vec2(uv.x * 2.0 + time * 0.05, uv.y * 2.0 - time * 0.07)) * 0.2;

          // Combine waves with smooth transitions
          float waves = wave1 * 0.4 + wave2 * 0.3 + wave3 * 0.2 + wave4 * 0.1;
          waves = waves * (1.0 + distortion * 0.3);

          // Create smooth gradient based on position and waves
          vec3 baseColor = mix(darkBlack, primaryBlue, uv.y + sin(uv.x * 3.0 + time * 0.1) * 0.05);
          baseColor = mix(baseColor, secondaryBlue, waves * 0.8);

          // Add subtle highlights along wave edges
          float highlight = max(0.0, 1.0 - abs(waves - 0.5) * 8.0) * 0.5;
          highlight *= 0.9 + 0.1 * sin(time * 0.3);
          baseColor = mix(baseColor, highlightBlue, highlight);

          // Add horizontal light strips
          float strip1 = smoothstep(0.03, 0.0, abs(uv.y - 0.3 + sin(uv.x * 5.0 + time * 0.2) * 0.05));
          float strip2 = smoothstep(0.02, 0.0, abs(uv.y - 0.6 + sin(uv.x * 7.0 - time * 0.15) * 0.03));
          float strip3 = smoothstep(0.01, 0.0, abs(uv.y - 0.9 + sin(uv.x * 9.0 + time * 0.1) * 0.02));

          baseColor = mix(baseColor, accentBlue, strip1 * 0.3);
          baseColor = mix(baseColor, accentBlue, strip2 * 0.2);
          baseColor = mix(baseColor, accentBlue, strip3 * 0.1);

          // Add subtle vignette for depth
          float vignette = 1.0 - length((uv - 0.5) * vec2(1.8, 1.2));
          vignette = smoothstep(0.0, 0.8, vignette);
          baseColor *= vignette;

          // Add subtle color variation for depth
          float variation = fbm(vec2(uv.x * 10.0 + time * 0.05, uv.y * 10.0 - time * 0.07)) * 0.03;
          baseColor += vec3(variation) * highlightBlue * 0.1;

          gl_FragColor = vec4(baseColor, 1.0);
        }
      `,
      side: THREE.DoubleSide
    })
  )

  // Animation loop
  useFrame(({ clock }) => {
    if (mesh.current && material.current) {
      // Update time uniform for animation - slower for more professional look
      material.current.uniforms.time.value = clock.getElapsedTime() * 0.3
    }
  })

  return (
    <mesh
      ref={mesh}
      position={[0, 0, 0]}
    >
      <planeGeometry args={[20, 10, 64, 64]} />
      <primitive object={material.current} attach="material" />
    </mesh>
  )
}

// Main component
const WaveBackground = ({ qualityLevel = 'high' }) => {
  // Determine geometry detail based on quality
  const getGeometryDetail = () => {
    switch (qualityLevel) {
      case 'low': return [32, 32]
      case 'medium': return [48, 48]
      case 'high': return [64, 64]
      default: return [48, 48]
    }
  }

  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
      <color attach="background" args={['#000a20']} /> {/* Very dark blue/black background */}
      <FluidWaves />
    </Canvas>
  )
}

export default WaveBackground
