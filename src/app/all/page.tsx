// 전체보기
// src/app/all/page.tsx

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{
    page?: string;
    size?: string; // 10, 20, 30
  }>;
};

function toInt(value: string | undefined, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function buildPages(current: number, total: number) {
  // 모던하게: 현재 기준 좌우 2개씩만 보여주기
  const start = Math.max(1, current - 2);
  const end = Math.min(total, current + 2);
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
}

export default async function AllPostsPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const page = toInt(sp.page, 1);
  const size = Math.min(30, Math.max(10, toInt(sp.size, 10))); // 10~30

  const total = await prisma.post.count();
  const totalPages = Math.max(1, Math.ceil(total / size));
  const safePage = Math.min(page, totalPages);

  if (page !== safePage) {
    redirect(`/all?page=${safePage}&size=${size}`);
  }

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    skip: (safePage - 1) * size,
    take: size,
    select: {
      id: true,
      title: true,
      category: true,
      createdAt: true,
    },
  });

  const makeUrl = (p: number, s = size) => `/all?page=${p}&size=${s}`;
  const pages = buildPages(safePage, totalPages);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            전체보기
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            총 <span className="font-semibold text-slate-700">{total}</span>
            개의 글
          </p>
        </div>

        <Link
          href="/"
          className="text-sm text-slate-500 hover:text-emerald-700 transition mt-1"
        >
          닫기
        </Link>
      </div>

      {/* Controls */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-sm text-slate-500">
          <span className="font-medium text-slate-700">{safePage}</span> /{" "}
          {totalPages} 페이지
        </div>

        {/* size 변경은 서버 컴포넌트라 form submit 방식 */}
        <form action="/all" method="GET" className="flex items-center gap-2">
          <input type="hidden" name="page" value="1" />
          <select
            name="size"
            defaultValue={String(size)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-400"
          >
            <option value="10">10개 보기</option>
            <option value="20">20개 보기</option>
            <option value="30">30개 보기</option>
          </select>
          <button
            type="submit"
            className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:border-emerald-300 hover:text-emerald-700 transition"
          >
            적용
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-[1fr_140px_140px] px-6 py-3 text-sm text-slate-500 border-b bg-slate-50">
          <div>글 제목</div>
          <div className="text-right">카테고리</div>
          <div className="text-right">작성일</div>
        </div>

        {posts.length === 0 ? (
          <div className="px-6 py-16 text-center text-slate-500">
            아직 작성된 글이 없습니다.
          </div>
        ) : (
          posts.map((p) => (
            <Link
              key={p.id}
              href={`/post/${p.id}`}
              className="grid grid-cols-[1fr_140px_140px] px-6 py-4 border-b last:border-b-0 hover:bg-emerald-50/40 transition"
            >
              <div className="min-w-0">
                <div className="font-medium text-slate-900 truncate">
                  {p.title}
                </div>
              </div>

              <div className="text-right text-sm text-slate-600">
                {p.category}
              </div>

              <div className="text-right text-sm text-slate-500">
                {new Date(p.createdAt).toLocaleDateString()}
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="text-sm text-slate-500">
          {total > 0 && (
            <>
              {(safePage - 1) * size + 1}–{Math.min(safePage * size, total)} /{" "}
              {total}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={makeUrl(Math.max(1, safePage - 1))}
            className={[
              "h-9 px-3 inline-flex items-center rounded-lg border text-sm transition",
              safePage === 1
                ? "pointer-events-none opacity-40 bg-white border-slate-200 text-slate-400"
                : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700",
            ].join(" ")}
          >
            이전
          </Link>

          <div className="flex items-center gap-1">
            {pages[0] > 1 && (
              <>
                <Link
                  href={makeUrl(1)}
                  className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:border-emerald-300 hover:text-emerald-700 transition"
                >
                  1
                </Link>
                <span className="px-1 text-slate-400">…</span>
              </>
            )}

            {pages.map((n) => (
              <Link
                key={n}
                href={makeUrl(n)}
                className={[
                  "h-9 w-9 inline-flex items-center justify-center rounded-lg border text-sm transition",
                  n === safePage
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700",
                ].join(" ")}
              >
                {n}
              </Link>
            ))}

            {pages[pages.length - 1] < totalPages && (
              <>
                <span className="px-1 text-slate-400">…</span>
                <Link
                  href={makeUrl(totalPages)}
                  className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:border-emerald-300 hover:text-emerald-700 transition"
                >
                  {totalPages}
                </Link>
              </>
            )}
          </div>

          <Link
            href={makeUrl(Math.min(totalPages, safePage + 1))}
            className={[
              "h-9 px-3 inline-flex items-center rounded-lg border text-sm transition",
              safePage === totalPages
                ? "pointer-events-none opacity-40 bg-white border-slate-200 text-slate-400"
                : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700",
            ].join(" ")}
          >
            다음
          </Link>
        </div>
      </div>
    </div>
  );
}
