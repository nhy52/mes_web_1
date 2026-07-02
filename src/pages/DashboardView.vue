<script setup lang="ts">
import { computed, ref } from 'vue'
import AppShell from '@/components/layout/AppShell.vue'
import { Card } from '@/components/ui'
import KpiCard from '@/components/dashboard/KpiCard.vue'
import RadialGauge from '@/components/dashboard/RadialGauge.vue'
import EquipmentList from '@/components/dashboard/EquipmentList.vue'
import RealtimeSensorChart from '@/components/charts/RealtimeSensorChart.vue'
import ChartLegend from '@/components/charts/ChartLegend.vue'
import { FAB_SENSOR_CONFIGS, useMockSensorData } from '@/composables/useMockSensorData'
import { useEquipmentFleet } from '@/composables/useEquipmentFleet'

const chartRef = ref<InstanceType<typeof RealtimeSensorChart> | null>(null)

const { current } = useMockSensorData(FAB_SENSOR_CONFIGS, {
  intervalMs: 1000,
  onTick: (point) => chartRef.value?.appendPoint(point),
})

const { fleet } = useEquipmentFleet(10, 2500)

const runningCount = computed(() => fleet.value.filter((e) => e.status === 'RUN').length)
const alarmCount = computed(() => fleet.value.filter((e) => e.status === 'ALARM').length)
const utilization = computed(() => (runningCount.value / fleet.value.length) * 100)
const avgUptime = computed(
  () => fleet.value.reduce((sum, e) => sum + e.uptime, 0) / fleet.value.length,
)
</script>

<template>
  <AppShell title="생산 대시보드" subtitle="A/B/C Line · 실시간 설비 모니터링">
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <KpiCard label="라인 가동률" :value="utilization.toFixed(1)" unit="%" :delta="2.4" tone="primary" />
      <KpiCard label="가동중 설비" :value="`${runningCount} / ${fleet.length}`" tone="ok" />
      <KpiCard label="알람 발생" :value="String(alarmCount)" unit="건" :delta="-1.2" tone="danger" />
      <KpiCard label="평균 Uptime" :value="avgUptime.toFixed(1)" unit="%" :delta="0.6" tone="ok" />
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
      <Card class="xl:col-span-2 p-4 flex flex-col">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h2 class="font-display text-sm text-foreground">EQP-004 · Chamber 센서 트렌드</h2>
            <p class="text-xs text-muted-foreground mt-0.5">SciChart.js 기반 실시간 스트리밍 (1s tick, 240pt window)</p>
          </div>
          <ChartLegend :configs="FAB_SENSOR_CONFIGS" :values="current" />
        </div>
        <div class="flex-1 min-h-[320px]">
          <RealtimeSensorChart id="dashboard-main-chart" ref="chartRef" :configs="FAB_SENSOR_CONFIGS" />
        </div>
      </Card>

      <Card class="p-4 flex flex-col items-center justify-center gap-4">
        <RadialGauge :value="utilization" label="LINE UTILIZATION" :size="160" />
        <div class="grid grid-cols-3 gap-3 w-full text-center">
          <div>
            <p class="font-mono-tabular text-lg text-ok">{{ runningCount }}</p>
            <p class="text-[10px] text-muted-foreground mt-0.5">RUN</p>
          </div>
          <div>
            <p class="font-mono-tabular text-lg text-muted-foreground">{{ fleet.length - runningCount - alarmCount }}</p>
            <p class="text-[10px] text-muted-foreground mt-0.5">IDLE</p>
          </div>
          <div>
            <p class="font-mono-tabular text-lg text-danger">{{ alarmCount }}</p>
            <p class="text-[10px] text-muted-foreground mt-0.5">ALARM</p>
          </div>
        </div>
      </Card>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
      <Card class="xl:col-span-3 p-4">
        <h2 class="font-display text-sm text-foreground mb-3">설비 현황</h2>
        <EquipmentList :items="fleet" />
      </Card>
    </div>
  </AppShell>
  </template>
