import { useRef } from "react";
import { apiClient } from "@/services/api-client";
import { CreateTaskState } from "./useCreateTaskState";

export function useAIAssistant(state: CreateTaskState) {
  const recognitionRef = useRef<any>(null);

  const toggleListening = () => {
    if (state.isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      state.setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      state.setAiError("Speech recognition is not supported in this browser. Please use Chrome or Safari.");
      return;
    }

    try {
      state.setAiError("");
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";
      rec.onstart = () => state.setIsListening(true);
      rec.onend = () => state.setIsListening(false);
      rec.onerror = (e: any) => {
        console.error(e);
        state.setAiError(`Voice input error: ${e.error}`);
        state.setIsListening(false);
      };
      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        state.setAiPrompt((prev) => (prev ? `${prev} ${text}` : text));
      };
      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error(err);
      state.setAiError("Failed to start voice input.");
      state.setIsListening(false);
    }
  };

  const handleAiParse = async () => {
    if (!state.aiPrompt.trim()) return;
    state.setIsParsing(true);
    state.setAiError("");
    try {
      const res = (await apiClient.post("/admin/tasks/parse-ai", { text: state.aiPrompt.trim() })) as any;
      if (res.success && res.data) {
        const d = res.data;
        if (d.title) state.setTitle(String(d.title));
        if (d.description) state.setDescription(String(d.description));
        if (d.caption) {
          state.setCaption(Array.isArray(d.caption) ? d.caption.join("\n\n") : String(d.caption));
        }
        if (d.link) state.setLink(String(d.link));
        if (d.instructions) {
          if (Array.isArray(d.instructions)) {
            const parsed = d.instructions.map((i: any) => (i ? String(i).trim() : "")).filter(Boolean);
            if (parsed.length > 0) state.setInstructions(parsed);
          } else if (typeof d.instructions === "string") {
            const parsed = d.instructions
              .split(/\n+/)
              .map((s: string) => s.replace(/^\d+\.\s*/, "").trim())
              .filter(Boolean);
            if (parsed.length > 0) {
              state.setInstructions(parsed);
            }
          }
        }
        if (d.taskType) state.setTaskType(String(d.taskType));
        if (d.targetPlatform) state.setTargetPlatform(String(d.targetPlatform));
        if (d.proofType) state.setProofType(d.proofType === "url" || d.proofType === "banner" ? d.proofType : "banner");
        if (d.acceptText !== undefined) {
          const accepted = Boolean(d.acceptText);
          state.setAcceptText(accepted);
          state.setTextLabel(accepted && d.textLabel ? String(d.textLabel) : "");
        }
        if (d.acceptNumber !== undefined) {
          const accepted = Boolean(d.acceptNumber);
          state.setAcceptNumber(accepted);
          state.setNumberLabel(accepted && d.numberLabel ? String(d.numberLabel) : "");
        }
        if (d.acceptMultipleImages !== undefined) state.setAcceptMultipleImages(Boolean(d.acceptMultipleImages));
        if (d.amount !== undefined) state.setAmount(String(d.amount));
        if (d.numberOfUsersNeeded !== undefined) state.setNumberOfUsersNeeded(String(d.numberOfUsersNeeded));
        if (d.noExpiry !== undefined) state.setNoExpiry(Boolean(d.noExpiry));
        state.setAiPrompt("");
      } else {
        state.setAiError(res.error ?? "Failed to parse task input.");
      }
    } catch (err: any) {
      console.error(err);
      state.setAiError(err?.response?.data?.error ?? "Error communicating with AI service. Please try again.");
    } finally {
      state.setIsParsing(false);
    }
  };

  return {
    toggleListening,
    handleAiParse,
  };
}
