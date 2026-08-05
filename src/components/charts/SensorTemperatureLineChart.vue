<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as d3 from 'd3'

interface SensorLine {
  id: string
  color: string
  points: { t: number; v: number }[]
}

const props = withDefaults(
  defineProps<{
    /** 센서(시리즈) 개수 */
    sensorCount?: number
    /** x축 최대 시간(초) */
    tMax?: number
    /** y축 최소 온도(°C) */
    yMin?: number
    /** y축 최대 온도(°C) */
    yMax?: number
    /** 한 시리즈당 샘플 스텝 수 */
    steps?: number
  }>(),
  { sensorCount: 65, tMax: 6, yMin: 20, yMax: 23, steps: 60 },
)

const container = ref<HTMLDivElement | null>(null)
const svgRef = ref<SVGSVGElement | null>(null)

// 커서로 가장 가까운 시리즈를 하이라이트할 때 쓰는 툴팁 상태
const hovered = ref<{
  id: string
  v: number
  t: number
  color: string
  x: number
  y: number
} | null>(null)

const margin = { top: 16, right: 18, bottom: 34, left: 46 }

let sensors: SensorLine[] = []
let ro: ResizeObserver | null = null
let xScale: d3.ScaleLinear<number, number> = d3.scaleLinear()
let yScale: d3.ScaleLinear<number, number> = d3.scaleLinear()
let linePaths: d3.Selection<d3.BaseType | SVGPathElement, SensorLine, SVGGElement, unknown> | null = null

/** 65개 센서의 온도 시계열을 랜덤워크로 생성 (baseline으로 밴드를 고르게 채움) */
function generate() {
  const { sensorCount, tMax, yMin, yMax, steps } = props
  const dt = tMax / steps
  const bandLo = yMin + 0.4
  const bandHi = yMax - 0.4
  sensors = Array.from({ length: sensorCount }, (_, i) => {
    const baseline = bandLo + (i / Math.max(1, sensorCount - 1)) * (bandHi - bandLo)
    let v = baseline + (Math.random() - 0.5) * 0.3
    const points = Array.from({ length: steps + 1 }, (_, s) => {
      // 완만한 랜덤워크 + baseline으로 되돌리는 힘
      v += (Math.random() - 0.5) * 0.14 + (baseline - v) * 0.06
      v = Math.max(yMin, Math.min(yMax, v))
      return { t: s * dt, v }
    })
    return {
      id: `CH-${String(i + 1).padStart(2, '0')}`,
      color: d3.interpolateTurbo(0.06 + (i / Math.max(1, sensorCount - 1)) * 0.88),
      points,
    }
  })
}

function valueAt(s: SensorLine, t: number) {
  const dt = props.tMax / props.steps
  const idx = Math.max(0, Math.min(props.steps, t / dt))
  const i0 = Math.floor(idx)
  const i1 = Math.min(i0 + 1, s.points.length - 1)
  const frac = idx - i0
  return s.points[i0].v + (s.points[i1].v - s.points[i0].v) * frac
}

