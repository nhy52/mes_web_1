export type EquipmentStatus = 'RUN' | 'IDLE' | 'ALARM' | 'DOWN'

export interface Equipment {
  id: string
  name: string
  line: string
  status: EquipmentStatus
  recipe: string
  progress: number // 0-100
  uptime: number // %
  temperature: number
  lastAlarmAt?: string
}

export interface SensorSeriesConfig {
  key: string
  label: string
  unit: string
  color: string
  base: number
  volatility: number
  min: number
  max: number
}

export interface KpiDatum {
  label: string
  value: string
  unit?: string
  delta?: number
  tone: 'ok' | 'warn' | 'danger' | 'primary'
}
