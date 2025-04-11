// 处理Base64编码相关的函数

/**
 * 将文本转换为Base64编码
 * @param text 需要编码的文本
 * @returns Base64编码后的字符串，如果失败则返回错误信息
 */
export function textToBase64(text: string): string {
  try {
    if (text.trim() !== '') {
      return btoa(encodeURIComponent(text).replace(/%([0-9A-F]{2})/g,
        function (match, p1) {
          return String.fromCharCode(parseInt(p1, 16));
        }
      ));
    } else {
      return '';
    }
  } catch {
    return 'Base64编码错误';
  }
}

/**
 * 将ArrayBuffer转换为Base64编码
 * @param buffer 需要编码的ArrayBuffer数据
 * @returns Base64编码后的字符串
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  try {
    // 转换ArrayBuffer到Base64
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch (error) {
    console.error('转换文件到Base64出错:', error);
    return '文件转Base64失败';
  }
}
