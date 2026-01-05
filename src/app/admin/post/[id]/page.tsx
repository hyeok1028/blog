// src/app/admin/post/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { updatePost, deletePost } from "@/lib/actions";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default async function AdminPostEditPage({
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

  // 2. 기존 데이터 로드
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) redirect("/");

  const categories = ["JavaScript", "TypeScript", "React", "Next.js", "MySQL"];

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            게시글 관리 허브
          </h1>
          <p className="text-slate-500 text-sm">
            작성된 글을 수정하거나 삭제할 수 있습니다.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/post/${post.id}`}>실제 글 보기</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 왼쪽: 수정 폼 (2컬럼 차지) */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>내용 수정</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData) => {
                "use server";
                await updatePost(postId, formData);
                redirect(`/post/${postId}`); // 수정 후 상세 페이지로 이동
              }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label>제목</Label>
                <Input name="title" defaultValue={post.title} required />
              </div>

              <div className="space-y-2">
                <Label>카테고리</Label>
                <select
                  name="category"
                  defaultValue={post.category}
                  className="w-full border rounded-md p-2"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>본문</Label>
                <textarea
                  name="content"
                  defaultValue={post.content}
                  className="w-full min-h-[400px] border p-4 rounded-md font-mono text-sm"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                수정 사항 저장하기
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 오른쪽: 위험 구역 (삭제 버튼) */}
        <div className="space-y-6">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-600 text-lg">
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-500 mb-4">
                게시글을 삭제하면 복구할 수 없습니다. 신중하게 결정해 주세요.
              </p>
              <form
                action={async () => {
                  "use server";
                  await deletePost(postId);
                  redirect("/"); // 삭제 후 홈으로 이동
                }}
              >
                <Button variant="destructive" className="w-full">
                  이 게시글 영구 삭제
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
