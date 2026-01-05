export const dynamic = "force-dynamic";

import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";
import ContributionGraph from "@/components/ContributionGraph"; // 7행 x 5열 구조로 데이터 전달
import {
  Search,
  MessageSquare,
  Heart,
  LogOut,
  PlusCircle,
  Tag,
} from "lucide-react";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  const { q } = await searchParams;

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <h1 className="text-4xl font-black text-slate-900 mb-2">hanaro.log</h1>
        <Button asChild size="lg" className="rounded-full px-10 shadow-lg">
          <Link href="/login">시작하기</Link>
        </Button>
      </div>
    );
  }

  // 데이터 로드
  const allPosts = await prisma.post.findMany({
    select: { createdAt: true, updatedAt: true },
  });
  const posts = await prisma.post.findMany({
    where: q
      ? { OR: [{ title: { contains: q } }, { content: { contains: q } }] }
      : {},
    include: { _count: { select: { likes: true, comments: true } } },
    orderBy: { createdAt: "desc" },
  });

  // 잔디밭 활동 데이터 계산
  const activityMap: Record<string, number> = {};
  allPosts.forEach((post) => {
    const createdDate = post.createdAt.toISOString().split("T")[0];
    const updatedDate = post.updatedAt.toISOString().split("T")[0];
    activityMap[createdDate] = (activityMap[createdDate] || 0) + 1;
    if (createdDate !== updatedDate)
      activityMap[updatedDate] = (activityMap[updatedDate] || 0) + 1;
  });

  const categories = ["JavaScript", "TypeScript", "React", "Next.js", "MySQL"];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* 상단 네비게이션 (사이드바 대신 모든 메뉴 통합) */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link
            href="/"
            className="text-xl font-black text-emerald-600 tracking-tighter"
          >
            hanaro.log
          </Link>
          <div className="flex items-center gap-4">
            {session.user?.role === "ADMIN" && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-emerald-600"
              >
                <Link href="/admin/post/new">
                  <PlusCircle className="w-4 h-4 mr-1" /> 글쓰기
                </Link>
              </Button>
            )}
            <span className="text-sm font-bold text-slate-600">
              {session.user?.email}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button
                type="submit"
                className="p-2 text-slate-400 hover:text-red-500"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* 1달치 행/열 잔디밭 섹션 */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-5 bg-emerald-500 rounded-full" />
            <h3 className="text-lg font-bold">활동 기록 (최근 365일)</h3>
          </div>
          <Card className="p-10 border-none shadow-sm rounded-[2.5rem] bg-white flex justify-center">
            {/* 그리드 형태의 잔디밭 컴포넌트 */}
            <ContributionGraph activityData={activityMap} />
          </Card>
        </section>

        {/* 검색 및 가로형 카테고리 */}
        <div className="max-w-3xl mx-auto mb-20 text-center">
          <div className="relative mb-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-6 h-6" />
            <form action="/" method="get">
              <Input
                name="q"
                placeholder="내용 + 제목을 입력하세요..."
                className="pl-14 h-16 rounded-3xl border-none bg-white shadow-md text-xl"
                defaultValue={q}
              />
            </form>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/category/${cat}`}
                className="px-4 py-2 bg-white border border-slate-100 rounded-full text-xs font-bold text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm"
              >
                # {cat}
              </Link>
            ))}
          </div>
        </div>

        {/* 게시글 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              className="flex flex-col bg-white rounded-[2rem] border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group overflow-hidden shadow-sm"
            >
              <div className="p-8 flex-1">
                <span className="text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-4 block">
                  {post.category}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-slate-500 text-sm line-clamp-3">
                  {post.content.replace(/[#*`\-\[\]]/g, "")}
                </p>
              </div>
              <div className="px-8 py-5 bg-slate-50/50 border-t flex justify-between items-center text-slate-400">
                <span className="text-[10px] font-bold">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
                <div className="flex gap-3">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span className="text-xs">{post._count.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs">{post._count.comments}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
