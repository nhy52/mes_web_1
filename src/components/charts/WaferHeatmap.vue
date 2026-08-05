<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import Plotly from 'plotly.js-cartesian-dist-min'
import type { WaferSensor } from '@/composables/useWaferSensors'

const props = withDefaults(
  defineProps<{
    /** 활성(on) 센서만 전달 — off된 센서는 보간에서 제외됨 */
    sensors: WaferSensor[]
    /** 웨이퍼 지름 */
    size?: number
    /** 히트맵 보간 그리드 해상도 */
    grid?: number
    /** 라벨(센서번호:온도) 표시 여부 */
    showLabels?: boolean
  }>(),
  { size: 300, grid: 150, showLabels: true },
)

const el = ref<HTMLDivElement | null>(null)
let ro: ResizeObserver | null = null

/** 활성 센서를 IDW 보간해 원형 마스킹한 z 그리드 생성 */
function buildGrid(active: WaferSensor[]) {
  const g = props.grid
  const r = props.size / 2
  const cx = props.size / 2
  const cy = props.size / 2
  const power = 2.4

  const axis = Array.from({ length: g }, (_, i) => (props.size * i) / (g - 1))
  const z: (number | null)[][] = []
  for (let j = 0; j < g; j++) {
    const row: (number | null)[] = new Array(g)
    const y = axis[j]
    for (let i = 0; i < g; i++) {
      const x = axis[i]
      if (Math.hypot(x - cx, y - cy) > r) {
        row[i] = null
        continue
      }
      let num = 0
      let den = 0
      let exact: number | null = null
      for (const s of active) {
        const d = Math.hypot(x - s.x, y - s.y)
        if (d < 1e-6) {
          exact = s.t
          break
        }
        const w = 1 / Math.pow(d, power)
        num += w * s.t
        den += w
      }
      row[i] = exact !== null ? exact : den === 0 ? null : num / den
    }
    z.push(row)
  }
  return { axis, z }
}

function render() {
  if (!el.value) return
  const active = props.sensors

  // 활성 센서가 없으면 빈 웨이퍼만
  if (active.length === 0) {
    Plotly.react(el.value, [], emptyLayout(), { responsive: true, displayModeBar: false })
    return
  }

  // 활성 센서 기준으로 min/max 재계산 → 새 max 기준 Rainbow
  const temps = active.map((s) => s.t)
  const zmin = Math.min(...temps)
  const zmax = Math.max(...temps)

  const { axis, z } = buildGrid(active)

  const heat = {
    type: 'heatmap',
    x: axis,
    y: axis,
    z,
    colorscale: 'Rainbow', // 낮음=보라 → 높음=빨강
    zmin,
    zmax,
    zsmooth: 'best',
    hovertemplate: '%{z:.2f} °C<extra></extra>',
    colorbar: {
      title: { text: '°C', font: { color: 'hsl(200 15% 80%)', size: 11 } },
      tickfont: { color: 'hsl(210 12% 60%)', size: 10 },
      outlinewidth: 0,
      thickness: 12,
      len: 0.9,
    },
  }

  const markers = {
    type: 'scatter',
    mode: 'markers',
    x: active.map((s) => s.x),
    y: active.map((s) => s.y),
    marker: {
      size: 6,
      color: 'rgba(255,255,255,0.92)',
      line: { color: 'rgba(0,0,0,0.65)', width: 1 },
    },
    text: active.map((s) => `${s.id} : ${s.t.toFixed(2)} °C`),
    hoverinfo: 'text',
    showlegend: false,
  }

  const annotations = props.showLabels
    ? active.map((s) => ({
        x: s.x,
        y: s.y,
        text: `${s.num}:${s.t.toFixed(1)}`,
        showarrow: false,
        yshift: 9,
        font: { size: 8, color: 'rgba(255,255,255,0.9)', family: 'var(--font-mono)' },
        bgcolor: 'rgba(8,12,18,0.45)',
        borderpad: 1,
      }))
    : []

  const layout = emptyLayout()
  layout.annotations = annotations

  Plotly.react(el.value, [heat, markers], layout, {
    responsive: true,
    displayModeBar: false,
  })
}

/** 축을 숨긴(좌표 미표시) 정사각 웨이퍼 레이아웃 */
function emptyLayout() {
  return {
    margin: { l: 6, r: 8, t: 8, b: 6 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: 'hsl(210 12% 58%)', family: 'var(--font-body)', size: 11 },
    xaxis: { visible: false, range: [0, props.size], constrain: 'domain' },
    yaxis: { visible: false, range: [0, props.size], scaleanchor: 'x', scaleratio: 1 },
    shapes: [
      {
        type: 'circle',
        x0: 0,
        y0: 0,
        x1: props.size,
        y1: props.size,
        line: { color: 'hsl(190 95% 55% / 0.4)', width: 1.5 },
      },
    ],
    annotations: [] as unknown[],
    showlegend: false,
  }
}

watch(
  () => [props.sensors, props.showLabels],
  () => render(),
  { deep: true },
)

onMounted(() => {
  render()
  ro = new ResizeObserver(() => {
    if (el.value) Plotly.Plots.resize(el.value)
  })
  if (el.value) ro.observe(el.value)
})

onBeforeUnmount(() => {
  ro?.disconnect()
  ro = null
  if (el.value) Plotly.purge(el.value)
})
</script>

<template>
  <div ref="el" class="h-full w-full" />
</template>
