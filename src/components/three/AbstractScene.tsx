'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useIsomorphicLayoutEffect } from '@/components/motion/useIsomorphicLayoutEffect';

interface AbstractSceneProps {
  className?: string;
  /** Rough number of floating shapes on desktop. Mobile auto-reduces. */
  density?: number;
}

const CANDY = [
  0x4f7cff, // blue
  0x8b5cf6, // indigo
  0x16c79a, // teal
  0xffc93c, // yellow
  0xff6b9d, // coral
  0xff8a3d, // orange
  0x38bdf8, // sky
];

function makeGeometry(i: number): THREE.BufferGeometry {
  switch (i % 6) {
    case 0:
      return new THREE.IcosahedronGeometry(1, 0);
    case 1:
      return new THREE.TorusGeometry(0.75, 0.3, 20, 48);
    case 2:
      return new THREE.OctahedronGeometry(1.1, 0);
    case 3:
      return new THREE.DodecahedronGeometry(1, 0);
    case 4:
      return new THREE.TorusKnotGeometry(0.6, 0.24, 90, 16);
    default:
      return new THREE.SphereGeometry(1, 32, 32);
  }
}

/**
 * Full-viewport fixed WebGL backdrop of floating abstract candy-colored
 * geometry. Reacts to pointer + scroll. Falls back to a static frame for
 * reduced-motion users and thins out on small screens for performance.
 */
export default function AbstractScene({
  className,
  density = 11,
}: AbstractSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    // WebGL support guard.
    let gl: WebGLRenderingContext | null = null;
    try {
      const testCanvas = document.createElement('canvas');
      gl =
        (testCanvas.getContext('webgl') as WebGLRenderingContext) ||
        (testCanvas.getContext('experimental-webgl') as WebGLRenderingContext);
    } catch {
      gl = null;
    }
    if (!gl) return; // CSS mesh-bg fallback shows through.

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    // Depth fog fades distant shapes into the cream page -> softer, less busy.
    scene.fog = new THREE.Fog(0xfaf9f6, 14, 34);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    // Lighting — soft, playful, colored rim lights.
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(5, 8, 6);
    scene.add(key);
    const rimBlue = new THREE.PointLight(0x4f7cff, 0.9, 60);
    rimBlue.position.set(-10, 6, 4);
    scene.add(rimBlue);
    const rimCoral = new THREE.PointLight(0xff6b9d, 0.8, 60);
    rimCoral.position.set(10, -6, 6);
    scene.add(rimCoral);

    // Floating shapes.
    const group = new THREE.Group();
    scene.add(group);

    const count = prefersReduced ? Math.min(6, density) : isMobile ? Math.round(density * 0.55) : density;
    const shapes: { mesh: THREE.Mesh; speed: number; phase: number; spin: THREE.Vector3 }[] =
      [];

    for (let i = 0; i < count; i++) {
      const geometry = makeGeometry(i);
      const color = CANDY[i % CANDY.length];
      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.4,
        metalness: 0.08,
        emissive: new THREE.Color(color).multiplyScalar(0.04),
        transparent: true,
        opacity: 0.88,
        flatShading: i % 6 === 0 || i % 6 === 2,
      });
      const mesh = new THREE.Mesh(geometry, material);

      // Bias shapes to the left/right edges so the central reading column
      // stays clear. x lives in the outer bands, never the middle.
      const side = Math.random() < 0.5 ? -1 : 1;
      const x = side * (6.5 + Math.random() * 6);
      mesh.position.set(
        x,
        (Math.random() - 0.5) * 16,
        -3 - Math.random() * 6 // pushed back for depth
      );
      const s = 0.4 + Math.random() * 0.65;
      mesh.scale.setScalar(s);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

      group.add(mesh);
      shapes.push({
        mesh,
        speed: 0.3 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        spin: new THREE.Vector3(
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.2
        ),
      });
    }

    // Pointer parallax.
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointerMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    if (!prefersReduced && !isMobile) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
    }

    // Scroll reactivity (Lenis writes to native scroll, so scrollY works).
    let scrollFactor = 0;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollFactor = max > 0 ? window.scrollY / max : 0;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const clock = new THREE.Clock();
    let raf = 0;
    let running = true;

    const renderFrame = () => {
      const t = clock.getElapsedTime();

      // Bob + spin each shape.
      for (const item of shapes) {
        item.mesh.position.y += Math.sin(t * item.speed + item.phase) * 0.004;
        if (!prefersReduced) {
          item.mesh.rotation.x += item.spin.x * 0.01;
          item.mesh.rotation.y += item.spin.y * 0.01;
          item.mesh.rotation.z += item.spin.z * 0.01;
        }
      }

      // Gentle vertical parallax on scroll only — no big rotation that would
      // sweep edge shapes across the central reading column.
      group.rotation.y = t * 0.015;
      group.position.y = scrollFactor * 4.5;

      // Subtle pointer parallax on camera.
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;
      camera.position.x = pointer.x * 1.0;
      camera.position.y = -pointer.y * 0.8;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    const animate = () => {
      if (!running) return;
      renderFrame();
      raf = requestAnimationFrame(animate);
    };

    if (prefersReduced) {
      renderFrame(); // single static frame
    } else {
      animate();
    }

    // Pause when tab hidden.
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!prefersReduced) {
        running = true;
        animate();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Resize.
    const onResize = () => {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      shapes.forEach(({ mesh }) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [density]);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}
