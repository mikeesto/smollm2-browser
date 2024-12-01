import { createContext, useContext, useRef, useState, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ProgressItem {
  file: string;
  progress: number;
}

interface WorkerMessage {
  type: "load" | "check" | "generate";
  data?: any;
}

interface WorkerContextValue {
  status: "loading" | "ready" | null;
  loadingMessage: string;
  progressItems: ProgressItem[];
  isRunning: boolean;
  generate: (messages: Message[]) => Promise<string>;
  sendMessage: (message: WorkerMessage) => void;
}

const WorkerContext = createContext<WorkerContextValue | null>(null);

export function useWorker() {
  const context = useContext(WorkerContext);
  if (!context) {
    throw new Error("useWorker must be used within a WorkerProvider");
  }
  return context;
}

export function WorkerProvider({ children }) {
  const worker = useRef<Worker | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(new URL("../worker.js", import.meta.url), {
        type: "module",
      });
      worker.current.postMessage({ type: "check" });
    }

    const onMessageReceived = (e) => {
      switch (e.data.status) {
        case "loading":
          setStatus("loading");
          setLoadingMessage(e.data.data);
          break;
        case "initiate":
          setProgressItems((prev) => [...prev, e.data]);
          break;
        case "progress":
          setProgressItems((prev) =>
            prev.map((item) => {
              if (item.file === e.data.file) {
                return { ...item, ...e.data };
              }
              return item;
            })
          );
          break;
        case "done":
          setProgressItems((prev) =>
            prev.filter((item) => item.file !== e.data.file)
          );
          break;
        case "ready":
          setStatus("ready");
          break;
      }
    };

    worker.current.addEventListener("message", onMessageReceived);
    return () =>
      worker.current?.removeEventListener("message", onMessageReceived);
  }, []);

  const generate = async (messages: Message[]): Promise<string> => {
    if (!worker.current) {
      throw new Error("Worker not initialized");
    }

    return new Promise((resolve, reject) => {
      let modelResponse = "";

      const handleMessages = (e: MessageEvent) => {
        switch (e.data.status) {
          case "update":
            modelResponse += e.data.output;
            break;

          case "complete":
            worker.current?.removeEventListener("message", handleMessages);
            setIsRunning(false);
            resolve(modelResponse);
            break;

          case "error":
            worker.current?.removeEventListener("message", handleMessages);
            setIsRunning(false);
            reject(e.data.data);
            break;
        }
      };

      worker.current?.addEventListener("message", handleMessages);
      setIsRunning(true);
      worker.current?.postMessage({
        type: "generate",
        data: messages,
      });
    });
  };

  const sendMessage = (message: WorkerMessage) => {
    if (!worker.current) {
      throw new Error("Worker not initialized");
    }

    worker.current.postMessage(message);
  };

  const value: WorkerContextValue = {
    status,
    loadingMessage,
    progressItems,
    isRunning,
    generate,
    sendMessage,
  };

  return (
    <WorkerContext.Provider value={value}>{children}</WorkerContext.Provider>
  );
}
