import { Suspense, useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Center } from '@react-three/drei'
import * as THREE from 'three'
import { fixMaterials, applyBodyColor } from './CarScene'
import '../styles/ConfigCarPreview.css'

const MODEL_PATH = '/3D-model2.glb'

function MiniCarModel({ bodyColor }) {
  const groupRef = useRef()
  const { scene } = useGLTF(MODEL_PATH)

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)

    if (maxDim > 0) {
      clone.scale.setScalar(3.2 / maxDim)
    }

    fixMaterials(clone, bodyColor)
    return clone
  }, [scene])

  useEffect(() => {
    if (!clonedScene) return
    applyBodyColor(clonedScene, bodyColor)
  }, [bodyColor, clonedScene])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4
    }
  })

  return (
    <group ref={groupRef} rotation={[0, -0.35, 0]}>
      <Center>
        <primitive object={clonedScene} />
      </Center>
    </group>
  )
}

export default function ConfigCarPreview({ bodyColor }) {
  return (
    <div className="config-car-preview">
      <Canvas
        camera={{ position: [4.5, 1.8, 5.5], fov: 32, near: 0.01, far: 100 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        dpr={1}
        frameloop="always"
      >
        <directionalLight position={[6, 8, 4]} intensity={2.2} />
        <directionalLight position={[-6, 4, -3]} intensity={0.7} color="#c8d8ff" />
        <directionalLight position={[0, 2, -6]} intensity={0.5} color="#D4A853" />
        <ambientLight intensity={0.35} />
        <hemisphereLight args={['#8888aa', '#111111', 0.4]} />

        <Suspense fallback={null}>
          <MiniCarModel bodyColor={bodyColor} />
        </Suspense>
      </Canvas>
    </div>
  )
}
