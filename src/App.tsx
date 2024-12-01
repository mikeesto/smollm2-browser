import { useState } from "react";
import { ModelLoader } from "@/components/ModelLoader";
import { useWorker } from "./context/workerContext";
import { Chat } from "@/components/Chat";

export default function App() {
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);
  const { status } = useWorker();

  return <>{status === "ready" ? <Chat /> : <ModelLoader />}</>;
}
