import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export function ThreeJSComponent() {
  const containerRef = useRef();

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    let canvasWidth;
    let canvasHeight;

    if (window.innerWidth >= 1650) {
      canvasWidth = containerRef.current.clientWidth * 1.3;
      canvasHeight = (containerRef.current.clientWidth * 1.3) / (window.innerWidth / window.innerHeight);
    } else if (window.innerWidth >= 1200) {
      canvasWidth = containerRef.current.clientWidth * 1.15;
      canvasHeight = (containerRef.current.clientWidth * 1.15) / (window.innerWidth / window.innerHeight);
    } else if (window.innerWidth >= 768) {
      canvasWidth = containerRef.current.clientWidth * 0.9;
      canvasHeight = (containerRef.current.clientWidth * 0.9) / (window.innerWidth / window.innerHeight);
    } else if (window.innerWidth >= 400) {
      canvasWidth = containerRef.current.clientWidth * 0.55;
      canvasHeight = (containerRef.current.clientWidth * 0.55) / (window.innerWidth / window.innerHeight);
    } else { 
      canvasWidth = 350; // Set a constant width
      canvasHeight = 350; // Set a constant height
    }

    renderer.setSize(canvasWidth, canvasHeight);
    containerRef.current.appendChild(renderer.domElement);

    let originalPositions;
    let points;
    let centroid = new THREE.Vector3();

    fetch('zkp.obj.csv')
      .then(response => response.text())
      .then(text => {
        const rows = text.split('\n').map(row => {
          const values = row.split(',').map(Number);
          if (values.some(value => isNaN(value))) {
            console.error('Invalid data found:', row);
            return [0, 0, 0]; 
          }
          return values;
        });
        const geometry = new THREE.BufferGeometry();
        const vertices = new window.Float32Array(rows.flat());
        originalPositions = new window.Float32Array(vertices);
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        const material = new THREE.PointsMaterial({ size: 0.01, color: 0x10b981, transparent: true, opacity: 0.7 });

        points = new THREE.Points(geometry, material);
        scene.add(points);

        const boundingBox = new THREE.Box3().setFromBufferAttribute(geometry.attributes.position);
        boundingBox.getCenter(centroid);

        camera.aspect = canvasWidth / canvasHeight;
        camera.updateProjectionMatrix();

        camera.position.set(centroid.x - 2, centroid.y + 0.5, centroid.z + 4);

        let mouseX = 0;
        let isMouseMoving = false;
        let rotationSpeed = 0.002;
        let rotationY = 0;
        let maxRotationY = Math.PI / 16;
        let explosionFactor = 0.02;

        document.addEventListener('mousemove', (event) => {
          isMouseMoving = true;
          mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        });

        const animate = function () {
          requestAnimationFrame(animate);

          if (isMouseMoving && window.innerWidth > 450) {
            const directionX = mouseX - (centroid.x / canvasWidth);
            rotationY += rotationSpeed * directionX;
            rotationY = Math.max(-maxRotationY, Math.min(maxRotationY, rotationY));
            points.rotation.y = rotationY;

            for (let i = 0; i < vertices.length; i += 3) {
              vertices[i] += (Math.random() - 0.5) * explosionFactor;
              vertices[i + 1] += (Math.random() - 0.5) * explosionFactor;
              vertices[i + 2] += (Math.random() - 0.5) * explosionFactor;
            }
            geometry.attributes.position.needsUpdate = true;
          } else {
            let factor = 0.2;
            rotationY *= factor;
            points.rotation.y = rotationY;

            for (let i = 0; i < vertices.length; i++) {
              vertices[i] += (originalPositions[i] - vertices[i]) * 0.1;
            }
            geometry.attributes.position.needsUpdate = true;
          }

          camera.lookAt(centroid);
          renderer.render(scene, camera);

          isMouseMoving = false;
        };

        animate();
      });

    window.addEventListener('resize', () => {
      if (containerRef.current) {
        if (window.innerWidth >= 1650) {
          canvasWidth = containerRef.current.clientWidth * 1.3;
          canvasHeight = (containerRef.current.clientWidth * 1.3) / (window.innerWidth / window.innerHeight);
        } else if (window.innerWidth >= 1200) {
          canvasWidth = containerRef.current.clientWidth * 1.15;
          canvasHeight = (containerRef.current.clientWidth * 1.15) / (window.innerWidth / window.innerHeight);
        } else if (window.innerWidth >= 768) {
          canvasWidth = containerRef.current.clientWidth * 0.9;
          canvasHeight = (containerRef.current.clientWidth * 0.9) / (window.innerWidth / window.innerHeight);
        } else if (window.innerWidth >= 450) {
          canvasWidth = containerRef.current.clientWidth * 0.55;
          canvasHeight = (containerRef.current.clientWidth * 0.55) / (window.innerWidth / window.innerHeight);
        } else { // Below 450
          canvasWidth = 350; // Set a constant width
          canvasHeight = 350; // Set a constant height
        }

        renderer.setSize(canvasWidth, canvasHeight);
        camera.aspect = canvasWidth / canvasHeight;
        camera.updateProjectionMatrix();
      }});
    return () => {
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="w-full flex items-center justify-center" ref={containerRef}>
      {/* Your HTML content here */}
    </div>
  );
}
