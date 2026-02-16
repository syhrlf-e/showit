import { useState } from "react";
import { toast } from "sonner";

export function useEnhancePrompt() {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const enhancePrompt = async (prompt: string): Promise<string | null> => {
    if (!prompt.trim()) return null;

    setIsEnhancing(true);
    try {
      const response = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to enhance prompt");
      }

      return data.enhancedPrompt;
    } catch (error) {
      console.error("Enhance Error:", error);
      toast.error("Failed to enhance prompt");
      return null;
    } finally {
      setIsEnhancing(false);
    }
  };

  return { enhancePrompt, isEnhancing };
}
