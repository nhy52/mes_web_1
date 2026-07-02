<script setup lang="ts">
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium font-mono-tabular',
  {
    variants: {
      variant: {
        default: 'border-border bg-white/5 text-foreground',
        ok: 'border-ok/30 bg-ok/10 text-ok',
        warn: 'border-warn/30 bg-warn/10 text-warn',
        danger: 'border-danger/30 bg-danger/10 text-danger',
        primary: 'border-primary/30 bg-primary/10 text-primary',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

interface BadgeProps {
  variant?: 'default' | 'ok' | 'warn' | 'danger' | 'primary'
  class?: string
}
defineProps<BadgeProps>()
</script>

<template>
  <span :class="cn(badgeVariants({ variant }), $props.class)"><slot /></span>
</template>
