// src/app/post/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound, redirect } from "next/navigation"; // redirect 추가
import { deletePost } from "@/lib/actions"; // 1. 이 줄을 꼭 추가해야 합니다!

export const dynamic = "force-dynamic";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const resolvedParams = await params;
  const postId = Number(resolvedParams.id);

  // ... (중간 디버깅 로그 및 조회 로직은 동일) ...

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { author: true },
  });

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-10">
      <Button variant="ghost" asChild className="mb-6">
        <Link href={`/category/${post.category}`}>
          ← {post.category} 목록으로
        </Link>
      </Button>

      <article className="bg-white p-8 rounded-2xl shadow-sm border">
        <header className="mb-8 pb-8 border-b">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-4xl font-extrabold text-slate-900 leading-tight">
              {post.title}
            </h1>

            {/* 관리자 도구 */}
            {session?.user?.role === "ADMIN" && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/post/${post.id}`}>수정/관리</Link>
                </Button>

                {/* 2. 삭제 폼 수정: 버튼이 반드시 form 안에 있어야 합니다. */}
                <form
                  action={async () => {
                    "use server";
                    await deletePost(post.id);
                    redirect("/"); // 삭제 후 홈으로 이동
                  }}
                >
                  <Button variant="destructive" size="sm" type="submit">
                    삭제
                  </Button>
                </form>
              </div>
            )}
          </div>
          {/* ... 나머지 메타데이터 및 본문 영역 동일 ... */}
          <div className="flex items-center text-slate-500 text-sm gap-4">
            <span className="font-medium text-slate-700">
              작성자: {post.author.email}
            </span>
            <span>•</span>
            <span>작성일: {new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </header>

        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>
      </article>
    </div>
  );
}
