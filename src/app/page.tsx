// src/app/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import ContributionGraph from "@/components/ContributionGraph";

export default async function HomePage() {
  const session = await auth(); // 서버 사이드에서 세션 확인

  // 1. 로그인하지 않은 경우 처리
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">hanaro 기술 블로그</h1>
        <p>로그인이 필요한 서비스입니다.</p>
        <Button asChild>
          <Link href="/login">로그인하러 가기</Link>
        </Button>
      </div>
    );
  }

  // 2. 잔디밭을 위한 활동 데이터 추출 (가이드 5번 항목)
  const posts = await prisma.post.findMany({
    select: {
      createdAt: true,
      updatedAt: true,
    },
  });

  const activityMap: Record<string, number> = {};

  posts.forEach((post) => {
    const createdDate = post.createdAt.toISOString().split("T")[0];
    const updatedDate = post.updatedAt.toISOString().split("T")[0];

    activityMap[createdDate] = (activityMap[createdDate] || 0) + 1;
    // 수정일이 작성일과 다를 경우에만 추가 카운트
    if (createdDate !== updatedDate) {
      activityMap[updatedDate] = (activityMap[updatedDate] || 0) + 1;
    }
  });

  const categories = ["JavaScript", "TypeScript", "React", "Next.js", "MySQL"];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* 사이드바: 카테고리 분류 (가이드 4번 항목) */}
      <aside className="w-64 bg-white border-r p-6 hidden md:block">
        <h2 className="text-xl font-bold mb-6 text-blue-600">hanaro Blog</h2>
        <nav className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Categories
          </p>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/category/${cat}`}
              className="block p-2 hover:bg-slate-100 rounded-md transition-colors text-slate-700"
            >
              {cat}
            </Link>
          ))}
        </nav>
      </aside>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">전체보기</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {session.user?.email} ({session.user?.role})
            </span>
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <Button variant="outline" size="sm">
                로그아웃
              </Button>
            </form>
          </div>
        </header>

        {/* 잔디밭 영역 (가이드 5번 항목 구현 완료) */}
        <section className="mb-10">
          <Card className="p-6 overflow-x-auto">
            <h3 className="text-sm font-medium mb-4">활동 기록 (잔디밭)</h3>
            <ContributionGraph activityData={activityMap} />
          </Card>
        </section>

        {/* 게시글 목록 영역 (가이드 6번 항목) */}
        <section>
          <div className="grid gap-4">
            {/* 추후 게시글 리스트가 들어올 자리입니다. */}
            <p className="text-slate-500 text-center py-20">
              아직 작성된 게시글이 없습니다.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
