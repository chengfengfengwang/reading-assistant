import { createRoot } from "react-dom/client";
import "@/assets/tailwind.css";
import { useCallback, useEffect, useRef, useState } from "react";
import Conversation from "./conversation/main";
import { Message } from "./conversation/types";
import { getMatchContent } from "@/getMatchContent";
import { useSetting } from "@/hooks/useSetting";
import { toastManager, ToastContainer } from "@/components/toast";
import { Settings, Eraser, FileTerminal, TextSearch } from "lucide-react";
import { getSyncStorage } from "@/storage";
type ConversationExpose = React.ElementRef<typeof Conversation>;
const getPrompt = async (id: string) => {
  const setting = await getSyncStorage();
  const prompts = setting.prompts;
  return prompts?.find((item) => item.id === id)?.content;
};
export default function App() {
  const { setting } = useSetting();
  const [matchContentLoading, setMatchContentLoading] = useState(false);
  const [preMessageList, setPreMessageList] = useState<Message[]>([]);
  const [connectStatus, setConnectStatus] = useState(false);
  const portRef = useRef<chrome.runtime.Port | undefined>(undefined);
  const conversationRef = useRef<ConversationExpose>(null);
  const getMainPageText = useCallback(async () => {
    return new Promise((resolve, _reject) => {
      portRef.current?.onMessage.addListener(function (message) {
        if (message.type === "pageText") {
          resolve(message.payload.content);
        }
      });
      portRef.current?.postMessage({ type: "getPageText" });
    });
  }, []);
  const sendConnectToContentScript = useCallback(() => {
    chrome.tabs.query({ active: true }).then(([tab]) => {
      const tabId = tab.id;
      if (typeof tabId !== "undefined") {
        portRef.current = chrome.tabs.connect(tabId, {
          name: "readingAssistantSidePanelInit",
        });
        portRef.current.onMessage.addListener(async function (message: {
          payload: { selectionText?: string; promptId?: string };
        }) {
          setConnectStatus(true);
          const payload = message.payload;
          if (!payload.promptId) {
            return;
          }
          const prompt = await getPrompt(payload.promptId);
          if (prompt) {
            const content = prompt.replace(
              /\{selectionText\}/g,
              () => payload.selectionText ?? ""
            );
            conversationRef.current?.sendMessage(content);
          }
          //
        });
        portRef.current.onDisconnect.addListener(function () {
          setConnectStatus(false);
          portRef.current = undefined;
          window.close();
        });
      }
    });
  }, []);
  const getMatchContext = async (query: string | undefined) => {
    if (!setting.openAIKey) {
      toastManager.add({ type: "error", msg: "openAIKey is empty" });
      return;
    }
    if (!query) {
      toastManager.add({ type: "error", msg: "question is empty" });
      return;
    }
    const mainPageInnerText = (await getMainPageText()) as string;
    const context = await getMatchContent({
      openAIApiKey: setting.openAIKey,
      context: mainPageInnerText,
      query,
    });
    return context;
  };
  const insertContext = () => {
    getMainPageText().then((res) => {
      setPreMessageList([
        {
          role: "assistant",
          content: `context: ${res}`,
        },
      ]);
    });
  };
  const createMetchMessage = async () => {
    const query = conversationRef.current?.getInput();
    if (!query) {
      return;
    }
    setMatchContentLoading(true);
    const context = await getMatchContext(query);
    setMatchContentLoading(false);
    setPreMessageList([
      {
        role: "assistant",
        content: `context: ${context}`,
      },
    ]);
    setTimeout(() => {
      conversationRef.current?.sendMessage(query);
    }, 300);
  };
  useEffect(() => {
    sendConnectToContentScript();
    return () => {
      if (portRef.current) {
        portRef.current.disconnect();
        portRef.current = undefined;
        setConnectStatus(false);
      }
    };
  }, [sendConnectToContentScript]);

  return (
    <>
      <div className="flex flex-col justify-between pt-3 h-[100vh]">
        <div
          onClick={() => {
            chrome.runtime.openOptionsPage();
          }}
          className="fixed z-10 right-3 top-3 btn btn-circle btn-xs"
        >
          <Settings className="w-[14px] h-[14px]" />
        </div>
        <div className="">
          <h1 className="hidden font-bold mt-2">
            status:{connectStatus ? "connected" : "lose"}
          </h1>
        </div>
        <div className="grow">
          <Conversation
            toolSlot={
              <div className="px-2 mb-1 flex items-center gap-2">
                <div
                  onClick={() => {
                    setPreMessageList([]);
                    conversationRef.current?.clearMessage();
                  }}
                  data-tip="clear"
                  className=" btn btn-xs btn-square tooltip flex items-center justify-center"
                >
                  <Eraser className="w-[16px] h-[16px]" />
                </div>
                <div
                  onClick={insertContext}
                  data-tip="insert whole context"
                  className=" btn btn-xs btn-square tooltip flex items-center justify-center"
                >
                  <FileTerminal className="w-[16px] h-[16px]" />
                </div>
                <div
                  onClick={createMetchMessage}
                  data-tip="get matched context"
                  className={`${
                    matchContentLoading ? "disabled" : ""
                  } btn btn-xs btn-square tooltip flex items-center justify-center`}
                >
                  {matchContentLoading ? (
                    <span className="w-[16px] h-[16px] loading loading-spinner"></span>
                  ) : (
                    <TextSearch className="w-[16px] h-[16px]" />
                  )}
                </div>
              </div>
            }
            ref={conversationRef}
            preMessageList={preMessageList}
            engine="openai"
          />
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

createRoot(document.querySelector("#root")!).render(<App />);
