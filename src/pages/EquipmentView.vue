<script setup lang="ts">
import AppShell from '@/components/layout/AppShell.vue'
import { Card } from '@/components/ui'
import EquipmentScene from '@/components/three/EquipmentScene.vue'
import EquipmentList from '@/components/dashboard/EquipmentList.vue'
import { useEquipmentFleet } from '@/composables/useEquipmentFleet'

const { fleet } = useEquipmentFleet(12, 2200)
</script>

<template>
  <AppShell title="설비 3D 뷰" subtitle="Three.js 기반 팹 레이아웃 시각화 · 드래그로 회전, 스크롤로 확대/축소">
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <Card class="xl:col-span-2 p-2 overflow-hidden">
        <EquipmentScene :items="fleet" />
      </Card>
      <Card class="p-4">
        <h2 class="font-display text-sm text-foreground mb-1">설비 현황</h2>
        <p class="text-xs text-muted-foreground mb-3">색상은 3D 뷰의 챔버 색상과 동기화됩니다.</p>
        <EquipmentList :items="fleet" />
      </Card>
    </div>
  </AppShell>
  </template>
