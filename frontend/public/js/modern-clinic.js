import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

// Performance monitoring
let stats = {
  fps: 0,
  frameCount: 0,
  lastTime: performance.now()
};

// Scene setup
let scene, camera, renderer, composer;
let waveGeometry, waveMaterial, waveMesh;
let particles, particleSystem;
let medicalIcons = [];
let controls;
let currentSection = 0;
let targetCameraPosition = new THREE.Vector3(0, 0, 5);
let targetLookAt = new THREE.Vector3(0, 0, 0);
let clock = new THREE.Clock();
let isMobile = window.innerWidth < 768;
let qualityLevel = isMobile ? 'low' : 'high';
let isInitialized = false;

// DOM elements
const loadingScreen = document.getElementById('loading-screen');
const performanceMonitor = document.getElementById('performance-monitor');
const fpsCounter = document.getElementById('fps');
const sections = document.querySelectorAll('.section');

// Initialize the scene
function init() {
  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#000830');
  
  // Create camera
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);
  
  // Create renderer
  renderer = new THREE.WebGLRenderer({ 
    antialias: qualityLevel !== 'low',
    powerPreference: 'high-performance',
    alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio * (qualityLevel === 'high' ? 1 : 0.75));
  document.getElementById('canvas-container').appendChild(renderer.domElement);
  
  // Add lights
  const ambientLight = new THREE.AmbientLight(0x404080, 1);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0x4080ff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);
  
  // Add post-processing
  setupPostProcessing();
  
  // Create wave background
  createWaveBackground();
  
  // Create floating particles
  createParticles();
  
  // Create medical icons
  createMedicalIcons();
  
  // Add orbit controls for development
  if (window.location.hash === '#dev') {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    performanceMonitor.style.display = 'block';
  }
  
  // Add event listeners
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('scroll', onScroll);
  document.getElementById('book-appointment').addEventListener('click', () => {
    scrollToSection('contact');
  });
  document.getElementById('contact-us').addEventListener('click', () => {
    scrollToSection('contact');
  });
  document.getElementById('call-now').addEventListener('click', () => {
    window.location.href = 'tel:+254722396296';
  });
  
  // Hide loading screen
  setTimeout(() => {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }, 1500);
  
  isInitialized = true;
  
  // Start animation loop
  animate();
}

