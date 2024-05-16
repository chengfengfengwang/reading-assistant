import { createRoot } from "react-dom/client";
import "@/assets/tailwind.css";
import { useCallback, useEffect, useRef, useState } from "react";
export default function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [connectStatus,setConnectStatus] = useState(false)
  const portRef = useRef<chrome.runtime.Port | undefined>(undefined);
  const sendConnectToContentScript = useCallback(()=> {
    chrome.tabs.query({active:true}).then(([tab]) => {
      const tabId = tab.id;
      if (typeof tabId !== 'undefined') {
        portRef.current = chrome.tabs.connect(tabId,{name: 'readingAssistantSidePanelInit'});
        portRef.current.onMessage.addListener(function(message) {
          setConnectStatus(true);
          setMessages(prev => [...prev, JSON.stringify(message)])
        })
        portRef.current.onDisconnect.addListener(function() {
          setConnectStatus(false)
          setMessages([]);
          portRef.current = undefined
        })
      }
    });
  }, [])
  useEffect(()=>{
    sendConnectToContentScript()
    return () => {
      if (portRef.current) {
        portRef.current.disconnect();
        portRef.current = undefined;
        setConnectStatus(false)
      }
    }
  }, [sendConnectToContentScript])
  return <div>
    <h1 className="text-center">hello world123</h1>
    <input type="text" className="input input-bordered" />
    {
      messages.map(item => <p key={item}>{item}</p>)
    }
    <h1 className="font-bold mt-2">status:{connectStatus ? 'connected' : 'lose'}</h1>
  </div> 
}

createRoot(document.querySelector("#root")!).render(
  <App />
);
