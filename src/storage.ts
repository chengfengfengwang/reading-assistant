import type { Setting } from "./types"
export const getSyncStorage = async ():Promise<Setting> => {
  return await chrome.storage.sync.get()
}