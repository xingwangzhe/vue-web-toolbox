<template>
  <div class="flex justify-center items-center min-h-screen">
    <div class="container my-0.5 px-3 max-w-4xl">
      <div class="bg-neutral-700 p-4 rounded-lg shadow border-2 border-indigo-700">
        <div class="text-center mb-4">
          <h2 class="text-blue-400 text-xl font-medium">哈基米编码转换工具</h2>
          <p class="text-gray-300 text-sm">将二进制数据通过"哈基米"三个汉字进行编码和解码</p>
        </div>

        <!-- 主选项卡 -->
        <div class="flex border-b border-indigo-700 mb-4">
          <button @click="activeTab = 'encode'" :class="[
            'py-2 px-4 focus:outline-none',
            activeTab === 'encode' ? 'text-blue-400 border-b-2 border-blue-400 font-medium' : 'text-gray-300'
          ]">编码</button>
          <button @click="activeTab = 'decode'" :class="[
            'py-2 px-4 focus:outline-none',
            activeTab === 'decode' ? 'text-blue-400 border-b-2 border-blue-400 font-medium' : 'text-gray-300'
          ]">解码</button>
        </div>

        <!-- 编码部分 -->
        <div v-if="activeTab === 'encode'" class="space-y-4">
          <!-- 编码输入选项 -->
          <div class="flex border-b border-gray-600 mb-4">
            <button @click="encodeInputType = 'text'" :class="[
              'py-1 px-3 focus:outline-none text-sm',
              encodeInputType === 'text' ? 'text-green-400 border-b border-green-400' : 'text-gray-300'
            ]">文本输入</button>
            <button @click="encodeInputType = 'file'" :class="[
              'py-1 px-3 focus:outline-none text-sm',
              encodeInputType === 'file' ? 'text-green-400 border-b border-green-400' : 'text-gray-300'
            ]">文件上传</button>
          </div>

          <!-- 文本输入 -->
          <div v-if="encodeInputType === 'text'">
            <div class="font-medium text-blue-400 mb-2 text-lg">输入文本：</div>
            <textarea v-model="inputText" placeholder="输入要编码的文本" rows="6"
              class="w-full h-32 p-2 border border-indigo-700 rounded-md bg-neutral-600 text-blue-300"></textarea>
            <button @click="encodeText" :disabled="!inputText"
              class="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed">编码</button>
          </div>

          <!-- 文件输入 -->
          <div v-else class="file-input">
            <div class="font-medium text-blue-400 mb-2 text-lg">上传文件：</div>
            <div class="border-2 border-dashed border-indigo-600 rounded-md p-6 text-center mb-4 transition-colors"
              :class="{ 'bg-indigo-900/20 border-indigo-400': isDragging }" @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false" @drop.prevent="handleFileDrop($event)">
              <div class="text-blue-300">
                <div v-if="!selectedFile" class="mb-2">
                  <div class="text-lg mb-2">拖拽文件到此处</div>
                  <div class="text-sm text-gray-300">或点击选择文件</div>
                </div>
                <div v-else class="text-green-400">
                  已选择: {{ selectedFile.name }} ({{ Math.round(selectedFile.size / 1024) }} KB)
                </div>
              </div>

              <label
                class="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md cursor-pointer inline-block">
                选择文件
                <input type="file" ref="fileInput" @change="handleFileSelected" class="hidden" />
              </label>
            </div>

            <button @click="encodeFile" :disabled="!selectedFile"
              class="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed">编码文件</button>
          </div>

          <!-- 编码结果 -->
          <div v-if="encodedResult" class="mt-4">
            <div class="font-medium text-blue-400 mb-2 text-lg">编码结果：</div>
            <div
              class="w-full p-2 border border-indigo-700 rounded-md bg-neutral-600 text-blue-300 max-h-64 overflow-y-auto font-mono">
              <pre>{{ encodedResultPreview }}</pre>
              <div class="text-gray-400 text-sm mt-2">
                编码长度: {{ encodedResult.length }} 字符
              </div>
            </div>
            <div class="flex mt-2 space-x-2">
              <button @click="copyToClipboard(encodedResult)"
                class="px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm">复制结果</button>
              <button @click="downloadEncodedResult"
                class="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm">下载结果</button>
            </div>
          </div>
        </div>

        <!-- 解码部分 -->
        <div v-else class="space-y-4">
          <div class="font-medium text-blue-400 mb-2 text-lg">输入哈基米编码：</div>
          <textarea v-model="encodedInput" placeholder="输入哈基米编码（仅包含'哈'、'基'、'米'三个汉字）" rows="6"
            class="w-full h-32 p-2 border border-indigo-700 rounded-md bg-neutral-600 text-blue-300"></textarea>

          <!-- 验证提示 -->
          <div v-if="encodedInput && !isValidInput" class="text-red-400 text-sm">
            无效的哈基米编码，请确保只包含"哈"、"基"、"米"三个汉字，且长度为3的倍数
          </div>

          <div class="flex border-b border-gray-600 mb-4">
            <label :class="[
              'py-1 px-3 focus:outline-none text-sm cursor-pointer',
              decodeOutputType === 'text' ? 'text-green-400 border-b border-green-400' : 'text-gray-300'
            ]">
              <input type="radio" v-model="decodeOutputType" value="text" class="hidden">
              文本输出
            </label>
            <label :class="[
              'py-1 px-3 focus:outline-none text-sm cursor-pointer',
              decodeOutputType === 'file' ? 'text-green-400 border-b border-green-400' : 'text-gray-300'
            ]">
              <input type="radio" v-model="decodeOutputType" value="file" class="hidden">
              文件输出
            </label>
          </div>

          <button @click="decodeHajimi" :disabled="!encodedInput || !isValidInput"
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed">解码</button>

          <!-- 解码结果 - 文本 -->
          <div v-if="decodedText && decodeOutputType === 'text'" class="mt-4">
            <div class="font-medium text-blue-400 mb-2 text-lg">解码结果：</div>
            <div
              class="w-full p-2 border border-indigo-700 rounded-md bg-neutral-600 text-blue-300 max-h-64 overflow-y-auto">
              <pre class="whitespace-pre-wrap">{{ decodedText }}</pre>
            </div>
            <button @click="copyToClipboard(decodedText)"
              class="mt-2 px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm">复制结果</button>
          </div>

          <!-- 解码结果 - 文件 -->
          <div v-if="decodedFileUrl && decodeOutputType === 'file'"
            class="mt-4 p-4 border border-dashed border-indigo-700 rounded-md">
            <h3 class="font-medium text-blue-400 mb-2">文件已准备好下载：</h3>
            <a :href="decodedFileUrl" download="decoded_file"
              class="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">下载解码后的文件</a>
          </div>

          <!-- 解码错误提示 -->
          <div v-if="decodeError" class="text-red-400 text-sm mt-2">
            {{ decodeError }}
          </div>

          <!-- 二进制数据警告 -->
          <div v-if="showBinaryWarning" class="text-yellow-400 text-sm mt-2">
            解码结果包含二进制数据，已自动切换到文件输出模式。
          </div>
        </div>
      </div>
    </div>

    <!-- 复制成功提示 -->
    <div v-if="showCopySuccess"
      class="fixed bottom-4 right-4 px-4 py-2 bg-green-600 text-white rounded-md animate-fade-out">
      已复制到剪贴板！
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import {
  encodeStringToHajimi,
  encodeFileToHajimi,
  isValidHajimiCode,
  decodeHajimiToString,
  decodeHajimiToFile
} from '@/utils/hajimi';

