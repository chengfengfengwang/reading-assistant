import { getSyncStorage } from '@/storage'
import type { Chat, Message } from '../types'
import { handleStream } from '../util'
//import { addOpenAIRecords } from '@/utils/storage'
export interface ChatConstructor {
  onError?: (err: string) => void
  onGenerating?: (text: string) => void
  onBeforeRequest?: () => void
  onComplete: (text: string) => void
  onClear?: () => void
  preMessageList?: Message[]
}
export interface OpenAIConstructor extends ChatConstructor{
}

export default class OpenAIClass implements Chat {
  controller: AbortController
  messageList: Message[]
  onError?: (err: string) => void
  onBeforeRequest?: () => void
  onGenerating?: (text: string) => void
  onComplete: (text: string) => void
  onClear?: () => void
  constructor({
    onError,
    onGenerating,
    onBeforeRequest,
    onComplete,
    onClear,
    preMessageList,
  }: OpenAIConstructor) {
    this.controller = new AbortController()
    this.messageList = preMessageList ? preMessageList : []
    this.onBeforeRequest = onBeforeRequest
    this.onError = onError
    this.onGenerating = onGenerating
    this.onComplete = onComplete
    this.onClear = onClear
  }
  async sendMessage(content?:string) {
    try {
      this.onBeforeRequest && await this.onBeforeRequest()
      if (this.controller.signal.aborted) {
        this.controller = new AbortController()
      }
      const setting = await getSyncStorage()

      const url =  setting.openAIAddress ?? "https://api.openai.com/v1/chat/completions"
      const model = setting.openAIModel?? "gpt-4o"
      const apiKey = setting.openAIKey
      if (!apiKey) {
        this.onError && this.onError('apiKey is empty')
        return
      }
      let result = '';
      content && this.messageList.push({role: 'user', content});
      this.messageList.push({role: 'assistant', content: ''});
      this.onGenerating && this.onGenerating(result);
      const res = await fetch(url, {
        method: 'POST',
        signal: this.controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: this.messageList.slice(0, -1),
          stream: true,
        }),
      })
      if (!res.ok || !res.body) {
        const json = await res.json()
        // if (json.error.message) {
        //   toastManager.add({ type: 'error', msg: json.error.message })
        // }
        this.onError && this.onError(json.error)
        return
      }
      const reader = res.body.getReader();
      handleStream(reader, (data)=> {
        if (data !== '[DONE]') {
          const json = JSON.parse(data)
          if (json.error) {
            //toastManager.add({ type: 'error', msg: json.error.message })
            this.onError && this.onError(json.error)
            return
          }            
          const text = json.choices[0].delta.content || '';
          result += text;
          this.messageList = this.messageList.map((message, index) => {
            if (index === this.messageList.length - 1) {
              return {...message, ...{content: message.content + text}}
            } else {
              return message
            }
          })
          this.onGenerating && this.onGenerating(result)
        } else {
          this.onComplete(this.messageList[this.messageList.length-1].content)
        }
      })
    } catch (error) {
      console.log(error);
      this.onError && this.onError('request failed')
    }
  }
  clearMessage() {
    this.controller.abort('card is hidden')
    this.messageList = []
    this.onClear && this.onClear()
  }
  refresh() {
    this.messageList = this.messageList.slice(0, -1);
    this.sendMessage()
  }
  abort(){
    this.controller.abort('card is hidden')
  };
}

