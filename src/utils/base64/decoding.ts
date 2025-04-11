// 处理Base64解码相关的函数

/**
 * Base64转换为数据
 * @param base64String Base64编码的字符串
 * @param outputType 输出类型: 'auto'(自动检测), 'text'(文本), 'image'(图片), 'file'(文件)
 * @param detectOnly 是否仅检测类型，不返回完整解码结果
 * @returns 解码结果对象，包含文本、数据URL、MIME类型和错误信息
 */
export function base64ToData(base64String: string, outputType: 'auto' | 'text' | 'image' | 'file' = 'auto', detectOnly = false) {
  const result = {
    decodedText: '',
    decodedDataUrl: '',
    detectMimeType: '',
    decodeError: ''
  };

  try {
    if (!base64String.trim()) {
      return result;
    }

    // 清理Base64字符串
    const cleanBase64 = base64String.replace(/[\n\r\s]/g, '');

    // 尝试解码Base64
    let binary: string;
    try {
      binary = atob(cleanBase64);
    } catch (e) {
      result.decodeError = '无效的Base64编码';
      return result;
    }

    // 检测前几个字节判断可能的文件类型
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    // 检测MIME类型
    result.detectMimeType = detectMimeTypeFromBytes(bytes);

    if (detectOnly) {
      return result;
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
        result.decodedText = decodeURIComponent(Array.prototype.map.call(binary, function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
      } catch {
        // 如果上面的方法失败，可能不是UTF-8编码，直接显示
        result.decodedText = binary;
      }
    } else {
      // 作为文件或图片处理
      const mimeType = result.detectMimeType || 'application/octet-stream';
      const blob = new Blob([bytes], { type: mimeType });
      result.decodedDataUrl = URL.createObjectURL(blob);

      if (outputType === 'image' && !result.detectMimeType.startsWith('image/')) {
        result.decodeError = '警告：这可能不是图片数据';
      }
    }
  } catch (error) {
    console.error('Base64解码错误:', error);
    result.decodeError = '解码过程中发生错误';
  }

  return result;
}

/**
 * 根据字节内容判断是否可能为文本
 * @param bytes 字节数据
 * @returns 是否为文本类型
 */
export function isTextLike(bytes: Uint8Array): boolean {
  // 检查是否含有BOM标记
  if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
    return true; // UTF-8 BOM
  }
  if (bytes.length >= 2 &&
    ((bytes[0] === 0xFE && bytes[1] === 0xFF) || (bytes[0] === 0xFF && bytes[1] === 0xFE))) {
    return true; // UTF-16 BOM
  }

  // 检测是否为有效的UTF-8编码
  if (isValidUTF8(bytes)) {
    return true;
  }

  // 检查统计特征
  const checkLength = Math.min(500, bytes.length); // 增加检查长度以提高准确性
  let textCharCount = 0;
  let controlCharCount = 0;
  let binaryCharCount = 0;
  let nullByteCount = 0;

  // 统计不同类型字符的数量
  for (let i = 0; i < checkLength; i++) {
    const byte = bytes[i];
    // ASCII 可见字符
    if (byte >= 32 && byte <= 126) {
      textCharCount++;
    }
    // 常见控制字符 (tab, LF, CR, etc)
    else if (byte === 9 || byte === 10 || byte === 13) {
      controlCharCount++;
    }
    // 空字节
    else if (byte === 0) {
      nullByteCount++;
    }
    // 其他非文本字节
    else if (byte < 9 || (byte > 13 && byte < 32) || byte > 126) {
      binaryCharCount++;
    }
  }

  // 文本特征判断条件
  // 1. 至少有30%是可见字符
  const textRatio = textCharCount / checkLength;
  // 2. 二进制字符比例不应太高
  const binaryRatio = binaryCharCount / checkLength;
  // 3. 空字节比例不应太高(可能是二进制文件)
  const nullRatio = nullByteCount / checkLength;

  // 判断为文本的条件组合
  return (textRatio > 0.3) && (binaryRatio < 0.3) && (nullRatio < 0.2);
}

/**
 * 检查是否是有效的UTF-8编码
 * @param bytes 字节数据
 * @returns 是否为有效UTF-8编码
 */
function isValidUTF8(bytes: Uint8Array): boolean {
  // 简单的UTF-8验证：检查多字节字符结构是否符合UTF-8编码规则
  let i = 0;
  const len = Math.min(bytes.length, 500); // 限制检查长度
  let validSequences = 0;
  let invalidSequences = 0;

  while (i < len) {
    // 单字节ASCII (0xxxxxxx)
    if ((bytes[i] & 0x80) === 0) {
      i += 1;
    }
    // 2字节序列 (110xxxxx 10xxxxxx)
    else if ((bytes[i] & 0xE0) === 0xC0) {
      if (i + 1 < len && (bytes[i + 1] & 0xC0) === 0x80) {
        validSequences++;
        i += 2;
      } else {
        invalidSequences++;
        i += 1;
      }
    }
    // 3字节序列 (1110xxxx 10xxxxxx 10xxxxxx)
    else if ((bytes[i] & 0xF0) === 0xE0) {
      if (i + 2 < len && (bytes[i + 1] & 0xC0) === 0x80 && (bytes[i + 2] & 0xC0) === 0x80) {
        validSequences++;
        i += 3;
      } else {
        invalidSequences++;
        i += 1;
      }
    }
    // 4字节序列 (11110xxx 10xxxxxx 10xxxxxx 10xxxxxx)
    else if ((bytes[i] & 0xF8) === 0xF0) {
      if (i + 3 < len && (bytes[i + 1] & 0xC0) === 0x80 &&
        (bytes[i + 2] & 0xC0) === 0x80 && (bytes[i + 3] & 0xC0) === 0x80) {
        validSequences++;
        i += 4;
      } else {
        invalidSequences++;
        i += 1;
      }
    } else {
      // 无效的UTF-8起始字节
      invalidSequences++;
      i += 1;
    }
  }

  // 如果有足够多的有效多字节序列，且无效序列比例低，认为是UTF-8
  return validSequences > 0 && (invalidSequences / (validSequences + invalidSequences)) < 0.2;
}

// 导入需要的函数
import { detectMimeTypeFromBytes } from './fileTypeDetection';
