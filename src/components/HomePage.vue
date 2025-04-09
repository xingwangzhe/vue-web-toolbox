<template>
  <div class="home-container">
    <el-card class="search-box" :body-style="{ padding: '20px' }">
      <el-input v-model="searchText" placeholder="搜索工具..." clearable class="search-input">
        <template #prefix>
          <font-awesome-icon :icon="['fas', 'search']" size="sm" />
        </template>
      </el-input>
    </el-card>

    <el-divider>
      <el-text class="tools-title" size="large">常用工具</el-text>
    </el-divider>

    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="tool in filteredTools" :key="tool.id">
        <el-card class="tool-card" @click="navigateTo(tool.path)" shadow="hover" :body-style="{ padding: '20px' }">
          <div class="tool-icon">
            <font-awesome-icon :icon="tool.icon" size="lg" />
          </div>
          <div class="tool-info">
            <h3>{{ tool.name }}</h3>
            <p>{{ tool.description }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();
const searchText = ref('');

// 根据工具名称智能匹配图标
const getIconForTool = (name: string): [string, string] => {
  const toolNameLower = name.toLowerCase();

  // 定义工具名称到图标的映射关系 - 使用 Font Awesome 图标
  const iconMapping: Record<string, [string, string]> = {
    'base64': ['fas', 'file-code'],
    'morse': ['fas', 'wave-square'],
    'url': ['fas', 'link'],
    'json': ['fas', 'code'],
    'qrcode': ['fas', 'qrcode'],
    'md5': ['fas', 'lock'],
    'uuid': ['fas', 'key'],
    'timestamp': ['far', 'clock'],
    'color': ['fas', 'palette'],
    'image': ['far', 'image'],
    'text': ['fas', 'font'],
    'regex': ['fas', 'magnifying-glass'],
    'jwt': ['fas', 'id-badge'],
    'hash': ['fas', 'hashtag']
  };

  // 尝试直接匹配
  for (const key in iconMapping) {
    if (toolNameLower.includes(key)) {
      return iconMapping[key];
    }
  }

  // 默认图标
  return ['fas', 'wrench'];
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
      icon: getIconForTool(displayName),
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
    ElMessage({
      message: '该功能正在开发中...',
      type: 'info'
    });
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
  transition: all 0.3s;
}

.search-input {
  width: 100%;
}

.tools-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

/* 工具卡片 */
.tool-card {
  height: 180px;
  margin-bottom: 20px;
  transition: all 0.3s;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(var(--el-color-primary-rgb), 0.2);
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
  background: linear-gradient(145deg, rgba(var(--el-color-primary-rgb), 0.7), rgba(var(--el-color-primary-rgb), 0.4));
  box-shadow: 0 4px 8px rgba(var(--el-color-primary-rgb), 0.2);
  color: var(--el-color-white);
  transition: all 0.3s;
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
  color: var(--el-text-color-primary);
  transition: all 0.3s;
}

.tool-info p {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  transition: all 0.3s;
}

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
  }

  .tools-title {
    font-size: 18px;
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

  .tool-icon svg {
    font-size: 16px;
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
  }

  .tool-card {
    height: 140px;
    margin-bottom: 12px;
  }

  .tool-icon {
    width: 36px;
    height: 36px;
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
