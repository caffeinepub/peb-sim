import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Comment } from '@/backend';

interface AnnotationMarkerProps {
  comment: Comment;
  onClick: (comment: Comment) => void;
}

function AnnotationMarker({ comment, onClick }: AnnotationMarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <group position={[comment.position.x, comment.position.y + 0.5, comment.position.z]}>
      <mesh
        ref={meshRef}
        onClick={e => {
          e.stopPropagation();
          onClick(comment);
        }}
        onPointerOver={e => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={e => {
          e.stopPropagation();
          document.body.style.cursor = 'default';
        }}
      >
        <planeGeometry args={[0.6, 0.6]} />
        <meshBasicMaterial color="#fbbf24" side={THREE.DoubleSide} />
      </mesh>
      {/* Stem */}
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
    </group>
  );
}

interface AnnotationMarkersProps {
  comments: Comment[];
  onMarkerClick: (comment: Comment) => void;
}

export default function AnnotationMarkers({ comments, onMarkerClick }: AnnotationMarkersProps) {
  return (
    <group>
      {comments.map(comment => (
        <AnnotationMarker
          key={Number(comment.id)}
          comment={comment}
          onClick={onMarkerClick}
        />
      ))}
    </group>
  );
}
