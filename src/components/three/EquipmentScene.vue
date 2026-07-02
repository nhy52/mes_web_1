<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { Equipment } from '@/types/mes'

const props = defineProps<{ items: Equipment[] }>()

const container = ref<HTMLDivElement | null>(null)
let renderer: THREE.WebGLRenderer | undefined
let scene: THREE.Scene | undefined
let camera: THREE.PerspectiveCamera | undefined
let controls: OrbitControls | undefined
let raf = 0
let resizeObserver: ResizeObserver | undefined

const statusColor: Record<Equipment['status'], number> = {
  RUN: 0x3ddbff,
  IDLE: 0x64748b,
  ALARM: 0xff4d4d,
  DOWN: 0xffb020,
}

const chamberGroup = new THREE.Group()
const chamberMeshes = new Map<string, THREE.Mesh>()
const glowMeshes = new Map<string, THREE.Mesh>()

function buildScene(el: HTMLDivElement) {
  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x090c10, 0.028)

  camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 200)
  camera.position.set(16, 12, 18)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(el.clientWidth, el.clientHeight)
  el.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minDistance = 8
  controls.maxDistance = 40
  controls.maxPolarAngle = Math.PI / 2.1
  controls.target.set(0, 1, 0)

  scene.add(new THREE.AmbientLight(0x445566, 1.1))
  const key = new THREE.DirectionalLight(0x88d9ff, 1.4)
  key.position.set(10, 18, 8)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0xff8a3d, 0.5)
  rim.position.set(-12, 8, -10)
  scene.add(rim)

  // 바닥
  const floorGeo = new THREE.PlaneGeometry(60, 60)
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x0c1116, roughness: 0.95, metalness: 0.1 })
  const floor = new THREE.Mesh(floorGeo, floorMat)
  floor.rotation.x = -Math.PI / 2
  scene.add(floor)

  const grid = new THREE.GridHelper(60, 40, 0x1c2733, 0x141c24)
  scene.add(grid)

  scene.add(chamberGroup)
  layoutChambers(props.items)

  animate()

  resizeObserver = new ResizeObserver(() => {
    if (!el || !renderer || !camera) return
    camera.aspect = el.clientWidth / el.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(el.clientWidth, el.clientHeight)
  })
  resizeObserver.observe(el)
}

function layoutChambers(items: Equipment[]) {
  chamberGroup.clear()
  chamberMeshes.clear()
  glowMeshes.clear()

  const perRow = 4
  const spacing = 4.2
  items.forEach((eq, i) => {
    const col = i % perRow
    const row = Math.floor(i / perRow)
    const x = (col - (perRow - 1) / 2) * spacing
    const z = row * spacing - 4

    const bodyGeo = new THREE.CylinderGeometry(1, 1.15, 2.2, 8)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1a2129,
      roughness: 0.4,
      metalness: 0.6,
      emissive: new THREE.Color(statusColor[eq.status]),
      emissiveIntensity: 0.25,
    })
    const body = new THREE.Mesh(bodyGeo, bodyMat)
    body.position.set(x, 1.1, z)
    chamberGroup.add(body)
    chamberMeshes.set(eq.id, body)

    const glowGeo = new THREE.SphereGeometry(0.18, 12, 12)
    const glowMat = new THREE.MeshBasicMaterial({ color: statusColor[eq.status] })
    const glow = new THREE.Mesh(glowGeo, glowMat)
    glow.position.set(x, 2.5, z)
    chamberGroup.add(glow)
    glowMeshes.set(eq.id, glow)

    const ringGeo = new THREE.RingGeometry(1.3, 1.45, 24)
    const ringMat = new THREE.MeshBasicMaterial({
      color: statusColor[eq.status],
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = -Math.PI / 2
    ring.position.set(x, 0.02, z)
    chamberGroup.add(ring)
  })
}

function updateColors(items: Equipment[]) {
  items.forEach((eq) => {
    const body = chamberMeshes.get(eq.id)
    const glow = glowMeshes.get(eq.id)
    const c = statusColor[eq.status]
    if (body) {
      ;(body.material as THREE.MeshStandardMaterial).emissive.setHex(c)
    }
    if (glow) {
      ;(glow.material as THREE.MeshBasicMaterial).color.setHex(c)
    }
  })
}

function animate() {
  raf = requestAnimationFrame(animate)
  controls?.update()
  glowMeshes.forEach((mesh) => {
    const s = 1 + Math.sin(Date.now() * 0.004 + mesh.position.x) * 0.15
    mesh.scale.setScalar(s)
  })
  if (renderer && scene && camera) renderer.render(scene, camera)
}

watch(
  () => props.items.map((i) => i.status).join(','),
  () => updateColors(props.items),
)

onMounted(() => {
  if (container.value) buildScene(container.value)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  resizeObserver?.disconnect()
  controls?.dispose()
  renderer?.dispose()
  if (renderer && container.value) container.value.removeChild(renderer.domElement)
})
</script>

<template>
  <div ref="container" class="h-full w-full min-h-[420px] rounded-lg overflow-hidden" />
</template>
