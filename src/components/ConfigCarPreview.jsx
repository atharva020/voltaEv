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

function tunePreviewMaterials(object) {
  object.traverse((child) => {
    if (!child.isMesh || !child.material) return
    const name = (child.name || '').toLowerCase()
    const mats = Array.isArray(child.material) ? child.material : [child.material]

    mats.forEach((mat) => {
      if (name.includes('rim') || name.includes('chrome')) {
        mat.metalness = 0.55
        mat.roughness = 0.38
        mat.envMapIntensity = 0.45
      } else if (name.includes('body_color') || name.includes('paint')) {
        mat.metalness = 0.45
        mat.roughness = 0.38
        mat.envMapIntensity = 0.75
      }
      mat.needsUpdate = true
    })
  })
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

    fixMaterials(clone, bodyColor)
    tunePreviewMaterials(clone)
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
          toneMappingExposure: mobile ? 1.5 : 1.45,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        dpr={mobile ? 1 : [1, 1.25]}
        frameloop={active ? 'always' : 'never'}
      >
        <directionalLight position={[6, 10, 5]} intensity={mobile ? 2.4 : 3} />
        <directionalLight position={[-8, 5, -4]} intensity={1.2} color="#c8d8ff" />
        <directionalLight position={[0, 3, -8]} intensity={0.9} color="#D4A853" />
        <ambientLight intensity={mobile ? 0.7 : 0.55} />
        <hemisphereLight args={['#b8c0d8', '#1a1a1a', 0.65]} />

        <Suspense fallback={null}>
          <MiniCarModel bodyColor={bodyColor} mobile={mobile} />
          <Environment preset="studio" background={false} environmentIntensity={mobile ? 1.1 : 1.4} />
        </Suspense>
      </Canvas>
    </div>
  )
}

useGLTF.preload(MODEL_PATH)