// 标签页状态
const activeTab = ref('encode');

// 编码状态
const inputText = ref('');
const selectedFile = ref<File | null>(null);
const encodedResult = ref('');
const encodeInputType = ref('text');
const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);

// 解码状态
const encodedInput = ref('');
const decodedText = ref('');
const decodedFileUrl = ref('');
const decodeOutputType = ref('text');
const decodeError = ref('');
const showBinaryWarning = ref(false);

// 复制状态
const showCopySuccess = ref(false);

// 验证输入是否为有效的哈基米编码
const isValidInput = computed(() => {
  return encodedInput.value ? isValidHajimiCode(encodedInput.value) : true;
});

// 显示编码结果的预览（如果太长则截断）
const encodedResultPreview = computed(() => {
  if (!encodedResult.value) return '';

  const MAX_PREVIEW_LENGTH = 500;
  if (encodedResult.value.length <= MAX_PREVIEW_LENGTH) {
    return encodedResult.value;
  } else {
    return `${encodedResult.value.substring(0, MAX_PREVIEW_LENGTH)}... (共${encodedResult.value.length}字符)`;
  }
});

// 处理文件选择
function handleFileSelected(event: Event) {
  const files = (event.target as HTMLInputElement).files;
  if (files && files.length > 0) {
    selectedFile.value = files[0];
  }
}

