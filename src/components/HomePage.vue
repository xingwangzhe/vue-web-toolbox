<template>
  <div class="home-container">
    <div class="search-box">
      <div class="search-input-container">
        <input v-model="searchText" placeholder="搜索工具..." class="search-input" />
        <span class="search-icon">🔍</span>
      </div>
    </div>

    <div class="divider">
      <span class="tools-title">常用工具</span>
    </div>

    <div class="tools-grid">
      <div v-for="tool in filteredTools" :key="tool.id" class="tool-card" @click="navigateTo(tool.path)">
        <div class="tool-icon">
          <span class="icon">{{ getIconText(tool.name) }}</span>
        </div>
        <div class="tool-info">
          <h3>{{ tool.name }}</h3>
          <p>{{ tool.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const searchText = ref('');

// 获取工具的图标文字（简单的替代方案）
const getIconText = (name: string): string => {
  const toolNameLower = name.toLowerCase();

  const iconMap: Record<string, string> = {
    'base64': '🔤',
    'morse': '📻',
    'url': '🔗',
    'json': '📋',
    'qrcode': '📱',
    'md5': '🔒',
    'uuid': '🔑',
    'timestamp': '⏱️',
    'color': '🎨',
    'image': '🖼️',
    'text': '📝',
    'regex': '🔍',
    'jwt': '🎫',
    'hash': '📊'
  };

  // 尝试匹配
  for (const key in iconMap) {
    if (toolNameLower.includes(key)) {
      return iconMap[key];
    }
  }

  // 默认图标
  return '🛠️';
};

// 工具列表配置
const toolModules = import.meta.glob('./tools/*.vue', { eager: true });

const tools = ref(
  Object.entries(toolModules).map(([path, module]: [string, any], index) => {
    const name = path.match(/\/([^/]+)\.vue$/)?.[1] ?? '';
    const displayName = name.replace('Code', '');
    // 从组件中获取描述，如果没有则使用默认描述
    const description = (module.default as any)?.toolDescription || `${displayName}编码/解码工具`;

    return {
      id: index + 1,
      name: displayName,
      description,
      path: `/${displayName.toLowerCase()}`,
      component: name
    };
  })
);

// 搜索过滤
const filteredTools = computed(() => {
  const search = searchText.value.toLowerCase().trim();
  if (!search) return tools.value;
  return tools.value.filter(tool =>
    tool.name.toLowerCase().includes(search) ||
    tool.description.toLowerCase().includes(search)
  );
});

const navigateTo = (path: string) => {
  router.push(path).catch(() => {
    alert('该功能正在开发中...');
  });
};
</script>

<style scoped>
/* 基础样式 */
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-box {
  margin-bottom: 30px;
  border-radius: 8px;
  padding: 20px;
  background-color: var(--bg-color);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.search-input-container {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 10px 15px 10px 40px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-color);
  color: var(--text-color-primary);
  font-size: 16px;
  outline: none;
  transition: all 0.3s;
}

.search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-color-secondary);
}

.divider {
  display: flex;
  align-items: center;
  margin: 30px 0;
  color: var(--text-color-secondary);
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-top: 1px solid var(--border-color);
}

.divider::before {
  margin-right: 20px;
}

.divider::after {
  margin-left: 20px;
}

.tools-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color-primary);
  white-space: nowrap;
}

/* 工具网格 */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

/* 工具卡片 */
.tool-card {
  height: 180px;
  padding: 20px;
  margin-bottom: 20px;
  transition: all 0.3s;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
  border-color: var(--color-primary);
}

/* 图标样式 */
.tool-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 52px;
  height: 52px;
  margin: 0 auto 15px;
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(64, 158, 255, 0.7), rgba(64, 158, 255, 0.4));
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.2);
  color: white;
  transition: all 0.3s;
}

.icon {
  font-size: 24px;
}

/* 工具信息 */
.tool-info {
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.tool-info h3 {
  margin: 0 0 10px;
  font-size: 18px;
  color: var(--text-color-primary);
  transition: all 0.3s;
}

.tool-info p {
  margin: 0;
  font-size: 14px;
  color: var(--text-color-secondary);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  transition: all 0.3s;
}

/* 响应式设计 */
/* 大屏幕 (≥1200px) */
@media screen and (min-width: 1200px) {
  .home-container {
    padding: 30px;
  }

  .tool-card {
    height: 190px;
  }

  .tool-icon {
    width: 56px;
    height: 56px;
  }
}

/* 中等屏幕 (≥992px) */
@media screen and (max-width: 992px) {
  .tools-title {
    font-size: 22px;
  }

  .tool-card {
    height: 170px;
  }
}

/* 平板电脑 (≥768px) */
@media screen and (max-width: 768px) {
  .home-container {
    padding: 15px;
  }

  .search-box {
    margin-bottom: 25px;
  }

  .tools-title {
    font-size: 20px;
  }
  
  .tool-card {
    height: 160px;
  }
  
  .tool-icon {
    width: 45px;
    height: 45px;
    margin-bottom: 12px;
  }
  
  .tool-info h3 {
    font-size: 16px;
    margin-bottom: 8px;
  }
  
  .tool-info p {
    font-size: 13px;
    -webkit-line-clamp: 2;
  }
}

/* 手机 (≥576px) */
@media screen and (max-width: 576px) {
  .home-container {
    padding: 12px;
  }
  
  .search-box {
    margin-bottom: 20px;
    padding: 15px;
  }
  
  .tools-title {
    font-size: 18px;
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
  }
  
  .tool-card {
    height: 150px;
    margin-bottom: 15px;
  }
  
  .tool-icon {
    width: 40px;
    height: 40px;
    margin-bottom: 10px;
  }
  
  .icon {
    font-size: 20px;
  }
  
  .tool-info h3 {
    font-size: 15px;
    margin-bottom: 6px;
  }
  
  .tool-info p {
    font-size: 12px;
    -webkit-line-clamp: 2;
  }
}

/* 超小屏幕手机 */
@media screen and (max-width: 375px) {
  .home-container {
    padding: 10px;
  }
  
  .search-box {
    margin-bottom: 15px;
    padding: 10px;
  }
  
  .tool-card {
    height: 140px;
    margin-bottom: 12px;
    padding: 15px;
  }
  
  .tool-icon {
    width: 36px;
    height: 36px;
  }
  
  .icon {
    font-size: 18px;
  }
  
  .tool-info h3 {
    font-size: 14px;
  }
  
  .tool-info p {
    font-size: 11px;
    -webkit-line-clamp: 2;
  }
}
</style>
