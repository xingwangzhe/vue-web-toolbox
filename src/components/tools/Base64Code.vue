<template>
  <div class="flex justify-center items-center min-h-screen">
    <div class="container my-0.5 px-3 max-w-4xl">
      <div class="bg-neutral-700 p-4 rounded-lg shadow border-2 border-indigo-700">
        <!-- 主选项卡 -->
        <div class="flex border-b border-indigo-700 mb-4">
          <button @click="activeTab = 'encode'" :class="[
            'py-2 px-4 focus:outline-none',
            activeTab === 'encode' ? 'text-blue-400 border-b-2 border-blue-400 font-medium' : 'text-gray-300'
          ]">
            编码 (数据 → Base64)
          </button>
          <button @click="activeTab = 'decode'" :class="[
            'py-2 px-4 focus:outline-none',
            activeTab === 'decode' ? 'text-blue-400 border-b-2 border-blue-400 font-medium' : 'text-gray-300'
          ]">
            解码 (Base64 → 数据)
          </button>
          <button @click="activeTab = 'charTable'" :class="[
            'py-2 px-4 focus:outline-none',
            activeTab === 'charTable' ? 'text-blue-400 border-b-2 border-blue-400 font-medium' : 'text-gray-300'
          ]">
            Base64码表
          </button>
        </div>

        <!-- 编码部分：将文件/文本编码成Base64 -->
        <div v-if="activeTab === 'encode'" class="space-y-4">
          <!-- 编码输入选项 -->
          <div class="flex border-b border-gray-600 mb-4">
            <button @click="encodeInputType = 'text'" :class="[
              'py-1 px-3 focus:outline-none text-sm',
              encodeInputType === 'text' ? 'text-green-400 border-b border-green-400' : 'text-gray-300'
            ]">
              文本输入
            </button>
            <button @click="encodeInputType = 'file'" :class="[
              'py-1 px-3 focus:outline-none text-sm',
              encodeInputType === 'file' ? 'text-green-400 border-b border-green-400' : 'text-gray-300'
            ]">
              文件上传
            </button>
          </div>

          <!-- 文本输入 -->
          <div v-if="encodeInputType === 'text'">
            <div class="font-medium text-blue-400 mb-2 text-lg">输入文本：</div>
            <textarea v-model="encodeText" placeholder="输入文本，将转换为 Base64 编码"
              class="w-full h-32 p-2 border border-indigo-700 rounded-md bg-neutral-600 text-blue-300"
              @input="handleTextInput"></textarea>
          </div>

          <!-- 文件上传 -->
          <div v-if="encodeInputType === 'file'">
            <div class="font-medium text-blue-400 mb-2 text-lg">上传文件：</div>
            <div class="flex items-center space-x-4">
              <label class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md cursor-pointer">
                选择文件
                <input type="file" @change="handleFileUpload" class="hidden" />
              </label>
              <span v-if="fileInfo" class="text-blue-300">{{ fileInfo }}</span>
            </div>

            <!-- 拖拽上传区域 -->
            <div class="mt-4 border-2 border-dashed rounded-md p-8 text-center transition-colors"
              :class="[isDragging ? 'border-blue-400 bg-blue-900/20' : 'border-indigo-700']"
              @dragenter.prevent="handleDragEnter" @dragover.prevent="handleDragOver"
              @dragleave.prevent="handleDragLeave" @drop.prevent="handleDrop">
              <div class="flex flex-col items-center justify-center space-y-2">
                <font-awesome-icon icon="cloud-upload-alt" class="text-blue-400 text-3xl" />
                <p class="text-blue-300">将文件拖放到此处或<button @click="triggerFileInput"
                    class="text-blue-400 underline">点击上传</button></p>
                <input type="file" ref="hiddenFileInput" @change="handleFileUpload" class="hidden" />
              </div>
            </div>

            <!-- 图片预览 -->
            <div v-if="fileType.startsWith('image/') && filePreview"
              class="mt-4 border-2 border-dashed border-indigo-700 p-2 rounded-md">
              <div class="font-medium text-blue-400 mb-2">预览：</div>
              <img :src="filePreview" class="max-h-64 mx-auto" alt="预览" />
            </div>
          </div>

          <!-- Base64 输出 -->
          <div v-if="encodeResult" class="mt-4">
            <div class="font-medium text-blue-400 mb-2 text-lg">Base64 编码结果：</div>
            <div class="flex space-x-2 mb-2">
              <button @click="handleCopyEncodeResult"
                class="px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm">
                复制
              </button>
              <span v-if="copyMessage" class="text-green-400 text-sm">{{ copyMessage }}</span>
            </div>
            <textarea v-model="encodeResult" readonly
              class="w-full h-32 p-2 border border-indigo-700 rounded-md bg-neutral-600 text-blue-300"></textarea>
          </div>
        </div>

        <!-- 解码部分：将Base64解码成文件/文本 -->
        <div v-if="activeTab === 'decode'" class="space-y-4">
          <div class="font-medium text-blue-400 mb-2 text-lg">输入 Base64 编码：</div>
          <textarea v-model="decodeInput" placeholder="输入 Base64 编码，将解码为原始数据"
            class="w-full h-32 p-2 border border-indigo-700 rounded-md bg-neutral-600 text-blue-300"
            @input="detectBase64Type"></textarea>

          <!-- 解码选项，决定如何处理解码后的数据 -->
          <div class="flex flex-wrap gap-2 mb-2" v-if="decodeInput.trim()">
            <button @click="handleDecode('auto')"
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">
              自动检测并解码
            </button>
            <button @click="handleDecode('text')" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
              作为文本解码
            </button>
            <button @click="handleDecode('image')"
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">
              作为图片解码
            </button>
            <button @click="handleDecode('file')"
              class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md">
              作为文件解码
            </button>
          </div>

          <!-- 解码结果：文本 -->
          <div v-if="decodedText" class="mt-4">
            <div class="font-medium text-blue-400 mb-2 text-lg">解码结果（文本）：</div>
            <div class="flex space-x-2 mb-2">
              <button @click="handleCopyDecodedText"
                class="px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm">
                复制文本
              </button>
            </div>
            <textarea v-model="decodedText" readonly
              class="w-full h-32 p-2 border border-indigo-700 rounded-md bg-neutral-600 text-blue-300"></textarea>
          </div>

          <!-- 解码结果：图片或其他文件 -->
          <div v-if="decodedDataUrl" class="mt-4 border-2 border-dashed border-indigo-700 p-2 rounded-md">
            <div v-if="detectMimeType.startsWith('image/')">
              <div class="font-medium text-blue-400 mb-2">图片预览：</div>
              <img :src="decodedDataUrl" class="max-h-64 mx-auto" alt="预览" />
            </div>
            <div v-else class="text-blue-300">
              <div class="font-medium text-blue-400 mb-2">文件信息：</div>
              <p>类型: {{ detectMimeType || '未知类型' }}</p>
            </div>
            <div class="mt-4 flex justify-center">
              <a :href="decodedDataUrl" :download="`decoded.${getFileExtension()}`"
                class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">
                下载文件
              </a>
            </div>
          </div>

          <!-- 解码错误提示 -->
          <div v-if="decodeError" class="mt-2 text-red-400">
            {{ decodeError }}
          </div>
        </div>

        <!-- Base64码表部分 -->
        <div v-if="activeTab === 'charTable'" class="space-y-4">
          <div class="font-medium text-blue-400 mb-2 text-lg">Base64码表：</div>

          <!-- Base64码表说明 -->
          <div class="text-blue-300 mb-4">
            <p>Base64 编码使用以下 64 个字符：A-Z, a-z, 0-9, +, /</p>
            <p>等号 (=) 用于填充，确保编码结果的长度是 4 的倍数</p>
          </div>

          <!-- Base64码表网格 -->
          <div class="grid grid-cols-8 gap-2 text-sm text-blue-300">
            <div v-for="(char, index) in base64Chars" :key="index"
              class="p-1 border border-indigo-700 rounded bg-neutral-800 flex justify-between">
              <span class="font-bold">{{ char }}</span>
              <span>{{ index }}</span>
            </div>
          </div>

          <!-- Base64编码原理简介 -->
          <div class="mt-4 p-3 border border-indigo-700 rounded-md bg-neutral-800 text-blue-300">
            <h3 class="font-medium text-blue-400 mb-2">Base64 编码原理：</h3>
            <ol class="list-decimal list-inside space-y-1">
              <li>将二进制数据以 3 字节为一组</li>
              <li>每组 3 字节共 24 位，划分为 4 个 6 位的块</li>
              <li>每个 6 位块转换为 0-63 的十进制数</li>
              <li>按照上方码表，将十进制数映射为对应的 Base64 字符</li>
              <li>如果最后一组不足 3 字节，用 0 补足，并在末尾添加 = 号填充</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import {
  textToBase64,
  arrayBufferToBase64,
  base64ToData,
  getFileExtensionFromMimeType,
  copyToClipboard
} from '../../utils/base64';

