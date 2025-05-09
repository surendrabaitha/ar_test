import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ARButton } from "three/examples/jsm/webxr/ARButton";

export default function App() {
  const containerRef = useRef(null);
  const selectedModelRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    const arButton = ARButton.createButton(renderer, {
      requiredFeatures: ["hit-test"],
    });
    document.body.appendChild(arButton);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1));

    const loader = new GLTFLoader();
    const modelFiles = [
      { file: "/models/model1.glb", position: [-0.5, 0, -1] },
      { file: "/models/model2.glb", position: [0.5, 0, -1] },
      { file: "/models/model3.glb", position: [0, 0, -2] },
    ];

    const models = [];

    modelFiles.forEach(({ file, position }) => {
      loader.load(file, (gltf) => {
        const model = gltf.scene;
        model.position.set(...position);
        model.scale.set(0.3, 0.3, 0.3);
        scene.add(model);
        models.push(model);
      });
    });

    // Pointer down for tap detection
    const onPointerDown = (event) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(models, true);
      if (intersects.length > 0) {
        selectedModelRef.current = intersects[0].object.parent;
      } else {
        selectedModelRef.current = null;
      }
    };

    // Drag to move model on screen (Z axis stays fixed)
    const onPointerMove = (event) => {
      if (!selectedModelRef.current) return;

      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const newPos = raycaster.ray.origin
        .clone()
        .add(raycaster.ray.direction.clone().multiplyScalar(1)); // 1 meter forward
      selectedModelRef.current.position.x = newPos.x;
      selectedModelRef.current.position.y = newPos.y;
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);

    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });

    return () => {
      if (renderer.domElement && containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      const button = document.querySelector(".ar-button");
      if (button) button.remove();
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100vw", height: "100vh" }} />;
}
