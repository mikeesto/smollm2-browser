import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useWorker } from "../context/workerContext";
import { Brain, Loader2, CheckCircle2 } from "lucide-react";

export const ModelLoader = () => {
  const { status, sendMessage, progressItems, loadingMessage } = useWorker();

  return (
    <Card className="w-full max-w-xl mx-auto shadow-lg mt-5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          SmolLM2
        </CardTitle>
        <CardDescription className="space-y-2">
          <p>
            Chat with a fully client-side AI model that runs directly in your
            browser. Your conversations stay private and processing happens
            entirely on your device.
          </p>
          <p className="text-xs">
            Powered by SmolLM2-1.7B-Instruct model • Requires Chrome with WebGPU
            •{" "}
            <a
              href="https://github.com/mikeesto/smollm2-browser"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Open Source
            </a>
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Button
            onClick={() => sendMessage({ type: "load" })}
            disabled={status === "ready"}
            className="w-full font-medium"
          >
            {status === "loading" && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {status === "ready" && (
              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
            )}
            {status === "ready" ? "Model Ready" : "Load Model"}
          </Button>

          {status === "loading" && (
            <div className="space-y-4">
              {loadingMessage && (
                <p className="text-sm text-muted-foreground animate-pulse">
                  {loadingMessage}
                </p>
              )}

              {progressItems.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-medium">
                      {item.file}
                    </span>
                    <span className="text-muted-foreground">
                      {Math.round(item.progress)}%
                    </span>
                  </div>
                  <Progress value={item.progress} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
