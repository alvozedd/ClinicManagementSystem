import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const StandardBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000c30); // Dark blue background

    // Create a camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Clear any existing canvas
    if (mountRef.current.childNodes.length > 0) {
      mountRef.current.removeChild(mountRef.current.childNodes[0]);
    }

    // Append renderer to the DOM
    mountRef.current.appendChild(renderer.domElement);

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 4000; // Increased particle count for better effect without spheres

    // Create positions for particles
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // Define colors
    const color1 = new THREE.Color(0x0a4da9); // Medium blue
    const color2 = new THREE.Color(0x00b894); // Teal/green
    const color3 = new THREE.Color(0x0984e3); // Bright blue

    // Create particles with random positions and colors
    for (let i = 0; i < particleCount; i++) {
      // Create particles in a spherical distribution
      const radius = 50 + Math.random() * 50; // Radius between 50 and 100
      const theta = Math.random() * Math.PI * 2; // Random angle around y-axis
      const phi = Math.acos((Math.random() * 2) - 1); // Random angle from y-axis

      // Convert spherical to cartesian coordinates
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta); // x
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta); // y
      positions[i * 3 + 2] = radius * Math.cos(phi); // z

      // Vary particle sizes for more depth - smaller particles for a more subtle effect
      sizes[i] = Math.random() * 0.3 + 0.05;

      // Color - randomly choose between our three colors with bias toward blue
      let color;
      const colorRand = Math.random();
      if (colorRand < 0.5) { // 50% chance of blue
        color = color1;
      } else if (colorRand < 0.75) { // 25% chance of teal
        color = color2;
      } else { // 25% chance of bright blue
        color = color3;
      }

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Create custom shader material for better-looking particles
    const particlesMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pixelRatio: { value: window.devicePixelRatio }
      },
      vertexShader: `
        uniform float time;
        uniform float pixelRatio;
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;

        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          // Create circular particles
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;

          // Soft edge
          float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    // Create the particle system
    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);

    // Using only the particle system for a cleaner look
    const spheres = []; // Empty array to avoid errors in cleanup

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    let animationId;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const currentTime = Date.now() * 0.001; // Current time in seconds

      // Update particle shader time uniform
      particlesMaterial.uniforms.time.value = currentTime;

      // Rotate particle system very slowly with minimal oscillation
      particleSystem.rotation.x = Math.sin(currentTime * 0.02) * 0.05;
      particleSystem.rotation.y = Math.cos(currentTime * 0.03) * 0.05;

      // No sphere animation - spheres have been removed

      // Slowly rotate camera around the scene with very subtle motion
      const cameraRadius = 45;
      const cameraSpeed = 0.02; // Slower speed for more subtle movement
      camera.position.x = Math.sin(currentTime * cameraSpeed) * cameraRadius;
      camera.position.z = Math.cos(currentTime * cameraSpeed) * cameraRadius;
      camera.position.y = Math.sin(currentTime * cameraSpeed * 0.3) * 5; // Very slight up/down motion
      camera.lookAt(0, 0, 0);

      // Render scene
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);

      // Dispose geometries and materials
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      scene.remove(particleSystem);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="canvas-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        overflow: 'hidden',
        pointerEvents: 'none' // Allow clicking through the background
      }}
    />
  );
};

export default StandardBackground;
