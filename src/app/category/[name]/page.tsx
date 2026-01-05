// src/app/category/[name]/page.tsx
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link"; // 1. Link 컴포넌트 추가

export const dynamic = "force-dynamic";

export default async function CategoryBoardPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const resolvedParams = await params;
  const categoryName = decodeURIComponent(resolvedParams.name);

  const posts = await prisma.post.findMany({
    where: {
      category: categoryName,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: true,
    },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">
          {categoryName} 게시판
        </h2>
        <p className="text-slate-500 mt-2">
          총 {posts.length}개의 포스트가 있습니다.
        </p>
      </div>

      <div className="grid gap-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            /* 2. 게시글 상세 페이지로 연결되는 Link 추가 */
            <Link
              href={`/post/${post.id}`}
              key={post.id}
              className="block group"
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer group-hover:border-emerald-400">
                <CardHeader>
                  <CardTitle className="group-hover:text-emerald-600 transition-colors">
                    {post.title}
                  </CardTitle>
                  <div className="flex gap-2 text-sm text-slate-400 mt-1">
                    <span>작성자: {post.author.email}</span>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 line-clamp-2">
                    {post.content.substring(0, 150)}...
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-xl bg-white">
            <p className="text-slate-400 text-lg">
              아직 이 카테고리에 등록된 게시글이 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
