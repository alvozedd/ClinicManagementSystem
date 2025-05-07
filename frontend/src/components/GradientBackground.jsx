import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const GradientBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Initialize Three.js scene
    const scene = new THREE.Scene();

    // Create a camera
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 1;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Clear any existing canvas
    if (mountRef.current.childNodes.length > 0) {
      mountRef.current.removeChild(mountRef.current.childNodes[0]);
    }

    // Append renderer to the DOM
    mountRef.current.appendChild(renderer.domElement);

    // Create a full-screen quad
    const geometry = new THREE.PlaneGeometry(2, 2);

    // Create shader material for gradient animation
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      },
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec2 resolution;
        uniform float time;
        varying vec2 vUv;

        // Colors for our gradient - more vibrant like MILWAM site
        vec3 color1 = vec3(0.0, 0.0, 0.15);     // Deep blue/black
        vec3 color2 = vec3(0.0, 0.3, 0.7);      // Vibrant blue
        vec3 color3 = vec3(0.0, 0.5, 0.3);      // Vibrant green
        vec3 color4 = vec3(0.0, 0.05, 0.25);    // Deep blue with hint of purple

        // Noise function for subtle animation
        float noise(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        void main() {
          // Normalized coordinates
          vec2 st = gl_FragCoord.xy / resolution.xy;

          // Create a gradient based on position and time
          float t = time * 0.05; // Slower animation

          // Create diagonal gradient similar to MILWAM site
          float angle = 0.85; // Steeper diagonal angle
          vec2 dir = vec2(cos(angle), sin(angle));
          float d = dot(st - 0.5, dir) * 0.5 + 0.5;

          // Add subtle movement to the gradient
          d += sin(t * 0.15) * 0.03; // More subtle movement

          // Add some noise for texture
          float noise1 = noise(st * 5.0 + t * 0.3);
          float noise2 = noise(st * 10.0 - t * 0.2);

          // Create a more dramatic gradient like MILWAM site
          vec3 color;

          // Left side (blue)
          if (d < 0.4) {
            color = mix(color4, color2, smoothstep(0.0, 0.4, d + noise1 * 0.03));
          }
          // Middle (transition)
          else if (d < 0.6) {
            color = mix(color2, color3, smoothstep(0.4, 0.6, d));
          }
          // Right side (green)
          else {
            color = mix(color3, color1, smoothstep(0.6, 1.0, d + noise2 * 0.03));
          }

          // Add subtle vignette effect
          float vignette = smoothstep(0.7, 0.2, length(st - 0.5));
          color = mix(color, color4 * 0.7, 1.0 - vignette);

          // Output final color
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.DoubleSide
    });

    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    let animationId;
    const startTime = Date.now();

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Update time uniform for animation
      material.uniforms.time.value = (Date.now() - startTime) * 0.001;

      // Render scene
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="gradient-background"
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

export default GradientBackground;
