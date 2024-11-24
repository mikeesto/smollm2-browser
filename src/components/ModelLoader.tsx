import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useWorker } from "../context/workerContext";

interface ProgressItem {
  file: string;
  progress: number;
}

export const ModelLoader = () => {
  const { status, sendMessage, progressItems, loadingMessage } = useWorker();
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <p className="font-bold text-sm">
            Please click the button to load a large language model that runs on
            your device. This only works on recent versions of Chrome!
          </p>

          <Button
            onClick={() => sendMessage({ type: "load" })}
            disabled={status === "ready"}
            className="w-full"
          >
            {status === "ready" ? "Model Loaded" : "Load model"}
          </Button>

          {status === "loading" && (
            <div className="space-y-2">
              {loadingMessage && (
                <p className="text-sm text-muted-foreground">
                  {loadingMessage}
                </p>
              )}

              {progressItems.map((item, index) => (
                <div key={index} className="space-y-1">
                  <p className="text-xs text-muted-foreground">{item.file}</p>
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