// 选项卡和输入类型控制
const activeTab = ref('encode');
const encodeInputType = ref('text');

// 处理状态变量
//const isProcessingFile = ref(false);

// 编码相关
const encodeText = ref('');
const encodeResult = ref('');
const fileInfo = ref('');
const fileType = ref('');
const filePreview = ref('');
const fileContent = ref<ArrayBuffer | null>(null);
const isDragging = ref(false);
const hiddenFileInput = ref<HTMLInputElement | null>(null);

// 解码相关
const decodeInput = ref('');
const decodedText = ref('');
const decodedDataUrl = ref('');
const detectMimeType = ref('');
const decodeError = ref('');

// 通用
const copyMessage = ref('');

// Base64码表字符
const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

// 处理文本输入
function handleTextInput() {
  if (encodeText.value.trim() !== '') {
    encodeResult.value = textToBase64(encodeText.value);
  } else {
    encodeResult.value = '';
  }
}

// 触发隐藏的文件上传输入
function triggerFileInput() {
  if (hiddenFileInput.value) {
    hiddenFileInput.value.click();
  }
}

// 处理文件上传
function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    processFile(input.files[0]);
  }
}

// 处理文件拖拽进入
function handleDragEnter() {
  isDragging.value = true;
}

// 处理文件拖拽悬停
function handleDragOver() {
  isDragging.value = true;
}

