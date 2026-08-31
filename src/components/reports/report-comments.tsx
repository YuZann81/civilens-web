"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { getReportComments, postReportComment, deleteReportComment } from "@/lib/api/client";
import { ReportComment } from "@/lib/api/types";
import { IconMessage, IconClose, IconShield } from "@/components/ui/icons";

interface ReportCommentsProps {
  reportId: number | string;
  initialCommentsCount?: number;
}

export default function ReportComments({ reportId, initialCommentsCount = 0 }: ReportCommentsProps) {
  const { user } = useAuth();

  const [comments, setComments] = useState<ReportComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [error, setError] = useState("");

  const loadComments = () => {
    getReportComments(reportId)
      .then((res) => {
        setComments(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setError("");
    setSubmitting(true);

    try {
      const created = await postReportComment(reportId, newComment.trim());
      setComments((prev) => [created, ...prev]);
      setNewComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim komentar.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostReply = async (parentId: number) => {
    if (!replyContent.trim() || submitting) return;

    setError("");
    setSubmitting(true);

    try {
      const createdReply = await postReportComment(reportId, replyContent.trim(), parentId);
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...(c.replies || []), createdReply] }
            : c
        )
      );
      setReplyingToId(null);
      setReplyContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membalas komentar.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number, parentId?: number | null) => {
    try {
      await deleteReportComment(reportId, commentId);
      if (parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? { ...c, replies: (c.replies || []).filter((r) => r.id !== commentId) }
              : c
          )
        );
      } else {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch {
      // Ignored
    }
  };

  return (
    <div className="rounded-2xl border border-[#eae2d3] bg-white p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-[#f0f4ee] pb-4">
        <h2 className="text-lg font-bold font-serif text-[#1e4d2b] flex items-center gap-2" style={{ fontFamily: "Georgia, serif" }}>
          <IconMessage className="h-5 w-5 text-[#1e4d2b]" />
          <span>Diskusi & Tanggapan Komunitas ({comments.length || initialCommentsCount})</span>
        </h2>
      </div>

      {error && (
        <p className="text-xs text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200">
          {error}
        </p>
      )}

      {/* Main Comment Input */}
      {user ? (
        <form onSubmit={handlePostComment} className="space-y-3">
          <textarea
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Tulis tanggapan atau informasi tambahan tentang lokasi/kondisi ini..."
            required
            className="w-full rounded-xl border border-[#c8dfc8] bg-[#fafaf5] px-4 py-3 text-xs sm:text-sm text-[#2c2926] outline-none transition focus:border-[#1e4d2b] focus:bg-white"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="rounded-xl bg-[#1e4d2b] px-5 py-2 text-xs font-semibold text-white hover:bg-[#163a20] transition disabled:opacity-40"
            >
              {submitting ? "Mengirim..." : "Kirim Tanggapan"}
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-xl bg-[#fafaf5] p-4 text-center text-xs text-[#57524d] border border-[#eae2d3]">
          <Link href="/login" className="font-semibold text-[#1e4d2b] hover:underline">
            Masuk
          </Link>{" "}
          untuk ikut berdiskusi dan memberikan informasi tambahan pada laporan ini.
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-6 text-xs text-[#7a9a80]">Memuat diskusi...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-6 text-xs text-[#8c857e]">
          Belum ada komentar. Jadilah yang pertama memberikan tanggapan atau konfirmasi kondisi di lapangan!
        </div>
      ) : (
        <div className="space-y-4 pt-2">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-3 border-b border-[#f0f4ee] pb-4 last:border-b-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Link
                    href={comment.user ? `/users/${comment.user.id}` : "#"}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e5f0e6] text-[#1e4d2b] text-xs font-bold font-serif hover:opacity-80 transition"
                  >
                    {comment.user?.name.charAt(0) || "U"}
                  </Link>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={comment.user ? `/users/${comment.user.id}` : "#"}
                        className="text-xs font-semibold text-[#1c4123] hover:underline"
                      >
                        {comment.user?.name || "Warga"}
                      </Link>
                      {comment.is_official && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#1e4d2b] px-2 py-0.2 text-[10px] font-semibold text-white">
                          <IconShield className="h-2.5 w-2.5" />
                          <span>Pemerintah</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#8c857e]">
                      {new Date(comment.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {user && (user.id === comment.user?.id || user.role === "admin") && (
                  <button
                    type="button"
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-[#8c857e] hover:text-red-600 transition p-1"
                    title="Hapus komentar"
                  >
                    <IconClose className="h-3 w-3" />
                  </button>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#2c2926] leading-relaxed pl-9 whitespace-pre-line">
                {comment.content}
              </p>

              {/* Reply trigger button */}
              {user && (
                <div className="pl-9">
                  <button
                    type="button"
                    onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                    className="text-[11px] font-semibold text-[#4a6b52] hover:text-[#1e4d2b] transition"
                  >
                    {replyingToId === comment.id ? "Batal" : "Balas"}
                  </button>
                </div>
              )}

              {/* Reply Input Box */}
              {replyingToId === comment.id && (
                <div className="pl-9 pt-2 space-y-2">
                  <textarea
                    rows={2}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Tulis balasan..."
                    className="w-full rounded-xl border border-[#c8dfc8] bg-[#fafaf5] px-3 py-2 text-xs text-[#2c2926] outline-none transition focus:border-[#1e4d2b] focus:bg-white"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handlePostReply(comment.id)}
                      disabled={submitting || !replyContent.trim()}
                      className="rounded-lg bg-[#1e4d2b] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#163a20] transition disabled:opacity-40"
                    >
                      Kirim Balasan
                    </button>
                  </div>
                </div>
              )}

              {/* Nested Replies List */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-9 space-y-2.5 pt-2 border-l-2 border-[#e5f0e6] pl-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1c4123]">
                          <span>{reply.user?.name || "Warga"}</span>
                          {reply.is_official && (
                            <span className="rounded-full bg-[#1e4d2b] px-1.5 py-0.2 text-[9px] font-semibold text-white">
                              Petugas
                            </span>
                          )}
                          <span className="text-[10px] text-[#8c857e] font-normal">
                            &bull; {new Date(reply.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        {user && (user.id === reply.user?.id || user.role === "admin") && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(reply.id, comment.id)}
                            className="text-[#8c857e] hover:text-red-600 transition"
                          >
                            <IconClose className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-[#57524d] leading-relaxed whitespace-pre-line">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
