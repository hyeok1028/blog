// src/app/layout.tsx
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import CategorySidebar from "@/components/CategorySidebar";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "hanaro 기술 블로그",
  description: "개인 기술 블로그 만들기 프로젝트",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // ✅ 전체 게시글 수
  const totalCountPromise = prisma.post.count();

  // ✅ 카테고리 목록(정렬)
  const categoriesPromise = prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { name: true },
  });

  const [totalCount, categoryRows] = await Promise.all([
    totalCountPromise,
    categoriesPromise,
  ]);

  const categories = categoryRows.map((c) => c.name);

  // ✅ 카테고리별 게시글 개수 (groupBy는 Post.category 기준)
  //    Category 테이블에 존재하지만 Post가 0개인 카테고리도 표시하려면 0으로 보정.
  const postCounts = await prisma.post.groupBy({
    by: ["category"],
    _count: { _all: true },
  });

  const countMap = new Map<string, number>();
  for (const row of postCounts) {
    countMap.set(row.category, row._count._all);
  }

  const categoryCounts = categories.map((name) => ({
    name,
    count: countMap.get(name) ?? 0,
  }));

  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="min-h-screen bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 md:gap-10">
              <aside className="md:sticky md:top-6 h-fit">
                <CategorySidebar
                  // ✅ 변경: counts 포함
                  categories={categoryCounts}
                  totalCount={totalCount}
                  isAdmin={session?.user?.role === "ADMIN"}
                />
              </aside>

              <div className="min-w-0 flex flex-col">
                <header className="h-16 bg-white border border-slate-200 rounded-2xl px-6 flex items-center justify-end shadow-sm">
                  {session ? (
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-slate-600">
                        {session.user?.email}님
                      </span>

                      {session.user?.role === "ADMIN" && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/admin">관리자</Link>
                        </Button>
                      )}
                    </div>
                  ) : (
                    <nav
                      aria-label="Auth navigation"
                      className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm"
                    >
                      <Link
                        href="/register"
                        className="rounded-full px-4 py-1.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition"
                      >
                        Sign up
                      </Link>
                      <Link
                        href="/login"
                        className="rounded-full px-4 py-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition"
                      >
                        Sign in
                      </Link>
                    </nav>
                  )}
                </header>

                <main className="flex-1 mt-6">{children}</main>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
