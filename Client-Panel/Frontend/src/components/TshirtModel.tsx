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
  const shirtMeshRef = useRef<MeshStandardMaterial | null>(null);
  const [isCentered, setIsCentered] = useState(false);

  // Center model & store shirt mesh reference (runs once)
  useEffect(() => {
    if (!isCentered) {
      // Centering
      const box = new Box3().setFromObject(scene);
      const center = new Vector3();
      box.getCenter(center);
      scene.position.sub(center);

      // Store shirt mesh material reference
      scene.traverse((child) => {
        if ((child as Mesh).isMesh && child.name.toLowerCase().includes("tshirt")) {
          shirtMeshRef.current = (child as Mesh).material as MeshStandardMaterial;
        }
      });

      setIsCentered(true);
    }
  }, [scene, isCentered]);

  // Update shirt color only when "color" changes
  useEffect(() => {
    if (shirtMeshRef.current) {
      shirtMeshRef.current.color = new Color(color);
      shirtMeshRef.current.needsUpdate = true;
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
