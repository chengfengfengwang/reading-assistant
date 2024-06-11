import { defaultSetting } from "@/const";
import { Prompt } from "@/types";
import type { Setting } from "@/types";
// const getPrompt = ({
//   selectionText,
//   promptId,
// }: {
//   selectionText: string;
//   promptId: string | number;
// }) => {
//   return chrome.storage.sync.get().then((res: Setting) => {
//     const prompts = res.prompts;
//     const prompt = prompts?.find(
//       (item) => String(item.id) === String(promptId)
//     );
//     return {
//       ...prompt,
//       ...{
//         content: prompt?.content.replace(
//           /\{selectionText\}/g,
//           () => selectionText
//         ),
//       },
//     };
//   });
// };
const injectedFunction = ({
  selectionText,
  promptId,
}: {
  selectionText?: string;
  promptId?: string | number;
}) => {
  // 已经建立过连接，直接发送消息
  if (window.readingAssistantExtensionPort) {
    window.readingAssistantExtensionPort.postMessage({
      type: "chat",
      payload: { selectionText, promptId },
    });
  } else {
    const handleConnect = (port:chrome.runtime.Port) => {
      // sidePanel发起初始化连接，将port保存起来，并且回复当前prompId和selectionText
      if (port.name === "readingAssistantSidePanelInit") {
        console.log("--init--");
        window.readingAssistantExtensionPort = port;
        port.onDisconnect.addListener(function () {
          console.log("--disconnect--");
          window.readingAssistantExtensionPort = undefined;
          chrome.runtime.onConnect.removeListener(handleConnect)
        });
        port.postMessage({ type: "chat", payload: { selectionText, promptId }});
        port.onMessage.addListener(function(message) {
          console.log('--message--',message);
          
          if (message.type === 'getPageText') {
            port.postMessage({type: 'pageText', payload:{content:document.body.innerText}})
          }
        })
      }
    }
    chrome.runtime.onConnect.addListener(handleConnect);
  }
};
const initContextMenu = () => {
  chrome.contextMenus.removeAll(async () => {
    const res: Setting = await chrome.storage.sync.get();
    const prompts: Prompt[] = res.prompts ?? defaultSetting.prompts;
    for (const item of prompts) {
      chrome.contextMenus.create({
        id: item.id,
        title: item.title,
        contexts: ["selection"],
        documentUrlPatterns: [
          "http://*/*",
          "https://*/*",
          "file://*/*",
          "ftp://*/*",
        ],
      });
    }
  });
};
const openSidePanel = (
  tabId: number,
  initPromptId?: string | number,
  selectionText?: string
) => {
  // let path = `src/pages/sidePanel/index.html?tabId=${tabId}`;
  // if (typeof initPromptId !== "undefined") {
  //   path += `&initPromptId=${initPromptId}`;
  // }
  // if (typeof selectionText !== "undefined") {
  //   path += `&selectionText=${selectionText}`;
  // }

  let path = `src/pages/sidePanel/index.html`;
  chrome.sidePanel.setOptions({
    tabId: tabId,
    path: path,
    enabled: true,
  });
  chrome.sidePanel.open({ tabId });
};
chrome.runtime.onMessage.addListener((message, sender) => {
  // The callback for runtime.onMessage must return falsy if we're not sending a response
  (async () => {
    if (message.type === "open_side_panel") {
      // This will open a tab-specific side panel only on the current tab.
      if (typeof sender.tab?.id === "number") {
        chrome.sidePanel.setOptions({
          tabId: sender.tab.id,
          path: "src/pages/sidePanel/index.html",
          enabled: true,
        });
        chrome.sidePanel.open({ tabId: sender.tab.id });
      }
    }
  })();
});
chrome.action.onClicked.addListener(function (tab) {
  const tabId = tab.id;
  if (typeof tabId === "number") {
    openSidePanel(tabId);
    chrome.scripting.executeScript({
      target: { tabId },
      func: injectedFunction,
      args: [
        { selectionText: undefined, promptId: undefined },
      ],
    });
  }
});
chrome.runtime.onInstalled.addListener(() => {
  initContextMenu();
  chrome.storage.sync.onChanged.addListener(function (changges) {
    if ("prompts" in changges) {
      initContextMenu();
    }
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    const tabId = tab?.id;
    if (typeof tabId === "number") {      
      openSidePanel(tabId, info.menuItemId, info.selectionText);
      // inject content_script
      chrome.scripting.executeScript({
        target: { tabId },
        func: injectedFunction,
        args: [
          { selectionText: info.selectionText, promptId: info.menuItemId },
        ],
      });
    }
  });
});
