/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useMemo } from "react";
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
  const rotationSpeed = useRef(0.5);

  // Memoize the color object to prevent unnecessary re-creations
  const colorObject = useMemo(() => new Color(color), [color]);

  useEffect(() => {
    if (!scene || !groupRef.current) return;

    // Clone the scene to avoid modifying the original
    const clonedScene = scene.clone();
    
    // Compute bounding box and center
    const box = new Box3().setFromObject(clonedScene);
    const center = new Vector3();
    box.getCenter(center);
    
    // Center the model at origin by adjusting its position
    clonedScene.position.set(-center.x, -center.y, -center.z);
    
    // Clear previous children and add the centered model
    groupRef.current.clear();
    groupRef.current.add(clonedScene);
    
    // Find and store the shirt material reference
    let materialFound = false;
    clonedScene.traverse((child) => {
      if (!materialFound && (child as Mesh).isMesh) {
        const mesh = child as Mesh;
        // Check if it's likely the shirt mesh (adjust name check as needed)
        if (
          child.name.toLowerCase().includes("tshirt") ||
          child.name.toLowerCase().includes("shirt") ||
          mesh.material instanceof MeshStandardMaterial
        ) {
          shirtMaterialRef.current = mesh.material as MeshStandardMaterial;
          materialFound = true;
        }
      }
    });
  }, [scene]);

  // Update material color when color prop changes
  useEffect(() => {
    if (shirtMaterialRef.current) {
      shirtMaterialRef.current.color.copy(colorObject);
      shirtMaterialRef.current.needsUpdate = true;
    }
  }, [colorObject]);

  // Smooth rotation animation
  useFrame((_, delta) => {
    if (groupRef.current) {
      // Rotate around Y-axis at the group's center (which is now at origin)
      groupRef.current.rotation.y += delta * rotationSpeed.current;
    }
  });

  return (
    <group ref={groupRef} {...props}>
      {/* The cloned scene will be added via useEffect */}
    </group>
  );
}

// Preload the model for better performance
useGLTF.preload("/models/tshirt.glb");