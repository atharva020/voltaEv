import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

function CarModel({ rotationY, bodyColor }) {
  const group = useRef()
  const { scene } = useGLTF('/3D-model.glb')

  // Apply color to all mesh materials that look like car body paint
  scene.traverse((child) => {
    if (child.isMesh && child.material) {
      const mat = child.material
      const name = (mat.name || child.name || '').toLowerCase()
      // Target body/paint materials - avoid glass, rubber, chrome
      if (
        !name.includes('glass') &&
        !name.includes('window') &&
        !name.includes('windshield') &&
        !name.includes('rubber') &&
        !name.includes('tire') &&
        !name.includes('chrome') &&
        !name.includes('light') &&
        !name.includes('lamp') &&
        !name.includes('lens') &&
        !name.includes('mirror') &&
        mat.type !== 'MeshPhysicalMaterial'  // skip glass-like physical materials
      ) {
        if (mat.color && mat.metalness !== undefined && mat.metalness > 0.3) {
          mat.color.set(bodyColor)
        }
      }
    }
  })

  return (
    <group ref={group} rotation={[0, rotationY, 0]} position={[0, -0.6, 0]} scale={1.6}>
      <primitive object={scene} />
    </group>
  )
}

export default function CarScene({ rotationY, bodyColor }) {
  return (
    <Canvas
      id="car-canvas"
      camera={{ position: [0, 1.2, 5], fov: 40, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[8, 8, 4]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-6, 3, -4]} intensity={0.6} color="#a0c0ff" />
      <directionalLight position={[0, -4, 6]} intensity={0.3} color="#D4A853" />
      <spotLight position={[0, 10, 0]} intensity={0.5} angle={0.4} penumbra={1} />

      <Suspense fallback={null}>
        <CarModel rotationY={rotationY} bodyColor={bodyColor} />
        <ContactShadows
          position={[0, -0.62, 0]}
          opacity={0.35}
          scale={8}
          blur={2.5}
          far={4}
          color="#000000"
        />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  )
}

useGLTF.preload('/3D-model.glb')
