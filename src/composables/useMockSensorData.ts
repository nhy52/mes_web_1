import { onBeforeUnmount, onMounted, shallowRef } from 'vue'
import type { SensorSeriesConfig } from '@/types/mes'

export interface StreamPoint {
  t: number
  values: Record<string, number>
}

/**
 * 설비 센서 값을 랜덤워크 방식으로 실시간처럼 시뮬레이션한다.
 * SciChart의 appendRange에 바로 먹일 수 있도록 콜백 기반으로 동작.
 */
export function useMockSensorData(
  configs: SensorSeriesConfig[],
  opts: { intervalMs?: number; onTick?: (point: StreamPoint) => void } = {},
) {
  const { intervalMs = 1000, onTick } = opts
  const current = shallowRef<Record<string, number>>(
    Object.fromEntries(configs.map((c) => [c.key, c.base])),
  )
  let timer: ReturnType<typeof setInterval> | undefined
  let t = 0

  function step(): StreamPoint {
    const next: Record<string, number> = { ...current.value }
    for (const c of configs) {
      const drift = (Math.random() - 0.5) * c.volatility
      // 가끔 스파이크(공정 이벤트)를 섞어 더 현실적인 파형을 만든다
      const spike = Math.random() < 0.02 ? (Math.random() - 0.5) * c.volatility * 6 : 0
      let v = next[c.key] + drift + spike
      v = Math.min(c.max, Math.max(c.min, v))
      next[c.key] = v
    }
    current.value = next
    t += intervalMs
    return { t: Date.now(), values: next }
  }

  onMounted(() => {
    timer = setInterval(() => {
      const point = step()
      onTick?.(point)
    }, intervalMs)
  })

  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
  })

  return { current }
}

export const FAB_SENSOR_CONFIGS: SensorSeriesConfig[] = [
  { key: 'chamberTemp', label: 'Chamber Temp', unit: '°C', color: '#3ddbff', base: 245, volatility: 1.2, min: 220, max: 270 },
  { key: 'rfPower', label: 'RF Power', unit: 'W', color: '#ff8a3d', base: 1500, volatility: 25, min: 1200, max: 1800 },
  { key: 'chamberPressure', label: 'Chamber Pressure', unit: 'mTorr', color: '#7ee787', base: 45, volatility: 1.5, min: 30, max: 60 },
  { key: 'particleCount', label: 'Particle Count', unit: 'cnt', color: '#e879f9', base: 8, volatility: 1.8, min: 0, max: 40 },
]
