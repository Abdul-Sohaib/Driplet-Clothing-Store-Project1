/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Group, Box3, Vector3, Color, Mesh, MeshStandardMaterial } from "three";

interface TshirtModelProps {
  scale?: number | [number, number, number];
  position?: [number, number, number];
  color?: string; // HEX or CSS color name
  [key: string]: any;
}

export default function TshirtModel({
  color = "#ffffff",
  ...props
}: TshirtModelProps) {
  const { scene } = useGLTF("/models/tshirt.glb");
  const groupRef = useRef<Group>(null);
  const shirtMeshesRef = useRef<MeshStandardMaterial[]>([]);
  const [isCentered, setIsCentered] = useState(false);

  // Center model & store shirt mesh references (runs once)
  useEffect(() => {
    if (!isCentered && scene) {
      // Centering
      const box = new Box3().setFromObject(scene);
      const center = new Vector3();
      box.getCenter(center);
      scene.position.sub(center);

      // Store all mesh material references for robust color application
      const meshes: MeshStandardMaterial[] = [];
      scene.traverse((child) => {
        if ((child as Mesh).isMesh) {
          const mesh = child as Mesh;
          if (mesh.material) {
            // Support both single material and array of materials
            if (Array.isArray(mesh.material)) {
              meshes.push(...(mesh.material as MeshStandardMaterial[]));
            } else {
              meshes.push(mesh.material as MeshStandardMaterial);
            }
          }
        }
      });
      shirtMeshesRef.current = meshes;
      setIsCentered(true);
    }
  }, [scene, isCentered]);

  // Update shirt color only when "color" changes
  useEffect(() => {
    if (shirtMeshesRef.current.length > 0) {
      const threeColor = new Color(color);
      shirtMeshesRef.current.forEach((material) => {
        material.color = threeColor;
        material.needsUpdate = true;
      });
    }
  }, [color]);

  // Smooth Y-axis rotation
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

// Preload the model to optimize loading performance
useGLTF.preload("/models/tshirt.glb");
