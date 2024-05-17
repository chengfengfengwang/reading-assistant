export interface Prompt {
  id: string;
  title: string;
  content: string;
}
export interface Setting {
  openAIKey?: string;
  openAIAddress?: string;
  openAIModel?: string;
  prompts?: Prompt[];
  openAIModelList?:{label:string,value:string}[]
}