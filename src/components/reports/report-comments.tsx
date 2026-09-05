"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { getReportComments, postReportComment, deleteReportComment } from "@/lib/api/client";
import { ReportComment } from "@/lib/api/types";
import { IconMessage, IconClose, IconShield } from "@/components/ui/icons";
import { CommentSkeleton } from "@/components/ui/skeletons";

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
    <div className="rounded-2xl border border-[#e2e6df] bg-white p-5 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-[#edf0ea] pb-4">
        <h2 className="text-base sm:text-lg font-bold text-[#1c241e] flex items-center gap-2">
          <IconMessage className="h-5 w-5 text-[#225332]" />
          <span>Diskusi & Tanggapan Warga ({comments.length || initialCommentsCount})</span>
        </h2>
      </div>

      {error && (
        <p className="text-xs text-[#b91c1c] bg-[#fee2e2] p-3 rounded-xl border border-[#fecaca]">
          {error}
        </p>
      )}

      {/* Main Comment Input */}
      {user ? (
        <form onSubmit={handlePostComment} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Tulis tanggapan, klarifikasi kondisi lapangan, atau konfirmasi terkait laporan ini..."
            rows={3}
            className="w-full rounded-xl border border-[#e2e6df] bg-[#fafaf7] px-4 py-3 text-xs sm:text-sm text-[#1c241e] placeholder-[#8c978f] outline-none transition duration-150 focus:border-[#225332] focus:bg-white"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="rounded-xl bg-[#225332] px-5 py-2 text-xs font-semibold text-white hover:bg-[#173722] transition active:scale-[0.98] disabled:opacity-40"
            >
              {submitting ? "Mengirim..." : "Kirim Tanggapan"}
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-xl bg-[#fafaf7] p-4 text-center text-xs text-[#5c685f] border border-[#e2e6df]">
          <Link href="/login" className="font-semibold text-[#225332] hover:underline">
            Masuk ke akun Anda
          </Link>{" "}
          untuk bergabung dalam diskusi dan memberikan tanggapan.
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <CommentSkeleton />
            <CommentSkeleton />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#8c978f]">
            Belum ada tanggapan untuk laporan ini. Jadilah yang pertama memberikan masukan.
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="space-y-3 border-b border-[#edf0ea] pb-4 last:border-b-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  {comment.user ? (
                    <Link
                      href={`/users/${comment.user.id}`}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f2f7f3] text-[#225332] text-xs font-bold border border-[#c5dcce] hover:opacity-80 transition"
                    >
                      {comment.user.name.charAt(0).toUpperCase()}
                    </Link>
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f4f5f0] text-[#5c685f] text-xs font-bold">
                      W
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {comment.user ? (
                        <Link
                          href={`/users/${comment.user.id}`}
                          className="text-xs font-semibold text-[#1c241e] hover:text-[#225332] hover:underline"
                        >
                          {comment.user.name}
                        </Link>
                      ) : (
                        <span className="text-xs font-semibold text-[#1c241e]">Warga Komunitas</span>
                      )}

                      {comment.is_official && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#225332] px-2 py-0.2 text-[10px] font-semibold text-white">
                          <IconShield className="h-2.5 w-2.5" />
                          <span>Resmi</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#8c978f]">
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
                    className="text-[#8c978f] hover:text-[#b91c1c] transition p-1"
                    title="Hapus komentar"
                  >
                    <IconClose className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#1c241e] leading-relaxed pl-9 whitespace-pre-line">
                {comment.content}
              </p>

              {/* Reply trigger */}
              {user && (
                <div className="pl-9">
                  {replyingToId === comment.id ? (
                    <div className="space-y-2 mt-2">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder={`Balas ${comment.user?.name || "warga"}...`}
                        rows={2}
                        className="w-full rounded-xl border border-[#e2e6df] bg-[#fafaf7] px-3 py-2 text-xs text-[#1c241e] placeholder-[#8c978f] outline-none transition focus:border-[#225332] focus:bg-white"
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingToId(null);
                            setReplyContent("");
                          }}
                          className="px-3 py-1.5 text-xs text-[#5c685f] hover:text-[#1c241e] transition"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePostReply(comment.id)}
                          disabled={submitting || !replyContent.trim()}
                          className="rounded-lg bg-[#225332] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#173722] transition active:scale-[0.98] disabled:opacity-40"
                        >
                          {submitting ? "Mengirim..." : "Kirim Balasan"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setReplyingToId(comment.id)}
                      className="text-[11px] font-semibold text-[#225332] hover:underline transition"
                    >
                      Balas
                    </button>
                  )}
                </div>
              )}

              {/* Bounded nested replies (max indentation) */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-5 sm:ml-9 space-y-2.5 pt-2 border-l-2 border-[#e2e6df] pl-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="space-y-1 bg-[#fafaf7] p-2.5 rounded-xl border border-[#e2e6df]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1c241e]">
                          <span>{reply.user?.name || "Warga"}</span>
                          {reply.is_official && (
                            <span className="rounded-full bg-[#225332] px-1.5 py-0.2 text-[9px] font-semibold text-white">
                              Resmi
                            </span>
                          )}
                          <span className="text-[10px] text-[#8c978f] font-normal">
                            &bull;{" "}
                            {new Date(reply.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                        {user && (user.id === reply.user?.id || user.role === "admin") && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(reply.id, comment.id)}
                            className="text-[#8c978f] hover:text-[#b91c1c] transition"
                          >
                            <IconClose className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-[#5c685f] leading-relaxed whitespace-pre-line">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
