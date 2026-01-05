import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { updatePost, deletePost, deleteComment } from "@/lib/actions";
import { redirect, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Heart, MessageCircle, Trash2, CornerDownRight } from "lucide-react";

export default async function AdminPostEditHub({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  const postId = Number(id);

  // 1. 관리자 권한 체크
  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  // 2. 기존 데이터 및 상호작용(좋아요/댓글) 데이터 로드
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      likes: true,
      comments: {
        include: { author: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!post) notFound();

  const categories = ["JavaScript", "TypeScript", "React", "Next.js", "MySQL"];

  return (
    <div className="p-10 max-w-6xl mx-auto">
      {/* 상단 헤더 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            게시글 관리 허브
          </h1>
          <p className="text-slate-500 mt-1">
            콘텐츠 수정 및 사용자 반응을 관리합니다.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/post/${post.id}`}>실제 게시글 보기</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽 섹션: 콘텐츠 수정 폼 */}
        <div className="lg:col-span-2 space-y-8">
          <Card shadow-sm>
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle>에디터</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form
                action={async (formData) => {
                  "use server";
                  await updatePost(postId, formData);
                  redirect(`/post/${postId}`);
                }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="title">제목</Label>
                  <Input
                    name="title"
                    id="title"
                    defaultValue={post.title}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">카테고리</Label>
                  <select
                    name="category"
                    id="category"
                    defaultValue={post.category}
                    className="w-full border rounded-md p-2 bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">본문 (Markdown)</Label>
                  <textarea
                    name="content"
                    id="content"
                    defaultValue={post.content}
                    className="w-full min-h-[500px] border p-4 rounded-md font-mono text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  수정 사항 저장 및 게시
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* 댓글 관리 섹션 (병합된 부분) */}
          <Card>
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                댓글 관리 ({post.comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {post.comments.length === 0 && (
                  <p className="text-center text-slate-400 py-10">
                    아직 댓글이 없습니다.
                  </p>
                )}
                {post.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-4 rounded-lg border ${
                      comment.parentId ? "ml-8 bg-slate-50" : "bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2 mb-2">
                        {comment.parentId && (
                          <CornerDownRight className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="font-bold text-sm">
                          {comment.author.email}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <form
                        action={async () => {
                          "use server";
                          await deleteComment(comment.id);
                        }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          type="submit"
                          className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </form>
                    </div>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap pl-1">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 오른쪽 섹션: 통계 및 위험 구역 */}
        <div className="space-y-6">
          {/* 상호작용 요약 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-slate-700">
                상호작용 요약
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg text-pink-700">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 fill-pink-500" />
                  <span className="font-semibold">공감 수</span>
                </div>
                <span className="text-xl font-bold">{post.likes.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg text-blue-700">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 fill-blue-500" />
                  <span className="font-semibold">총 댓글</span>
                </div>
                <span className="text-xl font-bold">
                  {post.comments.length}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 위험 구역 */}
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="text-red-600 text-lg">
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-red-500 mb-4 leading-relaxed">
                이 게시글을 삭제하면 연관된 모든 좋아요와 댓글 데이터가 영구히
                삭제되며 복구할 수 없습니다.
              </p>
              <form
                action={async () => {
                  "use server";
                  await deletePost(postId);
                  redirect("/admin");
                }}
              >
                <Button variant="destructive" className="w-full font-bold">
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
