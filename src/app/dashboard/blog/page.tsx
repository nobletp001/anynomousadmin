"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  Plus,
  Trash2,
  Edit,
  Sparkles,
  Loader2,
  Eye,
  List,
  Calendar,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { apiClient } from "@/services/api-client";

interface BlogArticle {
  id: number;
  title: string;
  slug: string;
  content: string;
  banner: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function BlogManagementPage() {
  const [activeTab, setActiveTab] = useState<"history" | "create" | "bulk_auto">("history");
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual Creation / Single Generation State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [banner, setBanner] = useState("");
  const [generatingSingle, setGeneratingSingle] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [singleMessage, setSingleMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Image Uploading state & helper
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result as string;
      const parts = base64String.split(",");
      if (parts.length < 2) return;
      const mimeType = file.type;
      const base64 = parts[1];

      setUploadingImage(true);
      try {
        const res = await apiClient.post<any, any>("/admin/upload", {
          base64,
          mimeType,
        });

        if (res && res.success) {
          let imageUrl = "";
          if (typeof res.data === "string") {
            imageUrl = res.data;
          } else if (res.data && typeof res.data === "object" && typeof res.data.url === "string") {
            imageUrl = res.data.url;
          } else if (typeof res.url === "string") {
            imageUrl = res.url;
          }

          if (imageUrl) {
            if (isEdit) {
              setEditBanner(imageUrl);
            } else {
              setBanner(imageUrl);
            }
          } else {
            alert("Upload succeeded but no image URL was returned in the response.");
          }
        } else {
          alert("Image upload failed");
        }
      } catch (err: any) {
        alert(err.message || "Failed to upload image");
      } finally {
        setUploadingImage(false);
      }
    };
    reader.onerror = () => {
      alert("Failed to read file");
    };
    reader.readAsDataURL(file);
  };

  // Bulk Generation State
  const [bulkTitles, setBulkTitles] = useState("");
  const [generatingBulk, setGeneratingBulk] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<string[]>([]);

  // Auto Generation State
  const [autoCount, setAutoCount] = useState(10);
  const [generatingAuto, setGeneratingAuto] = useState(false);
  const [autoProgress, setAutoProgress] = useState<string[]>([]);

