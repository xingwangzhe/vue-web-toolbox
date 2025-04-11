//图标映射表
export interface ToolInfo {
  icon: string[];
  description: string;
}

export const tools_information: Record<string, ToolInfo> = {
  base64code: {
    icon: ['fas', 'square-binary'],
    description: 'Base64的编解码,对字符串进行Base64编解码'
  }
}
