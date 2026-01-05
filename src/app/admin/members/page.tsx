// 회원관리 (목록/검색) 페이지
// src/app/admin/members/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import MembersTable, { type MemberRow } from "@/components/admin/MembersTable";

type PageProps = {
  searchParams?: Promise<{ q?: string }>;
};

export const dynamic = "force-dynamic";

export default async function MembersPage({ searchParams }: PageProps) {
  const session = await auth();

  // 1) 관리자만 접근
  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  // 2) 검색어(q) 처리
  const resolved = (await searchParams) ?? {};
  const q = (resolved.q ?? "").trim();

  // 3) 회원 목록 조회 (검색어 있으면 email/name 부분일치)
  const users: MemberRow[] = await prisma.user.findMany({
    where: q
      ? {
          OR: [{ email: { contains: q } }, { name: { contains: q } }],
        }
      : undefined,
    orderBy: { id: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
    },
    take: 200,
  });

  return (
    <div className="max-w-5xl mx-auto p-10">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">회원 관리</h1>
          <p className="text-sm text-slate-500 mt-1">
            회원 목록 확인 및 이메일/이름 검색
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href="/admin">관리자 홈</Link>
        </Button>
      </div>

      {/* 검색 폼: GET 방식으로 q 파라미터 */}
      <form className="flex gap-2 mb-6" action="/admin/members" method="GET">
        <Input
          name="q"
          placeholder="이메일 또는 이름으로 검색"
          defaultValue={q}
          className="max-w-sm"
        />
        <Button type="submit">검색</Button>
        {q && (
          <Button asChild variant="ghost">
            <Link href="/admin/members">초기화</Link>
          </Button>
        )}
      </form>

      {/* 헤더(카운트) + 테이블 */}
      <div className="mb-3 text-sm text-slate-600">
        {q ? (
          <>
            검색어 <span className="font-semibold">{q}</span> 결과:{" "}
            <span className="font-semibold">{users.length}</span>명
          </>
        ) : (
          <>
            전체 회원: <span className="font-semibold">{users.length}</span>명
          </>
        )}
      </div>

      <MembersTable users={users} />
    </div>
  );
}
