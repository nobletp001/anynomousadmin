"use client";

import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import PlaceholderExtension from "@tiptap/extension-placeholder";
import ImageExtension from "@tiptap/extension-image";
import {
  Smile,
  Image as ImageIcon,
  Globe,
  Undo2,
  Redo2,
  Eraser,
  List,
  ListOrdered,
  Indent,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const EMOJIS = ["😊", "👍", "🎉", "🔥", "❤️", "⭐", "🚀", "💬", "⚡", "🔔", "📱", "💻", "👋", "💡", "💰", "✨"];

export function RichTextEditor({ value, onChange, placeholder = "Write here..." }: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-purple-400 underline font-bold cursor-pointer hover:text-purple-300",
        },
      }),
      PlaceholderExtension.configure({
        placeholder,
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:float-left before:text-zinc-500 before:pointer-events-none before:h-0",
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: "max-w-full rounded-xl border border-zinc-700/60 my-2",
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[160px] outline-none select-text",
      },
    },
  });

  // Keep editor content sync'd with prop value if edited externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!mounted || !editor) {
    return <div className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl h-[208px] animate-pulse" />;
  }

  const addLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt("Enter Image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addEmoji = (emoji: string) => {
    editor.chain().focus().insertContent(emoji).run();
    setShowEmojiPicker(false);
  };

  const btnCls = (active: boolean) =>
    `w-8 h-8 rounded-lg transition-all flex items-center justify-center border text-xs font-semibold cursor-pointer shrink-0 ${
      active
        ? "bg-purple-500/25 border-purple-500/40 text-purple-300 font-bold"
        : "bg-zinc-800 hover:bg-zinc-700/80 text-zinc-300 hover:text-zinc-100 border-zinc-750/50"
    }`;

  return (
    <div className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl overflow-hidden focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/20 transition-colors flex flex-col relative text-left">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-zinc-900 border-b border-zinc-700/60 shrink-0">
        
        {/* Group 1: Text Styling */}
        <div className="flex items-center gap-1">
          {/* Bold */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={btnCls(editor.isActive("bold"))}
            title="Bold"
          >
            <span className="font-serif font-black text-sm text-inherit">B</span>
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={btnCls(editor.isActive("italic"))}
            title="Italic"
          >
            <span className="font-serif italic font-bold text-sm text-inherit">I</span>
          </button>

          {/* Underline */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={btnCls(editor.isActive("underline"))}
            title="Underline"
          >
            <span className="font-sans underline font-semibold text-sm text-inherit">U</span>
          </button>

          {/* Strikethrough */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={btnCls(editor.isActive("strike"))}
            title="Strikethrough"
          >
            <span className="font-sans line-through font-semibold text-sm text-inherit">S</span>
          </button>
        </div>

        <span className="w-px h-5 bg-zinc-700/60 mx-1.5" />

        {/* Group 2: Insert Elements */}
        <div className="flex items-center gap-1 relative">
          {/* Emoji */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={btnCls(showEmojiPicker)}
              title="Insert Emoji"
            >
              <Smile className="w-4 h-4 text-inherit" />
            </button>
            {showEmojiPicker && (
              <div className="absolute top-9 left-0 z-50 p-2 bg-zinc-900 border border-zinc-750 rounded-xl shadow-2xl grid grid-cols-4 gap-1.5 w-40 max-h-48 overflow-y-auto">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => addEmoji(emoji)}
                    className="p-1 text-center hover:bg-zinc-800 rounded text-sm cursor-pointer text-zinc-200"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Image */}
          <button
            type="button"
            onClick={addImage}
            className={btnCls(editor.isActive("image"))}
            title="Insert Image"
          >
            <ImageIcon className="w-4 h-4 text-inherit" />
          </button>

          {/* Link */}
          <button
            type="button"
            onClick={addLink}
            className={btnCls(editor.isActive("link"))}
            title="Insert Link"
          >
            <Globe className="w-4 h-4 text-inherit" />
          </button>
        </div>

        <span className="w-px h-5 bg-zinc-700/60 mx-1.5" />

        {/* Group 3: History & Clear */}
        <div className="flex items-center gap-1">
          {/* Undo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="w-8 h-8 rounded-lg flex items-center justify-center border bg-zinc-800 hover:bg-zinc-700/80 disabled:opacity-30 disabled:pointer-events-none text-zinc-300 border-zinc-750/50 shadow-sm cursor-pointer animate-none"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          {/* Redo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="w-8 h-8 rounded-lg flex items-center justify-center border bg-zinc-800 hover:bg-zinc-700/80 disabled:opacity-30 disabled:pointer-events-none text-zinc-300 border-zinc-750/50 shadow-sm cursor-pointer animate-none"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          {/* Clear Formatting */}
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            className="w-8 h-8 rounded-lg flex items-center justify-center border bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-750/50 shadow-sm cursor-pointer"
            title="Clear Formatting"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        <span className="w-px h-5 bg-zinc-700/60 mx-1.5" />

        {/* Group 4: Lists & Nesting */}
        <div className="flex items-center gap-1">
          {/* Bullet List */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={btnCls(editor.isActive("bulletList"))}
            title="Bullet List"
          >
            <List className="w-4 h-4 text-inherit" />
          </button>

          {/* Numbered List */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={btnCls(editor.isActive("orderedList"))}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4 text-inherit" />
          </button>

          {/* Indent / Nest List Item */}
          <button
            type="button"
            onClick={() => {
              if (editor.isActive("bulletList") || editor.isActive("orderedList")) {
                editor.chain().focus().sinkListItem("listItem").run();
              } else {
                editor.chain().focus().toggleBlockquote().run();
              }
            }}
            className={btnCls(false)}
            title="Indent / Blockquote"
          >
            <Indent className="w-4 h-4 text-inherit" />
          </button>
        </div>
      </div>

      {/* Editor Content area */}
      <div className="flex-1 bg-transparent overflow-y-auto text-zinc-100 text-sm [&_.tiptap]:outline-none [&_.tiptap]:p-4 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:ml-6 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:ml-6 [&_.tiptap_p]:mb-2 [&_.tiptap_a]:text-purple-400 [&_.tiptap_a]:underline [&_.tiptap_strong]:font-bold [&_.tiptap_blockquote]:border-l-4 [&_.tiptap_blockquote]:border-zinc-600 [&_.tiptap_blockquote]:pl-4 [&_.tiptap_blockquote]:italic [&_.tiptap_blockquote]:text-zinc-400 [&_.tiptap_blockquote]:my-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
