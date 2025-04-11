<template>
  <div class="container my-0.5 mx-3.5 px-3">
    <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <li v-for="tool in tools" :key="tool.name"
        class="bg-neutral-700  p-4 rounded-lg shadow hover:shadow-md transition-shadow block border-2 border-indigo-700">
        <a :href="tool.path" class="block h-full">
          <div class="flex flex-col items-center">
            <div class="text-center mb-3">
              <font-awesome-icon :icon="tool.icon" size="2x" />
            </div>
            <h2 class="text-blue-400 font-medium text-lg mb-2 text-center">{{ tool.name }}</h2>
            <div class="text-blue-300 text-sm text-center">{{ tool.description }}</div>
          </div>
        </a>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { tools_information } from '@/router/config';
import { icon } from '@fortawesome/fontawesome-svg-core';
const router = useRouter();

const tools = computed(() => {
  return router.getRoutes()
    .filter(route => route.name && route.name !== 'home')
    .map(route => ({
      path: route.path,
      name: String(route.name),
      description: tools_information[String(route.name)]?.description,
      icon: tools_information[String(route.name)]?.icon,
    }))

})

</script>

<style scoped></style>
