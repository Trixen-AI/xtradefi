import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { stageFor, stageStore, type Face } from '@/lib/stageStore'
import { faceCanvas } from './faces'

// Fixed full-viewport Three.js stage. The object is QuiverFi's emblem: a thick chamfered tile (cut top-left and
// bottom-right corners, like the logo) whose face shows the payoff of the product in view. In the settlement
// section it becomes an oracle coin. Sections not showing it fade it out and drop it 450px, like the reference.

const CALL_A = new THREE.Color('#19e3a0')
const CALL_B = new THREE.Color('#b7f23a')
const PUT_A = new THREE.Color('#ffb627')
const PUT_B = new THREE.Color('#ff5b4a')

function chamferShape(half: number, ch: number, r: number) {
  const s = new THREE.Shape()
  s.moveTo(-half + ch, half)
  s.lineTo(half - r, half)
  s.quadraticCurveTo(half, half, half, half - r)
  s.lineTo(half, -half + ch)
  s.lineTo(half - ch, -half)
  s.lineTo(-half + r, -half)
  s.quadraticCurveTo(-half, -half, -half, -half + r)
  s.lineTo(-half, half - ch)
  s.closePath()
  return s
}

function gradientColors(geo: THREE.BufferGeometry, axis: (p: THREE.Vector3) => number) {
  const pos = geo.getAttribute('position')
  const colors: number[] = []
  const v = new THREE.Vector3()
  const c = new THREE.Color()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const t = THREE.MathUtils.clamp(axis(v), 0, 1)
    if (t < 0.33) c.lerpColors(CALL_A, CALL_B, t / 0.33)
    else if (t < 0.66) c.lerpColors(CALL_B, PUT_A, (t - 0.33) / 0.33)
    else c.lerpColors(PUT_A, PUT_B, (t - 0.66) / 0.34)
    colors.push(c.r, c.g, c.b)
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
}

