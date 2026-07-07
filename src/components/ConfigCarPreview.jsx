import { Suspense, useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment, Center } from '@react-three/drei'
import * as THREE from 'three'
import { fixMaterials, applyBodyColor, resetSpinningParts } from './CarScene'
import '../styles/ConfigCarPreview.css'

const MODEL_PATH = '/3D-model2.glb?config-preview'
const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768

function isolateScene(scene) {
  const clone = scene.clone(true)
  clone.traverse((child) => {
    if (!child.isMesh || !child.material) return
    child.material = Array.isArray(child.material)
      ? child.material.map((mat) => mat.clone())
      : child.material.clone()
  })
  return clone
}

function MiniCarModel({ bodyColor, mobile }) {
  const groupRef = useRef()
  const modelRef = useRef(null)
  const { scene } = useGLTF(MODEL_PATH)

  const clonedScene = useMemo(() => {
    const clone = isolateScene(scene)
    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)

    if (maxDim > 0) {
      const scaleTarget = mobile ? 2.2 / maxDim : 3.2 / maxDim
      clone.scale.setScalar(scaleTarget)
    }

    // Same material pipeline as the hero car — no separate overrides
    fixMaterials(clone, bodyColor)
    resetSpinningParts(clone)
    modelRef.current = clone
    return clone
  }, [scene, mobile])

  useEffect(() => {
    if (!clonedScene) return
    applyBodyColor(clonedScene, bodyColor)
  }, [bodyColor, clonedScene])

  useFrame((_, delta) => {
    resetSpinningParts(modelRef.current)

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

export default function ConfigCarPreview({ bodyColor, active = true }) {
  const mobile = isMobile()
  const camPos = mobile ? [5.5, 2.2, 8.5] : [4.5, 1.8, 5.5]
  const camFov = mobile ? 42 : 32

  return (
    <div className="config-car-preview">
      <Canvas
        camera={{ position: camPos, fov: camFov, near: 0.01, far: 100 }}
        gl={{
          antialias: !mobile,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        dpr={mobile ? 1 : [1, 1.25]}
        frameloop={active ? 'always' : 'never'}
      >
        {/* Match hero CarScene lighting exactly */}
        <directionalLight position={[8, 12, 6]} intensity={2.5} />
        <directionalLight position={[-10, 5, -5]} intensity={0.9} color="#c8d8ff" />
        <directionalLight position={[0, 3, -10]} intensity={0.6} color="#D4A853" />
        <ambientLight intensity={0.25} />

        <Suspense fallback={null}>
          <MiniCarModel bodyColor={bodyColor} mobile={mobile} />
          <Environment
            preset="studio"
            background={false}
            environmentIntensity={mobile ? 0.8 : 1.2}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

useGLTF.preload(MODEL_PATH)
