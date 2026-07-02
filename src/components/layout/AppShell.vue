<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import Topbar from './Topbar.vue'

defineProps<{ title: string; subtitle?: string }>()
</script>

<template>
  <div class="flex h-screen w-full overflow-hidden">
    <div class="fixed inset-0 grid-fade pointer-events-none" />
    <Sidebar />
    <div class="flex flex-1 flex-col min-w-0">
      <Topbar :title="title" :subtitle="subtitle" />
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