function makeTexture(face: Face) {
  const t = new THREE.CanvasTexture(faceCanvas(face))
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

export function Stage3D() {
  const wrap = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const el = wrap.current
    if (!canvas || !el) return
    const reduced = prefersReducedMotion()

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    canvas.dataset.engine = `three.js r${THREE.REVISION}`

    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = envTex

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50)
    camera.position.set(0, 0, 9)

    scene.add(new THREE.AmbientLight(0xffffff, 0.25))
    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(-3, 4, 6)
    scene.add(key)
    const rimG = new THREE.PointLight(0x19e3a0, 26, 12)
    rimG.position.set(-3.2, 1.5, 1.2)
    scene.add(rimG)
    const rimC = new THREE.PointLight(0xff5b4a, 22, 12)
    rimC.position.set(3.4, -1.6, 1.4)
    scene.add(rimC)

    const bodyMat = new THREE.MeshPhysicalMaterial({ color: 0x1b1d20, metalness: 0.6, roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.25 })
    const rimMat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false })

    // Tile
    const HALF = 1.1
    const DEPTH = 0.5
    const BEVEL = 0.07
    const tile = new THREE.Group()
    const tileGeo = new THREE.ExtrudeGeometry(chamferShape(HALF, 0.42, 0.16), { depth: DEPTH, bevelEnabled: true, bevelSize: BEVEL, bevelThickness: BEVEL, bevelSegments: 4, curveSegments: 10 })
    tileGeo.translate(0, 0, -DEPTH / 2)
    tile.add(new THREE.Mesh(tileGeo, bodyMat))

    const inset = HALF - 0.16
    const faceShape = chamferShape(inset, 0.34, 0.1)
    const faceGeo = new THREE.ShapeGeometry(faceShape, 12)
    const uv = faceGeo.getAttribute('uv')
    const fp = faceGeo.getAttribute('position')
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (fp.getX(i) + inset) / (2 * inset), (fp.getY(i) + inset) / (2 * inset))
    const faceMat = new THREE.MeshStandardMaterial({ map: makeTexture('x'), emissive: 0xffffff, emissiveIntensity: 0.9, roughness: 0.45, metalness: 0.1 })
    faceMat.emissiveMap = faceMat.map
    const faceMesh = new THREE.Mesh(faceGeo, faceMat)
    faceMesh.position.z = DEPTH / 2 + BEVEL + 0.004
    tile.add(faceMesh)

    const rimPts = chamferShape(inset + 0.05, 0.37, 0.12).getPoints(24).map((p) => new THREE.Vector3(p.x, p.y, 0))
    const rimGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rimPts, true, 'catmullrom', 0.02), 260, 0.035, 10, true)
    gradientColors(rimGeo, (p) => (p.x - p.y + 2 * HALF) / (4 * HALF))
    const rim = new THREE.Mesh(rimGeo, rimMat)
    rim.position.z = DEPTH / 2 + BEVEL + 0.01
    tile.add(rim)

    // Coin
    const coin = new THREE.Group()
    const coinGeo = new THREE.CylinderGeometry(1.25, 1.25, 0.3, 96, 1)
    coinGeo.rotateX(Math.PI / 2)
    coin.add(new THREE.Mesh(coinGeo, bodyMat))
    const edgeGeo = new THREE.CylinderGeometry(1.262, 1.262, 0.2, 96, 1, true)
    edgeGeo.rotateX(Math.PI / 2)
    const edgeMat = new THREE.MeshPhysicalMaterial({ color: 0x2a2d31, metalness: 0.8, roughness: 0.45 })
    coin.add(new THREE.Mesh(edgeGeo, edgeMat))
    const coinFaceMat = new THREE.MeshStandardMaterial({ map: makeTexture('oracle'), emissive: 0xffffff, emissiveIntensity: 0.9, roughness: 0.45 })
    coinFaceMat.emissiveMap = coinFaceMat.map
    const coinFace = new THREE.Mesh(new THREE.CircleGeometry(1.08, 96), coinFaceMat)
    coinFace.position.z = 0.152
    coin.add(coinFace)
    const coinRimGeo = new THREE.TorusGeometry(1.14, 0.034, 10, 200)
    gradientColors(coinRimGeo, (p) => (p.x - p.y + 2.3) / 4.6)
    const coinRim = new THREE.Mesh(coinRimGeo, rimMat)
    coinRim.position.z = 0.156
    coin.add(coinRim)
    coin.scale.setScalar(0.001)
    coin.visible = false

    const pivot = new THREE.Group() // pointer tilt + idle
    const spin = new THREE.Group() // face flips
    spin.add(tile, coin)
    pivot.add(spin)
    scene.add(pivot)

    // Soft halo behind the object
    const haloCanvas = document.createElement('canvas')
    haloCanvas.width = haloCanvas.height = 256
    const hctx = haloCanvas.getContext('2d')
    if (hctx) {
      const g = hctx.createRadialGradient(128, 128, 0, 128, 128, 128)
      g.addColorStop(0, 'rgba(25,227,160,0.22)')
      g.addColorStop(0.5, 'rgba(255,182,39,0.07)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      hctx.fillStyle = g
      hctx.fillRect(0, 0, 256, 256)
    }
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 6.5), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(haloCanvas), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))
    halo.position.z = -1.6
    pivot.add(halo)

    // Sizing
    let baseScale = 1
    const resize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      baseScale = THREE.MathUtils.clamp(Math.min(w / 1440, h / 900) * 0.84, 0.46, 0.95)
      if (w < 768) baseScale = THREE.MathUtils.clamp(w / 780, 0.42, 0.6)
      pivot.scale.setScalar(baseScale)
    }
    resize()
    window.addEventListener('resize', resize)

    // Pointer tilt
    const pointer = { x: 0, y: 0 }
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove)

    // State changes
    let current = stageFor(stageStore.get())
    let spotY = 0
    const spotFor = (spot: 'center' | 'high') => (spot === 'high' ? 0.9 : 0)
    const applyVisible = (v: boolean) => el.classList.toggle('is-hidden', !v)
    applyVisible(current.visible)
    spotY = spotFor(current.spot)

    const setFace = (face: Face) => {
      if (face === 'oracle') return
      const next = makeTexture(face)
      const old = faceMat.map
      faceMat.map = next
      faceMat.emissiveMap = next
      faceMat.needsUpdate = true
      old?.dispose()
    }
    let shownFace: Face = current.face
    let shownShape = current.shape
    if (shownShape === 'coin') {
      tile.scale.setScalar(0.001)
      tile.visible = false
      coin.visible = true
      coin.scale.setScalar(1)
    }
    setFace(shownFace)

    const swapShape = (shape: 'tile' | 'coin') => {
      const show = shape === 'coin' ? coin : tile
      const hide = shape === 'coin' ? tile : coin
      show.visible = true
      gsap.to(hide.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.35, ease: 'power2.in', onComplete: () => void (hide.visible = false) })
      gsap.fromTo(show.scale, { x: 0.001, y: 0.001, z: 0.001 }, { x: 1, y: 1, z: 1, duration: 0.7, delay: 0.3, ease: 'back.out(1.6)' })
      gsap.fromTo(spin.rotation, { y: -Math.PI }, { y: 0, duration: 1, delay: 0.3, ease: 'power3.out' })
    }

    const flipTo = (face: Face) => {
      if (reduced) return setFace(face)
      let swapped = false
      gsap.fromTo(
        spin.rotation,
        { y: 0 },
        {
          y: Math.PI * 2,
          duration: 1.1,
          ease: 'power3.inOut',
          onUpdate() {
            if (!swapped && spin.rotation.y > Math.PI / 2) {
              swapped = true
              setFace(face)
            }
          },
          onComplete: () => void (spin.rotation.y = 0),
        },
      )
    }

    const unsub = stageStore.subscribe(() => {
      const next = stageFor(stageStore.get())
      applyVisible(next.visible)
      spotY = spotFor(next.spot)
      if (next.shape !== shownShape) {
        shownShape = next.shape
        swapShape(next.shape)
      }
      if (next.shape === 'tile' && next.face !== shownFace) {
        shownFace = next.face
        flipTo(next.face)
      }
      current = next
    })

    // Loop: render while visible (and during the fade-out), pause when the tab is hidden
    let raf = 0
    let running = true
    const timer = new THREE.Timer()
    let tilt = { x: 0, y: 0 }
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!running) return
      timer.update()
      const t = timer.getElapsed()
      const hiddenLong = !current.visible && getComputedStyle(el).opacity === '0'
      if (hiddenLong) return
      const amp = reduced ? 0 : 1
      tilt = { x: tilt.x + (pointer.y * 0.16 - tilt.x) * 0.05, y: tilt.y + (pointer.x * 0.28 - tilt.y) * 0.05 }
      pivot.rotation.x = 0.1 + tilt.x * amp
      pivot.rotation.y = -0.42 + Math.sin(t * 0.45) * 0.12 * amp + tilt.y * amp
      pivot.rotation.z = Math.sin(t * 0.3) * 0.03 * amp
      pivot.position.y += (spotY + Math.sin(t * 0.9) * 0.07 * amp - pivot.position.y) * 0.06
      renderer.render(scene, camera)
    }
    tick()
    const onVis = () => (running = !document.hidden)
    document.addEventListener('visibilitychange', onVis)

    return () => {
      cancelAnimationFrame(raf)
      unsub()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', onVis)
      gsap.killTweensOf([spin.rotation, tile.scale, coin.scale])
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose()
          const m = o.material as THREE.Material & { map?: THREE.Texture | null }
          m.map?.dispose()
          m.dispose()
        }
      })
      envTex.dispose()
      pmrem.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div ref={wrap} className="webgl" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  )
}
