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

          // Diagonal direction - combine x and y for diagonal movement
          float diagonal = (position.x + position.y) * 0.7071; // 0.7071 is 1/sqrt(2) for normalization

          // Very slow diagonal movement
          float diagonalTime = time * 0.1; // Slow down the animation even more

          // Create diagonal wave patterns with more pronounced diagonal movement
          float wave1 = sin(diagonal * 2.5 + diagonalTime * 0.4) * 0.5 + 0.5;
          float wave2 = sin(diagonal * 2.0 + diagonalTime * 0.3 + 2.0) * 0.5 + 0.5;
          float wave3 = sin(diagonal * 1.5 + diagonalTime * 0.2 + 4.0) * 0.5 + 0.5;
          float wave4 = sin(diagonal * 1.0 + diagonalTime * 0.1 + 6.0) * 0.5 + 0.5;

          // Add subtle random movement
          float randomMovement = random(position + time * 0.005) * 0.05; // Very subtle random movement
          wave1 += randomMovement;
          wave2 += randomMovement;
          wave3 += randomMovement;
          wave4 += randomMovement;

          // Define our colors for the sequence: blue -> dark -> green -> dark -> blue
          vec3 blue1 = vec3(0.0, 0.15, 0.4);      // First blue (deeper blue)
          vec3 blue2 = vec3(0.0, 0.2, 0.5);       // Second blue (brighter blue)
          vec3 darkColor = vec3(0.0, 0.02, 0.1);  // Dark (almost black)
          vec3 greenColor = vec3(0.0, 0.25, 0.2); // Green (more vibrant)

          // Create the color sequence using the waves
          // Each wave controls the transition between two colors
          vec3 color;

          // Start with dark color
          color = darkColor;

          // Transition: dark -> blue1
          color = mix(color, blue1, smoothstep(0.4, 0.6, wave1));

          // Transition: blue1 -> darkColor
          color = mix(color, darkColor, smoothstep(0.4, 0.6, wave2));

          // Transition: darkColor -> greenColor
          color = mix(color, greenColor, smoothstep(0.4, 0.6, wave3));

          // Transition: greenColor -> darkColor -> blue2
          color = mix(color, mix(darkColor, blue2, smoothstep(0.3, 0.7, wave1)), smoothstep(0.4, 0.6, wave4));

          // Add subtle vignette effect
          float vignette = length(position * 0.8);
          color = mix(color, darkColor, smoothstep(0.5, 1.5, vignette));

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

      // Update uniforms - use an extremely slow animation speed
      material.uniforms.time.value = elapsedTime * 0.15;

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
      className={`fixed inset-0 z-[-10] w-full h-full ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      style={{
        backgroundColor: '#000830',
        transition: 'opacity 0.5s ease-in-out',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        pointerEvents: 'none' // Allow clicks to pass through
      }}
    />
  );
}

export default ThreeBackground;
