import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Professional Immersive Blue Wave Effect

// Main animated component
const ImmersiveWaves = () => {
  const mesh = useRef()

  // Create shader material for the immersive wave effect
  const material = useRef(
    new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(1, 1) },
        brightBlue: { value: new THREE.Color('#0080FF') },   // Bright blue
        deepBlue: { value: new THREE.Color('#0040C0') },     // Deep blue
        darkBlue: { value: new THREE.Color('#001060') },     // Dark blue background
        highlightColor: { value: new THREE.Color('#80CFFF') }, // Light blue highlight
        accentColor: { value: new THREE.Color('#40A0FF') }   // Medium blue accent
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

          // Create dynamic vertex displacement for 3D effect
          float displacement = snoise(vec2(position.x * 0.05 + time * 0.1, position.y * 0.05 + time * 0.2)) * 0.3;
          displacement += snoise(vec2(position.x * 0.1 - time * 0.15, position.y * 0.1 + time * 0.1)) * 0.2;

          // Apply displacement with time-based variation
          vec3 newPosition = position;
          newPosition.z += displacement * sin(time * 0.2 + position.x * 0.5) * 0.4;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        uniform vec3 brightBlue;
        uniform vec3 deepBlue;
        uniform vec3 darkBlue;
        uniform vec3 highlightColor;
        uniform vec3 accentColor;
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

        // Create sharp wave pattern with dynamic animation
        float sharpWave(vec2 p, float thickness, float speed, float scale) {
          // Create dynamic wave pattern with multiple frequencies
          float wave = sin(p.x * 10.0 * scale + time * 0.5 * speed) * 0.5 + 0.5;
          wave += sin(p.x * 20.0 * scale - time * 0.3 * speed) * 0.25 + 0.25;
          wave += sin(p.x * 30.0 * scale + time * 0.2 * speed) * 0.125 + 0.125;

          // Add time-based vertical shift for more dynamic movement
          float verticalShift = sin(time * 0.2 + p.x * 2.0) * 0.05;

          // Create sharp transition with dynamic thickness
          float pulseThickness = thickness * (1.0 + 0.2 * sin(time * 0.5));
          return smoothstep(p.y - pulseThickness - verticalShift, p.y - verticalShift, wave) -
                 smoothstep(p.y - verticalShift, p.y + pulseThickness - verticalShift, wave);
        }

        // Create energy pulse effect
        float energyPulse(vec2 uv, float time) {
          float pulse = 0.0;

          // Create multiple pulse centers that move over time
          for (int i = 0; i < 3; i++) {
            float t = time * 0.2 + float(i) * 2.0;
            vec2 center = vec2(
              0.5 + 0.3 * cos(t * 0.5 + float(i)),
              0.5 + 0.2 * sin(t * 0.7 + float(i) * 0.5)
            );

            float dist = length(uv - center);
            float radius = 0.1 + 0.05 * sin(time * 0.3 + float(i));
            pulse += smoothstep(radius, radius - 0.05, dist) * 0.3;
          }

          return pulse;
        }

        void main() {
          // Create coordinate system for waves
          vec2 uv = vUv;

          // Create multiple layers of sharp waves with different speeds and scales
          float wave1 = sharpWave(vec2(uv.x, uv.y * 1.5), 0.02, 1.0, 1.0);
          float wave2 = sharpWave(vec2(uv.x * 0.8 + 0.2, uv.y * 1.2 + 0.3), 0.015, 0.7, 0.8);
          float wave3 = sharpWave(vec2(uv.x * 1.2 - 0.1, uv.y * 0.9 - 0.2), 0.01, 1.3, 1.2);

          // Create dynamic distortion fields
          float distortion1 = fbm(vec2(uv.x * 3.0 + time * 0.1, uv.y * 3.0 - time * 0.15)) * 0.3;
          float distortion2 = fbm(vec2(uv.x * 5.0 - time * 0.2, uv.y * 5.0 + time * 0.25)) * 0.2;

          // Combine waves with dynamic distortion
          float waves = wave1 * 0.6 + wave2 * 0.3 + wave3 * 0.2;
          waves = waves * (1.0 - distortion1 * 0.5);

          // Create sharp edges with high contrast
          waves = smoothstep(0.2, 0.8, waves);

          // Add energy pulse effect
          float pulse = energyPulse(uv, time);

          // Create dynamic color gradient based on position and waves
          vec3 baseColor = mix(darkBlue, deepBlue, uv.y + sin(uv.x * 5.0 + time * 0.2) * 0.1);
          baseColor = mix(baseColor, brightBlue, waves * 1.5);

          // Add highlights along wave edges with time-based intensity
          float highlight = max(0.0, 1.0 - abs(waves - 0.5) * 10.0) * 0.8;
          highlight *= 0.8 + 0.2 * sin(time * 0.5);
          baseColor = mix(baseColor, highlightColor, highlight);

          // Add energy pulse glow
          baseColor = mix(baseColor, accentColor, pulse * 0.5);

          // Add subtle vignette
          float vignette = 1.0 - length((uv - 0.5) * vec2(1.8, 1.2));
          vignette = smoothstep(0.0, 0.8, vignette);
          baseColor *= vignette;

          // Add subtle color variation for depth
          float variation = fbm(vec2(uv.x * 15.0 + time * 0.1, uv.y * 15.0 - time * 0.15)) * 0.05;
          baseColor += vec3(variation) * highlightColor * 0.2;

          gl_FragColor = vec4(baseColor, 1.0);
        }
      `,
      side: THREE.DoubleSide
    })
  )

  // Animation loop
  useFrame(({ clock }) => {
    if (mesh.current && material.current) {
      // Update time uniform for animation
      material.current.uniforms.time.value = clock.getElapsedTime() * 0.4
    }
  })

  return (
    <mesh
      ref={mesh}
      position={[0, 0, 0]}
    >
      <planeGeometry args={[20, 10, 32, 32]} />
      <primitive object={material.current} attach="material" />
    </mesh>
  )
}

// Main component
const WaveBackground = ({ qualityLevel = 'high' }) => {
  // Determine geometry detail based on quality
  const getGeometryDetail = () => {
    switch (qualityLevel) {
      case 'low': return [16, 16]
      case 'medium': return [32, 32]
      case 'high': return [64, 64]
      default: return [32, 32]
    }
  }

  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
      <color attach="background" args={['#000830']} /> {/* Very dark blue background */}
      <ImmersiveWaves />
    </Canvas>
  )
}

export default WaveBackground
