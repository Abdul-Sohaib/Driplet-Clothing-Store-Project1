/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Group, Box3, Vector3, Color, Mesh, MeshStandardMaterial } from "three";

interface TshirtModelProps {
  scale?: number | [number, number, number];
  position?: [number, number, number];
  color?: string; // HEX or CSS color name
  [key: string]: any;
}

export default function TshirtModel({
  color = "#ffffff", // default 
  ...props
}: TshirtModelProps) {
  const { scene } = useGLTF("/models/tshirt.glb", true, true);
  const groupRef = useRef<Group>(null);

  // Center the model based on its bounding box
  useEffect(() => {
    const box = new Box3().setFromObject(scene);
    const center = new Vector3();
    box.getCenter(center);
    scene.position.sub(center);
  }, [scene]);

  // Change only the main shirt's material color
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh;
        // Replace "Tshirt" with the exact mesh name from your GLB
        if (mesh.name.toLowerCase().includes("tshirt")) {
          const mat = mesh.material as MeshStandardMaterial;
          mat.color = new Color(color);
          mat.needsUpdate = true;
        }
      }
    });
  }, [scene, color]);

  // Continuous Y-axis rotation
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={groupRef} {...props}>
      <primitive object={scene} />
    </group>
  );
}
