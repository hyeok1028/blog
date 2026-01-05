import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { deletePost } from "@/lib/actions";

// 마크다운 및 코드 하이라이팅 관련 라이브러리
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { PrismTheme } from "react-syntax-highlighter";
import type { CSSProperties } from "react";

export const dynamic = "force-dynamic";

// ✅ 핵심: style 타입을 확정 (오버로드/union 문제 방지)
const prismStyle = vscDarkPlus as unknown as Record<string, CSSProperties>;

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const resolvedParams = await params;
  const postId = Number(resolvedParams.id);

  if (!Number.isFinite(postId)) notFound();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { author: true },
  });

  if (!post) notFound();

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

            {session?.user?.role === "ADMIN" && (
              <div className="flex gap-2">
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

          <div className="flex items-center text-slate-500 text-sm gap-4">
            <span className="font-medium text-slate-700">
              작성자: {post.author.email}
            </span>
            <span>•</span>
            <span>작성일: {new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </header>

        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const codeText = String(children).replace(/\n$/, "");

                // ✅ react-markdown에서는 inline 구분이 애매할 수 있어
                // language-xxx가 있으면 code block으로 취급하는 방식이 가장 안전
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

                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
