// src/app/layout.tsx
import type { Metadata } from "next";
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
  const categories = ["JavaScript", "TypeScript", "React", "Next.js", "MySQL"];

  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="min-h-screen bg-slate-50">
          {/* 전체 컨테이너: 화면 비율 따라 여백/간격 자동 */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 md:gap-10">
              {/* 사이드바 */}
              <aside className="md:sticky md:top-6 h-fit">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <Link href="/" className="block">
                    <h1 className="text-2xl font-bold text-emerald-700">
                      HanaLog
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">hanaro</p>
                  </Link>

                  <div className="mt-6">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                      Categories
                    </p>

                    <nav className="mt-3 flex flex-col gap-1">
                      {/* 전체보기: 앞으로 /all로 보낼 거면 여기만 /all로 바꾸면 됨 */}
                      <Link
                        href="/all"
                        className="px-3 py-2 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
                      >
                        전체보기
                      </Link>

                      {categories.map((cat) => (
                        <Link
                          key={cat}
                          href={`/category/${encodeURIComponent(cat)}`}
                          className="px-3 py-2 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
                        >
                          {cat}
                        </Link>
                      ))}
                    </nav>
                  </div>
                </div>
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
