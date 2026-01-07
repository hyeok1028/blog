// src/app/post/[id]/page.tsx
// 게시글 상세 페이지
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { deletePost, toggleLike, createComment } from "@/lib/actions";
import { CommentItem } from "@/components/comments/CommentItem";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { CSSProperties } from "react";

import { Heart, MessageCircle } from "lucide-react";
import type { CommentWithAuthor } from "@/types/comment";
import LikeButton from "@/components/likes/LikeButton";

export const dynamic = "force-dynamic";

const prismStyle = vscDarkPlus as unknown as Record<string, CSSProperties>;

interface RenderCommentProps {
  currentUserId: number | null;
  isAdmin: boolean;
  postId: number;
}

function renderComments(
  comments: CommentWithAuthor[],
  parentId: number | null,
  props: RenderCommentProps,
  depth = 0
): React.ReactNode {
  return comments
    .filter((c) => c.parentId === parentId)
    .map((c) => (
      <div key={c.id} className="space-y-3">
        <CommentItem
          comment={c}
          depth={depth}
          currentUserId={props.currentUserId}
          isAdmin={props.isAdmin}
          postId={props.postId}
        />
        {renderComments(comments, c.id, props, depth + 1)}
      </div>
    ));
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  const postId = Number(id);

  if (!Number.isFinite(postId)) notFound();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: true,
      likes: true, // ✅ 좋아요 데이터 로드
      comments: {
        include: { author: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!post) notFound();

  const currentUserId = session?.user?.id ? Number(session.user.id) : null;

  // ✅ 현재 유저가 좋아요 눌렀는지 여부
  const likedByMe =
    currentUserId != null && post.likes.some((l) => l.userId === currentUserId);

  return (
    <div className="max-w-4xl mx-auto p-10">
      <Button variant="ghost" asChild className="mb-6">
        <Link href={`/category/${post.category}`}>
          ← {post.category} 목록으로
        </Link>
      </Button>

      <article className="bg-white p-8 rounded-2xl shadow-sm border">
        <header className="mb-8 pb-8 border-b">
          <div className="flex justify-between items-start gap-4 mb-4">
            <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">
              {post.title}
            </h1>

            {session?.user?.role === "ADMIN" && (
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/post/${post.id}`}>수정/관리</Link>
                </Button>

                <form
                  action={async () => {
                    "use server";
                    await deletePost(post.id);
                    redirect("/");
                  }}
                >
                  <Button variant="destructive" size="sm" type="submit">
                    삭제
                  </Button>
                </form>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center text-slate-500 text-sm gap-4">
            <span className="font-medium text-slate-700">
              작성자: {post.author.email}
            </span>
            <span>•</span>
            <span>작성일: {new Date(post.createdAt).toLocaleDateString()}</span>

            {/* ✅ 좋아요/댓글 요약 */}
            <span className="ml-auto flex items-center gap-4">
              <span className="inline-flex items-center gap-1 text-slate-500">
                <Heart className="w-4 h-4" />
                {post.likes.length}
              </span>
              <span className="inline-flex items-center gap-1 text-slate-500">
                <MessageCircle className="w-4 h-4" />
                {post.comments.length}
              </span>
            </span>
          </div>

          {/* ✅ 액션 버튼 (좋아요) */}
          <div className="mt-6 flex items-center gap-2">
            <LikeButton
              postId={postId}
              initialLiked={likedByMe}
              initialCount={post.likes.length}
              disabled={!session}
            />

            {!session && (
              <span className="text-xs text-slate-400">
                좋아요/댓글은 로그인 후 사용할 수 있습니다.
              </span>
            )}
          </div>
        </header>

        {/* 본문 */}
        <div className="prose prose-slate max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children }) {
                const match = /language-(\w+)/.exec(className || "");
                const codeText = String(children).replace(/\n$/, "");

                if (match) {
                  return (
                    <SyntaxHighlighter
                      style={prismStyle}
                      language={match[1]}
                      PreTag="div"
                    >
                      {codeText}
                    </SyntaxHighlighter>
                  );
                }

                return <code className={className}>{children}</code>;
              },
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* ✅ 댓글 입력 폼 (최상위 댓글) */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">댓글</h2>
            <span className="text-sm text-slate-500">
              총 {post.comments.length}개
            </span>
          </div>

          {session && (
            <form
              className="mb-8 p-4 rounded-2xl border bg-slate-50/60"
              action={async (formData) => {
                "use server";
                const content = String(formData.get("content") || "").trim();
                if (!content) return;
                await createComment(postId, content);
              }}
            >
              <textarea
                name="content"
                className="w-full min-h-[90px] rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-400"
                placeholder="댓글을 입력하세요."
                required
              />
              <div className="mt-3 flex justify-end">
                <Button
                  type="submit"
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                >
                  댓글 작성
                </Button>
              </div>
            </form>
          )}

          {/* 댓글 트리 */}
          <div className="space-y-4">
            {post.comments.length === 0 ? (
              <div className="text-center py-10 rounded-2xl border border-dashed bg-white">
                <p className="text-slate-400">첫 댓글을 남겨보세요.</p>
              </div>
            ) : (
              renderComments(post.comments, null, {
                currentUserId,
                isAdmin: session?.user?.role === "ADMIN",
                postId,
              })
            )}
          </div>
        </section>
      </article>
    </div>
  );
}
