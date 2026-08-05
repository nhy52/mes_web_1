import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'dashboard', component: () => import('@/pages/DashboardView.vue') },
    { path: '/analysis', name: 'analysis', component: () => import('@/pages/AnalysisView.vue') },
    { path: '/thermal', name: 'thermal', component: () => import('@/pages/ThermalLinesView.vue') },
    { path: '/wafer', name: 'wafer', component: () => import('@/pages/WaferThermalView.vue') },
    { path: '/equipment', name: 'equipment', component: () => import('@/pages/EquipmentView.vue') },
  ],
})

export default router
