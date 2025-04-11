<template>
  <div class="flex justify-center items-center min-h-screen">
    <div class="container my-0.5 px-3 max-w-4xl">
      <div class="bg-neutral-700 p-4 rounded-lg shadow border-2 border-indigo-700">
        <div class="space-y-4">
          <div class="mb-2">
            <div class="font-medium text-blue-400 mb-2 text-lg">原始文本：</div>
            <textarea v-model="deCodeString" placeholder="输入原始文本，将自动转换为 Base64 编码"
              class="w-full h-32 p-2 border border-indigo-700 rounded-md bg-neutral-600 text-blue-300"
              @input="enCodeBase64"></textarea>
          </div>
          <div class="mb-2">
            <div class="font-medium text-blue-400 mb-2 text-lg">Base64 编码：</div>
            <textarea v-model="enCodeString" placeholder="输入 Base64 编码，将自动解码为原始文本"
              class="w-full h-32 p-2 border border-indigo-700 rounded-md bg-neutral-600 text-blue-300"
              @input="deCodeBase64"></textarea>
          </div>
          <div class="flex justify-center space-x-4">
            <button @click="clearFields" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md">
              清空
            </button>
            <button @click="switchTexts" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">
              交换
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const deCodeString = ref('');
const enCodeString = ref('');

// 编码：将普通文本转换为 Base64
function enCodeBase64() {
  try {
    if (deCodeString.value.trim() !== '') {
      // 使用更现代的方法处理 UTF-8 编码
      enCodeString.value = window.btoa(encodeURIComponent(deCodeString.value).replace(/%([0-9A-F]{2})/g,
        function (match, p1) {
          return String.fromCharCode(parseInt(p1, 16));
        }
      ));
    } else {
      enCodeString.value = '';
    }
  } catch {
    enCodeString.value = 'Base64编码错误';
  }
}

// 解码：将 Base64 转换为普通文本
function deCodeBase64() {
  try {
    if (enCodeString.value.trim() !== '') {
      // 处理 Base64 解码，使用现代方法
      const cleanBase64 = enCodeString.value.replace(/[\n\r\s]/g, '');
      deCodeString.value = decodeURIComponent(Array.prototype.map.call(atob(cleanBase64), function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
    } else {
      deCodeString.value = '';
    }
  } catch {
    deCodeString.value = 'Base64解码错误';
  }
}

// 清空两个文本框
function clearFields() {
  deCodeString.value = '';
  enCodeString.value = '';
}

// 交换两个文本框的内容
function switchTexts() {
  const temp = deCodeString.value;
  deCodeString.value = enCodeString.value;
  enCodeString.value = temp;
}
</script>

<style></style>
