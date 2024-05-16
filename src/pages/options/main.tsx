import { createRoot } from "react-dom/client";
import "@/assets/tailwind.css";
import ExternalLinks from "./prompts";
export default function App() {
  return <div className="p-2">
    <ExternalLinks />
  </div>
}
createRoot(document.querySelector("#root")!).render(
  <App>
  </App>
);
