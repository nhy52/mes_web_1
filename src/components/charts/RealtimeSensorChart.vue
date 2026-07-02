<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { SensorSeriesConfig } from '@/types/mes'
import type { StreamPoint } from '@/composables/useMockSensorData'

const props = withDefaults(
  defineProps<{
    id: string
    configs: SensorSeriesConfig[]
    windowSize?: number
    /** 초기 로드시 대용량 히스토리 데이터를 미리 채워 SciChart의 대용량 렌더링 성능을 보여준다 */
    seedCount?: number
  }>(),
  { windowSize: 240, seedCount: 0 },
)

const rootEl = ref<HTMLDivElement | null>(null)
let dataSeriesMap: Record<string, any> = {}
let surface: any = null
let disposed = false

async function init() {
  const {
    SciChartSurface,
    NumericAxis,
    FastLineRenderableSeries,
    XyDataSeries,
    NumberRange,
    EllipsePointMarker,
    SciChartJsNavyTheme,
    EAutoRange,
    ENumericFormat,
  } = await import('scichart')

  // Vite는 scichart의 wasm 파일을 자동으로 서빙하지 않으므로 버전에 맞는 CDN에서 로드한다.
  SciChartSurface.loadWasmFromCDN()

  // 포트폴리오/데모 용도의 무료 커뮤니티 라이선스.
  // 실제 배포 시 https://www.scichart.com/licensing-scichart-js 에서 발급받은 키로 교체하세요.
  SciChartSurface.UseCommunityLicense()

  if (disposed || !rootEl.value) return

  const { sciChartSurface, wasmContext } = await SciChartSurface.create(rootEl.value, {
    theme: new SciChartJsNavyTheme(),
  })
  if (disposed) {
    sciChartSurface.delete()
    return
  }
  surface = sciChartSurface

  surface.background = 'transparent'

  const xAxis = new NumericAxis(wasmContext, {
    autoRange: EAutoRange.Always,
    drawMajorGridLines: true,
    drawMinorGridLines: false,
    labelFormat: ENumericFormat.Decimal,
  })
  surface.xAxes.add(xAxis)

  const yAxis = new NumericAxis(wasmContext, {
    autoRange: EAutoRange.Always,
    growBy: new NumberRange(0.1, 0.15),
    drawMinorGridLines: false,
  })
  surface.yAxes.add(yAxis)

  props.configs.forEach((cfg) => {
    const ds = new XyDataSeries(wasmContext, { dataSeriesName: cfg.label })
    dataSeriesMap[cfg.key] = ds
    const series = new FastLineRenderableSeries(wasmContext, {
      dataSeries: ds,
      stroke: cfg.color,
      strokeThickness: 2,
      pointMarker: new EllipsePointMarker(wasmContext, {
        width: 5,
        height: 5,
        fill: cfg.color,
        strokeThickness: 0,
      }),
    })
    surface.renderableSeries.add(series)
  })

  if (props.seedCount > 0) {
    seedHistory(props.seedCount)
  }
}

/** 대용량 히스토리 데이터를 랜덤워크로 생성해 시리즈에 채운다 */
function seedHistory(count: number) {
  const cursor: Record<string, number> = Object.fromEntries(
    props.configs.map((c) => [c.key, c.base]),
  )
  for (const cfg of props.configs) {
    const ds = dataSeriesMap[cfg.key]
    if (!ds) continue
    const xs: number[] = []
    const ys: number[] = []
    for (let i = 0; i < count; i++) {
      const drift = (Math.random() - 0.5) * cfg.volatility
      let v = cursor[cfg.key] + drift
      v = Math.min(cfg.max, Math.max(cfg.min, v))
      cursor[cfg.key] = v
      xs.push(i)
      ys.push(v)
    }
    ds.appendRange(xs, ys)
    tCounter = count
  }
}

let tCounter = 0
function appendPoint(point: StreamPoint) {
  tCounter += 1
  for (const key of Object.keys(point.values)) {
    const ds = dataSeriesMap[key]
    if (!ds) continue
    ds.append(tCounter, point.values[key])
    if (ds.count() > props.windowSize) {
      ds.removeRange(0, ds.count() - props.windowSize)
    }
  }
}

defineExpose({ appendPoint })

onMounted(() => {
  init()
})

onBeforeUnmount(() => {
  disposed = true
  surface?.delete()
  dataSeriesMap = {}
})
</script>

<template>
  <div :id="id" ref="rootEl" class="h-full w-full min-h-[240px]" />
</template>