// Set up post-processing effects
function setupPostProcessing() {
  // Create composer
  composer = new EffectComposer(renderer);
  
  // Add render pass
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  
  // Add bloom pass (adjust parameters based on quality level)
  const bloomStrength = qualityLevel === 'low' ? 0.5 : 0.7;
  const bloomRadius = qualityLevel === 'low' ? 0.5 : 0.7;
  const bloomThreshold = 0.2;
  
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    bloomStrength,
    bloomRadius,
    bloomThreshold
  );
  composer.addPass(bloomPass);
  
  // Add custom shader pass for color correction
  const colorCorrectionShader = {
    uniforms: {
      tDiffuse: { value: null },
      brightness: { value: 0.05 },
      contrast: { value: 1.05 },
      saturation: { value: 1.1 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float brightness;
      uniform float contrast;
      uniform float saturation;
      varying vec2 vUv;
      
      void main() {
        vec4 color = texture2D(tDiffuse, vUv);
        
        // Brightness
        color.rgb += brightness;
        
        // Contrast
        color.rgb = (color.rgb - 0.5) * contrast + 0.5;
        
        // Saturation
        float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        color.rgb = mix(vec3(luminance), color.rgb, saturation);
        
        gl_FragColor = color;
      }
    `
  };
  
  const colorCorrectionPass = new ShaderPass(colorCorrectionShader);
  composer.addPass(colorCorrectionPass);
}

// Create wave background with shader
function createWaveBackground() {
  // Create geometry
  const geometryDetail = qualityLevel === 'low' ? [32, 32] : qualityLevel === 'medium' ? [64, 64] : [128, 128];
  waveGeometry = new THREE.PlaneGeometry(30, 20, ...geometryDetail);
  
  // Create shader material
  waveMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
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

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
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

      // Fractal Brownian Motion
      float fbm(vec2 p) {
        float f = 0.0;
        float w = 0.5;
        for (int i = 0; i < 5; i++) {
          f += w * snoise(p);
          p *= 2.0;
          w *= 0.5;
        }
        return f;
      }

      // Simplex noise
      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
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

      // Sharp wave function
      float sharpWave(vec2 p, float thickness, float scale, float speed) {
        float wave = sin(p.x * scale + time * speed) * 0.5 + 0.5;
        return smoothstep(0.5 - thickness, 0.5, wave) - smoothstep(0.5, 0.5 + thickness, wave);
      }

      vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

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

        // Create depth gradient
        float depth = uv.y * 0.5 + 0.5 + distortion2 * 0.2;
        depth = clamp(depth, 0.0, 1.0);

        // Create color gradient based on depth
        vec3 baseColor = mix(deepBlue, brightBlue, depth);
        
        // Add wave highlights
        baseColor = mix(baseColor, highlightColor, waves * 0.7);
        
        // Add subtle glow effect
        float glow = fbm(vec2(uv.x * 2.0 - time * 0.05, uv.y * 2.0 + time * 0.1)) * 0.1;
        baseColor += accentColor * glow;

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
  });
  
  // Create mesh
  waveMesh = new THREE.Mesh(waveGeometry, waveMaterial);
  waveMesh.position.z = -5;
  scene.add(waveMesh);
}

// Create floating particles
function createParticles() {
  const particleCount = qualityLevel === 'low' ? 500 : qualityLevel === 'medium' ? 1000 : 2000;
  
  // Create geometry
  const particleGeometry = new THREE.BufferGeometry();
  
  // Create positions
  particles = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    
    // Position particles in a volume
    particles[i3] = (Math.random() - 0.5) * 20;
    particles[i3 + 1] = (Math.random() - 0.5) * 20;
    particles[i3 + 2] = (Math.random() - 0.5) * 10;
    
    // Blue to cyan colors
    colors[i3] = 0.1 + Math.random() * 0.2;     // R - low
    colors[i3 + 1] = 0.5 + Math.random() * 0.5; // G - medium to high
    colors[i3 + 2] = 0.8 + Math.random() * 0.2; // B - high
    
    // Random sizes
    sizes[i] = Math.random() * 0.1 + 0.05;
  }
  
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  
  // Create material
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.1,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  
  // Create particle system
  particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particleSystem);
}

// Create floating medical icons
function createMedicalIcons() {
  // Medical icon geometries
  const iconGeometries = [
    new THREE.TorusGeometry(0.5, 0.2, 16, 32), // Stethoscope-like
    new THREE.CapsuleGeometry(0.2, 0.8, 4, 8), // Pill-like
    new THREE.SphereGeometry(0.4, 16, 16),     // Cell-like
    new THREE.BoxGeometry(0.7, 0.7, 0.7),      // Box-like (medical kit)
    new THREE.CylinderGeometry(0.3, 0.3, 0.8, 16) // Syringe-like
  ];
  
  // Create 10 random icons
  for (let i = 0; i < 10; i++) {
    const geometry = iconGeometries[Math.floor(Math.random() * iconGeometries.length)];
    
    // Create material with blue/cyan colors
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.2, 0.5 + Math.random() * 0.5, 0.8 + Math.random() * 0.2),
      metalness: 0.2,
      roughness: 0.8,
      transparent: true,
      opacity: 0.7
    });
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    
    // Position randomly in scene
    mesh.position.set(
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 5 - 2
    );
    
    // Random rotation
    mesh.rotation.set(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    );
    
    // Random scale
    const scale = 0.5 + Math.random() * 0.5;
    mesh.scale.set(scale, scale, scale);
    
    // Add to scene and array
    scene.add(mesh);
    medicalIcons.push({
      mesh,
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01
      },
      floatSpeed: 0.2 + Math.random() * 0.3,
      floatOffset: Math.random() * Math.PI * 2
    });
  }
}

// Handle window resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  
  // Update uniforms
  if (waveMaterial) {
    waveMaterial.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
  }
  
  // Update mobile detection
  isMobile = window.innerWidth < 768;
}

// Handle scroll events
function onScroll() {
  // Calculate current section based on scroll position
  const scrollPosition = window.scrollY;
  const windowHeight = window.innerHeight;
  
  sections.forEach((section, index) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    
    if (scrollPosition >= sectionTop - windowHeight / 2 && 
        scrollPosition < sectionTop + sectionHeight - windowHeight / 2) {
      currentSection = index;
    }
  });
  
  // Update camera target position based on current section
  updateCameraTarget();
}

// Update camera target position
function updateCameraTarget() {
  switch (currentSection) {
    case 0: // Hero
      targetCameraPosition.set(0, 0, 5);
      targetLookAt.set(0, 0, 0);
      break;
    case 1: // Services
      targetCameraPosition.set(3, -2, 6);
      targetLookAt.set(0, -2, 0);
      break;
    case 2: // Contact
      targetCameraPosition.set(-3, -4, 5);
      targetLookAt.set(0, -4, 0);
      break;
  }
}

// Scroll to section
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    window.scrollTo({
      top: section.offsetTop,
      behavior: 'smooth'
    });
  }
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  const time = clock.getElapsedTime();
  
  // Update FPS counter
  stats.frameCount++;
  const now = performance.now();
  if (now - stats.lastTime >= 1000) {
    stats.fps = Math.round((stats.frameCount * 1000) / (now - stats.lastTime));
    stats.frameCount = 0;
    stats.lastTime = now;
    
    // Update FPS display
    if (fpsCounter) {
      fpsCounter.textContent = stats.fps;
    }
  }
  
  // Skip updates if not initialized
  if (!isInitialized) return;
  
  // Update wave material
  if (waveMaterial) {
    waveMaterial.uniforms.time.value = time * 0.4;
  }
  
  // Update particles
  if (particleSystem && particleSystem.geometry) {
    const positions = particleSystem.geometry.attributes.position.array;
    
    for (let i = 0; i < positions.length / 3; i++) {
      const i3 = i * 3;
      
      // Subtle movement based on sine waves
      positions[i3 + 1] += Math.sin(time * 0.2 + i * 0.1) * 0.002;
      positions[i3] += Math.cos(time * 0.2 + i * 0.1) * 0.002;
      
      // Reset particles that go too far
      if (Math.abs(positions[i3]) > 10) positions[i3] *= 0.95;
      if (Math.abs(positions[i3 + 1]) > 10) positions[i3 + 1] *= 0.95;
      if (Math.abs(positions[i3 + 2]) > 10) positions[i3 + 2] *= 0.95;
    }
    
    particleSystem.geometry.attributes.position.needsUpdate = true;
    
    // Rotate particle system
    particleSystem.rotation.y += delta * 0.05;
  }
  
  // Update medical icons
  medicalIcons.forEach(icon => {
    // Rotate
    icon.mesh.rotation.x += icon.rotationSpeed.x;
    icon.mesh.rotation.y += icon.rotationSpeed.y;
    icon.mesh.rotation.z += icon.rotationSpeed.z;
    
    // Float up and down
    icon.mesh.position.y += Math.sin(time * icon.floatSpeed + icon.floatOffset) * 0.003;
  });
  
  // Smoothly move camera to target position
  if (!controls) {
    camera.position.lerp(targetCameraPosition, delta * 1.5);
    
    // Look at target
    const currentLookAt = new THREE.Vector3();
    currentLookAt.copy(camera.position).add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(5));
    currentLookAt.lerp(targetLookAt, delta * 1.5);
    camera.lookAt(currentLookAt);
  } else {
    controls.update();
  }
  
  // Render scene with post-processing
  composer.render();
}

// Initialize when DOM is loaded
window.addEventListener('DOMContentLoaded', init);
