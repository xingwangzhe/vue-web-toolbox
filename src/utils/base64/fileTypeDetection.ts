// 处理文件类型检测相关的函数

import { bytesToString } from './textDetection';

/**
 * 从字节数组中检测可能的MIME类型
 * @param bytes 需要检测的字节数组
 * @returns 检测到的MIME类型字符串
 */
export function detectMimeTypeFromBytes(bytes: Uint8Array): string {
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

/**
 * 检查JSON格式：查找匹配的闭合花括号
 * @param bytes 字节数据
 * @returns 是否找到闭合花括号
 */
function findClosingBrace(bytes: Uint8Array): boolean {
  // 简化实现，仅检查前100字节中是否有闭合花括号
  return bytesToString(bytes.slice(0, 100)).includes('}');
}

/**
 * 检查JSON数组格式：查找匹配的闭合方括号
 * @param bytes 字节数据
 * @returns 是否找到闭合方括号
 */
function findClosingBracket(bytes: Uint8Array): boolean {
  // 简化实现，仅检查前100字节中是否有闭合方括号
  return bytesToString(bytes.slice(0, 100)).includes(']');
}

/**
 * 检查是否包含常见CSS规则
 * @param bytes 字节数据
 * @returns 是否包含常见CSS规则
 */
function containsCommonCSSRules(bytes: Uint8Array): boolean {
  const content = bytesToString(bytes.slice(0, 100)).toLowerCase();
  return content.includes('{') &&
    (content.includes('margin') || content.includes('padding') ||
      content.includes('font') || content.includes('color') ||
      content.includes('background') || content.includes('display'));
}

/**
 * 检查是否包含JavaScript常见模式
 * @param bytes 字节数据
 * @returns 是否包含JavaScript常见模式
 */
function containsJavaScriptPatterns(bytes: Uint8Array): boolean {
  const content = bytesToString(bytes.slice(0, 150)).toLowerCase();
  return (content.includes('function') && content.includes('{')) ||
    content.includes('var ') || content.includes('let ') ||
    content.includes('const ') ||
    (content.includes('=') && content.includes(';')) ||
    content.includes('export ') || content.includes('import ');
}

// 从其他模块导入所需函数
import { isTextLike } from './decoding';
