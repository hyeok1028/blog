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
  description: "Next.js 16으로 만든 개인 블로그",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const categoryRows = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { name: true },
  });
  const categories = categoryRows.map((c) => c.name);

  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="min-h-screen bg-slate-50">
          {/* 전체 컨테이너: 화면 비율 따라 여백/간격 자동 */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 md:gap-10">
              {/* 사이드바 */}
              <aside className="md:sticky md:top-6 h-fit">
                <CategorySidebar
                  categories={categories}
                  isAdmin={session?.user?.role === "ADMIN"}
                />
              </aside>

              {/* 메인 */}
              <div className="min-w-0 flex flex-col">
                {/* 상단 헤더 */}
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
                    <Button
                      size="sm"
                      asChild
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Link href="/login">로그인</Link>
                    </Button>
                  )}
                </header>

                {/* 콘텐츠 */}
                <main className="flex-1 mt-6">{children}</main>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