// 处理文件拖拽
function handleFileDrop(event: DragEvent) {
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    selectedFile.value = files[0];
  }
  isDragging.value = false;
}

// 编码文本
async function encodeText() {
  if (!inputText.value) return;
  try {
    encodedResult.value = encodeStringToHajimi(inputText.value);
  } catch (error) {
    alert(`编码错误: ${error}`);
  }
}

// 编码文件
async function encodeFile() {
  if (!selectedFile.value) return;
  try {
    encodedResult.value = await encodeFileToHajimi(selectedFile.value);
  } catch (error) {
    alert(`文件编码错误: ${error}`);
  }
}

// 解码哈基米编码
async function decodeHajimi() {
  if (!encodedInput.value || !isValidInput.value) return;

  try {
    // 重置状态
    decodeError.value = '';
    showBinaryWarning.value = false;

    if (decodeOutputType.value === 'text') {
      const result = decodeHajimiToString(encodedInput.value);

      if (result.success) {
        decodedText.value = result.text;
      } else {
        if (result.error?.includes('二进制数据')) {
          showBinaryWarning.value = true;
          decodeError.value = result.error;
          decodeOutputType.value = 'file';
          const fileResult = decodeHajimiToFile(encodedInput.value);
          decodedFileUrl.value = URL.createObjectURL(fileResult.blob);
        } else {
          decodeError.value = result.error || '解码失败，请检查输入数据';
        }
      }
    } else {
      const fileResult = decodeHajimiToFile(encodedInput.value);
      decodedFileUrl.value = URL.createObjectURL(fileResult.blob);
      decodedText.value = '';

      const fileExtension = getFileExtensionByMimeType(fileResult.mimeType);
      const downloadLink = document.querySelector('a[download="decoded_file"]');
      if (downloadLink) {
        downloadLink.setAttribute('download', `decoded_file${fileExtension}`);
      }
    }
  } catch (error) {
    decodeError.value = error instanceof Error ? error.message : '解码过程中发生错误';
    alert(`解码错误: ${decodeError.value}`);
  }
}

// 根据MIME类型获取合适的文件扩展名
function getFileExtensionByMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'application/pdf': '.pdf',
    'application/zip': '.zip',
    'text/plain': '.txt',
    'text/html': '.html',
    'application/json': '.json'
  };

  return mimeToExt[mimeType] || '';
}

// 复制到剪贴板
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    showCopySuccess.value = true;
    setTimeout(() => {
      showCopySuccess.value = false;
    }, 2000);
  } catch {
    alert('复制失败，请手动复制');
  }
}

// 下载编码结果
function downloadEncodedResult() {
  if (!encodedResult.value) return;

  const blob = new Blob([encodedResult.value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hajimi_encoded.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
</script>

<style>
@keyframes fadeOut {
  0% {
    opacity: 1;
  }

  70% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

.animate-fade-out {
  animation: fadeOut 2s forwards;
}
</style>