  // Edit Modal State
  const [editingArticle, setEditingArticle] = useState<BlogArticle | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editBanner, setEditBanner] = useState("");
  const [updating, setUpdating] = useState(false);

  // Preview Modal State
  const [previewArticle, setPreviewArticle] = useState<BlogArticle | null>(null);

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<any, { success: boolean; data: { blogs: BlogArticle[]; total: number } }>(
        `/blogs/admin/list?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
      );
      if (res && res.success) {
        setBlogs(res.data.blogs);
        setTotal(res.data.total);
      } else {
        setError("Failed to fetch blog list");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load blog articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history") {
      fetchBlogs();
    }
  }, [page, search, activeTab]);

  // Handle manual publish
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setSingleMessage({ type: "error", text: "Title and Content are required." });
      return;
    }

    setPublishing(true);
    setSingleMessage(null);
    try {
      const res = await apiClient.post<any, { success: boolean }>("/blogs/admin/create", {
        title,
        content,
        banner: banner.trim() || null,
      });

      if (res && res.success) {
        setSingleMessage({ type: "success", text: "Article published successfully!" });
        setTitle("");
        setContent("");
        setBanner("");
      } else {
        setSingleMessage({ type: "error", text: "Failed to publish article." });
      }
    } catch (err: any) {
      setSingleMessage({ type: "error", text: err.message || "An error occurred while publishing." });
    } finally {
      setPublishing(false);
    }
  };

  // Generate article using DeepSeek for the manual creator
  const handleAISingleGenerate = async () => {
    if (!title.trim()) {
      setSingleMessage({ type: "error", text: "Please provide a title first before generating." });
      return;
    }

    setGeneratingSingle(true);
    setSingleMessage(null);
    try {
      const res = await apiClient.post<any, { success: boolean; data: { content: string; banner: string } }>(
        "/blogs/admin/generate",
        { title: title.trim() }
      );

      if (res && res.success) {
        setContent(res.data.content);
        setBanner(res.data.banner);
        setSingleMessage({ type: "success", text: "Article written and banner generated by DeepSeek!" });
      } else {
        setSingleMessage({ type: "error", text: "Failed to generate article." });
      }
    } catch (err: any) {
      setSingleMessage({ type: "error", text: err.message || "Failed to communicate with DeepSeek." });
    } finally {
      setGeneratingSingle(false);
    }
  };

  // Handle Edit update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;

    setUpdating(true);
    try {
      const res = await apiClient.put<any, { success: boolean }>(`/blogs/admin/${editingArticle.id}`, {
        title: editTitle,
        content: editContent,
        banner: editBanner.trim() || null,
      });

      if (res && res.success) {
        setEditingArticle(null);
        fetchBlogs();
      } else {
        alert("Failed to update article");
      }
    } catch (err: any) {
      alert(err.message || "Failed to update article");
    } finally {
      setUpdating(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id: number, articleTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${articleTitle}"?`)) return;

    try {
      const res = await apiClient.delete<any, { success: boolean }>(`/blogs/admin/${id}`);
      if (res && res.success) {
        fetchBlogs();
      } else {
        alert("Failed to delete article");
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete article");
    }
  };

  // Handle bulk generate
  const handleBulkGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const list = bulkTitles
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);

    if (list.length === 0) return;

    setGeneratingBulk(true);
    setBulkProgress(["Starting bulk generation...", `Found ${list.length} titles to process.`]);

    try {
      const res = await apiClient.post<
        any,
        { success: boolean; count: number; data: any[]; errors: { title: string; error: string }[] }
      >("/blogs/admin/generate-bulk", { titles: list });

      if (res && res.success) {
        const progress = [
          `Bulk generation finished!`,
          `Successfully posted: ${res.count} articles.`,
          `Failed: ${res.errors.length} articles.`,
        ];
        if (res.errors.length > 0) {
          res.errors.forEach((err) => {
            progress.push(`❌ Title "${err.title}" failed: ${err.error}`);
          });
        }
        setBulkProgress(progress);
        setBulkTitles("");
      } else {
        setBulkProgress(["Failed to complete bulk generation process."]);
      }
    } catch (err: any) {
      setBulkProgress([`Error: ${err.message || "Bulk process crashed."}`]);
    } finally {
      setGeneratingBulk(false);
    }
  };

  // Handle auto generate
  const handleAutoGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (autoCount < 1 || autoCount > 30) return;

    setGeneratingAuto(true);
    setAutoProgress([
      `Initiating Auto-Generation for ${autoCount} articles...`,
      "Asking DeepSeek to come up with ideas...",
    ]);

    try {
      const res = await apiClient.post<
        any,
        { success: boolean; count: number; data: any[]; errors: { title: string; error: string }[] }
      >("/blogs/admin/auto-generate", { count: autoCount });

      if (res && res.success) {
        const progress = [
          `Auto-generation completed!`,
          `Posted: ${res.count} articles.`,
          `Failed: ${res.errors.length} articles.`,
        ];
        res.data.forEach((article) => {
          progress.push(`✍️ Published: "${article.title}"`);
        });
        if (res.errors.length > 0) {
          res.errors.forEach((err) => {
            progress.push(`❌ Failed: "${err.title}" (${err.error})`);
          });
        }
        setAutoProgress(progress);
      } else {
        setAutoProgress(["Failed to execute auto-generation."]);
      }
    } catch (err: any) {
      setAutoProgress([`Error: ${err.message || "Auto-generate failed."}`]);
    } finally {
      setGeneratingAuto(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-500" />
            Blog Article Management
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Create, auto-generate, update, and manage blog posts on PayFluence to drive SEO and authority.
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 p-1 rounded-xl bg-zinc-900/40 border border-zinc-800/50 w-fit">
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === "history"
              ? "bg-purple-600 text-white shadow-md shadow-purple-500/10"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <List className="w-3.5 h-3.5" />
          Article History ({total})
        </button>
        <button
          onClick={() => setActiveTab("create")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === "create"
              ? "bg-purple-600 text-white shadow-md shadow-purple-500/10"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          Create / AI Single Write
        </button>
        <button
          onClick={() => setActiveTab("bulk_auto")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === "bulk_auto"
              ? "bg-purple-600 text-white shadow-md shadow-purple-500/10"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Bulk &amp; Auto-Generate
        </button>
      </div>

      {/* TAB 1: HISTORY */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-zinc-900/30 border border-zinc-800/80 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>

          {/* List display */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
              <BookOpen className="w-10 h-10 text-zinc-650 mx-auto mb-3" />
              <p className="text-xs font-medium text-zinc-500">No blog articles found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800/80 bg-zinc-900/30 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        <th className="px-6 py-4">Article</th>
                        <th className="px-6 py-4">Slug</th>
                        <th className="px-6 py-4">Published Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50 text-xs text-zinc-300">
                      {blogs.map((b) => (
                        <tr key={b.id} className="hover:bg-zinc-900/20 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-8 rounded bg-zinc-850 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
                                {b.banner ? (
                                  <img src={b.banner} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="w-3.5 h-3.5 text-zinc-650" />
                                )}
                              </div>
                              <span className="font-bold text-zinc-200 line-clamp-1 max-w-sm">{b.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <code className="text-[10px] text-zinc-400 bg-zinc-900/60 px-1.5 py-0.5 rounded border border-zinc-800/40">
                              {b.slug}
                            </code>
                          </td>
                          <td className="px-6 py-4 text-zinc-450 font-medium">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-zinc-500" />
                              {new Date(b.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setPreviewArticle(b)}
                                className="p-1.5 rounded-lg hover:bg-zinc-800 hover:text-purple-400 text-zinc-550 transition cursor-pointer"
                                title="Preview Article"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingArticle(b);
                                  setEditTitle(b.title);
                                  setEditContent(b.content);
                                  setEditBanner(b.banner || "");
                                }}
                                className="p-1.5 rounded-lg hover:bg-zinc-800 hover:text-emerald-400 text-zinc-550 transition cursor-pointer"
                                title="Edit Article"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(b.id, b.title)}
                                className="p-1.5 rounded-lg hover:bg-zinc-800 hover:text-red-400 text-zinc-550 transition cursor-pointer"
                                title="Delete Article"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800/40">
                  <span className="text-[11px] text-zinc-500 font-medium">
                    Showing page {page} of {totalPages} ({total} total)
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded-lg border border-zinc-850 bg-zinc-900/30 hover:bg-zinc-800 hover:text-zinc-200 text-zinc-450 disabled:opacity-40 disabled:hover:bg-transparent text-[11px] transition font-semibold cursor-pointer"
                    >
                      Previous
                    </button>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="px-3 py-1.5 rounded-lg border border-zinc-850 bg-zinc-900/30 hover:bg-zinc-800 hover:text-zinc-200 text-zinc-450 disabled:opacity-40 disabled:hover:bg-transparent text-[11px] transition font-semibold cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MANUAL CREATOR / AI SINGLE WRITE */}
      {activeTab === "create" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Creation Form */}
          <div className="lg:col-span-2 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800/50 pb-2">
              Article details
            </h2>

            {singleMessage && (
              <div
                className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-xs ${
                  singleMessage.type === "success"
                    ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                    : "border-red-500/20 bg-red-500/5 text-red-400"
                }`}
              >
                {singleMessage.type === "success" ? (
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span className="font-semibold">{singleMessage.text}</span>
              </div>
            )}

            <form onSubmit={handlePublish} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Article Title</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 5 Side Hustles for Nigerian Students in 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-zinc-950/40 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition"
                  />
                  <button
                    type="button"
                    onClick={handleAISingleGenerate}
                    disabled={generatingSingle || !title.trim()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition shrink-0 cursor-pointer"
                  >
                    {generatingSingle ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Writing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Write with DeepSeek
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Banner Image</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="https://... or upload image"
                    value={banner}
                    onChange={(e) => setBanner(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-zinc-950/40 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-purple-500 transition"
                  />
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-semibold cursor-pointer transition disabled:opacity-50 shrink-0">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Upload Banner</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, false)}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                    {uploadingImage && <Loader2 className="w-4 h-4 animate-spin text-purple-500" />}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Content (HTML formatted text)
                  </label>
                  <span className="text-[9px] text-zinc-550">HTML supported</span>
                </div>
                <textarea
                  placeholder="<p>Write your article here...</p>"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 bg-zinc-950/40 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={publishing}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/10 cursor-pointer"
              >
                {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Publish Post
              </button>
            </form>
          </div>

          {/* Quick Preview Panel */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/10 p-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800/50 pb-2">
              Preview Box
            </h2>
            {title ? (
              <div className="space-y-3">
                {banner && (
                  <div className="w-full aspect-video rounded-xl bg-zinc-950/60 border border-zinc-800 overflow-hidden">
                    <img src={banner} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <h3 className="text-base font-extrabold text-zinc-100">{title}</h3>
                <div
                  className="text-xs text-zinc-400 leading-relaxed max-h-[300px] overflow-y-auto space-y-3 prose prose-invert pr-1 scrollbar-thin"
                  dangerouslySetInnerHTML={{
                    __html: content || "<p className='italic text-zinc-600'>No content written yet.</p>",
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-20 text-zinc-600 text-xs italic">
                Give your article a title to see the live layout preview.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: BULK & AUTO GENERATE */}
      {activeTab === "bulk_auto" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bulk Generation Card */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-5 space-y-4 flex flex-col">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Bulk Article Generator
              </h2>
              <p className="text-[11px] text-zinc-400 mt-1">
                Post a list of titles (one title per line). DeepSeek will write detailed HTML articles and generate
                matching banners for all of them.
              </p>
            </div>

            <form onSubmit={handleBulkGenerate} className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-1.5 flex-1 flex flex-col">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Article Titles List (One per line)
                </label>
                <textarea
                  placeholder="How to Earn Money on PayFluence in Nigeria&#10;5 Smart Financial Habits for University Students&#10;Why Micro-tasking is the Best Side Hustle"
                  value={bulkTitles}
                  onChange={(e) => setBulkTitles(e.target.value)}
                  rows={8}
                  disabled={generatingBulk}
                  className="w-full flex-1 px-4 py-3 bg-zinc-950/40 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition font-mono min-h-[160px]"
                />
              </div>

              <button
                type="submit"
                disabled={generatingBulk || !bulkTitles.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-purple-600/15 cursor-pointer mt-4"
              >
                {generatingBulk ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating in Bulk...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Bulk Generate &amp; Publish
                  </>
                )}
              </button>
            </form>

            {/* Bulk Progress Logs */}
            {bulkProgress.length > 0 && (
              <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/60 max-h-48 overflow-y-auto space-y-1.5 font-mono text-[10px] text-zinc-400 scrollbar-thin">
                {bulkProgress.map((p, idx) => (
                  <p
                    key={idx}
                    className={
                      p.includes("❌")
                        ? "text-red-400"
                        : p.includes("✍️") || p.includes("Success")
                          ? "text-emerald-400"
                          : ""
                    }
                  >
                    {p}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Hands-off Auto Generation Card */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Auto-Pilot Article Generator
                </h2>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Fully hands-off auto-generation. DeepSeek generates highly optimized blog topics, writes the articles,
                  builds custom AI banners, and publishes them.
                </p>
              </div>

              <div className="space-y-2 border border-zinc-800/50 bg-zinc-900/20 p-4 rounded-xl">
                <h4 className="text-xs font-bold text-zinc-300">How to scale PayFluence articles?</h4>
                <p className="text-[11px] text-zinc-550 leading-relaxed font-medium">
                  Generating multiple posts consistently builds search engine crawling volume. Auto-generating 10–20
                  posts at regular intervals helps rapidly push Domain Authority upwards of 50+.
                </p>
              </div>

              <form onSubmit={handleAutoGenerate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Number of Articles to Auto-Publish
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={autoCount}
                    onChange={(e) => setAutoCount(Math.max(1, parseInt(e.target.value) || 1))}
                    disabled={generatingAuto}
                    className="w-full px-4 py-2.5 bg-zinc-950/40 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={generatingAuto}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-purple-600/15 cursor-pointer"
                >
                  {generatingAuto ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating and Publishing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Trigger Hands-off Auto Publish
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Auto Progress Logs */}
            {autoProgress.length > 0 && (
              <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/60 max-h-48 overflow-y-auto space-y-1.5 font-mono text-[10px] text-zinc-400 mt-4 scrollbar-thin">
                {autoProgress.map((p, idx) => (
                  <p
                    key={idx}
                    className={
                      p.includes("❌")
                        ? "text-red-400"
                        : p.includes("✍️") || p.includes("Published")
                          ? "text-emerald-400"
                          : ""
                    }
                  >
                    {p}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-zinc-800/80 bg-zinc-950 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60 bg-zinc-900/40 shrink-0">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">Edit Blog Article</h3>
              <button
                onClick={() => setEditingArticle(null)}
                className="text-zinc-500 hover:text-zinc-200 transition text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleUpdate} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-90/50 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-purple-500 transition"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Banner Image</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={editBanner}
                    onChange={(e) => setEditBanner(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-zinc-90/50 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-purple-500 transition"
                  />
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800 text-zinc-350 hover:text-zinc-200 text-xs font-semibold cursor-pointer transition disabled:opacity-50 shrink-0">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Upload Banner</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, true)}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                    {uploadingImage && <Loader2 className="w-4 h-4 animate-spin text-purple-500" />}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Content (HTML)</label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 bg-zinc-90/50 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-purple-500 transition font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800/40">
                <button
                  type="button"
                  onClick={() => setEditingArticle(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-400 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                >
                  {updating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL PREVIEW MODAL */}
      {previewArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-zinc-800/80 bg-zinc-950 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60 bg-zinc-900/40 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Article Preview</span>
              <button
                onClick={() => setPreviewArticle(null)}
                className="text-zinc-500 hover:text-zinc-200 transition text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
              {previewArticle.banner && (
                <div className="w-full aspect-[21/9] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-850">
                  <img src={previewArticle.banner} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <h2 className="text-xl font-extrabold text-zinc-100">{previewArticle.title}</h2>
              <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-bold uppercase">
                <span>By PayFluence Admin</span>
                <span>•</span>
                <span>{new Date(previewArticle.createdAt).toLocaleDateString()}</span>
              </div>
              <div
                className="text-xs text-zinc-350 leading-relaxed space-y-4 border-t border-zinc-900 pt-4 prose prose-invert max-w-none prose-headings:text-zinc-100 prose-a:text-purple-400"
                dangerouslySetInnerHTML={{ __html: previewArticle.content }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
