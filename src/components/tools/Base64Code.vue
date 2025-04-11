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
              @input="textToBase64"></textarea>
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
              <button @click="copyToClipboard(encodeResult)"
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
            <button @click="base64ToData('auto')"
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">
              自动检测并解码
            </button>
            <button @click="base64ToData('text')" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
              作为文本解码
            </button>
            <button @click="base64ToData('image')"
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">
              作为图片解码
            </button>
            <button @click="base64ToData('file')"
              class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md">
              作为文件解码
            </button>
          </div>

          <!-- 解码结果：文本 -->
          <div v-if="decodedText" class="mt-4">
            <div class="font-medium text-blue-400 mb-2 text-lg">解码结果（文本）：</div>
            <div class="flex space-x-2 mb-2">
              <button @click="copyToClipboard(decodedText)"
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
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';

// 选项卡和输入类型控制
const activeTab = ref('encode');
const encodeInputType = ref('text');

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

// 文本转Base64
function textToBase64() {
  try {
    if (encodeText.value.trim() !== '') {
      encodeResult.value = btoa(encodeURIComponent(encodeText.value).replace(/%([0-9A-F]{2})/g,
        function (match, p1) {
          return String.fromCharCode(parseInt(p1, 16));
        }
      ));
    } else {
      encodeResult.value = '';
    }
  } catch {
    encodeResult.value = 'Base64编码错误';
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
function handleDragEnter(e: DragEvent) {
  isDragging.value = true;
}

// 处理文件拖拽悬停
function handleDragOver(e: DragEvent) {
  isDragging.value = true;
}

// 处理文件拖拽离开
function handleDragLeave(e: DragEvent) {
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
      fileToBase64(fileContent.value);
    }
  };
  reader.readAsArrayBuffer(file);
}

// 文件内容转Base64
function fileToBase64(buffer: ArrayBuffer) {
  try {
    // 转换ArrayBuffer到Base64
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    encodeResult.value = btoa(binary);
  } catch (error) {
    console.error('转换文件到Base64出错:', error);
    encodeResult.value = '文件转Base64失败';
  }
}

