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

    // Make sure renderer covers the entire screen
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    renderer.setClearColor(0x000830, 1);
    renderer.domElement.style.width = '100vw';
    renderer.domElement.style.height = '100vh';
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.margin = '0';
    renderer.domElement.style.padding = '0';

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

          // Create more complex noise patterns with slower movement
          float noise1 = sin(position.x * 3.0 + time * 0.3) * 0.15;
          float noise2 = sin(position.y * 4.0 + time * 0.2) * 0.15;
          float noise3 = sin(position.x * position.y * 2.0 + time * 0.4) * 0.1;

          // Random movement (reduced for more subtle effect)
          float randomMovement = random(position + time * 0.005) * 0.08;

          // Combined noise
          float noise = noise1 + noise2 + noise3 + randomMovement;

          // Define our colors - enhanced for better contrast and depth
          vec3 darkBlue = vec3(0.0, 0.03, 0.18);      // Deep dark blue
          vec3 mediumBlue = vec3(0.0, 0.12, 0.28);    // Medium blue
          vec3 brightBlue = vec3(0.0, 0.18, 0.38);    // Brighter blue
          vec3 greenAccent = vec3(0.0, 0.22, 0.2);    // Green accent
          vec3 black = vec3(0.0, 0.01, 0.08);         // Near black (not pure black)

          // Create complex color mixing
          float yPos = position.y + noise * 0.8;
          float xPos = position.x + noise * 0.8;

          // Base gradient - enhanced for better vertical transition
          float baseGradient = smoothstep(-1.2, 1.0, yPos);

          // Create patterns for different colors
          float pattern1 = sin(xPos * 4.0 + time * 0.3) * sin(yPos * 4.0 + time * 0.4);
          float pattern2 = cos(xPos * 3.0 - time * 0.3) * cos(yPos * 6.0 - time * 0.1);

          // Additional diagonal pattern for more depth
          float diagonalPattern = sin((xPos + yPos) * 3.0 + time * 0.2) * 0.5 + 0.5;

          // Mix colors based on patterns
          vec3 color = mix(black, darkBlue, baseGradient);
          color = mix(color, mediumBlue, smoothstep(0.3, 0.7, pattern1 + 0.5));
          color = mix(color, brightBlue, smoothstep(0.4, 0.6, pattern2 + 0.5));
          color = mix(color, greenAccent, smoothstep(0.7, 0.9, diagonalPattern * abs(pattern1 * pattern2)));

          // Add subtle vignette effect
          float vignette = 1.0 - smoothstep(0.5, 1.5, length(position));
          color = mix(color * 0.8, color, vignette);

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

      // Update renderer element styles
      renderer.domElement.style.width = '100vw';
      renderer.domElement.style.height = '100vh';
      renderer.domElement.style.position = 'fixed';
      renderer.domElement.style.left = '0';
      renderer.domElement.style.top = '0';
      renderer.domElement.style.margin = '0';
      renderer.domElement.style.padding = '0';
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
      className={`fixed inset-0 z-0 w-full h-full ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      style={{
        backgroundColor: '#000830',
        transition: 'opacity 0.5s ease-in-out',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        margin: 0,
        padding: 0,
        overflow: 'hidden'
      }}
    />
  );
}

export default ThreeBackground;