function draw() {
  if (!container.value || !svgRef.value) return
  const { width, height } = container.value.getBoundingClientRect()
  const plotW = width - margin.left - margin.right
  const plotH = height - margin.top - margin.bottom
  if (plotW <= 0 || plotH <= 0) return

  const svg = d3.select(svgRef.value).attr('width', width).attr('height', height)
  svg.selectAll('*').remove()

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  xScale = d3.scaleLinear().domain([0, props.tMax]).range([0, plotW])
  yScale = d3.scaleLinear().domain([props.yMin, props.yMax]).range([plotH, 0])

  const xTicks = xScale.ticks(6)
  const yTicks = yScale.ticks(7)

  // grid
  const grid = g.append('g')
  grid
    .selectAll('line.h')
    .data(yTicks)
    .join('line')
    .attr('x1', 0)
    .attr('x2', plotW)
    .attr('y1', (d) => yScale(d))
    .attr('y2', (d) => yScale(d))
    .attr('stroke', 'hsl(210 18% 16%)')
    .attr('stroke-width', 1)
  grid
    .selectAll('line.v')
    .data(xTicks)
    .join('line')
    .attr('y1', 0)
    .attr('y2', plotH)
    .attr('x1', (d) => xScale(d))
    .attr('x2', (d) => xScale(d))
    .attr('stroke', 'hsl(210 18% 16% / 0.55)')
    .attr('stroke-width', 1)

  // lines
  const line = d3
    .line<{ t: number; v: number }>()
    .x((d) => xScale(d.t))
    .y((d) => yScale(d.v))
    .curve(d3.curveMonotoneX)

  linePaths = g
    .append('g')
    .attr('fill', 'none')
    .selectAll('path')
    .data(sensors)
    .join('path')
    .attr('d', (d) => line(d.points))
    .attr('stroke', (d) => d.color)
    .attr('stroke-width', 1)
    .attr('stroke-opacity', 0.55)
    .attr('stroke-linecap', 'round')

  // x axis labels
  g.append('g')
    .attr('transform', `translate(0,${plotH})`)
    .selectAll('text')
    .data(xTicks)
    .join('text')
    .attr('x', (d) => xScale(d))
    .attr('y', 20)
    .attr('text-anchor', 'middle')
    .attr('fill', 'hsl(210 12% 52%)')
    .attr('font-size', '11px')
    .attr('font-family', 'var(--font-mono)')
    .text((d) => `${d}s`)

  // y axis labels
  g.append('g')
    .selectAll('text')
    .data(yTicks)
    .join('text')
    .attr('x', -10)
    .attr('y', (d) => yScale(d))
    .attr('dy', '0.32em')
    .attr('text-anchor', 'end')
    .attr('fill', 'hsl(210 12% 52%)')
    .attr('font-size', '11px')
    .attr('font-family', 'var(--font-mono)')
    .text((d) => `${d.toFixed(1)}°`)

  // hover overlay
  g.append('rect')
    .attr('width', plotW)
    .attr('height', plotH)
    .attr('fill', 'transparent')
    .style('cursor', 'crosshair')
    .on('mousemove', onMove)
    .on('mouseleave', () => {
      hovered.value = null
      updateHighlight()
    })

  updateHighlight()
}

function onMove(event: MouseEvent) {
  const [mx, my] = d3.pointer(event)
  const t = Math.max(0, Math.min(props.tMax, xScale.invert(mx)))
  let best: SensorLine | null = null
  let bestV = 0
  let bestDist = Infinity
  for (const s of sensors) {
    const v = valueAt(s, t)
    const dist = Math.abs(yScale(v) - my)
    if (dist < bestDist) {
      bestDist = dist
      best = s
      bestV = v
    }
  }
  if (best) {
    hovered.value = {
      id: best.id,
      v: bestV,
      t,
      color: best.color,
      x: margin.left + xScale(t),
      y: margin.top + yScale(bestV),
    }
    updateHighlight()
  }
}

function updateHighlight() {
  if (!linePaths) return
  const h = hovered.value
  linePaths
    .attr('stroke-opacity', (d) => (!h ? 0.55 : d.id === h.id ? 1 : 0.1))
    .attr('stroke-width', (d) => (h && d.id === h.id ? 2 : 1))
  if (h) linePaths.filter((d) => d.id === h.id).raise()
}

function regenerate() {
  generate()
  draw()
}

defineExpose({ regenerate })

onMounted(() => {
  generate()
  draw()
  ro = new ResizeObserver(() => draw())
  if (container.value) ro.observe(container.value)
})

onBeforeUnmount(() => {
  ro?.disconnect()
  ro = null
})
</script>

<template>
  <div ref="container" class="relative h-full w-full">
    <svg ref="svgRef" class="block" />

    <!-- 하이라이트 지점 마커 -->
    <div
      v-if="hovered"
      class="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-background"
      :style="{ left: `${hovered.x}px`, top: `${hovered.y}px`, backgroundColor: hovered.color }"
    />

    <!-- 툴팁 -->
    <div
      v-if="hovered"
      class="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[140%] whitespace-nowrap rounded-md border border-border bg-card/95 px-2.5 py-1.5 shadow-lg backdrop-blur"
      :style="{ left: `${hovered.x}px`, top: `${hovered.y}px` }"
    >
      <div class="flex items-center gap-1.5">
        <span
          class="h-2 w-2 rounded-full status-dot"
          :style="{ backgroundColor: hovered.color, color: hovered.color }"
        />
        <span class="font-display text-xs text-foreground">{{ hovered.id }}</span>
      </div>
      <div class="mt-0.5 font-mono-tabular text-[11px] text-muted-foreground">
        {{ hovered.t.toFixed(2) }}s · <span :style="{ color: hovered.color }">{{ hovered.v.toFixed(2) }}°C</span>
      </div>
    </div>
  </div>
</template>
