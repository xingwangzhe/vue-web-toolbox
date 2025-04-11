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
  <div class="app-container">
    <header class="">
      <div class="flex flex-col items-center justify-center p-4">
        <a class="text-blue-600 text-5xl text-center block backdrop-blur-md"
          href="https://tools.needhelp.icu">Needhelp.ICU-工具栈</a>
        <br />
        <div class=" text-blue-500 italic backdrop-blur-md">只为便捷</div>
      </div>
    </header>
    <main>
      <div>
        <transition name="fade" mode="out-in">
          <RouterView />
        </transition>
      </div>
    </main>

    <footer class="footer">

    </footer>
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
  position: relative;
}

body {
  margin: 0;
  padding: 0;
}

/* 设置SVG背景平铺 */
body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/phone.svg');
  background-repeat: repeat;
  /* 设置背景平铺 */
  background-size: 300px auto;
  /* 调整SVG的大小，可以根据需要修改 */
  opacity: 0.5;
  /* 调整透明度，使内容更易读 */
  z-index: -1;
}

/* 暗色模式下的背景调整 */
:root.dark body::before {
  opacity: 0.5;
  /* 暗色模式下背景更透明 */
  filter: invert(1);
  /* 暗色模式下反转颜色 */
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
