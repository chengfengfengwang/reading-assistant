import { createRoot } from "react-dom/client";
import "@/assets/tailwind.css";
import Prompts from "./prompts";
import OpenAIConfig from "./openAIConfig";
import { ToastContainer } from "@/components/toast";

export default function App() {
  return (
    <div className="p-2">
      <div className="mx-auto max-w-screen-md">
        <Prompts />
        <OpenAIConfig />
      </div>

      <ToastContainer />
    </div>
  );
}
createRoot(document.querySelector("#root")!).render(<App />);
