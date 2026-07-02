<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{ value: number; label: string; size?: number }>(),
  { size: 140 },
)

const radius = 52
const circumference = 2 * Math.PI * radius
const offset = computed(() => circumference * (1 - Math.min(100, Math.max(0, props.value)) / 100))
const color = computed(() => (props.value > 85 ? 'var(--color-ok)' : props.value > 60 ? 'var(--color-warn)' : 'var(--color-danger)'))
</script>

<template>
  <div class="relative inline-flex flex-col items-center justify-center" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" viewBox="0 0 120 120" class="-rotate-90">
      <circle cx="60" cy="60" :r="radius" fill="none" stroke="hsl(var(--border))" stroke-width="10" />
      <circle
        cx="60"
        cy="60"
        :r="radius"
        fill="none"
        :stroke="color"
        stroke-width="10"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        style="transition: stroke-dashoffset 0.6s ease, stroke 0.6s ease"
      />
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <span class="font-mono-tabular text-2xl font-semibold" :style="{ color }">{{ value.toFixed(1) }}%</span>
      <span class="text-[11px] text-muted-foreground mt-1">{{ label }}</span>
    </div>
  </div>
</template>