// 检测Base64字符串可能的类型
function detectBase64Type() {
  if (!decodeInput.value.trim()) {
    resetDecodeState();
    return;
  }

  try {
    // 尝试作为文本解析
    base64ToData('auto', true); // 只检测类型，不显示结果
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

// Base64转数据
function base64ToData(outputType: 'auto' | 'text' | 'image' | 'file', detectOnly = false) {
  resetDecodeState();

  try {
    if (!decodeInput.value.trim()) {
      return;
    }

    // 清理Base64字符串
    const cleanBase64 = decodeInput.value.replace(/[\n\r\s]/g, '');

    // 尝试解码Base64
    let binary: string;
    try {
      binary = atob(cleanBase64);
    } catch (e) {
      decodeError.value = '无效的Base64编码';
      return;
    }

    // 检测前几个字节判断可能的文件类型
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    // 检测MIME类型
    detectMimeType.value = detectMimeTypeFromBytes(bytes);

    if (detectOnly) {
      return;
    }

    // 根据输出类型处理
    if (outputType === 'auto') {
      if (isTextLike(bytes)) {
        outputType = 'text';
      } else {
        outputType = 'file';
      }
    }

    if (outputType === 'text') {
      // 尝试作为UTF-8文本解析
      try {
        decodedText.value = decodeURIComponent(Array.prototype.map.call(binary, function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
      } catch {
        // 如果上面的方法失败，可能不是UTF-8编码，直接显示
        decodedText.value = binary;
      }
    } else {
      // 作为文件或图片处理
      const mimeType = detectMimeType.value || 'application/octet-stream';
      const blob = new Blob([bytes], { type: mimeType });
      decodedDataUrl.value = URL.createObjectURL(blob);

      if (outputType === 'image' && !detectMimeType.value.startsWith('image/')) {
        decodeError.value = '警告：这可能不是图片数据';
      }
    }
  } catch (error) {
    console.error('Base64解码错误:', error);
    decodeError.value = '解码过程中发生错误';
  }
}

// 从字节数组中检测可能的MIME类型
function detectMimeTypeFromBytes(bytes: Uint8Array): string {
  // 文件签名(Magic Numbers)检测
  // 图片格式
  if (bytes.length >= 4 && bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return 'image/jpeg';
  }
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47
    && bytes[4] === 0x0D && bytes[5] === 0x0A && bytes[6] === 0x1A && bytes[7] === 0x0A) {
    return 'image/png';
  }
  if (bytes.length >= 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38
    && (bytes[4] === 0x37 || bytes[4] === 0x39) && bytes[5] === 0x61) {
    return 'image/gif';
  }
  if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46
    && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return 'image/webp';
  }
  if (bytes.length >= 4 && bytes[0] === 0x42 && bytes[1] === 0x4D) {
    return 'image/bmp';
  }
  if ((bytes.length >= 4 && bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2A && bytes[3] === 0x00) ||
    (bytes.length >= 4 && bytes[0] === 0x4D && bytes[1] === 0x4D && bytes[2] === 0x00 && bytes[3] === 0x2A)) {
    return 'image/tiff';
  }
  if (bytes.length >= 4 && bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x01 && bytes[3] === 0x00) {
    return 'image/x-icon';
  }

  // 文档格式
  if (bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return 'application/pdf';
  }
  // MS Office文档
  if (bytes.length >= 8 &&
    bytes[0] === 0xD0 && bytes[1] === 0xCF && bytes[2] === 0x11 && bytes[3] === 0xE0 &&
    bytes[4] === 0xA1 && bytes[5] === 0xB1 && bytes[6] === 0x1A && bytes[7] === 0xE1) {
    // 这是OLE格式，包括旧版本的Word/Excel/PowerPoint
    return 'application/msword'; // 简单起见返回msword，实际上还需进一步分析
  }
  // 新版Office文档(docx, xlsx, pptx等)基于ZIP格式，会被下面的ZIP检测识别

  // 压缩文件格式
  if (bytes.length >= 4 &&
    ((bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04) ||
      (bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x05 && bytes[3] === 0x06) ||
      (bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x07 && bytes[3] === 0x08))) {
    return 'application/zip';
  }
  if (bytes.length >= 6 && bytes[0] === 0x52 && bytes[1] === 0x61 && bytes[2] === 0x72 && bytes[3] === 0x21 &&
    bytes[4] === 0x1A && bytes[5] === 0x07) {
    return 'application/x-rar-compressed';
  }
  if (bytes.length >= 6 && bytes[0] === 0x1F && bytes[1] === 0x8B && bytes[2] === 0x08) {
    return 'application/gzip';
  }
  if (bytes.length >= 2 && bytes[0] === 0x42 && bytes[1] === 0x5A) {
    return 'application/x-bzip';
  }
  if (bytes.length >= 4 && bytes[0] === 0x7F && bytes[1] === 0x45 && bytes[2] === 0x4C && bytes[3] === 0x46) {
    return 'application/x-elf'; // Linux可执行文件
  }
  if (bytes.length >= 2 && bytes[0] === 0x4D && bytes[1] === 0x5A) {
    return 'application/x-msdownload'; // Windows可执行文件
  }

  // 音频视频格式
  if (bytes.length >= 4 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    return 'audio/mp3'; // ID3标记，常见于MP3文件
  }
  if (bytes.length >= 12 && bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x00 &&
    (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70)) {
    return 'video/mp4'; // MP4文件格式
  }
  if (bytes.length >= 4 && bytes[0] === 0x1A && bytes[1] === 0x45 && bytes[2] === 0xDF && bytes[3] === 0xA3) {
    return 'video/webm'; // WebM文件格式
  }
  if (bytes.length >= 4 && bytes[0] === 0x4F && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) {
    return 'application/ogg'; // Ogg容器格式
  }
  if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x41 && bytes[9] === 0x56 && bytes[10] === 0x49) {
    return 'video/x-msvideo'; // AVI文件
  }
  if (bytes.length >= 8 && bytes[0] === 0x46 && bytes[1] === 0x4C && bytes[2] === 0x56 && bytes[3] === 0x01) {
    return 'video/x-flv'; // Flash视频
  }

  // XML检测
  if (bytes.length >= 5 && bytes[0] === 0x3C && bytes[1] === 0x3F && bytes[2] === 0x78 && bytes[3] === 0x6D && bytes[4] === 0x6C) {
    return 'application/xml'; // XML文档
  }

  // JSON检测
  if (bytes.length >= 2 && ((bytes[0] === 0x7B && findClosingBrace(bytes)) || (bytes[0] === 0x5B && findClosingBracket(bytes)))) {
    return 'application/json'; // JSON文档
  }

  // HTML检测
  if (bytes.length >= 15) {
    const htmlPrefix = bytesToString(bytes.slice(0, 15)).toLowerCase();
    if (htmlPrefix.includes("<!doctype html") || htmlPrefix.includes("<html")) {
      return 'text/html';
    }
  }

  // CSS检测
  if (bytes.length >= 10 && containsCommonCSSRules(bytes)) {
    return 'text/css';
  }

  // JavaScript检测
  if (bytes.length >= 20 && containsJavaScriptPatterns(bytes)) {
    return 'application/javascript';
  }

  // 检查UTF-8 BOM
  if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
    return 'text/plain; charset=utf-8';
  }

  // 检查UTF-16 BOM
  if (bytes.length >= 2 &&
    ((bytes[0] === 0xFE && bytes[1] === 0xFF) || (bytes[0] === 0xFF && bytes[1] === 0xFE))) {
    return 'text/plain; charset=utf-16';
  }

  // 如果无法检测，根据内容粗略判断是否可能是文本
  if (isTextLike(bytes)) {
    return 'text/plain';
  }

  return 'application/octet-stream'; // 默认二进制类型
}

