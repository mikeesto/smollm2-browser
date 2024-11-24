import { useState } from "react";
import { ModelLoader } from "@/components/ModelLoader";
import { useWorker } from "./context/workerContext";

export default function App() {
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);
  const { status } = useWorker();

  return <ModelLoader />;
}
