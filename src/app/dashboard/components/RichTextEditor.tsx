"use client";

import React, { useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Smile,
  Image as ImageIcon,
  Link as LinkIcon,
  RotateCcw,
  RotateCw,
  Eraser,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = "Write here..." }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync value from props to editor DOM only if it differs from current innerHTML
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, arg: string = "") => {
    document.execCommand(command, false, arg);
    handleInput();
  };

  const handleLink = () => {
    const url = prompt("Enter the URL:");
    if (url) {
      executeCommand("createLink", url);
    }
  };

  const handleImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      executeCommand("insertImage", url);
    }
  };

  const handleEmoji = () => {
    const emoji = prompt("Enter emoji or paste content here:");
    if (emoji) {
      executeCommand("insertText", emoji);
    }
  };

  const handleClear = () => {
    executeCommand("removeFormat");
  };

  const isEmpty = !value || value === "<br>" || value === "<p></p>" || value === "<div><br></div>" || value === "";

  return (
    <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900/10 overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-zinc-900/40 border-b border-zinc-800/80 select-none">
        <button
          type="button"
          onClick={() => executeCommand("bold")}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand("italic")}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand("underline")}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand("strikeThrough")}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-zinc-800 mx-1" />

        <button
          type="button"
          onClick={handleEmoji}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          title="Insert Emoji"
        >
          <Smile className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleImage}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleLink}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-zinc-800 mx-1" />

        <button
          type="button"
          onClick={() => executeCommand("undo")}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          title="Undo"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand("redo")}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          title="Redo"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          title="Clear Formatting"
        >
          <Eraser className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-zinc-800 mx-1" />

        <button
          type="button"
          onClick={() => executeCommand("insertUnorderedList")}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand("insertOrderedList")}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand("formatBlock", "<blockquote>")}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </button>
      </div>

      {/* Input Field Area */}
      <div className="relative flex-1">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="w-full min-h-[200px] max-h-[450px] overflow-y-auto px-4 py-3 bg-zinc-950/40 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-500/30 relative z-10"
          style={{ outline: "none" }}
        />
        {isEmpty && (
          <div className="absolute left-4 top-3 text-zinc-600 text-xs pointer-events-none select-none z-0">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
