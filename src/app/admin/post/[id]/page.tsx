// src/app/admin/post/[id]/page.tsx
// 관리자용 게시글 수정/관리 페이지
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { updatePost, deletePost, deleteComment } from "@/lib/actions";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import {
  ArrowLeft,
  Eye,
  Save,
  Heart,
  MessageCircle,
  PencilLine,
  Trash2,
  CornerDownRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPostEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const { id } = await params;
  const postId = Number(id);
  if (!Number.isFinite(postId)) notFound();

  // 카테고리 목록 (DB 기반)
  const categoryRows = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { name: true },
  });
  const categories = categoryRows.map((c) => c.name);

  // 게시글 + 상호작용 + 댓글(작성자 포함)
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: true,
      likes: true,
      comments: {
        include: { author: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!post) notFound();

  // 메타 표시
  const createdAt = new Date(post.createdAt);
  const updatedAt = new Date(post.updatedAt);
  const isPostEdited = updatedAt.getTime() > createdAt.getTime();

  return (
    <div className="mx-auto max-w-6xl p-6 sm:p-10 space-y-6">
      {/* 상단 액션바 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <PencilLine className="h-5 w-5 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              게시글 수정/관리
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              수정 후 저장하면 상세 페이지로 돌아갑니다.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
          <Button variant="outline" asChild className="rounded-xl">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              관리자 홈
            </Link>
          </Button>

          <Button variant="outline" asChild className="rounded-xl">
            <Link href={`/post/${post.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              미리보기
            </Link>
          </Button>

          {/* 저장 버튼은 폼 안에 있지만, UX상 상단에 하나 더 두는 게 인기 패턴입니다.
              아래는 form="edit-form"로 폼 submit 트리거 */}
          <Button
            type="submit"
            form="edit-form"
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
          >
            <Save className="h-4 w-4 mr-2" />
            저장
          </Button>
        </div>
      </div>

      {/* 본문 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 에디터 */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="border-b bg-slate-50/60 rounded-t-2xl">
              <CardTitle className="text-slate-900">에디터</CardTitle>
            </CardHeader>

            <CardContent className="pt-6">
              <form
                id="edit-form"
                action={async (formData) => {
                  "use server";
                  await updatePost(postId, formData);
                  redirect(`/post/${postId}`);
                }}
                className="space-y-6"
              >
                {/* 제목 */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-700">
                    제목
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={post.title}
                    required
                    className="rounded-xl"
                  />
                </div>

                {/* 카테고리 */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-slate-700">
                    카테고리
                  </Label>
                  <select
                    id="category"
                    name="category"
                    defaultValue={post.category}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-400"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400">
                    카테고리는 사이드바에 노출됩니다.
                  </p>
                </div>

                {/* 본문 */}
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-slate-700">
                    본문 (Markdown)
                  </Label>
                  <textarea
                    id="content"
                    name="content"
                    defaultValue={post.content}
                    required
                    className="w-full min-h-[520px] rounded-2xl border border-slate-200 bg-white p-4 font-mono text-sm outline-none focus:border-emerald-400"
                    placeholder="마크다운으로 내용을 작성하세요."
                  />
                  <p className="text-xs text-slate-400">
                    코드 블록은 ```language 형태로 작성하면 하이라이팅됩니다.
                  </p>
                </div>

                {/* 하단 저장 버튼 */}
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    저장 후 상세 페이지로 이동
                  </Button>

                  <Button variant="outline" asChild className="rounded-xl">
                    <Link href={`/post/${post.id}`}>취소</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* 댓글 관리 */}
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="border-b bg-slate-50/60 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <MessageCircle className="h-5 w-5" />
                댓글 관리
                <span className="text-sm font-semibold text-slate-400">
                  ({post.comments.length})
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-6">
              {post.comments.length === 0 ? (
                <div className="text-center py-10 rounded-2xl border border-dashed bg-white">
                  <p className="text-slate-400">아직 댓글이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {post.comments.map((comment) => {
                    const isDeleted = comment.content === "삭제된 댓글입니다";
                    const isEdited =
                      !isDeleted &&
                      new Date(comment.updatedAt).getTime() >
                        new Date(comment.createdAt).getTime();

                    return (
                      <div
                        key={comment.id}
                        className={[
                          "rounded-2xl border p-4",
                          comment.parentId
                            ? "ml-8 bg-slate-50/60 border-slate-200"
                            : "bg-white border-slate-200",
                        ].join(" ")}
                      >
                        <div className="flex justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {comment.parentId && (
                                <CornerDownRight className="h-4 w-4 text-slate-400" />
                              )}

                              <span className="text-sm font-bold text-slate-900">
                                {isDeleted
                                  ? "알 수 없음"
                                  : comment.author.email}
                              </span>

                              <span className="text-xs text-slate-400">
                                {new Date(comment.createdAt).toLocaleString()}
                              </span>

                              {isEdited && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                                  <PencilLine className="h-3 w-3" />
                                  수정됨
                                </span>
                              )}
                            </div>
                          </div>

                          {/* 삭제 버튼 (관리자: 항상 노출 가능, 단 삭제 정책은 actions.ts에서 처리됨) */}
                          {!isDeleted && (
                            <form
                              action={async () => {
                                "use server";
                                await deleteComment(comment.id);
                                // deleteComment 내부에서 revalidatePath 처리
                              }}
                            >
                              <Button
                                type="submit"
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50"
                                aria-label="댓글 삭제"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </form>
                          )}
                        </div>

                        <p
                          className={[
                            "mt-2 text-sm leading-relaxed whitespace-pre-wrap",
                            isDeleted
                              ? "text-slate-300 italic"
                              : "text-slate-700",
                          ].join(" ")}
                        >
                          {comment.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 오른쪽: 메타/통계 + Danger Zone */}
        <div className="space-y-6">
          {/* 메타 */}
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="border-b bg-slate-50/60 rounded-t-2xl">
              <CardTitle className="text-slate-900">게시글 정보</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-400">작성자</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {post.author.email}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-400">작성일</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {createdAt.toLocaleString()}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-400">수정일</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {isPostEdited ? updatedAt.toLocaleString() : "수정 이력 없음"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Heart className="h-5 w-5" />
                    <span className="text-sm font-semibold">좋아요</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-800 mt-2">
                    {post.likes.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-slate-700">
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm font-semibold">댓글</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    {post.comments.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="rounded-2xl border-red-200 bg-red-50/40 shadow-sm">
            <CardHeader className="border-b border-red-200/60 bg-red-50/60 rounded-t-2xl">
              <CardTitle className="text-red-700">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-xs text-red-600 leading-relaxed mb-4">
                게시글을 삭제하면 연관된 데이터가 함께 정리됩니다. (좋아요/댓글
                관계가 onDelete Cascade로 설정되어 있다면 연쇄 삭제가 발생할 수
                있습니다.)
              </p>

              <form
                action={async () => {
                  "use server";
                  await deletePost(postId);
                  redirect("/admin");
                }}
              >
                <Button
                  type="submit"
                  variant="destructive"
                  className="w-full rounded-xl font-bold"
                >
                  게시글 영구 삭제
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