// 处理文件拖拽离开
function handleDragLeave() {
  isDragging.value = false;
}

// 处理文件拖放
function handleDrop(e: DragEvent) {
  isDragging.value = false;
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    processFile(e.dataTransfer.files[0]);
  }
}

// 统一处理文件逻辑
function processFile(file: File) {
  // 显示文件信息
  const sizeInKB = Math.round(file.size / 1024);
  fileInfo.value = `${file.name} (${sizeInKB} KB)`;
  fileType.value = file.type;

  // 读取文件内容
  const reader = new FileReader();

  // 如果是图片则预览
  if (file.type.startsWith('image/')) {
    const imageReader = new FileReader();
    imageReader.onload = (e) => {
      if (e.target?.result) {
        filePreview.value = e.target.result as string;
      }
    };
    imageReader.readAsDataURL(file);
  } else {
    filePreview.value = '';
  }

  // 读取为二进制，转换为Base64
  reader.onload = (e) => {
    if (e.target?.result) {
      fileContent.value = e.target.result as ArrayBuffer;
      encodeResult.value = arrayBufferToBase64(fileContent.value);
    }
  };
  reader.readAsArrayBuffer(file);
}

// 复制编码结果到剪贴板
async function handleCopyEncodeResult() {
  copyMessage.value = await copyToClipboard(encodeResult.value);
  setTimeout(() => {
    copyMessage.value = '';
  }, 2000);
}

// 复制解码文本到剪贴板
async function handleCopyDecodedText() {
  copyMessage.value = await copyToClipboard(decodedText.value);
  setTimeout(() => {
    copyMessage.value = '';
  }, 2000);
}

// 检测Base64字符串可能的类型
function detectBase64Type() {
  if (!decodeInput.value.trim()) {
    resetDecodeState();
    return;
  }

  try {
    // 尝试作为文本解析，只检测类型，不显示结果
    handleDecode('auto', true);
  } catch {
    // 解析失败不显示错误
    resetDecodeState();
  }
}

// 重置解码状态
function resetDecodeState() {
  decodedText.value = '';
  decodedDataUrl.value = '';
  detectMimeType.value = '';
  decodeError.value = '';
}

// 处理解码
function handleDecode(outputType: 'auto' | 'text' | 'image' | 'file', detectOnly = false) {
  resetDecodeState();

  const result = base64ToData(decodeInput.value, outputType, detectOnly);

  // 更新状态
  decodedText.value = result.decodedText;
  decodedDataUrl.value = result.decodedDataUrl;
  detectMimeType.value = result.detectMimeType;
  decodeError.value = result.decodeError;
}

// 获取文件扩展名
function getFileExtension(): string {
  return getFileExtensionFromMimeType(detectMimeType.value);
}

// 监听选项卡切换，重置相关状态
watch(activeTab, (newTab) => {
  if (newTab === 'encode') {
    resetDecodeState();
  } else {
    encodeResult.value = '';
    fileInfo.value = '';
    filePreview.value = '';
  }
});

watch(encodeInputType, () => {
  encodeResult.value = '';
  fileInfo.value = '';
  filePreview.value = '';
  encodeText.value = '';
});
</script>

<style>
/* 可能需要的自定义样式 */
.hidden {
  display: none;
}
</style>
