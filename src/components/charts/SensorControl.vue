<script setup lang="ts">
import type { WaferSensor } from '@/composables/useWaferSensors'

const props = withDefaults(
  defineProps<{
    sensors: WaferSensor[]
    size?: number
  }>(),
  { size: 300 },
)

const emit = defineEmits<{ toggle: [id: string] }>()

// SVG는 y축이 아래로 증가하므로 히트맵(위로 증가)과 방향을 맞추기 위해 y를 뒤집는다.
function sy(y: number) {
  return props.size - y
}
</script>

<template>
  <svg :viewBox="`0 0 ${size} ${size}`" class="h-full w-full">
    <!-- 웨이퍼 베이스 (회색 배경) -->
    <circle
      :cx="size / 2"
      :cy="size / 2"
      :r="size / 2 - 1"
      fill="hsl(210 10% 20%)"
      stroke="hsl(190 95% 55% / 0.4)"
      stroke-width="1.5"
    />
    <!-- 센서 노드 -->
    <g v-for="s in sensors" :key="s.id">
      <circle
        :cx="s.x"
        :cy="sy(s.y)"
        r="6"
        :fill="s.active ? s.color : 'transparent'"
        :stroke="s.color"
        stroke-width="1.6"
        class="cursor-pointer transition-opacity hover:opacity-80"
        @click="emit('toggle', s.id)"
      >
        <title>{{ s.id }} · {{ s.t.toFixed(2) }}°C · {{ s.active ? 'ON' : 'OFF (제외됨)' }}</title>
      </circle>
    </g>
  </svg>
</template>
