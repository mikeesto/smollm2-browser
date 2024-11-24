import { createContext, useContext, useRef, useState, useEffect } from "react";

const WorkerContext = createContext(null);

export function useWorker() {
  const context = useContext(WorkerContext);
  if (!context) {
    throw new Error("useWorker must be used within a WorkerProvider");
  }
  return context;
}

export function WorkerProvider({ children }) {
  const worker = useRef(null);
  const [status, setStatus] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [progressItems, setProgressItems] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

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

  const generate = async (prompt: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      let modelResponse = "";

      const handleMessages = (e: MessageEvent) => {
        switch (e.data.status) {
          case "update":
            modelResponse += e.data.output;
            break;

          case "complete":
            worker.current.removeEventListener("message", handleMessages);
            setIsRunning(false);
            resolve(modelResponse);
            break;

          case "error":
            worker.current.removeEventListener("message", handleMessages);
            setIsRunning(false);
            reject(e.data.data);
            break;
        }
      };

      worker.current.addEventListener("message", handleMessages);
      setIsRunning(true);
      worker.current.postMessage({
        type: "generate",
        data: [{ role: "user", content: prompt }],
      });
    });
  };

  const sendMessage = (message) => {
    worker.current?.postMessage(message);
  };

  const value = {
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
