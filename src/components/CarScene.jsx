import { Suspense, useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment, Center, useProgress, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

const MODEL_PATH = '/3D-model2.glb'
const isMobileDevice = () => typeof window !== 'undefined' && window.innerWidth < 768

function LoadReporter({ onLoadProgress, onModelReady }) {
  const { progress, active } = useProgress()
  const readySent = useRef(false)

  useEffect(() => {
    onLoadProgress?.(Math.min(99, Math.round(progress)))
  }, [progress, onLoadProgress])

  useEffect(() => {
    if (!active && progress >= 100 && !readySent.current) {
      readySent.current = true
      onModelReady?.()
    }
  }, [active, progress, onModelReady])

  return null
}

const WHEEL_HUB_NAMES = [
  'Empty_FL_Wheels',
  'Empty_FR_Wheels',
  'Empty_FL_Wheels.001',
  'Empty_FR_Wheels.001',
]

const RIM_NAMES = [
  'rim_235',
  'rim_235.001',
  'rim_235.002',
  'rim_235.003',
]

const SPINNING_PART_NAMES = new Set([...WHEEL_HUB_NAMES, ...RIM_NAMES])

export function resetSpinningParts(object) {
  if (!object) return
  object.traverse((child) => {
    const name = child.name || ''
    if (
      SPINNING_PART_NAMES.has(name) ||
      name.startsWith('tire_v001') ||
      name.startsWith('brakes_Coll')
    ) {
      child.rotation.set(0, 0, 0)
    }
  })
}

const WHEEL_ASSEMBLY_NAMES = new Set(WHEEL_HUB_NAMES)

export function collectRims(object, rimsRef) {
  const rims = []
  object.traverse((child) => {
    if (RIM_NAMES.includes(child.name)) rims.push(child)
  })
  if (rimsRef) {
    rimsRef.current = rims
  }
  return rims
}

export function collectWheelAssemblies(object, wheelParentsRef) {
  const assemblies = []
  object.traverse((child) => {
    if (WHEEL_ASSEMBLY_NAMES.has(child.name)) {
      assemblies.push(child)
    }
  })
  if (wheelParentsRef) {
    wheelParentsRef.current = assemblies
  }
}

// ── Material enhancer: log and fix metalness/roughness ───────
export function fixMaterials(object, bodyColor, wheelParentsRef, rimsRef) {
  object.traverse((child) => {
    if (!child.isMesh) return

    if (!child.material) return

    const mobile = isMobileDevice()
    child.castShadow = !mobile
    child.receiveShadow = !mobile

    const mats = Array.isArray(child.material) ? child.material : [child.material]
    mats.forEach((mat) => {
      if (!mat._volta_fixed) {
        mat._volta_fixed = true
      }

      if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace
      if (mat.emissiveMap) mat.emissiveMap.colorSpace = THREE.SRGBColorSpace

      const matName = (mat.name || child.name || '').toLowerCase()
      const isBodyPaint = matName.includes('body_color') || matName.includes('paint')
      const isRubber = matName.includes('rubber') || matName.includes('tyre') || matName.includes('tire')
      const isChrome = matName.includes('chrome') || matName.includes('metal') || matName.includes('steel')
      const isLight = matName.includes('light') || matName.includes('lamp') || matName.includes('emissiv')

      if (isRubber) {
        mat.roughness = 0.85
        mat.metalness = 0.0
      } else if (isChrome) {
        mat.roughness = 0.05
        mat.metalness = 1.0
        mat.envMapIntensity = mobile ? 1.2 : 2.5
      } else if (isLight) {
        // leave as-is
      } else if (isBodyPaint) {
        if (mat.metalness !== undefined && mat.metalness < 0.3) {
          mat.metalness = 0.6
        }
        if (mat.roughness !== undefined && mat.roughness > 0.3) {
          mat.roughness = 0.2
        }
        mat.envMapIntensity = mobile ? 1.0 : 1.5
        if (bodyColor && mat.color) {
          mat.color.set(bodyColor)
        }
      } else {
        mat.transparent = false
        mat.opacity = 1.0
        mat.roughness = 0.05
        mat.metalness = 0.4
        if (mat.color) mat.color.set('#030303')
        mat.envMapIntensity = mobile ? 1.2 : 2.0
      }

      mat.needsUpdate = true
    })
  })

  collectWheelAssemblies(object, wheelParentsRef)
  collectRims(object, rimsRef)
}

const _rollAxis = new THREE.Vector3(1, 0, 0)

export function spinRims(rims, amount, orientationQuat) {
  if (!amount || !rims?.length) return
  _rollAxis.set(1, 0, 0)
  if (orientationQuat) _rollAxis.applyQuaternion(orientationQuat)
  rims.forEach((rim) => rim.rotateOnWorldAxis(_rollAxis, amount))
}

export function applyBodyColor(object, bodyColor) {
  object.traverse((child) => {
    if (!child.isMesh || !child.material) return
    const mats = Array.isArray(child.material) ? child.material : [child.material]
    mats.forEach((mat) => {
      const matName = (mat.name || child.name || '').toLowerCase()
      const isBodyPaint = matName.includes('body_color') || matName.includes('paint')
      if (isBodyPaint && mat.color) {
        mat.color.set(bodyColor)
        mat.needsUpdate = true
      }
    })
  })
}

function CarModel({ carData, bodyColor }) {
  const groupRef = useRef()
  const wheelsRef = useRef([])
  const rimsRef = useRef([])
  const prevWheelRot = useRef(0)
  const { scene } = useGLTF(MODEL_PATH)
  
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    wheelsRef.current = []
    rimsRef.current = []
    
    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    
    if (maxDim > 0) {
      clone.scale.setScalar(8 / maxDim)
    }

    fixMaterials(clone, bodyColor, wheelsRef, rimsRef)
    return clone
  }, [scene])

  useEffect(() => {
    if (!clonedScene) return
    applyBodyColor(clonedScene, bodyColor)
  }, [bodyColor, clonedScene])

  useFrame(() => {
    if (!carData?.current || !groupRef.current) return
    const { rotationY, positionX, positionY, positionZ, scale, wheelRot } = carData.current
    
    groupRef.current.rotation.y = rotationY
    groupRef.current.position.x = positionX
    groupRef.current.position.y = positionY || 0
    groupRef.current.position.z = positionZ
    groupRef.current.scale.setScalar(scale || 1)

    wheelsRef.current.forEach((wheelAssembly) => {
      wheelAssembly.rotation.x = wheelRot
    })

    const wheelDelta = wheelRot - prevWheelRot.current
    spinRims(rimsRef.current, wheelDelta, groupRef.current.quaternion)
    prevWheelRot.current = wheelRot
  })

  return (
    <group ref={groupRef}>
      <Center>
        {clonedScene && <primitive object={clonedScene} />}
      </Center>
    </group>
  )
}

