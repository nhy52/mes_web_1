<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Badge } from '@/components/ui'

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  timer = setInterval(() => (now.value = new Date()), 1000)
})
onBeforeUnmount(() => timer && clearInterval(timer))

const formatted = () =>
  now.value.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

defineProps<{ title: string; subtitle?: string }>()
</script>

<template>
  <header class="h-16 border-b border-border flex items-center justify-between px-6 bg-card/40 backdrop-blur">
    <div>
      <h1 class="font-display text-lg text-foreground">{{ title }}</h1>
      <p v-if="subtitle" class="text-xs text-muted-foreground mt-0.5">{{ subtitle }}</p>
    </div>
    <div class="flex items-center gap-3">
      <Badge variant="ok">
        <span class="h-1.5 w-1.5 rounded-full bg-ok status-dot" />
        SYSTEM ONLINE
      </Badge>
      <span class="font-mono-tabular text-xs text-muted-foreground">{{ formatted() }}</span>
    </div>
  </header>
</template>
