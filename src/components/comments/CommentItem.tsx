"use client";

import { useState, useTransition } from "react";
import { PencilLine, Trash2, CornerDownRight } from "lucide-react";
import { deleteComment, createComment, updateComment } from "@/lib/actions";
import { Button } from "@/components/ui/button";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type { CommentWithAuthor } from "@/types/comment";

export function CommentItem({
  comment,
  depth,
  currentUserId,
  isAdmin,
  postId,
}: {
  comment: CommentWithAuthor;
  depth: number;
  currentUserId: number | null;
  isAdmin: boolean;
  postId: number;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const isDeleted = comment.content === "삭제된 댓글입니다";
  const isEdited =
    !isDeleted &&
    new Date(comment.updatedAt).getTime() >
      new Date(comment.createdAt).getTime();

  const canManage =
    !isDeleted &&
    (isAdmin || (currentUserId != null && currentUserId === comment.authorId));

  return (
    <TooltipProvider>
      <div
        className={[
          "py-5 px-4 rounded-2xl",
          depth === 0 ? "border-b" : "bg-slate-50/60 border border-slate-200",
          depth > 0 ? "ml-8" : "",
        ].join(" ")}
      >
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {depth > 0 && (
                <CornerDownRight className="w-4 h-4 text-slate-400" />
              )}

              <span className="font-bold text-sm text-slate-900">
                {isDeleted ? "알 수 없음" : comment.author.email}
              </span>

              <span className="text-[11px] text-slate-400">
                {new Date(comment.createdAt).toLocaleString()}
              </span>

              {/* 수정됨 + hover 시 수정일 툴팁 */}
              {isEdited && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded cursor-default">
                      <PencilLine className="w-3 h-3" />
                      수정됨
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      수정일: {new Date(comment.updatedAt).toLocaleString()}
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* 액션 버튼 */}
          {canManage && (
            <div className="flex items-center gap-2">
              {/* 수정 버튼: 본인만(관리자라도 타인 댓글을 수정하게 할지 정책에 따라) */}
              {currentUserId != null && currentUserId === comment.authorId && (
                <button
                  type="button"
                  onClick={() => setEditOpen((v) => !v)}
                  className="text-xs text-slate-500 hover:text-slate-700 transition"
                >
                  수정
                </button>
              )}

              {/* 삭제 */}
              <form
                action={() => {
                  startTransition(async () => {
                    await deleteComment(comment.id);
                  });
                }}
              >
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  className="h-8 w-8 p-0 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50"
                  aria-label="댓글 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* 본문 */}
        <p
          className={[
            "mt-2 text-sm leading-relaxed whitespace-pre-wrap",
            isDeleted ? "text-slate-300 italic" : "text-slate-700",
          ].join(" ")}
        >
          {comment.content}
        </p>

        {/* 수정 폼 */}
        {editOpen &&
          currentUserId != null &&
          currentUserId === comment.authorId &&
          !isDeleted && (
            <form
              className="mt-3 p-3 rounded-xl border border-slate-200 bg-white"
              action={(formData) => {
                startTransition(async () => {
                  const content = String(formData.get("content") || "").trim();
                  if (!content) return;
                  await updateComment(comment.id, content);
                  setEditOpen(false);
                });
              }}
            >
              <textarea
                name="content"
                defaultValue={comment.content}
                className="w-full min-h-[80px] rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-400"
                required
              />
              <div className="mt-2 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:border-slate-300 transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="h-9 px-3 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-60 transition"
                  disabled={pending}
                >
                  저장
                </button>
              </div>
            </form>
          )}

        {/* 답글(대댓글 포함) 폼: 삭제된 댓글에는 숨김 */}
        {!isDeleted && currentUserId != null && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setReplyOpen((v) => !v)}
              className="text-[11px] text-emerald-700 font-semibold hover:underline"
            >
              답글 달기
            </button>

            {replyOpen && (
              <form
                className="mt-2 p-3 rounded-xl border border-slate-200 bg-slate-50/60"
                action={(formData) => {
                  startTransition(async () => {
                    const content = String(
                      formData.get("content") || ""
                    ).trim();
                    if (!content) return;
                    await createComment(postId, content, comment.id); // 대댓글에도 답글 가능
                    setReplyOpen(false);
                  });
                }}
              >
                <textarea
                  name="content"
                  className="w-full min-h-[70px] rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-400"
                  placeholder="답글을 입력하세요."
                  required
                />
                <div className="mt-2 flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setReplyOpen(false)}
                    className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:border-slate-300 transition"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="h-9 px-3 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-60 transition"
                    disabled={pending}
                  >
                    등록
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
