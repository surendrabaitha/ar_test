import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ARButton } from "three/examples/jsm/webxr/ARButton";

export default function App() {
  const containerRef = useRef(null);
  const rendererRef = useRef(null); // store renderer separately

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add AR Button
    const arButton = ARButton.createButton(renderer, {
      requiredFeatures: ["hit-test"],
    });
    document.body.appendChild(arButton);

    // Light
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    // Load Model
    const loader = new GLTFLoader();
    loader.load("/models/glasses.glb", (gltf) => {
      const model = gltf.scene;
      model.scale.set(0.3, 0.3, 0.3);
      model.position.set(0, 0, -1); // 1 meter in front
      scene.add(model);
    });

    // Animation loop
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });

    // Cleanup
    return () => {
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      if (arButton && arButton.parentNode) {
        arButton.parentNode.removeChild(arButton);
      }
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100vw", height: "100vh" }} />;
}
