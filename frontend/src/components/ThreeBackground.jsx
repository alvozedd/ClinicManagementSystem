import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import '../styles/ThreeStyles.css';

function ThreeBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    // Safety check for window object (important for SSR/production builds)
    if (typeof window === 'undefined') {
      console.error('Window object not available, Three.js cannot initialize');
      return;
    }

    console.log('Initializing Three.js background');

    // Scene setup
    const scene = new THREE.Scene();
    console.log('Three.js scene created');

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000830, 1);

    // Add renderer to DOM
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
      console.log('Three.js renderer added to DOM');
    } else {
      console.error('Mount ref is not available');
      return; // Exit early if mount ref is not available
    }

    // Create a simple background with blue gradient
    const geometry = new THREE.PlaneGeometry(20, 20);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        varying vec2 vUv;

        // Function to create a random value based on coordinates
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        void main() {
          vec2 position = vUv * 2.0 - 1.0;

          // Create more complex noise patterns
          float noise1 = sin(position.x * 3.0 + time * 0.5) * 0.15;
          float noise2 = sin(position.y * 4.0 + time * 0.3) * 0.15;
          float noise3 = sin(position.x * position.y * 2.0 + time * 0.7) * 0.1;

          // Random movement
          float randomMovement = random(position + time * 0.01) * 0.1;

          // Combined noise
          float noise = noise1 + noise2 + noise3 + randomMovement;

          // Define our colors
          vec3 darkBlue = vec3(0.0, 0.03, 0.18);    // Dark blue
          vec3 mediumBlue = vec3(0.0, 0.15, 0.3);   // Medium blue
          vec3 brightBlue = vec3(0.0, 0.2, 0.4);    // Brighter blue
          vec3 greenAccent = vec3(0.0, 0.25, 0.2);  // Green accent
          vec3 black = vec3(0.0, 0.0, 0.0);         // Black

          // Create complex color mixing
          float yPos = position.y + noise;
          float xPos = position.x + noise;

          // Base gradient
          float baseGradient = smoothstep(-1.0, 1.0, yPos);

          // Create patterns for different colors
          float pattern1 = sin(xPos * 5.0 + time) * sin(yPos * 5.0 + time * 0.7);
          float pattern2 = cos(xPos * 3.0 - time * 0.5) * cos(yPos * 7.0 - time * 0.2);

          // Mix colors based on patterns
          vec3 color = mix(black, darkBlue, baseGradient);
          color = mix(color, mediumBlue, smoothstep(0.3, 0.7, pattern1 + 0.5));
          color = mix(color, brightBlue, smoothstep(0.4, 0.6, pattern2 + 0.5));
          color = mix(color, greenAccent, smoothstep(0.7, 0.9, abs(pattern1 * pattern2)));

          gl_FragColor = vec4(color, 1.0);
        }
      `
    });

    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    const clock = new THREE.Clock();
    console.log('Three.js animation clock started');

    let frameCount = 0;
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Update uniforms
      material.uniforms.time.value = elapsedTime * 0.5;

      // Render
      renderer.render(scene, camera);

      // Log every 100 frames to avoid console spam
      frameCount++;
      if (frameCount === 1 || frameCount % 100 === 0) {
        console.log(`Three.js animation frame ${frameCount}, time: ${elapsedTime.toFixed(2)}s`);
      }

      // Continue animation loop
      requestAnimationFrame(animate);
    };

    animate();
    console.log('Three.js animation loop started');

    // Cleanup
    return () => {
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        try {
          mountRef.current.removeChild(renderer.domElement);
        } catch (e) {
          console.error('Error removing renderer:', e);
        }
      }
      window.removeEventListener('resize', handleResize);

      // Dispose resources
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Set loaded state after component mounts
    setIsLoaded(true);
    console.log('ThreeBackground component mounted');
  }, []);

  return (
    <div
      ref={mountRef}
      className={`absolute inset-0 z-0 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      style={{
        backgroundColor: '#000830',
        transition: 'opacity 0.5s ease-in-out'
      }}
    />
  );
}

export default ThreeBackground;
