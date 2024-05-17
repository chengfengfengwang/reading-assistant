export interface Message {
  role: 'user' | 'assistant' | 'system',
  content: string,
  isError?: boolean
}
export interface OpenAIRecordItem {
  conversationId: string,
  messageList: Message[],
  lastMessageId?: string
}
export interface  Chat {
  messageList: Message[]
  sendMessage: (content?:string)=>void
  abort: ()=>void
  clearMessage: ()=>void
  refresh: ()=>void
  resume?: (params: OpenAIRecordItem) => void
}
export const EngineList = [
  {
    name: "OpenAI",
    value: "openai",
  },
  {
    name: "Gemini",
    value: "gemini",
  },
  {
    name: "文心一言",
    value: "wenxin",
  },
  {
    name: "DeepSeek",
    value: "deepseek",
  },
  {
    name: "moonshot",
    value: "moonshot",
  },
] as const
export type EngineValue = typeof EngineList[number]['value']