const injectedFunction = () => {
  
  if (!window.readingAssistantExtensionPort){    
    const handleConnect = (port: chrome.runtime.Port) => {
      // sidePanel发起初始化连接，将port保存起来，并且回复当前prompId和selectionText
      if (port.name === "readingAssistantSidePanelInit") {
        window.readingAssistantExtensionPort = port;
        port.onDisconnect.addListener(function () {
          window.readingAssistantExtensionPort = undefined;
          chrome.runtime.onConnect.removeListener(handleConnect);
        });
        port.onMessage.addListener(function (message) {
          if (message.type === "getPageText") {
            port.postMessage({
              type: "pageText",
              payload: { content: document.body.innerText },
            });
          }
        });
      }
    };
    chrome.runtime.onConnect.addListener(handleConnect);
    document.addEventListener('selectionchange', function(){
      window.readingAssistantExtensionPort?.postMessage({
        type: 'selectionchange',
        payload: { content: document.getSelection()?.toString() },
      })
    })
  }
};

const openSidePanel = (tabId: number) => {
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
  if (tab.url?.startsWith('chrome://')) {
    chrome.runtime.openOptionsPage()
  } else {
    const tabId = tab.id;
    if (typeof tabId === "number") {
      openSidePanel(tabId);
      chrome.scripting.executeScript({
        target: { tabId },
        func: injectedFunction,
      });
    }
  }
});

