<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { LayoutGrid, LineChart, Box, Radio, Thermometer, Grid2x2 } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const route = useRoute()

const nav = [
  { to: '/', label: '대시보드', icon: LayoutGrid },
  { to: '/analysis', label: '데이터 분석', icon: LineChart },
  { to: '/thermal', label: '센서 온도 라인', icon: Thermometer },
  { to: '/wafer', label: '웨이퍼 열지도', icon: Grid2x2 },
  { to: '/equipment', label: '설비 3D 뷰', icon: Box },
]
</script>

<template>
  <aside class="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-card/60 backdrop-blur">
    <div class="flex items-center gap-2.5 px-5 h-16 border-b border-border">
      <div class="h-8 w-8 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center">
        <Radio class="h-4 w-4 text-primary" />
      </div>
      <div>
        <p class="font-display text-sm leading-none text-foreground">FabSight MES</p>
        <p class="text-[10px] text-muted-foreground mt-1 tracking-wide">PRODUCTION MONITOR</p>
      </div>
    </div>

    <nav class="flex-1 px-3 py-4 space-y-1">
      <RouterLink
        v-for="item in nav"
        :key="item.to"
        :to="item.to"
        :class="cn(
          'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
          route.path === item.to
            ? 'bg-primary/10 text-primary border border-primary/25'
            : 'text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent',
        )"
      >
        <component :is="item.icon" class="h-4 w-4" />
        {{ item.label }}
      </RouterLink>
    </nav>

    <div class="px-4 py-4 border-t border-border">
      <p class="text-[11px] text-muted-foreground leading-relaxed">
        개인 포트폴리오 데모입니다.<br />
        모든 설비/센서 데이터는 실시간처럼 시뮬레이션된 목업입니다.
      </p>
    </div>
  </aside>
</template>
