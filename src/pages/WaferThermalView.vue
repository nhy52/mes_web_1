<script setup lang="ts">
import { computed, ref } from 'vue'
import { RefreshCw, Tag } from 'lucide-vue-next'
import AppShell from '@/components/layout/AppShell.vue'
import { Card, Badge, Button } from '@/components/ui'
import WaferHeatmap from '@/components/charts/WaferHeatmap.vue'
import SensorControl from '@/components/charts/SensorControl.vue'
import { useWaferSensors } from '@/composables/useWaferSensors'

const SIZE = 300
const SENSOR_COUNT = 65
const T_MIN = 20
const T_MAX = 23

const { sensors, generate, toggle } = useWaferSensors({
  size: SIZE,
  count: SENSOR_COUNT,
  tMin: T_MIN,
  tMax: T_MAX,
})

const showLabels = ref(true)

const activeSensors = computed(() => sensors.value.filter((s) => s.active))
const activeCount = computed(() => activeSensors.value.length)

// 활성 센서 기준 실시간 min/max (히트맵 Rainbow 스케일 기준)
const range = computed(() => {
  if (activeSensors.value.length === 0) return null
  const temps = activeSensors.value.map((s) => s.t)
  return { min: Math.min(...temps), max: Math.max(...temps) }
})

function regenerate() {
  generate()
}
function reset() {
  sensors.value.forEach((s) => (s.active = true))
}
</script>

<template>
  <AppShell title="웨이퍼 열지도" subtitle="300×300 원형 웨이퍼 · 위치별 온도 분포 · Plotly.js Heatmap">
    <div class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <!-- 히트맵 -->
      <Card class="p-4">
        <div class="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 class="font-display text-sm text-foreground">Wafer Thermal Map</h2>
            <p class="mt-0.5 text-xs text-muted-foreground">
              활성 {{ activeCount }}개 센서를 IDW 보간한 위치별 온도 분포입니다.
              센서를 끄면 해당 지점을 제외하고 min/max를 다시 계산해 무지개 스케일을 재조정합니다.
            </p>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <Badge variant="primary">Plotly.js</Badge>
            <Button
              variant="outline"
              size="sm"
              :class="showLabels ? 'border-primary/40 text-primary' : ''"
              @click="showLabels = !showLabels"
            >
              <Tag class="h-3.5 w-3.5" />
              라벨 {{ showLabels ? 'ON' : 'OFF' }}
            </Button>
          </div>
        </div>

        <div class="mb-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span>웨이퍼 <span class="font-mono-tabular text-foreground">Ø {{ SIZE }}</span></span>
          <span v-if="range">
            현재 범위
            <span class="font-mono-tabular text-foreground">
              {{ range.min.toFixed(2) }} ~ {{ range.max.toFixed(2) }} °C
            </span>
          </span>
          <span>색상 <span class="text-foreground">보라(저온) → 빨강(고온)</span></span>
        </div>

        <div class="h-[520px]">
          <WaferHeatmap
            :sensors="activeSensors"
            :size="SIZE"
            :show-labels="showLabels"
          />
          <p v-if="activeCount === 0" class="mt-2 text-center text-xs text-danger">
            활성 센서가 없습니다. 오른쪽 Sensor Control에서 센서를 켜세요.
          </p>
        </div>
      </Card>

      <!-- Sensor Control -->
      <Card class="flex flex-col p-4">
        <div class="mb-3 flex items-center justify-between">
          <div>
            <h2 class="font-display text-sm text-foreground">Sensor Control</h2>
            <p class="mt-0.5 text-xs text-muted-foreground">클릭하여 센서 on/off</p>
          </div>
          <Badge variant="default">{{ activeCount }} / {{ SENSOR_COUNT }} on</Badge>
        </div>

        <div class="rounded-lg bg-[hsl(210_10%_14%)] p-3">
          <div class="aspect-square w-full">
            <SensorControl :sensors="sensors" :size="SIZE" @toggle="toggle" />
          </div>
        </div>

        <div class="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span class="inline-flex items-center gap-1">
            <span class="h-2.5 w-2.5 rounded-full bg-muted-foreground" /> ON (채움)
          </span>
          <span class="inline-flex items-center gap-1">
            <span class="h-2.5 w-2.5 rounded-full border border-muted-foreground" /> OFF (테두리만)
          </span>
        </div>

        <div class="mt-auto flex gap-2 pt-3">
          <Button variant="outline" size="sm" class="flex-1" @click="reset">전체 ON</Button>
          <Button variant="outline" size="sm" class="flex-1" @click="regenerate">
            <RefreshCw class="h-3.5 w-3.5" />
            재생성
          </Button>
        </div>
      </Card>
    </div>

    <Card class="mt-4 p-4">
      <p class="text-xs leading-relaxed text-muted-foreground">
        센서 좌표는 원 내부에 임의 배치되고, 온도는 hot/cold spot 기반 공간 필드 + 잡음으로 생성한
        가상 데이터입니다. 히트맵은 활성 센서만 IDW(역거리 가중, power 2.4) 보간해 채우며 원 바깥은
        마스킹합니다. Sensor Control의 센서 색상은 D3 컬러스케일에서 랜덤 샘플한 값입니다.
      </p>
    </Card>
  </AppShell>
</template>
