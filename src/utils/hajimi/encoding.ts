/**
 * 哈基米编码 - 编码工具
 * 使用"哈基米"三个汉字编码二进制数据
 * 统一使用UTF-8编码
 */

// 编码字符集："哈"，"基"，"米"
const HAJIMI_CHARS = ['哈', '基', '米'];

/**
 * 将二进制数据编码为哈基米编码
 * @param data 要编码的二进制数据
 * @returns 哈基米编码字符串
 */
export function encodeToHajimi(data: Uint8Array): string {
  // 优化：使用更直接的方式将二进制数据转换为三进制表示
  const resultArray: string[] = [];

  // 处理每个字节
  for (let i = 0; i < data.length; i++) {
    // 将字节值转换为三进制字符串，使用padStart确保长度为8位
    const ternaryStr = data[i].toString(3).padStart(8, '0');

    // 将三进制字符串的每一位映射为对应的"哈基米"字符
    for (let j = 0; j < ternaryStr.length; j++) {
      const digit = parseInt(ternaryStr[j], 3);
      resultArray.push(HAJIMI_CHARS[digit]);
    }
  }

  return resultArray.join('');
}

/**
 * 将字符串转换为哈基米编码
 * @param text 要编码的文本
 * @returns 哈基米编码字符串
 */
export function encodeStringToHajimi(text: string): string {
  // 统一使用UTF-8编码
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  return encodeToHajimi(data);
}

/**
 * 将文件数据编码为哈基米编码
 * @param file 文件对象
 * @returns Promise，解析为哈基米编码字符串
 */
export function encodeFileToHajimi(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        const data = new Uint8Array(reader.result);
        resolve(encodeToHajimi(data));
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}
