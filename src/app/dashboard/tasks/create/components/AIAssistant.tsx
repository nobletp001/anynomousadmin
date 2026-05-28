import React from "react";
import { Sparkles, Mic, Loader2 } from "lucide-react";
import { CreateTaskState } from "../hooks/useCreateTaskState";
import { useAIAssistant } from "../hooks/useAIAssistant";
import { AI_PROMPT_EXAMPLES } from "../constants/ai-prompts";

interface AIAssistantProps {
  state: CreateTaskState;
}

export function AIAssistant({ state }: AIAssistantProps) {
  const { toggleListening, handleAiParse } = useAIAssistant(state);

  const filteredPrompts = AI_PROMPT_EXAMPLES.filter((p) => {
    const matchesSearch =
      p.label.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      p.text.toLowerCase().includes(state.searchQuery.toLowerCase());
    const matchesCategory = state.selectedCategory === "all" || p.category === state.selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="backdrop-blur-md bg-purple-950/10 border border-purple-500/20 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
          <h2 className="text-sm font-bold text-purple-300">AI Task Assistant</h2>
        </div>
        <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2.5 py-0.5 rounded-full">
          DeepSeek Powered
        </span>
      </div>

      <p className="text-xs text-zinc-400">
        Type or speak a task description to automatically pre-fill the form fields below.
      </p>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => state.setShowPromptRepo(!state.showPromptRepo)}
          className="w-full flex items-center justify-between p-3 rounded-xl border border-purple-500/20 bg-purple-950/10 hover:bg-purple-950/20 text-xs font-bold text-purple-300 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Prompt Templates Repository ({AI_PROMPT_EXAMPLES.length} Ready Prompts)
          </span>
          <span>{state.showPromptRepo ? "Collapse ▲" : "Expand ▼"}</span>
        </button>

        {state.showPromptRepo && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-955 p-4 space-y-4 max-h-[280px] overflow-y-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={state.searchQuery}
                onChange={(e) => state.setSearchQuery(e.target.value)}
                placeholder="Search templates (e.g. follow, views)..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-purple-500/50"
              />
              <select
                value={state.selectedCategory}
                onChange={(e) => state.setSelectedCategory(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/50"
              >
                <option value="all">All Categories</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="tiktok">TikTok</option>
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
                <option value="facebook">Facebook</option>
                <option value="twitter">X (Twitter)</option>
                <option value="app_download">App Downloads</option>
                <option value="reviews">Reviews &amp; Ratings</option>
                <option value="telegram">Telegram</option>
              </select>
            </div>

            <div className="space-y-2">
              {filteredPrompts.length === 0 ? (
                <p className="text-center text-xs text-zinc-600 py-6">No matching prompts found.</p>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {filteredPrompts.map((ex, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        state.setAiPrompt(ex.text);
                        state.setAiError("");
                        state.setShowPromptRepo(false);
                      }}
                      className="p-3 rounded-lg border border-zinc-900 bg-zinc-900/40 hover:bg-purple-950/10 hover:border-purple-500/20 text-left text-zinc-350 hover:text-purple-200 transition-all flex flex-col gap-1.5 cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-xs text-purple-400">{ex.label}</span>
                        <span className="text-[9px] uppercase tracking-wider text-zinc-550 font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                          {ex.category.replace("_", " ")}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-450 leading-relaxed italic">
                        &ldquo;{ex.text}&rdquo;
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="relative">
          <textarea
            value={state.aiPrompt}
            onChange={(e) => {
              state.setAiPrompt(e.target.value);
              state.setAiError("");
            }}
            placeholder="Type your task details here or click the microphone to describe it by voice..."
            rows={3}
            className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 pr-12 resize-none"
          />
          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-all ${
                state.isListening
                  ? "bg-red-500/20 border-red-500/40 text-red-400 animate-pulse"
                  : "bg-zinc-800/80 border-zinc-700/60 text-zinc-400 hover:text-zinc-200"
              }`}
              title={state.isListening ? "Stop voice input" : "Start voice input"}
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>

        {state.aiError && <p className="text-xs text-red-400">{state.aiError}</p>}

        <button
          type="button"
          onClick={handleAiParse}
          disabled={state.isParsing || !state.aiPrompt.trim()}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-550 py-2.5 text-xs font-bold text-white transition disabled:opacity-40 shadow-lg shadow-purple-500/10 cursor-pointer"
        >
          {state.isParsing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating task details...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Fill Form with AI
            </>
          )}
        </button>
      </div>
    </div>
  );
}
