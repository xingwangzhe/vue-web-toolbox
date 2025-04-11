// 处理文本检测和转换相关的函数

/**
 * 将字节数组转换成字符串，用于文本内容检测
 * @param bytes 要转换的字节数组
 * @returns 转换后的字符串
 */
export function bytesToString(bytes: Uint8Array): string {
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

/**
 * 根据MIME类型获取文件扩展名
 * @param mimeType MIME类型字符串
 * @returns 对应的文件扩展名
 */
export function getFileExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    // 图片格式
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/bmp': 'bmp',
    'image/tiff': 'tiff',
    'image/x-icon': 'ico',
    'image/svg+xml': 'svg',

    // 文档格式
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',

    // 压缩文件
    'application/zip': 'zip',
    'application/x-rar-compressed': 'rar',
    'application/gzip': 'gz',
    'application/x-bzip': 'bz2',
    'application/x-7z-compressed': '7z',
    'application/x-tar': 'tar',

    // 可执行文件
    'application/x-msdownload': 'exe',
    'application/x-elf': 'elf',

    // 音频视频
    'audio/mp3': 'mp3',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'application/ogg': 'ogg',
    'video/x-msvideo': 'avi',
    'video/x-flv': 'flv',
    'video/quicktime': 'mov',

    // 文本和编程语言
    'text/plain': 'txt',
    'text/html': 'html',
    'text/css': 'css',
    'application/javascript': 'js',
    'application/json': 'json',
    'application/xml': 'xml',
    'text/csv': 'csv',
    'text/markdown': 'md',

    // 字体
    'font/ttf': 'ttf',
    'font/otf': 'otf',
    'font/woff': 'woff',
    'font/woff2': 'woff2'
  };

  // 检查MIME类型是否包含编码信息（例如 text/plain; charset=utf-8）
  const mimeBase = mimeType.split(';')[0].trim();

  // 尝试从映射表中获取扩展名，如果不存在则使用默认值
  return mimeToExt[mimeBase] || (mimeBase.startsWith('text/') ? 'txt' : 'bin');
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns Promise，复制成功返回成功信息，否则返回错误信息
 */
export async function copyToClipboard(text: string): Promise<string> {
  try {
    await navigator.clipboard.writeText(text);
    return '已复制到剪贴板！';
  } catch (err) {
    console.error('复制失败:', err);
    return '复制失败，请手动复制';
  }
}
