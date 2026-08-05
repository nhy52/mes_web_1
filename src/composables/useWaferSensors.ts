import { ref } from 'vue'
import * as d3 from 'd3'

export interface WaferSensor {
  id: string
  num: string
  x: number
  y: number
  t: number
  /** Sensor Control 패널용 색상 (colorScale에서 랜덤 샘플) */
  color: string
  /** on/off 상태 — off면 히트맵 보간에서 제외 */
  active: boolean
}

interface WaferSensorOptions {
  size: number
  count: number
  tMin: number
  tMax: number
}

/**
 * 원형 웨이퍼 위 센서 집합을 관리. 위치/온도/색상 생성 + on-off 토글.
 * 히트맵(WaferHeatmap)과 Sensor Control(SensorControl)이 같은 데이터를 공유한다.
 */
export function useWaferSensors(opts: WaferSensorOptions) {
  const sensors = ref<WaferSensor[]>([])

  function generate() {
    const { size, count, tMin, tMax } = opts
    const r = size / 2
    const cx = size / 2
    const cy = size / 2
    // 공간 구조를 위한 hot/cold spot
    const spots = [
      { x: cx + r * 0.35, y: cy + r * 0.25, w: 1 },
      { x: cx - r * 0.4, y: cy - r * 0.35, w: -0.75 },
    ]

    sensors.value = Array.from({ length: count }, (_, i) => {
      const ang = Math.random() * Math.PI * 2
      const rad = Math.sqrt(Math.random()) * r * 0.94
      const x = cx + Math.cos(ang) * rad
      const y = cy + Math.sin(ang) * rad

      let field = 0.45 + (1 - rad / r) * 0.22
      for (const s of spots) {
        const d = Math.hypot(x - s.x, y - s.y)
        field += s.w * 0.4 * Math.exp(-(d * d) / (2 * (r * 0.34) ** 2))
      }
      field += (Math.random() - 0.5) * 0.1
      field = Math.max(0, Math.min(1, field))

      const num = String(i + 1).padStart(2, '0')
      return {
        id: `CH-${num}`,
        num,
        x: Math.round(x),
        y: Math.round(y),
        t: tMin + field * (tMax - tMin),
        color: d3.interpolateTurbo(Math.random()),
        active: true,
      }
    })
  }

  function toggle(id: string) {
    const s = sensors.value.find((s) => s.id === id)
    if (s) s.active = !s.active
  }

  generate()

  return { sensors, generate, toggle }
}
