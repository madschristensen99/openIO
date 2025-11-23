'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeBackgroundProps {
  className?: string;
}

export default function ThreeBackground({ className = '' }: ThreeBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create particles
    const particleCount = 150;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Position
      positions[i3] = (Math.random() - 0.5) * 10;
      positions[i3 + 1] = (Math.random() - 0.5) * 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;

      // Color (cyan to purple gradient)
      const colorMix = Math.random();
      colors[i3] = 0.2 + colorMix * 0.3; // R
      colors[i3 + 1] = 0.8 + colorMix * 0.2; // G
      colors[i3 + 2] = 0.9 + (1 - colorMix) * 0.1; // B

      // Size
      sizes[i] = Math.random() * 0.05 + 0.02;

      // Velocity
      velocities[i3] = (Math.random() - 0.5) * 0.01;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.01;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('pColor', new THREE.BufferAttribute(colors, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Material
    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pointTexture: { value: createParticleTexture() }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 pColor;
        varying vec3 vColor;
        uniform float time;
        
        void main() {
          vColor = pColor;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D pointTexture;
        varying vec3 vColor;
        
        void main() {
          gl_FragColor = vec4(vColor, 0.8) * texture2D(pointTexture, gl_PointCoord);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // Create connecting lines
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(particleCount * 3 * 2);
    const lineColors = new Float32Array(particleCount * 3 * 2);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    });

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // Animation
    const clock = new THREE.Clock();
    let time = 0;

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      time = clock.getElapsedTime();

      // Update particles
      const positions = particles.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Update position
        positions[i3] += velocities[i3];
        positions[i3 + 1] += velocities[i3 + 1];
        positions[i3 + 2] += velocities[i3 + 2];

        // Boundary check
        if (Math.abs(positions[i3]) > 5) velocities[i3] *= -1;
        if (Math.abs(positions[i3 + 1]) > 5) velocities[i3 + 1] *= -1;
        if (Math.abs(positions[i3 + 2]) > 5) velocities[i3 + 2] *= -1;

        // Add subtle wave motion
        positions[i3 + 1] += Math.sin(time + i) * 0.001;
      }
      particles.attributes.position.needsUpdate = true;

      // Update connections
      const linePositions = lineGeometry.attributes.position.array as Float32Array;
      const lineColors = lineGeometry.attributes.color.array as Float32Array;
      const pColors = particles.attributes.pColor.array as Float32Array;
      let lineIndex = 0;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const pos1 = new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2]);

        for (let j = i + 1; j < particleCount; j++) {
          const j3 = j * 3;
          const pos2 = new THREE.Vector3(positions[j3], positions[j3 + 1], positions[j3 + 2]);
          const distance = pos1.distanceTo(pos2);

          if (distance < 2) {
            const color1 = new THREE.Color(pColors[i3], pColors[i3 + 1], pColors[i3 + 2]);
            const color2 = new THREE.Color(pColors[j3], pColors[j3 + 1], pColors[j3 + 2]);
            const opacity = (1 - distance / 2) * 0.3;

            // Line start
            linePositions[lineIndex] = positions[i3];
            linePositions[lineIndex + 1] = positions[i3 + 1];
            linePositions[lineIndex + 2] = positions[i3 + 2];
            lineColors[lineIndex] = color1.r;
            lineColors[lineIndex + 1] = color1.g;
            lineColors[lineIndex + 2] = color1.b;

            // Line end
            linePositions[lineIndex + 3] = positions[j3];
            linePositions[lineIndex + 4] = positions[j3 + 1];
            linePositions[lineIndex + 5] = positions[j3 + 2];
            lineColors[lineIndex + 3] = color2.r;
            lineColors[lineIndex + 4] = color2.g;
            lineColors[lineIndex + 5] = color2.b;

            lineIndex += 6;
          }
        }
      }

      // Update line geometry
      lineGeometry.setDrawRange(0, lineIndex / 3);
      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.color.needsUpdate = true;

      // Update material time
      particleMaterial.uniforms.time.value = time;

      // Rotate camera slightly
      camera.position.x = Math.sin(time * 0.1) * 0.5;
      camera.position.y = Math.cos(time * 0.15) * 0.5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      const newWidth = containerRef.current.offsetWidth;
      const newHeight = containerRef.current.offsetHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (renderer && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      particles.dispose();
      particleMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
    };
  }, []);

  function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(0, 212, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  return <div ref={containerRef} className={`three-background ${className}`} />;
}

