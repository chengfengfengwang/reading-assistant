import type { Setting } from "@/types";
import { atom, useAtom } from "jotai";
import { useCallback, useEffect } from "react";
const settingAtom = atom<Setting>({});


export function useSetting() {
  const [setting, _setSetting] = useAtom(settingAtom);
  const setSetting = useCallback((props:Partial<Setting>)=> {
    _setSetting((prev) => ({...prev, ...props}));
    console.log('props:', props);
    
    chrome.storage.sync.set(props)
  }, [])
  
  useEffect(()=> {
    const initSetting = ()=> {
      chrome.storage.sync.get().then(res => {
        console.log('get:', res);
        
        _setSetting(res)
      })
    };
    initSetting()
  }, [])
  // useEffect(() => {
  //   const handleSync = (
  //     changes: { [key: string]: chrome.storage.StorageChange },
  //     area: string
  //   ) => {
  //     if (area === "sync") {
  //       setSetting(changes["setting"].newValue);
  //     }
  //   };
  //   chrome.storage.onChanged.addListener(handleSync);
  //   return () => {
  //     chrome.storage.onChanged.removeListener(handleSync);
  //   };
  // }, []);
  return {
    setting,
    setSetting
  }
}
