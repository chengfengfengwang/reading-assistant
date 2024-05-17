import { useState, useCallback } from "react";
import { toastManager } from "@/components/toast";
import { RotateCcw } from "lucide-react";
import { useSetting } from "@/hooks/useSetting";

const defaultSetting = {
  openAIAddress: "https://api.openai.com/v1/chat/completions",
};
export default function OpenAIConfig() {
  const {setting, setSetting} = useSetting();
  const [getOpenAIModelLoading, setOpenAIModelLoading] = useState(false);
  const getOpenAIModelList = useCallback(() => {
    if (!setting?.openAIKey) {
      return;
    }
    if (getOpenAIModelLoading) {
      return;
    }
    const controller = new AbortController();
    const address = setting?.openAIAddress ?? defaultSetting.openAIAddress;
    const url = address.replace("/v1/chat/completions", "/v1/models");
    setOpenAIModelLoading(true);
    fetch(`${url}`, {
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${setting.openAIKey}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.error) {
          toastManager.add({ type: "error", msg: res.error.message });
          throw new Error(res.error);
        }
        const list = res.data
          .sort((a: any, b: any) => a.created - b.created)
          .reverse()
          .map((item: any) => ({ label: item.id, value: item.id }));
        setSetting({  openAIModelList: list  });
      })
      .catch((err) => {
        console.log(err);
        toastManager.add({type: 'error', msg: err.message})
      })
      .finally(() => {
        setOpenAIModelLoading(false);
      });
    return controller;
  }, [setting?.openAIAddress, setting?.openAIKey, getOpenAIModelLoading,setSetting]);
  return (
      <div className="relative">
        <div className="font-semibold text-[17px] mb-3">OpenAI</div>
        <div className="border rounded-xl p-4">
          <label>
            <div className="text-[15px] my-2">apiKey</div>
            <input
              onChange={(e) => {
                setSetting({ openAIKey: e.target.value });
              }}
              value={setting?.openAIKey ?? ""}
              type="text"
              placeholder=""
              className="input input-bordered w-full"
            />
          </label>
          <label>
            <div className="text-[15px] my-2">apiAddress</div>
            <input
              onChange={(e) => {
                setSetting({
                  openAIAddress: e.target.value,
                });
              }}
              value={setting?.openAIAddress ?? defaultSetting.openAIAddress}
              type="text"
              placeholder=""
              className="input input-bordered w-full"
            />
          </label>
          <label>
            <div className="text-[15px] my-2">
              Available models for the current key
            </div>
            <div
              className={`flex transition-opacity ${
                getOpenAIModelLoading ? "opacity-50" : "opacity-100"
              }`}
            >
              <select
                value={setting.openAIModel}
                onChange={(e) => {
                  setSetting({
                    openAIModel: e.target.value,
                  });
                }}
                className="select select-bordered w-full flex-auto"
              >
                {setting.openAIModelList?.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <button
                onClick={getOpenAIModelList}
                className="btn btn-square ml-2"
              >
                {getOpenAIModelLoading ? (
                  <span className="w-5 loading loading-spinner"></span>
                ) : (
                  <RotateCcw className="w-5" />
                )}
              </button>
            </div>
          </label>
        </div>
      </div>
  );
}