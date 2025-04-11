<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { RouterView, useRouter } from 'vue-router';

const router = useRouter();
const activeIndex = ref('home');
const isDarkMode = ref(true); // 默认使用暗色模式
const isMenuActive = ref(false); // 移动端菜单状态

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

// 切换路由
const handleSelect = (path: string) => {
  router.push(path);
  isMenuActive.value = false; // 关闭移动菜单
};

// 切换暗色/亮色模式
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
  }
  // 保存用户偏好
  localStorage.setItem('darkMode', isDarkMode.value ? 'true' : 'false');
};

// 切换移动菜单
const toggleMenu = () => {
  isMenuActive.value = !isMenuActive.value;
};

onMounted(() => {
  // 设置初始激活菜单
  const currentPath = router.currentRoute.value.path;
  activeIndex.value = currentPath;

  // 从本地存储中恢复暗色模式设置
  const savedDarkMode = localStorage.getItem('darkMode');
  if (savedDarkMode !== null) {
    isDarkMode.value = savedDarkMode === 'true';
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }
});

// 路由变化时更新激活菜单
watch(() => router.currentRoute.value.path, (newPath) => {
  activeIndex.value = newPath;
});
</script>

<template>

  <main class="section main-content">
    <div class="container">
      <transition name="fade" mode="out-in">
        <RouterView />
      </transition>
    </div>
  </main>

  <footer class="footer">

  </footer>
  </div>
</template>

<style></style>
