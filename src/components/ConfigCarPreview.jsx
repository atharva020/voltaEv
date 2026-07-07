import { Suspense, useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment, Center } from '@react-three/drei'
import * as THREE from 'three'
import { fixMaterials, applyBodyColor } from './CarScene'
import '../styles/ConfigCarPreview.css'

const MODEL_PATH = '/3D-model2.glb'

function brightenMaterials(object) {
  object.traverse((child) => {
    if (!child.isMesh || !child.material) return
    const mats = Array.isArray(child.material) ? child.material : [child.material]
    mats.forEach((mat) => {
      if (mat.envMapIntensity !== undefined) {
        mat.envMapIntensity = Math.max(mat.envMapIntensity, 2.2)
      }
      mat.needsUpdate = true
    })
  })
}

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
    brightenMaterials(clone)
    return clone
  }, [scene])

  useEffect(() => {
    if (!clonedScene) return
    applyBodyColor(clonedScene, bodyColor)
  }, [bodyColor, clonedScene])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.35
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
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.45,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        dpr={[1, 1.25]}
        frameloop="always"
      >
        <directionalLight position={[6, 10, 5]} intensity={3} />
        <directionalLight position={[-8, 5, -4]} intensity={1.2} color="#c8d8ff" />
        <directionalLight position={[0, 3, -8]} intensity={0.9} color="#D4A853" />
        <ambientLight intensity={0.55} />
        <hemisphereLight args={['#b8c0d8', '#1a1a1a', 0.65]} />

        <Suspense fallback={null}>
          <MiniCarModel bodyColor={bodyColor} />
          <Environment preset="studio" background={false} environmentIntensity={1.4} />
        </Suspense>
      </Canvas>
    </div>
  )
}
