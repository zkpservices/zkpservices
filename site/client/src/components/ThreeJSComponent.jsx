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

      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      containerRef.current.appendChild(renderer.domElement);

      let originalPositions;
      let points;
      let centroid = new window.THREE.Vector3();

      fetch('zkp_geometry_clean.obj.csv')
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

          // Shift the camera slightly closer to the points
          camera.position.set(centroid.x - 0.1, centroid.y, centroid.z + 4);

          camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
          camera.updateProjectionMatrix();

          let mouseX = 0;
          let mouseY = 0;
          let isMouseMoving = false;
          let rotationSpeedX = 0.002;
          let rotationSpeedY = 0.002;
          let rotationX = 0;
          let rotationY = 0;
          let rotationZ = 0;
          let explosionFactor = 0.02;

          document.addEventListener('mousemove', (event) => {
            isMouseMoving = true;
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = (event.clientY / window.innerHeight) * 2 - 1;
          });

          const animate = function () {
            requestAnimationFrame(animate);

            if (isMouseMoving) {
              const direction = new window.THREE.Vector3(mouseX, mouseY, 0).normalize();
              // Flip rotation direction for up and down mouse movement
              rotationX += rotationSpeedX * direction.y;
              rotationY += rotationSpeedY * direction.x;

              points.rotation.x = rotationX;
              points.rotation.y = rotationY;
              points.rotation.z = rotationZ;

              for (let i = 0; i < vertices.length; i += 3) {
                vertices[i] += (Math.random() - 0.5) * explosionFactor;
                vertices[i + 1] += (Math.random() - 0.5) * explosionFactor;
                vertices[i + 2] += (Math.random() - 0.5) * explosionFactor;
              }
              geometry.attributes.position.needsUpdate = true;
            } else {
              rotationX *= 0.95;
              rotationY *= 0.95;

              points.rotation.x = rotationX;
              points.rotation.y = rotationY;
              points.rotation.z = rotationZ;

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
        const containerAspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        camera.aspect = containerAspect;
        camera.updateProjectionMatrix();

        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      });
    }
  }, [scriptLoaded]);

  return (
    <div className="w-full h-screen flex items-center justify-center" ref={containerRef}>
      {/* Your HTML content here */}
    </div>
  );
}
