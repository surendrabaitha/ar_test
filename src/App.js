import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ARButton } from "three/examples/jsm/webxr/ARButton";

export default function App() {
  const containerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const modelRef = useRef(null);
  const rotationStart = useRef(null);
  const models = [
    "/models/model1.glb",
    "/models/model2.glb",
    "/models/model3.glb",
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    const arButton = ARButton.createButton(renderer, {
      requiredFeatures: ["hit-test"],
    });
    document.body.appendChild(arButton);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    const loader = new GLTFLoader();

    const loadModel = (index) => {
      loader.load(models[index], (gltf) => {
        if (modelRef.current) {
          scene.remove(modelRef.current);
        }
        const model = gltf.scene;
        model.position.set(0, 0, -1);
        model.scale.set(0.3, 0.3, 0.3);
        model.rotation.y = 0;
        modelRef.current = model;
        scene.add(model);
      });
    };

    loadModel(currentIndex);

    const handlePointerDown = (e) => {
      rotationStart.current = e.clientX;
    };

    const handlePointerUp = (e) => {
      if (rotationStart.current === null) return;
      const dx = e.clientX - rotationStart.current;
      if (Math.abs(dx) > 50) {
        // Rotate model visually
        modelRef.current.rotation.y += dx > 0 ? Math.PI / 2 : -Math.PI / 2;

        // Switch model after a short delay
        setTimeout(() => {
          const nextIndex = (currentIndex + 1) % models.length;
          setCurrentIndex(nextIndex);
          loadModel(nextIndex);
        }, 300);
      }
      rotationStart.current = null;
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);

    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });

    return () => {
      if (renderer.domElement && containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      document.body.removeChild(arButton);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [currentIndex]);

  return <div ref={containerRef} style={{ width: "100vw", height: "100vh" }} />;
}
