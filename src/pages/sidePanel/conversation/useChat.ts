import { useEffect, useState, useRef } from "react";
import { Message, Chat } from "./types";
import { useErrorBoundary } from "react-error-boundary";
import { EngineValue } from "./types";
import { ChatConstructor } from "./api/openAI";
import { getChat } from "./api/getChat";
export default function useChat({
  preMessageList,
  engine,
}: {
  preMessageList?: Message[];
  engine: EngineValue;
}) {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [messageList, setMessageList] = useState<Message[]>(
    preMessageList ?? []
  );
  const chatInstance = useRef<Chat | null>(null);
  const { showBoundary } = useErrorBoundary();
  const clearMessage = () => {
    chatInstance.current?.clearMessage();
    setMessageList([])
  }
  useEffect(() => {
    // if (chatInstance.current) {
    //   return;
    // }
    preMessageList && setMessageList(preMessageList);
    const chatOptions: ChatConstructor = {
      preMessageList: preMessageList ?? [],
      onBeforeRequest() {
        setLoading(true);
      },
      onComplete: () => {
        setGenerating(false);
        setLoading(false);
      },
      onGenerating() {
        setGenerating(true);
        setLoading(false);
        chatInstance.current &&
          setMessageList(chatInstance.current.messageList);
      },
      onError(err) {
        setGenerating(false);
        setLoading(false);
        showBoundary(err);
      },
    };
    const chatClass = getChat(engine);
    if (!chatClass) {
      return;
    }
    chatInstance.current = new chatClass(chatOptions);
  }, [preMessageList, engine]);
  return {
    loading,
    generating,
    chatInstance,
    messageList,
    clearMessage
  };
}
