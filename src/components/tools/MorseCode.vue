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
            编码 (文本 → 摩尔斯码)
          </button>
          <button @click="activeTab = 'decode'" :class="[
            'py-2 px-4 focus:outline-none',
            activeTab === 'decode' ? 'text-blue-400 border-b-2 border-blue-400 font-medium' : 'text-gray-300'
          ]">
            解码 (摩尔斯码 → 文本)
          </button>
        </div>

        <!-- 编码部分 -->
        <div v-if="activeTab === 'encode'" class="space-y-4">
          <div class="font-medium text-blue-400 mb-2 text-lg">输入文本：</div>
          <textarea v-model="encodeInput"
            class="w-full h-32 p-2 border border-indigo-700 rounded-md bg-neutral-600 text-blue-300"
            placeholder="输入原始文本，将转换为摩尔斯码"></textarea>

          <div class="flex space-x-2 mb-2">
            <button @click="convertToMorse" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
              转换为摩尔斯码
            </button>
            <button v-if="morseResult" @click="handleCopyMorseResult"
              class="px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm">
              复制结果
            </button>
            <span v-if="copyMessage" class="text-green-400 text-sm">{{ copyMessage }}</span>
          </div>

          <div v-if="morseResult" class="mt-4">
            <div class="font-medium text-blue-400 mb-2 text-lg">摩尔斯码结果：</div>
            <div class="w-full p-3 border border-indigo-700 rounded-md bg-neutral-600 text-blue-300 break-all">
              {{ morseResult }}
            </div>
          </div>

          <!-- 摩尔斯码表 -->
          <div class="mt-6">
            <div class="font-medium text-blue-400 mb-2 text-lg">摩尔斯码表：</div>
            <div class="grid grid-cols-5 gap-2 text-sm text-blue-300">
              <div v-for="(code, char) in morseCodeMap" :key="char"
                class="p-1 border border-indigo-700 rounded bg-neutral-800 flex justify-between">
                <span class="font-bold">{{ char }}</span>
                <span>{{ code }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 解码部分 -->
        <div v-if="activeTab === 'decode'" class="space-y-4">
          <div class="font-medium text-blue-400 mb-2 text-lg">输入摩尔斯码：</div>
          <div class="text-gray-300 text-sm mb-2">
            <p>请使用空格分隔每个字符的摩尔斯码，使用 "/" 表示空格</p>
            <p>例如：... --- ... 表示 SOS</p>
          </div>
          <textarea v-model="decodeInput"
            class="w-full h-32 p-2 border border-indigo-700 rounded-md bg-neutral-600 text-blue-300"
            placeholder="输入摩尔斯码，将转换为文本"></textarea>

          <div class="flex space-x-2 mb-2">
            <button @click="convertToText" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
              转换为文本
            </button>
            <button v-if="textResult" @click="handleCopyTextResult"
              class="px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm">
              复制结果
            </button>
            <span v-if="copyMessage" class="text-green-400 text-sm">{{ copyMessage }}</span>
          </div>

          <div v-if="textResult" class="mt-4">
            <div class="font-medium text-blue-400 mb-2 text-lg">文本结果：</div>
            <div class="w-full p-3 border border-indigo-700 rounded-md bg-neutral-600 text-blue-300">
              {{ textResult }}
            </div>
          </div>

          <!-- 摩尔斯码表 -->
          <div class="mt-6">
            <div class="font-medium text-blue-400 mb-2 text-lg">摩尔斯码表：</div>
            <div class="grid grid-cols-5 gap-2 text-sm text-blue-300">
              <div v-for="(code, char) in morseCodeMap" :key="char"
                class="p-1 border border-indigo-700 rounded bg-neutral-800 flex justify-between">
                <span class="font-bold">{{ char }}</span>
                <span>{{ code }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';

// 选项卡控制
const activeTab = ref('encode');

// 编码相关
const encodeInput = ref('');
const morseResult = ref('');

// 解码相关
const decodeInput = ref('');
const textResult = ref('');

// 通用
const copyMessage = ref('');

// 摩尔斯码映射表
const morseCodeMap = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  ' ': '/',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.',
  '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
  '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-',
  '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.',
  '$': '...-..-', '@': '.--.-.',
};

// 摩尔斯码到字符的反向映射表
const morseToCharMap = computed(() => {
  const map: { [key: string]: string } = {};
  Object.entries(morseCodeMap).forEach(([char, code]) => {
    map[code] = char;
  });
  return map;
});

// 文本转摩尔斯码
function convertToMorse() {
  if (!encodeInput.value) return;

  morseResult.value = encodeInput.value
    .toUpperCase()
    .split('')
    .map(char => morseCodeMap[char] || char)
    .join(' ');
}

// 摩尔斯码转文本
function convertToText() {
  if (!decodeInput.value) return;

  // 处理输入的摩尔斯码，按空格分割
  const morseCharacters = decodeInput.value.trim().split(' ');

  // 将每个摩尔斯码转换回字符
  textResult.value = morseCharacters
    .map(code => {
      if (code === '/') return ' '; // 处理空格
      return morseToCharMap.value[code] || '?'; // 找不到对应字符时显示?
    })
    .join('');
}

// 复制文本到剪贴板
async function copyToClipboard(text: string): Promise<string> {
  try {
    await navigator.clipboard.writeText(text);
    return "已复制到剪贴板";
  } catch (error) {
    console.error("复制失败:", error);
    return "复制失败";
  }
}

// 复制摩尔斯码到剪贴板
async function handleCopyMorseResult() {
  copyMessage.value = await copyToClipboard(morseResult.value);
  setTimeout(() => {
    copyMessage.value = '';
  }, 2000);
}

// 复制文本结果到剪贴板
async function handleCopyTextResult() {
  copyMessage.value = await copyToClipboard(textResult.value);
  setTimeout(() => {
    copyMessage.value = '';
  }, 2000);
}

// 实时转换
watch(encodeInput, (newValue) => {
  if (newValue) {
    convertToMorse();
  } else {
    morseResult.value = '';
  }
});

// 实时转换
watch(decodeInput, (newValue) => {
  if (newValue) {
    convertToText();
  } else {
    textResult.value = '';
  }
});

// 监听选项卡切换，重置相关状态
watch(activeTab, () => {
  copyMessage.value = '';
});
</script>

<style>
/* 可能需要的自定义样式 */
.hidden {
  display: none;
}
</style>
