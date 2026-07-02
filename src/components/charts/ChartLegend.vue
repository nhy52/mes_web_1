<script setup lang="ts">
import type { SensorSeriesConfig } from '@/types/mes'
import { formatNumber } from '@/lib/utils'

defineProps<{ configs: SensorSeriesConfig[]; values: Record<string, number> }>()
</script>

<template>
  <div class="flex flex-wrap gap-4">
    <div v-for="c in configs" :key="c.key" class="flex items-center gap-2">
      <span class="h-2.5 w-2.5 rounded-full status-dot" :style="{ backgroundColor: c.color, color: c.color }" />
      <span class="text-xs text-muted-foreground">{{ c.label }}</span>
      <span class="font-mono-tabular text-xs font-medium" :style="{ color: c.color }">
        {{ values[c.key] !== undefined ? formatNumber(values[c.key], 1) : '--' }} {{ c.unit }}
      </span>
    </div>
  </div>
</template>
