// Base64 工具函数统一导出

// 编码相关函数
export { textToBase64, arrayBufferToBase64 } from './encoding';

// 解码相关函数
export { base64ToData, isTextLike } from './decoding';

// 文件类型检测相关函数
export { detectMimeTypeFromBytes } from './fileTypeDetection';

// 文本处理相关函数
export {
  bytesToString,
  getFileExtensionFromMimeType,
  copyToClipboard
} from './textDetection';
