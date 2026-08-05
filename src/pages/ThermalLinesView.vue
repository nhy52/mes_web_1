<script setup lang="ts">
import { ref } from 'vue'
import { RefreshCw } from 'lucide-vue-next'
import AppShell from '@/components/layout/AppShell.vue'
import { Card, Badge, Button } from '@/components/ui'
import SensorTemperatureLineChart from '@/components/charts/SensorTemperatureLineChart.vue'

const chartRef = ref<InstanceType<typeof SensorTemperatureLineChart> | null>(null)

const SENSOR_COUNT = 65
const T_MAX = 6
const Y_MIN = 20
const Y_MAX = 23
</script>

<template>
  <AppShell title="센서 온도 라인차트" subtitle="65개 센서 · 시간별 온도 변화 · D3.js">
    <Card class="p-4">
      <div class="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 class="font-display text-sm text-foreground">멀티 센서 온도 트렌드 · {{ SENSOR_COUNT }} channels</h2>
          <p class="mt-0.5 text-xs text-muted-foreground">
            챔버 내 {{ SENSOR_COUNT }}개 온도 센서의 0~{{ T_MAX }}초 구간 변화를 D3.js로 렌더링했습니다.
            라인 위에 커서를 올리면 가장 가까운 센서가 강조됩니다.
          </p>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <Badge variant="primary">D3.js SVG</Badge>
          <Badge variant="default">{{ SENSOR_COUNT }} series</Badge>
          <Button variant="outline" size="sm" @click="chartRef?.regenerate()">
            <RefreshCw class="h-3.5 w-3.5" />
            재생성
          </Button>
        </div>
      </div>

      <div class="mb-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span>X축 <span class="font-mono-tabular text-foreground">0 ~ {{ T_MAX }} s</span></span>
        <span>Y축 <span class="font-mono-tabular text-foreground">{{ Y_MIN }} ~ {{ Y_MAX }} °C</span></span>
        <span>센서 <span class="font-mono-tabular text-foreground">CH-01 ~ CH-{{ String(SENSOR_COUNT).padStart(2, '0') }}</span></span>
      </div>

      <div class="h-[520px]">
        <SensorTemperatureLineChart
          ref="chartRef"
          :sensor-count="SENSOR_COUNT"
          :t-max="T_MAX"
          :y-min="Y_MIN"
          :y-max="Y_MAX"
        />
      </div>
    </Card>

    <Card class="mt-4 p-4">
      <p class="text-xs leading-relaxed text-muted-foreground">
        각 센서 값은 채널별 baseline을 중심으로 한 랜덤워크로 생성한 가상 데이터입니다.
        색상은 D3 <span class="font-mono-tabular text-foreground">interpolateTurbo</span> 스펙트럼으로
        채널 순서에 따라 매핑됩니다. 실제 설비/회사 데이터는 사용하지 않습니다.
      </p>
    </Card>
  </AppShell>
</template>
