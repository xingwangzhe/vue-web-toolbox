import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/components/HomePage.vue'
import type { RouteRecordRaw } from 'vue-router'

// 自动导入工具组件
const toolModules = import.meta.glob('../components/tools/*.vue')

// 生成工具路由
const toolRoutes: RouteRecordRaw[] = Object.keys(toolModules).map(path => {
  const name = path.match(/\/([^/]+)\.vue$/)?.[1].toLowerCase() ?? ''
  return {
    path: `/${name.toLowerCase().replace('code', '')}`,
    name,
    component: toolModules[path]
  }
})

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    ...toolRoutes
  ],
})

export default router
