import { useEffect, useState } from "react";
interface ToastConfig {
  type: "success" | "error" | "info";
  msg: string;
  id?: string;
}
type AddToast = (config: ToastConfig) => void;
type RemoveToast = (id: string) => void;
interface ToastManager {
  init: ({ add, remove }: { add: AddToast; remove: RemoveToast }) => void;
  add: AddToast;
  remove: RemoveToast | undefined;
}
const retain = 5000;
function Toaster({ msg, type }: { msg: string; type: ToastConfig["type"] }) {
  let alertType = '';
  switch (type) {
    case 'success':
      alertType = 'alert-success'
      break;
    case 'error':
      alertType = 'alert-error'
      break;
    default:
      break;
  } 
  return (
    <div role="alert" className={`alert gap-[10px] ${alertType}`}>
      <span>{msg}</span>
    </div>
  );
}
export const toastManager: ToastManager = {
  init(param) {
    toastManager.add = param.add;
    toastManager.remove = param.remove;
  },
  // @ts-ignore
  add: (config) => {
    throw new Error("not init");
  },
  // @ts-ignore
  remove: (id) => {
    throw new Error("not init");
  },
};
export const ToastContainer = function () {
  const [toastList, setToastList] = useState<ToastConfig[]>([]);
  const addToast = (config: ToastConfig) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToastList((prev) => [...prev, { ...config, id }]);
    setTimeout(() => {
      removeToast(id);
    }, retain);
  };
  const removeToast = (id: string) => {
    setToastList((list) => list.filter((item) => item.id !== id));
  };
  useEffect(() => {
    toastManager.init({
      add: addToast,
      remove: removeToast,
    });
  }, [addToast, removeToast]);
  return (
    <div
      className={`text-[16px] toast toast-center toast-top z-[2147483647] ${
        toastList.length ? "" : "hidden"
      }`}
    >
      {toastList.map((item) => (
        <Toaster key={item.id} type={item.type} msg={item.msg} />
      ))}
    </div>
  );
};
