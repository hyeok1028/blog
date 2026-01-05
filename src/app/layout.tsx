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

  // 가이드 4번: 카테고리 분류
  const categories = ["JavaScript", "TypeScript", "React", "Next.js", "MySQL"];

  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="flex min-h-screen">
          {/* 사이드바: 블로그 이름 및 카테고리 메뉴 */}
          <aside className="w-64 bg-slate-900 text-white p-6 hidden md:block">
            <Link href="/">
              <h1 className="text-2xl font-bold mb-10 text-emerald-400">
                hanaro
              </h1>
            </Link>
            <nav className="space-y-4">
              <p className="text-xs font-semibold text-slate-500 uppercase">
                Categories
              </p>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="hover:text-emerald-400 block transition"
                  >
                    전체보기
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat}>
                    <Link
                      href={`/category/${cat}`}
                      className="hover:text-emerald-400 block transition"
                    >
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* 메인 영역 */}
          <div className="flex-1 flex flex-col bg-slate-50">
            <header className="h-16 border-b bg-white flex items-center justify-end px-8">
              {session ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-600">
                    {session.user?.email}님
                  </span>
                  {/* 관리자 기능을 위한 링크 */}
                  {session.user?.role === "ADMIN" && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/admin">관리자</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <Button size="sm" asChild>
                  <Link href="/login">로그인</Link>
                </Button>
              )}
            </header>
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
