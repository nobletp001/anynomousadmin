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
        if (d.title) state.setTitle(d.title);
        if (d.description) state.setDescription(d.description);
        if (d.caption) state.setCaption(d.caption);
        if (d.link) state.setLink(d.link);
        if (d.instructions && d.instructions.length) state.setInstructions(d.instructions);
        if (d.taskType) state.setTaskType(d.taskType);
        if (d.targetPlatform) state.setTargetPlatform(d.targetPlatform);
        if (d.proofType) state.setProofType(d.proofType);
        if (d.acceptText !== undefined) {
          state.setAcceptText(d.acceptText);
          state.setTextLabel(d.acceptText && d.textLabel ? d.textLabel : "");
        }
        if (d.acceptNumber !== undefined) {
          state.setAcceptNumber(d.acceptNumber);
          state.setNumberLabel(d.acceptNumber && d.numberLabel ? d.numberLabel : "");
        }
        if (d.acceptMultipleImages !== undefined) state.setAcceptMultipleImages(d.acceptMultipleImages);
        if (d.amount !== undefined) state.setAmount(String(d.amount));
        if (d.numberOfUsersNeeded !== undefined) state.setNumberOfUsersNeeded(String(d.numberOfUsersNeeded));
        if (d.maxPerHour !== undefined) state.setMaxPerHour(d.maxPerHour ? String(d.maxPerHour) : "");
        if (d.noExpiry !== undefined) state.setNoExpiry(d.noExpiry);
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
