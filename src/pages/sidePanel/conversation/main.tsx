import ChatInput from "./chatInput";
import type { Message } from "./types";
import InputBlink from "./inputBlink";
import useChat from "./useChat";
import { EngineValue } from "./types";
import { ErrorBoundary } from "react-error-boundary";
import FallbackComponent from "./fallbackComponent";

interface ConversationProps {
  preMessageList?: Message[];
  className?: string;
  engine: EngineValue;
}
export function ConversationMain({
  preMessageList,
  className,
  engine,
}: ConversationProps) {
  const { messageList, loading, generating, chatInstance } = useChat({
    preMessageList,
    engine,
  });
  console.log(messageList,loading);
  
  const handleRequest = (content: string) => {
    chatInstance.current?.sendMessage(content);
  };

  // const renderMessageList = messageList.filter(
  //   (_item,index) => chatInstance.current instanceof GeminiClass ? (index !== 0 && index !==1 ) : index !== 0
  // );
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
                  {item.content}
                  {(loading || generating) && index === messageList.length - 1 && (
                    <InputBlink />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="shrink-0">
        <ChatInput onSubmit={handleRequest} placeholder=""></ChatInput>
      </div>
    </div>
  );
}

export default function Conversation(props: ConversationProps) {
  return (
    <div className="h-full">
      <ErrorBoundary
        FallbackComponent={(fallbackProps) => (
          <FallbackComponent fallbackProps={fallbackProps} />
        )}
      >
        <ConversationMain {...props} />
      </ErrorBoundary>
    </div>
  );
}
