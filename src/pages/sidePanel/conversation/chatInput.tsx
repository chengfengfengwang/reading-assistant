import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  ReactElement,
} from "react";
import { Send, SendHorizonal, TextSearch } from "lucide-react";
interface ChatInputProps {
  onSubmit: (msg: string) => void;
  placeholder?: string;
  sendSlot?: ReactElement;
}
interface ChatInputExpose {
  getInput: () => string;
  setInput: (v: string) => void;
}
export default forwardRef<ChatInputExpose, ChatInputProps>(function ChatInput(
  params,
  ref
) {
  const [value, setValue] = useState("");
  const { onSubmit, placeholder } = params;
  useImperativeHandle(ref, () => {
    return {
      getInput: () => value,
      setInput: (v: string) => setValue(v),
    };
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const handleSubmit = () => {
    if (value.trim() === "") return;
    onSubmit(value.trim());
    setValue("");
  };
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    event.stopPropagation();
    const value = event.target.value;
    setValue(value);
  };

  useEffect(() => {
    if (textareaRef.current) {
      if (value) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${
          textareaRef.current.scrollHeight || 50
        }px`;
        if (textareaRef.current.scrollHeight > 150) {
          textareaRef.current.style.overflowY = "scroll";
        }
      } else {
        textareaRef.current.style.height = `50px`;
      }
    }
  }, [value]);
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    event.stopPropagation();
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
      setValue("");
    }
  };

  return (
    <div className="relative px-2 pb-2">
      <div className={`relative transition bg-base-300  rounded-md`}>
        <div className={`flex p-[4px] justify-between items-end`}>
          <textarea
            ref={textareaRef}
            rows={3}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onKeyUp={(e) => e.stopPropagation()}
            onKeyPress={(e) => e.stopPropagation()}
            placeholder={placeholder ? placeholder : ""}
            className="bg-inherit flex-grow placeholder:text-base-content/50 w-full shadow-none overflow-hidden  max-h-[150px] text-[14px] p-0 m-0 outline-none border-0 focus:ring-0 appearance-none resize-none -translate-y-[3px]"
            autoFocus
          ></textarea>
          <div className="flex flex-col gap-1">
            {value ? (
              params.sendSlot
            ) : (
              <button
                disabled
                className={`w-[24px] h-[24px] flex justify-center items-center cursor-pointer transition ${
                  value && "bg-neutral hover:bg-neutral-600"
                } rounded-md p-1 text-white disabled:text-gray-400`}
              >
                <TextSearch className="w-4/5 h-4/5" />
              </button>
            )}

            <button
              onClick={handleSubmit}
              disabled={Boolean(!value)}
              className={`w-[24px] h-[24px] flex justify-center items-center cursor-pointer transition ${
                value && "bg-neutral hover:bg-neutral-600"
              } rounded-md p-1 text-white disabled:text-gray-400`}
            >
              <SendHorizonal className="w-4/5 h-4/5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
