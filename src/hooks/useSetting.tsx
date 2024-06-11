import type { Setting } from "@/types";
import { atom, useAtom } from "jotai";
import { useCallback, useEffect } from "react";
const settingAtom = atom<Setting>({});


export function useSetting() {
  const [setting, _setSetting] = useAtom(settingAtom);
  const setSetting = useCallback((props:Partial<Setting>)=> {
    _setSetting((prev) => ({...prev, ...props}));    
    chrome.storage.sync.set(props)
  }, [])
  
  useEffect(()=> {
    const initSetting = ()=> {
      chrome.storage.sync.get().then(res => {        
        _setSetting(res)
      })
    };
    initSetting()
  }, [])
  return {
    setting,
    setSetting
  }
}
