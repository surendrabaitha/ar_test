import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ARButton } from "three/examples/jsm/webxr/ARButton";

export default function App() {
  const containerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const modelRef = useRef(null);
  const rotationY = useRef(0);
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
        rotationY.current = 0;
        scene.add(model);
      });
    };

    loadModel(currentIndex);

    let isDragging = false;
    let previousX = 0;

    const handlePointerDown = (e) => {
      isDragging = true;
      previousX = e.clientX;
    };

    const handlePointerMove = (e) => {
      if (!isDragging || !modelRef.current) return;
      const deltaX = e.clientX - previousX;
      previousX = e.clientX;

      const deltaRotation = deltaX * 0.01;
      modelRef.current.rotation.y += deltaRotation;
      rotationY.current += deltaRotation;

      // If model rotated enough, switch
      if (Math.abs(rotationY.current) >= Math.PI / 2) {
        isDragging = false;
        const nextIndex = (currentIndex + 1) % models.length;
        setCurrentIndex(nextIndex);
        loadModel(nextIndex);
      }
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
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
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [currentIndex]);

  return <div ref={containerRef} style={{ width: "100vw", height: "100vh" }} />;
}
