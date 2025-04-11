/**
 * 哈基米编码 - 解码工具
 * 将哈基米编码转换回原始二进制数据
 * 统一使用UTF-8编码
 */

// 解码映射表
const HAJIMI_MAP: Record<string, number> = {
  '哈': 0,
  '基': 1,
  '米': 2
};

/**
 * 检查字符串是否是有效的哈基米编码
 * @param encoded 需要检查的字符串
 * @returns 是否是有效的哈基米编码
 */
export function isValidHajimiCode(encoded: string): boolean {
  // 长度必须是8的倍数
  if (encoded.length % 8 !== 0) {
    return false;
  }

  // 使用正则表达式一次性检查是否只包含"哈"、"基"、"米"三个字符
  return /^[哈基米]+$/.test(encoded);
}

/**
 * 将哈基米编码转换回二进制数据
 * @param encoded 哈基米编码字符串
 * @returns 解码后的二进制数据
 */
export function decodeFromHajimi(encoded: string): Uint8Array {
  if (!isValidHajimiCode(encoded)) {
    throw new Error('无效的哈基米编码');
  }

  // 计算需要多少字节来存储结果
  const byteCount = Math.floor(encoded.length / 8);
  const result = new Uint8Array(byteCount);

  // 每8个哈基米字符对应一个字节
  for (let i = 0; i < byteCount; i++) {
    // 获取当前字节对应的8个哈基米字符
    const startIdx = i * 8;
    const part = encoded.substring(startIdx, startIdx + 8);

    // 转换为三进制字符串
    let ternaryStr = '';
    for (let j = 0; j < part.length; j++) {
      ternaryStr += HAJIMI_MAP[part[j]];
    }

    // 将三进制字符串转换为十进制数值
    result[i] = parseInt(ternaryStr, 3);
  }

  return result;
}

/**
 * 检测数据可能是哪种格式（文本或二进制）
 * @param data 二进制数据
 * @returns 数据类型和可能的MIME类型
 */
export function detectDataType(data: Uint8Array): { type: 'text' | 'binary'; mimeType: string } {
  // 使用映射表提高文件类型检测效率
  interface SignatureInfo {
    signature: number[];
    offset?: number;
    mimeType: string;
    type: 'binary';
  }

  // 常见二进制文件格式签名
  const signatures: SignatureInfo[] = [
    { signature: [0xFF, 0xD8, 0xFF], mimeType: 'image/jpeg', type: 'binary' },
    { signature: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], mimeType: 'image/png', type: 'binary' },
    { signature: [0x47, 0x49, 0x46, 0x38], mimeType: 'image/gif', type: 'binary' },
    { signature: [0x25, 0x50, 0x44, 0x46], mimeType: 'application/pdf', type: 'binary' },
    { signature: [0x50, 0x4B, 0x03, 0x04], mimeType: 'application/zip', type: 'binary' },
    // Office文档使用ZIP格式
    { signature: [0xD0, 0xCF, 0x11, 0xE0], mimeType: 'application/vnd.ms-office', type: 'binary' }
  ];

  // 检查是否匹配任何已知的二进制格式
  for (const sig of signatures) {
    if (data.length >= sig.signature.length) {
      const offset = sig.offset || 0;
      let match = true;

      for (let i = 0; i < sig.signature.length; i++) {
        if (data[offset + i] !== sig.signature[i]) {
          match = false;
          break;
        }
      }

      if (match) {
        return { type: 'binary', mimeType: sig.mimeType };
      }
    }
  }

  // 尝试以UTF-8编码解析
  try {
    const decoder = new TextDecoder('utf-8', { fatal: true });
    decoder.decode(data);
    return { type: 'text', mimeType: 'text/plain' };
  } catch (e) {
    // 如果UTF-8解码失败，可能是二进制数据或其他编码
    return { type: 'binary', mimeType: 'application/octet-stream' };
  }
}

/**
 * 将哈基米编码转换回文本字符串，统一使用UTF-8编码
 * @param encoded 哈基米编码字符串
 * @returns 解码结果对象，包含文本、是否成功、MIME类型和错误信息
 */
export function decodeHajimiToString(encoded: string): {
  text: string;
  success: boolean;
  mimeType?: string;
  error?: string;
} {
  try {
    const data = decodeFromHajimi(encoded);

    // 检测数据类型
    const dataInfo = detectDataType(data);

    if (dataInfo.type === 'binary') {
      return {
        text: '',
        success: false,
        mimeType: dataInfo.mimeType,
        error: '检测到二进制数据，无法显示为文本。请使用"文件输出"选项下载解码后的文件。'
      };
    }

    // 使用UTF-8解码
    try {
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(data);
      return {
        text,
        success: true,
        mimeType: 'text/plain'
      };
    } catch (e) {
      return {
        text: '',
        success: false,
        mimeType: 'application/octet-stream',
        error: '无法使用UTF-8解码数据，可能是二进制文件。请使用"文件输出"选项下载解码后的文件。'
      };
    }
  } catch (error) {
    return {
      text: '',
      success: false,
      error: error instanceof Error ? error.message : '解码失败'
    };
  }
}

/**
 * 将哈基米编码转换为可下载的文件数据
 * @param encoded 哈基米编码字符串
 * @returns 解码后的二进制数据Blob和MIME类型
 */
export function decodeHajimiToFile(encoded: string): { blob: Blob; mimeType: string } {
  const data = decodeFromHajimi(encoded);

  // 检测数据类型和MIME类型
  const dataInfo = detectDataType(data);

  return {
    blob: new Blob([data], { type: dataInfo.mimeType }),
    mimeType: dataInfo.mimeType
  };
}
