import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { WorkerProvider } from "./context/workerContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WorkerProvider>
      <App />
    </WorkerProvider>
  </StrictMode>
);
