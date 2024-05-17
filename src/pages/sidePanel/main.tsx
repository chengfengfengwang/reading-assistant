import { createRoot } from "react-dom/client";
import "@/assets/tailwind.css";
import { useCallback, useEffect, useRef, useState } from "react";
import Conversation from "./conversation/main";
import { Message } from "./conversation/types";

const preMessageList:Message[] = [
  {
    role: 'assistant',
    content: 'you are a helpful assistant'
  },
  {
    role: 'user',
    content: '写一个50字左右的小说'
  }
]
export default function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [connectStatus, setConnectStatus] = useState(false);
  const portRef = useRef<chrome.runtime.Port | undefined>(undefined);
  const sendConnectToContentScript = useCallback(() => {
    chrome.tabs.query({ active: true }).then(([tab]) => {
      const tabId = tab.id;
      if (typeof tabId !== "undefined") {
        portRef.current = chrome.tabs.connect(tabId, {
          name: "readingAssistantSidePanelInit",
        });
        portRef.current.onMessage.addListener(function (message) {
          setConnectStatus(true);
          setMessages((prev) => [...prev, JSON.stringify(message)]);
        });
        portRef.current.onDisconnect.addListener(function () {
          setConnectStatus(false);
          setMessages([]);
          portRef.current = undefined;
          window.close();
        });
      }
    });
  }, []);
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
  // useEffect(()=>{
  //   let timer:number|null = null
  //   if (!connectStatus) {
  //     timer = window.setTimeout(() => {
  //       sendConnectToContentScript()
  //     }, 2000);
  //   }
  //   return()=>{
  //     timer && clearTimeout(timer)
  //   }
  // }, [connectStatus])
  return (
    <div className="flex flex-col justify-between h-[100vh]">
      <div className="">
        <input type="text" className="input input-bordered" />
        <h1 className="font-bold mt-2">
          status:{connectStatus ? "connected" : "lose"}
        </h1>
        {messages.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
      <div className="grow">
        <Conversation preMessageList={preMessageList} engine="openai" />
      </div>
    </div>
  );
}

createRoot(document.querySelector("#root")!).render(<App />);
