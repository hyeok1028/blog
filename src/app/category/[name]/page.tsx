// src/app/category/[name]/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth"; // 세션 확인을 위해 추가
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react"; // 아이콘 추가

export const dynamic = "force-dynamic";

export default async function CategoryBoardPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const session = await auth();
  const currentUserId = session?.user?.id ? Number(session.user.id) : null;

  const resolvedParams = await params;
  const categoryName = decodeURIComponent(resolvedParams.name);

  // likes와 comments를 포함하여 조회
  const posts = await prisma.post.findMany({
    where: { category: categoryName },
    orderBy: { createdAt: "desc" },
    include: {
      author: true,
      likes: true,
      comments: true,
    },
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
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
          posts.map((post) => {
            // 내가 좋아요를 눌렀는지 확인
            const isLikedByMe = post.likes.some(
              (l) => l.userId === currentUserId
            );
            // 내가 댓글을 달았는지 확인
            const isCommentedByMe = post.comments.some(
              (c) => c.authorId === currentUserId
            );

            return (
              <Link
                href={`/post/${post.id}`}
                key={post.id}
                className="block group"
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer group-hover:border-emerald-400 relative">
                  <CardHeader>
                    <CardTitle className="group-hover:text-emerald-600 transition-colors">
                      {post.title}
                    </CardTitle>
                    <div className="flex gap-2 text-sm text-slate-400 mt-1">
                      <span>작성자: {post.author.email}</span>
                      <span>•</span>
                      <span>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-12">
                    {" "}
                    {/* 하단 아이콘 공간 확보 */}
                    <p className="text-slate-600 line-clamp-2">
                      {post.content.substring(0, 150)}...
                    </p>
                    {/* 우측 하단 좋아요/댓글 상태 */}
                    <div className="absolute bottom-4 right-6 flex items-center gap-4">
                      <div
                        className={`flex items-center gap-1.5 ${
                          isLikedByMe ? "text-red-500" : "text-slate-400"
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isLikedByMe ? "fill-red-500" : ""
                          }`}
                        />
                        <span className="text-xs font-bold">
                          {post.likes.length}
                        </span>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 ${
                          isCommentedByMe
                            ? "text-emerald-500"
                            : "text-slate-400"
                        }`}
                      >
                        <MessageCircle
                          className={`w-4 h-4 ${
                            isCommentedByMe ? "fill-emerald-500" : ""
                          }`}
                        />
                        <span className="text-xs font-bold">
                          {post.comments.length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-xl bg-white">
            <p className="text-slate-400 text-lg">
              아직 등록된 게시글이 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
