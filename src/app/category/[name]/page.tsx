// src/app/category/[name]/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
// ✅ Hash와 Plus를 임포트 목록에 추가했습니다.
import {
  Heart,
  MessageCircle,
  Clock,
  Calendar,
  ChevronRight,
  Hash,
  Plus,
} from "lucide-react";

export const dynamic = "force-dynamic";

// 읽기 소요 시간 계산 함수
function getReadTime(content: string) {
  const wordsPerMinute = 200;
  const minutes = Math.ceil(content.length / wordsPerMinute);
  return minutes;
}

export default async function CategoryBoardPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const session = await auth();
  const currentUserId = session?.user?.id ? Number(session.user.id) : null;

  const resolvedParams = await params;
  const categoryName = decodeURIComponent(resolvedParams.name);

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
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      {/* 상단 헤더 섹션 */}
      <header className="relative py-12 px-8 rounded-3xl bg-slate-900 overflow-hidden text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-60 h-60 bg-emerald-600/10 rounded-full blur-2xl" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-4">
            {/* ✅ 직접 만든 Hash 대신 lucide 아이콘 사용 */}
            <Hash className="w-3 h-3" aria-hidden="true" />
            Category
          </div>
          <h2 className="text-4xl font-black tracking-tight mb-2">
            {categoryName} <span className="text-emerald-500">Board</span>
          </h2>
          <p className="text-slate-400 font-medium">
            현재 <span className="text-white font-bold">{posts.length}</span>
            개의 지식이 공유되고 있습니다.
          </p>
        </div>
      </header>

      {/* 게시글 리스트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.length > 0 ? (
          posts.map((post) => {
            const isLikedByMe = post.likes.some(
              (l) => l.userId === currentUserId
            );
            const isCommentedByMe = post.comments.some(
              (c) => c.authorId === currentUserId
            );
            const readTime = getReadTime(post.content);

            return (
              <Link href={`/post/${post.id}`} key={post.id} className="group">
                <Card className="h-full border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 rounded-3xl overflow-hidden bg-white">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.createdAt).toLocaleDateString()}
                        <span className="mx-1">•</span>
                        <Clock className="w-3 h-3" />약 {readTime}분 소요
                      </div>
                    </div>
                    <CardTitle className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1 leading-snug">
                      {post.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6">
                      {post.content.replace(/[#*`]/g, "").substring(0, 180)}
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100">
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              isLikedByMe
                                ? "fill-red-500 text-red-500"
                                : "text-slate-400"
                            }`}
                          />
                          <span
                            className={`text-xs font-bold ${
                              isLikedByMe ? "text-red-600" : "text-slate-500"
                            }`}
                          >
                            {post.likes.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100">
                          <MessageCircle
                            className={`w-3.5 h-3.5 ${
                              isCommentedByMe
                                ? "fill-emerald-500 text-emerald-500"
                                : "text-slate-400"
                            }`}
                          />
                          <span
                            className={`text-xs font-bold ${
                              isCommentedByMe
                                ? "text-emerald-600"
                                : "text-slate-500"
                            }`}
                          >
                            {post.comments.length}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs group-hover:gap-2 transition-all">
                        Read More <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full py-24 border-2 border-dashed border-slate-200 rounded-[40px] bg-white flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              {/* ✅ Plus 아이콘도 이제 정상적으로 인식됩니다. */}
              <Plus className="w-8 h-8 text-slate-300" aria-hidden="true" />
            </div>
            <p className="text-slate-400 font-bold text-lg">
              아직 등록된 지식이 없습니다.
            </p>
            <p className="text-slate-300 text-sm mt-1">
              첫 번째 주인공이 되어보세요!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
