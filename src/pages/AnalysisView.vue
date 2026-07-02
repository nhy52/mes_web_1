<script setup lang="ts">
import { ref } from 'vue'
import AppShell from '@/components/layout/AppShell.vue'
import { Card, Badge } from '@/components/ui'
import RealtimeSensorChart from '@/components/charts/RealtimeSensorChart.vue'
import ChartLegend from '@/components/charts/ChartLegend.vue'
import { FAB_SENSOR_CONFIGS, useMockSensorData } from '@/composables/useMockSensorData'

const historyChartRef = ref<InstanceType<typeof RealtimeSensorChart> | null>(null)
const perMetricRefs: Record<string, InstanceType<typeof RealtimeSensorChart> | null> = {}

// 대용량 히스토리(5,000pt) + 실시간 스트리밍이 이어지는 메인 트렌드 차트
const { current: historyCurrent } = useMockSensorData(FAB_SENSOR_CONFIGS, {
  intervalMs: 500,
  onTick: (point) => historyChartRef.value?.appendPoint(point),
})

// 지표별 단일 시리즈 상세 차트
const perMetricConfigs = FAB_SENSOR_CONFIGS.map((c) => [c])
perMetricConfigs.forEach((configs) => {
  useMockSensorData(configs, {
    intervalMs: 800,
    onTick: (point) => perMetricRefs[configs[0].key]?.appendPoint(point),
  })
})

function setPerMetricRef(key: string, el: unknown) {
  perMetricRefs[key] = el as InstanceType<typeof RealtimeSensorChart> | null
}
</script>

<template>
  <AppShell title="데이터 분석" subtitle="대용량 시계열 렌더링 · SciChart.js WebAssembly 엔진">
    <Card class="p-4">
      <div class="flex items-center justify-between mb-3">
        <div>
          <h2 class="font-display text-sm text-foreground">Chamber 통합 트렌드 · 대용량 히스토리 5,000pt</h2>
          <p class="text-xs text-muted-foreground mt-0.5">
            초기 로드시 5,000개 포인트를 프리필한 뒤 500ms 주기로 실시간 스트리밍을 이어 붙입니다.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Badge variant="primary">WebGL / WASM</Badge>
          <Badge variant="default">4 series</Badge>
        </div>
      </div>
      <ChartLegend :configs="FAB_SENSOR_CONFIGS" :values="historyCurrent" />
      <div class="h-[380px] mt-3">
        <RealtimeSensorChart
          id="analysis-history-chart"
          ref="historyChartRef"
          :configs="FAB_SENSOR_CONFIGS"
          :window-size="6000"
          :seed-count="5000"
        />
      </div>
    </Card>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
      <Card v-for="cfg in FAB_SENSOR_CONFIGS" :key="cfg.key" class="p-4">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm text-foreground">{{ cfg.label }}</h3>
          <span class="text-[11px] text-muted-foreground font-mono-tabular">unit: {{ cfg.unit }}</span>
        </div>
        <div class="h-[220px]">
          <RealtimeSensorChart
            :id="`analysis-metric-${cfg.key}`"
            :ref="(el) => setPerMetricRef(cfg.key, el)"
            :configs="[cfg]"
            :window-size="300"
          />
        </div>
      </Card>
    </div>
  </AppShell>
  </template>
