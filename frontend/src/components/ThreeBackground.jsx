import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import '../styles/ThreeStyles.css';

function ThreeBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    // Safety check for window object (important for SSR/production builds)
    if (typeof window === 'undefined') return;

    // Scene setup
    const scene = new THREE.Scene();

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

        void main() {
          vec2 position = vUv * 2.0 - 1.0;
          float y = position.y;

          vec3 color1 = vec3(0.0, 0.03, 0.18); // Dark blue
          vec3 color2 = vec3(0.0, 0.05, 0.3);  // Medium blue

          float noise = sin(position.x * 5.0 + time) * 0.1 +
                        sin(position.y * 7.0 + time * 0.8) * 0.1;

          float gradient = smoothstep(0.0, 1.0, (y + 1.0) * 0.5 + noise);
          vec3 color = mix(color1, color2, gradient);

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

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Update uniforms
      material.uniforms.time.value = elapsedTime * 0.5;

      // Render
      renderer.render(scene, camera);

      // Continue animation loop
      requestAnimationFrame(animate);
    };

    animate();

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
