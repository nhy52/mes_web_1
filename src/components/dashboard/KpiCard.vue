<script setup lang="ts">
import { Card } from '@/components/ui'
import { cn } from '@/lib/utils'
import { ArrowDownRight, ArrowUpRight } from 'lucide-vue-next'
import type { KpiDatum } from '@/types/mes'

defineProps<KpiDatum>()

const toneClass: Record<KpiDatum['tone'], string> = {
  ok: 'text-ok',
  warn: 'text-warn',
  danger: 'text-danger',
  primary: 'text-primary',
}
</script>

<template>
  <Card class="p-4 relative overflow-hidden scanline">
    <p class="text-xs text-muted-foreground tracking-wide">{{ label }}</p>
    <div class="mt-2 flex items-baseline gap-1">
      <span :class="cn('font-mono-tabular text-3xl font-semibold', toneClass[tone])">{{ value }}</span>
      <span v-if="unit" class="text-sm text-muted-foreground">{{ unit }}</span>
    </div>
    <div v-if="delta !== undefined" class="mt-2 flex items-center gap-1 text-xs">
      <component
        :is="delta >= 0 ? ArrowUpRight : ArrowDownRight"
        :class="delta >= 0 ? 'text-ok' : 'text-danger'"
        class="h-3.5 w-3.5"
      />
      <span :class="delta >= 0 ? 'text-ok' : 'text-danger'">{{ Math.abs(delta) }}%</span>
      <span class="text-muted-foreground">전일 대비</span>
    </div>
  </Card>
</template>
