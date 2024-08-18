import ChatInput from "./chatInput";
import type { Message } from "./types";
import InputBlink from "./inputBlink";
import useChat from "./useChat";
import { EngineValue } from "./types";
import { ErrorBoundary } from "react-error-boundary";
import FallbackComponent from "./fallbackComponent";
import { ReactElement, forwardRef, useImperativeHandle, useRef } from "react";
import Markdown from 'react-markdown'

interface ConversationProps {
  preMessageList?: Message[];
  className?: string;
  engine: EngineValue;
  toolSlot?: ReactElement
}
interface ConversationExpose {
  sendMessage: (content?:string) => void,
  clearMessage: ()=>void,
  getInput: ()=>string,
  setInput: (v:string)=>void
}
type ChatInputExpose = React.ElementRef<typeof ChatInput>
const ConversationMain = forwardRef<ConversationExpose, ConversationProps>(function (params: ConversationProps, ref) {
  const { preMessageList, className, engine } = params;
  const { messageList, loading, generating, chatInstance } = useChat({
    preMessageList,
    engine,
  });
  const chatInputRef = useRef<ChatInputExpose>(null)
  const handleRequest = (content?: string) => {
    chatInstance.current?.sendMessage(content);
    chatInputRef.current?.setInput('')
  };

  useImperativeHandle(ref, ()=>{
    return {
      sendMessage: (content?:string) => {
        handleRequest(content)
      },
      clearMessage: () => {
        chatInstance.current?.clearMessage()
      },
      getInput() {
        return chatInputRef.current!.getInput()
      },
      setInput(v:string) {
        return chatInputRef.current!.setInput(v)
      },
    }
  })
  return (
    <div
      className={`h-full overflow-auto pt-3  flex flex-col justify-between ${className}`}
    >
      <div className="grow overflow-hidden">
        <div
          className={`cat_message_wrapper space-y-3 px-2 py-2 h-full overflow-y-scroll`}
        >
          {messageList.map((item, index) => {
            return (
              <div
                className={`flex ${
                  item.role === "user" ? "justify-end" : "justify-start"
                }`}
                key={index}
              >
                <div
                  className={`${
                    item.role === "user"
                      ? "bg-neutral text-neutral-content rounded-br-md"
                      : "bg-neutral text-neutral-content rounded-tl-md"
                  } ${
                    item.isError ? "text-error-content" : ""
                  } group rounded-3xl  px-4 py-3 relative shadow break-words min-w-0`}
                >
                  <Markdown>{item.content}</Markdown>
                  {(loading || generating) &&
                    index === messageList.length - 1 && <InputBlink />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="shrink-0">
        {
          params.toolSlot ? params.toolSlot :null
        }
        <ChatInput ref={chatInputRef} onSubmit={handleRequest} placeholder=""></ChatInput>
      </div>
    </div>
  );
});

export default forwardRef<ConversationExpose, ConversationProps>(function Conversation(props: ConversationProps, ref) {
  return (
    <div className="h-full">
      <ErrorBoundary
        FallbackComponent={(fallbackProps) => (
          <FallbackComponent fallbackProps={fallbackProps} />
        )}
      >
        <ConversationMain ref={ref} {...props} />
      </ErrorBoundary>
    </div>
  );
});
