import React, { useRef, useEffect, useState } from 'react';

export function ThreeJSComponent() {
  const containerRef = useRef();
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!scriptLoaded) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.async = true;

      script.onload = () => {
        setScriptLoaded(true);
      };

      document.body.appendChild(script);
    }
  }, [scriptLoaded]);

  useEffect(() => {
    if (scriptLoaded) {
      const scene = new window.THREE.Scene();
      const camera = new window.THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new window.THREE.WebGLRenderer({ antialias: true, alpha: true });

      let scale;

      if (window.innerWidth >= 1650) {
        scale = 1.4;
      } else if (window.innerWidth >= 1200) {
        scale = 1.15;
      } else if (window.innerWidth >= 768) {
        scale = 0.9;
      } else {
        scale = 0.55;
      }

      const canvasWidth = containerRef.current.clientWidth * scale;
      const canvasHeight = (containerRef.current.clientWidth * scale) / (window.innerWidth / window.innerHeight);

      renderer.setSize(canvasWidth, canvasHeight);
      containerRef.current.appendChild(renderer.domElement);

      let originalPositions;
      let points;
      let centroid = new window.THREE.Vector3();

      fetch('zkp.obj.csv')
        .then(response => response.text())
        .then(text => {
          const rows = text.split('\n').map(row => row.split(',').map(Number));
          const geometry = new window.THREE.BufferGeometry();
          const vertices = new window.Float32Array(rows.flat());
          originalPositions = new window.Float32Array(vertices);
          geometry.setAttribute('position', new window.THREE.BufferAttribute(vertices, 3));

          const material = new window.THREE.PointsMaterial({ size: 0.01, color: 0x10b981, transparent: true, opacity: 0.7 });

          points = new window.THREE.Points(geometry, material);
          scene.add(points);

          const boundingBox = new window.THREE.Box3().setFromBufferAttribute(geometry.attributes.position);
          boundingBox.getCenter(centroid);

          camera.aspect = canvasWidth / canvasHeight;
          camera.updateProjectionMatrix();
          
          // The camera position remains as it was before
          camera.position.set(centroid.x - 2, centroid.y + 0.5, centroid.z + 4);

          let mouseX = 0;
          let isMouseMoving = false;
          let rotationSpeed = 0.002;
          let rotationY = 0;
          let maxRotationY = Math.PI / 16; // Set the maximum rotation here
          let explosionFactor = 0.02;

          document.addEventListener('mousemove', (event) => {
            isMouseMoving = true;

            // Calculate the mouse's position relative to the canvas
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
          });

          const animate = function () {
            requestAnimationFrame(animate);

            if (isMouseMoving) {
              const directionX = mouseX - (centroid.x / canvasWidth);
              rotationY += rotationSpeed * directionX;
              
              // Clamping the rotation
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
          if (containerRef.current) { // Check if containerRef.current is not null
            if (window.innerWidth >= 1650) {
              scale = 1.4;
            } else if (window.innerWidth >= 1200) {
              scale = 1.15;
            } else if (window.innerWidth >= 768) {
              scale = 0.9;
            } else {
              scale = 0.55;
            }
  
            const newCanvasWidth = containerRef.current.clientWidth * scale;
            const newCanvasHeight = (containerRef.current.clientWidth * scale) / (window.innerWidth / window.innerHeight);
            renderer.setSize(newCanvasWidth, newCanvasHeight);
  
            camera.aspect = newCanvasWidth / newCanvasHeight;
            camera.updateProjectionMatrix();
          }
        });
      }
    }, [scriptLoaded]);

  return (
    <div className="w-full flex items-center justify-center" ref={containerRef}>
      {/* Your HTML content here */}
    </div>
  );
}