// 将字节数组转换成字符串，用于文本内容检测
function bytesToString(bytes: Uint8Array): string {
  let result = '';
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    // 只转换ASCII可打印字符和常见控制字符
    if ((byte >= 32 && byte <= 126) || byte === 9 || byte === 10 || byte === 13) {
      result += String.fromCharCode(byte);
    } else {
      result += ' '; // 用空格替代不可打印字符
    }
  }
  return result;
}

// 检查是否包含常见CSS规则
function containsCommonCSSRules(bytes: Uint8Array): boolean {
  const content = bytesToString(bytes.slice(0, 100)).toLowerCase();
  return content.includes('{') &&
    (content.includes('margin') || content.includes('padding') ||
      content.includes('font') || content.includes('color') ||
      content.includes('background') || content.includes('display'));
}

// 检查是否包含JavaScript常见模式
function containsJavaScriptPatterns(bytes: Uint8Array): boolean {
  const content = bytesToString(bytes.slice(0, 150)).toLowerCase();
  return (content.includes('function') && content.includes('{')) ||
    content.includes('var ') || content.includes('let ') ||
    content.includes('const ') ||
    (content.includes('=') && content.includes(';')) ||
    content.includes('export ') || content.includes('import ');
}

// 检查JSON格式：查找匹配的闭合花括号
function findClosingBrace(bytes: Uint8Array): boolean {
  // 简化实现，仅检查前100字节中是否有闭合花括号
  return bytesToString(bytes.slice(0, 100)).includes('}');
}

// 检查JSON数组格式：查找匹配的闭合方括号
function findClosingBracket(bytes: Uint8Array): boolean {
  // 简化实现，仅检查前100字节中是否有闭合方括号
  return bytesToString(bytes.slice(0, 100)).includes(']');
}

// 根据字节内容粗略判断是否可能为文本
function isTextLike(bytes: Uint8Array): boolean {
  // 检查前100个字节，如果大部分在可打印ASCII范围内则可能是文本
  const checkLength = Math.min(100, bytes.length);
  let textCharCount = 0;

  for (let i = 0; i < checkLength; i++) {
    const byte = bytes[i];
    // ASCII 可见字符范围大致是 32-126，加上一些常见控制字符
    if ((byte >= 32 && byte <= 126) || byte === 9 || byte === 10 || byte === 13) {
      textCharCount++;
    }
  }

  // 如果超过80%的字符是可打印的，可能是文本
  return textCharCount / checkLength > 0.8;
}

// 根据MIME类型获取文件扩展名
function getFileExtension(): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'application/pdf': 'pdf',
    'application/zip': 'zip',
    'text/plain': 'txt',
    'text/html': 'html',
    'application/json': 'json'
  };

  return mimeToExt[detectMimeType.value] || 'bin';
}

// 复制到剪贴板
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    copyMessage.value = '已复制到剪贴板！';
    setTimeout(() => {
      copyMessage.value = '';
    }, 2000);
  }).catch(err => {
    console.error('复制失败:', err);
    copyMessage.value = '复制失败，请手动复制';
  });
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
