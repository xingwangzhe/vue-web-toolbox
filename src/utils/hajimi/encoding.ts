/**
 * 哈基米编码 - 编码工具
 * 使用"哈基米汪人胖宝牢"八个汉字编码二进制数据
 * 统一使用UTF-8编码，进行高效压缩
 */

// 扩展编码字符集："哈"，"基"，"米"，"汪"，"人"，"胖"，"宝"，"牢"
const HAJIMI_CHARS = ['哈', '基', '米', '汪', '人', '胖', '宝', '牢'];

/**
 * 将二进制数据编码为哈基米编码
 * @param data 要编码的二进制数据
 * @returns 哈基米编码字符串
 */
export function encodeToHajimi(data: Uint8Array): string {
  // 优化：使用八进制表示字节数据，每个字节需要3个字符（8^3=512，足够表示0-255）
  const resultArray: string[] = [];

  // 将每个字节转换为八进制并映射到对应字符
  for (let i = 0; i < data.length; i++) {
    const byte = data[i];

    // 转换为八进制
    const octalDigits: number[] = [];
    let value = byte;

    do {
      octalDigits.push(value % 8);
      value = Math.floor(value / 8);
    } while (value > 0);

    // 确保至少有3位（三个八进制位可以表示0-511，足够表示一个字节0-255）
    while (octalDigits.length < 3) {
      octalDigits.push(0);
    }

    // 翻转数组（低位->高位）
    octalDigits.reverse();

    // 将八进制数映射到扩展的"哈基米汪人胖宝牢"字符
    for (const digit of octalDigits) {
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
