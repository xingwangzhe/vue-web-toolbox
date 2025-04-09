<template>
  <el-card class="base64-container">
    <template #header>
      <div class="card-header">
        <h2>Base64编码/解码</h2>
        <div>
          <el-button type="primary" size="small" @click="clearAll">
            清空
          </el-button>
          <el-button type="success" size="small" @click="copyResult">
            复制结果
          </el-button>
        </div>
      </div>
    </template>

    <div class="encoding-section">
      <el-form label-position="top">
        <el-form-item label="原始字符串">
          <el-input type="textarea" v-model="enCodeValue" :rows="6" placeholder="输入原始字符串"
            @input="handleEnCodeInput"></el-input>
        </el-form-item>

        <div class="direction-buttons">
          <el-button type="primary" plain circle @click="encode">
            <font-awesome-icon :icon="['fas', 'arrow-down']" />
          </el-button>
          <el-button type="info" plain circle @click="decode">
            <font-awesome-icon :icon="['fas', 'arrow-up']" />
          </el-button>
        </div>

        <el-form-item label="Base64字符串">
          <el-input type="textarea" v-model="deCodeValue" :rows="6" placeholder="输入Base64字符串"
            @input="handleDeCodeInput"></el-input>
        </el-form-item>
      </el-form>
    </div>
  </el-card>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';

const toolDescription = '快速进行Base64编码和解码转换，支持文本和文件';

const enCodeValue = ref('');
const deCodeValue = ref('');
const activeInput = ref(''); // 'encode' 或 'decode' 表示当前激活的输入框

// 原始字符串输入处理
function handleEnCodeInput() {
  activeInput.value = 'encode';
  encode();
}

// Base64字符串输入处理
function handleDeCodeInput() {
  activeInput.value = 'decode';
  decode();
}

// 加密
function encode() {
  activeInput.value = 'encode';
  try {
    if (enCodeValue.value) {
      deCodeValue.value = btoa(encodeURIComponent(enCodeValue.value));
    }
  } catch {
    deCodeValue.value = '';
    ElMessage.error('编码失败，请检查输入!');
  }
}

// 解密
function decode() {
  activeInput.value = 'decode';
  try {
    if (deCodeValue.value) {
      enCodeValue.value = decodeURIComponent(atob(deCodeValue.value));
    }
  } catch {
    enCodeValue.value = '';
    ElMessage.error('非法的Base64字符串!请检查输入!');
  }
}

// 清空所有输入
function clearAll() {
  enCodeValue.value = '';
  deCodeValue.value = '';
  activeInput.value = '';
}

// 复制结果
function copyResult() {
  const textToCopy = activeInput.value === 'encode' ? deCodeValue.value : enCodeValue.value;

  if (!textToCopy) {
    ElMessage.warning('没有可复制的内容');
    return;
  }

  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      ElMessage.success('已复制到剪贴板');
    })
    .catch(() => {
      ElMessage.error('复制失败');
    });
}
</script>

<style scoped>
.base64-container {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.direction-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 16px 0;
}
</style>
