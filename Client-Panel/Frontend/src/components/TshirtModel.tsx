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
  color = "#ffffff",
  ...props
}: TshirtModelProps) {
  const { scene } = useGLTF("/models/tshirt.glb");
  const groupRef = useRef<Group>(null);
const shirtMaterialRef = useRef<MeshStandardMaterial | null>(null);


  useEffect(() => {
    // Center the model
    const box = new Box3().setFromObject(scene);
    const center = new Vector3();
    box.getCenter(center);
    scene.position.sub(center); // Move model so its center is at origin

    // Grab shirt material reference
    scene.traverse((child) => {
      if ((child as Mesh).isMesh && child.name.toLowerCase().includes("tshirt")) {
        shirtMaterialRef.current = (child as Mesh).material as MeshStandardMaterial;
      }
    });
  }, [scene]);

  useEffect(() => {
    // Update shirt color only when needed
    if (shirtMaterialRef.current) {
      shirtMaterialRef.current.color = new Color(color);
      shirtMaterialRef.current.needsUpdate = true;
    }
  }, [color]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5; // Rotate smoothly in place
    }
  });

  return (
    <group ref={groupRef} {...props}>
      <primitive object={scene} />
    </group>
  );
}
