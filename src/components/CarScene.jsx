import { Suspense, useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment, Center, useProgress, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

// ── Load progress logger (dev only) ──────────────────────────
function LoadProgress() {
  const { progress, errors } = useProgress()
  useEffect(() => {
    if (errors.length) console.error('[CarScene] Load errors:', errors)
    if (progress === 100) console.log('[CarScene] Model fully loaded.')
  }, [progress, errors])
  return null
}

// ── Material enhancer: log and fix metalness/roughness ───────
function fixMaterials(object, bodyColor, wheelParentsRef) {
  const wheelMeshes = []
  
  object.traverse((child) => {
    if (!child.isMesh) return
    
    // Collect wheel meshes by name
    const name = (child.name || '').toLowerCase()
    if (name.includes('wheel') || name.includes('tire') || name.includes('tyre') || name.includes('rim') || name.includes('rubber') || name.includes('tireprotector') || name.includes('plane00')) {
      wheelMeshes.push(child)
    }

    if (!child.material) return

    // Ensure castShadow / receiveShadow on all meshes
    child.castShadow = true
    child.receiveShadow = true

    const mats = Array.isArray(child.material) ? child.material : [child.material]
    mats.forEach((mat) => {
      if (!mat._volta_fixed) {
        mat._volta_fixed = true
      }

      // Enable SRGB textures for correct color rendering
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
        mat.envMapIntensity = 2.5
      } else if (isLight) {
        // leave as-is, don't override emissive lights
      } else if (isBodyPaint) {
        // Car body paint: restore glossy original look
        if (mat.metalness !== undefined && mat.metalness < 0.3) {
          mat.metalness = 0.6
        }
        if (mat.roughness !== undefined && mat.roughness > 0.3) {
          mat.roughness = 0.2
        }
        mat.envMapIntensity = 1.5
        // Apply body color
        if (bodyColor && mat.color) {
          mat.color.set(bodyColor)
        }
      } else {
        // Everything else (plastic trims, unknown materials, and specifically the large window area)
        // Make it pitch black and sleek/glossy to match the reference image.
        mat.transparent = false
        mat.opacity = 1.0
        mat.roughness = 0.05
        mat.metalness = 0.4
        if (mat.color) mat.color.set('#030303')
        mat.envMapIntensity = 2.0
      }

      mat.needsUpdate = true
    })
  })
  
  // Group wheel meshes by parent to find the 4 wheel assemblies
  const parentSet = new Set()
  wheelMeshes.forEach(mesh => {
    if (mesh.parent) parentSet.add(mesh.parent)
  })
  if (wheelParentsRef) {
    wheelParentsRef.current = Array.from(parentSet)
  }
}

// ── Car Model ─────────────────────────────────────────────────
function CarModel({ carData, bodyColor }) {
  const groupRef = useRef()
  const wheelsRef = useRef([])
  const { scene } = useGLTF('/3D-model2.glb')
  
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    wheelsRef.current = [] // reset
    
    // Normalize scale so the model is always a reasonable size
    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    
    if (maxDim > 0) {
      const scaleTarget = 8 / maxDim // increased from 5 to make car larger initially
      clone.scale.setScalar(scaleTarget)
    }

    fixMaterials(clone, bodyColor, wheelsRef)
    console.log('[CarScene] wheel assemblies:', wheelsRef.current.length,
      wheelsRef.current.map(p => p.name || '(unnamed)'))
    return clone
  }, [scene]) // scene is cached by useGLTF, bodyColor is handled below

  // Reapply color when it changes
  useEffect(() => {
    if (!clonedScene) return
    clonedScene.traverse((child) => {
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
  }, [bodyColor, clonedScene])

  // useFrame for 60fps buttery smooth scroll-driven animation
  useFrame(() => {
    if (!carData?.current || !groupRef.current) return
    const { rotationY, positionX, positionY, positionZ, scale, wheelRot } = carData.current
    
    groupRef.current.rotation.y = rotationY
    groupRef.current.position.x = positionX
    groupRef.current.position.y = positionY || 0
    groupRef.current.position.z = positionZ
    groupRef.current.scale.setScalar(scale || 1)

    // Rotate each wheel assembly (parent group) around its local X axis
    wheelsRef.current.forEach(wheelParent => {
      wheelParent.rotation.z = wheelRot
    })
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

// ── Main export ───────────────────────────────────────────────
export default function CarScene({ carData, bodyColor }) {
  return (
    <Canvas
      id="car-canvas"
      camera={{ position: [0, 2, 10], fov: 42, near: 0.01, far: 2000 }}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      shadows="soft"
      dpr={[1, 1.5]}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1,
        background: 'transparent',
      }}
    >
      {/* Key light — strong directional from upper-right, casts crisp shadow */}
      <directionalLight
        position={[8, 12, 6]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={100}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0004}
      />
      {/* Fill light — soft blue from left to separate from dark bg */}
      <directionalLight position={[-10, 5, -5]} intensity={0.9} color="#c8d8ff" />
      {/* Rim/backlight — amber warm from behind for depth */}
      <directionalLight position={[0, 3, -10]} intensity={0.6} color="#D4A853" />
      {/* Ambient — subtle, don't wash out shadows */}
      <ambientLight intensity={0.25} />

      <Suspense fallback={<LoadProgress />}>
        <CarModel carData={carData} bodyColor={bodyColor} />

        {/* Soft accumulated ground shadow */}
        <ShadowGround />

        {/* Studio HDRI — provides reflection data for metallic/shiny materials */}
        <Environment
          preset="studio"
          background={false}
          environmentIntensity={1.2}
        />
      </Suspense>
    </Canvas>
  )
}

useGLTF.preload('/3D-model2.glb')
