<script setup lang="ts">
import type { Equipment, EquipmentStatus } from '@/types/mes'
import { Badge } from '@/components/ui'

defineProps<{ items: Equipment[] }>()

const statusMeta: Record<EquipmentStatus, { label: string; variant: 'ok' | 'warn' | 'danger' | 'default' }> = {
  RUN: { label: '가동중', variant: 'ok' },
  IDLE: { label: '대기', variant: 'default' },
  ALARM: { label: '알람', variant: 'danger' },
  DOWN: { label: '정지', variant: 'warn' },
}
</script>

<template>
  <div class="divide-y divide-border">
    <div
      v-for="eq in items"
      :key="eq.id"
      class="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
    >
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <span class="font-mono-tabular text-xs text-muted-foreground">{{ eq.id }}</span>
          <span class="text-sm text-foreground truncate">{{ eq.name }}</span>
        </div>
        <p class="text-[11px] text-muted-foreground mt-0.5">{{ eq.line }} · {{ eq.recipe }}</p>
      </div>
      <Badge :variant="statusMeta[eq.status].variant">
        <span class="h-1.5 w-1.5 rounded-full status-dot bg-current" />
        {{ statusMeta[eq.status].label }}
      </Badge>
    </div>
  </div>
</template>