function ShadowGround() {
  if (isMobileDevice()) return null

  return (
    <ContactShadows
      position={[0, -0.5, 0]}
      opacity={0.6}
      scale={20}
      blur={2}
      far={10}
      color="#000000"
    />
  )
}

export default function CarScene({ carData, bodyColor, onLoadProgress, onModelReady, active = true }) {
  const mobile = isMobileDevice()

  return (
    <Canvas
      id="car-canvas"
      frameloop={active ? 'always' : 'never'}
      camera={{ position: mobile ? [0, 1.4, 13.5] : [0, 2, 10], fov: mobile ? 40 : 42, near: 0.01, far: 2000 }}
      gl={{
        antialias: !mobile,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      shadows={!mobile}
      dpr={mobile ? 1 : [1, 1.25]}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        height: '100dvh',
        pointerEvents: 'none',
        zIndex: 1,
        background: 'transparent',
        opacity: active ? 1 : 0,
        transition: 'opacity 0.35s ease',
      }}
    >
      <LoadReporter onLoadProgress={onLoadProgress} onModelReady={onModelReady} />

      <directionalLight
        position={[8, 12, 6]}
        intensity={2.5}
        castShadow={!mobile}
        shadow-mapSize-width={mobile ? 512 : 1024}
        shadow-mapSize-height={mobile ? 512 : 1024}
        shadow-camera-near={0.1}
        shadow-camera-far={100}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-10, 5, -5]} intensity={0.9} color="#c8d8ff" />
      <directionalLight position={[0, 3, -10]} intensity={0.6} color="#D4A853" />
      <ambientLight intensity={0.25} />

      <Suspense fallback={null}>
        <CarModel carData={carData} bodyColor={bodyColor} />
        <ShadowGround />
        <Environment
          preset="studio"
          background={false}
          environmentIntensity={mobile ? 0.8 : 1.2}
        />
      </Suspense>
    </Canvas>
  )
}

useGLTF.preload(MODEL_PATH)
