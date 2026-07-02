import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { Equipment, EquipmentStatus } from '@/types/mes'

const LINES = ['A-LINE', 'B-LINE', 'C-LINE']
const RECIPES = ['ETCH_STD_v3', 'CVD_LOWSTRESS', 'CLEAN_O2', 'DEP_TEOS_02', 'ETCH_HARDMASK']

function randomStatus(prevStatus: EquipmentStatus): EquipmentStatus {
  const roll = Math.random()
  if (prevStatus === 'ALARM') return roll < 0.6 ? 'ALARM' : 'IDLE'
  if (roll < 0.03) return 'ALARM'
  if (roll < 0.1) return 'IDLE'
  return 'RUN'
}

function makeEquipment(idx: number): Equipment {
  return {
    id: `EQP-${String(idx + 1).padStart(3, '0')}`,
    name: `Etcher #${idx + 1}`,
    line: LINES[idx % LINES.length],
    status: idx % 6 === 0 ? 'ALARM' : idx % 5 === 0 ? 'IDLE' : 'RUN',
    recipe: RECIPES[idx % RECIPES.length],
    progress: Math.round(Math.random() * 100),
    uptime: 80 + Math.random() * 18,
    temperature: 230 + Math.random() * 30,
    lastAlarmAt: idx % 6 === 0 ? '방금 전' : undefined,
  }
}

export function useEquipmentFleet(count = 12, intervalMs = 2500) {
  const fleet = ref<Equipment[]>(Array.from({ length: count }, (_, i) => makeEquipment(i)))
  let timer: ReturnType<typeof setInterval> | undefined

  function tick() {
    fleet.value = fleet.value.map((eq) => {
      const status = randomStatus(eq.status)
      const progress = status === 'RUN' ? (eq.progress + Math.random() * 8) % 100 : eq.progress
      return {
        ...eq,
        status,
        progress,
        temperature: Math.min(280, Math.max(215, eq.temperature + (Math.random() - 0.5) * 3)),
        lastAlarmAt: status === 'ALARM' ? '방금 전' : eq.lastAlarmAt,
      }
    })
  }

  onMounted(() => {
    timer = setInterval(tick, intervalMs)
  })
  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
  })

  return { fleet }
}
