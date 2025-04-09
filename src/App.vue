<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { RouterView, useRouter } from 'vue-router';

const router = useRouter();
const activeIndex = ref('home');

// 获取路由列表（排除首页）
const routes = computed(() => {
  return router.getRoutes()
    .filter(route => route.name !== 'home')
    .map(route => ({
      path: route.path,
      name: String(route.name),
      displayName: String(route.name).charAt(0).toUpperCase() + String(route.name).slice(1).replace(/-/g, ' ')
    }));
});

const handleSelect = (key: string) => {
  router.push(key);
};

onMounted(() => {
  // 设置初始激活菜单
  const currentPath = router.currentRoute.value.path;
  activeIndex.value = currentPath;
});
</script>

<template>
  <div class="common-layout">
    <el-config-provider namespace="ep">
      <el-container class="container">
        <el-header class="header">
          <div class="logo">HelpStack</div>
          <el-menu :default-active="activeIndex" class="menu" mode="horizontal" @select="handleSelect">
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item v-for="route in routes" :key="route.path" :index="route.path">
              {{ route.displayName }}
            </el-menu-item>
          </el-menu>
        </el-header>

        <el-main class="main">
          <RouterView />
        </el-main>

        <el-footer class="footer">
          <p>©2025-{{ new Date().getFullYear() }} HelpStack - Web工具箱</p>
        </el-footer>
      </el-container>
    </el-config-provider>
  </div>
</template>

<style>
/* 全局暗色模式变量 */
html.dark {
  --el-bg-color: #1d1e1f;
  --el-bg-color-page: #0a0a0a;
  --el-text-color-primary: #E5EAF3;
  --el-text-color-regular: #CFD3DC;
}
</style>

<style scoped>
.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  border-bottom: 1px solid var(--el-border-color);
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--el-color-primary);
}

.menu {
  border-bottom: none;
}

.main {
  flex: 1;
  padding: 20px;
}

.footer {
  text-align: center;
  padding: 20px;
  border-top: 1px solid var(--el-border-color);
  color: var(--el-text-color-secondary);
}
</style>
