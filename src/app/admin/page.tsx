// src/app/admin/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await auth();

  // 관리자 권한 확인
  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="p-10 max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            게시글 및 회원 관리를 한 곳에서 진행합니다.
          </p>
        </div>

        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/admin/post/new">새 글 작성</Link>
        </Button>
      </div>

      {/* 관리 카드 2개 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* 게시글 관리 카드 */}
        <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                게시글 관리
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                글을 작성하고 목록에서 수정할 수 있습니다.
              </p>
            </div>

            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              ✍️
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/admin/post/new">새 글 작성</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href="/admin">목록 보기</Link>
            </Button>
          </div>
        </div>

        {/* 회원 관리 카드 */}
        <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                회원 관리
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                회원 목록 조회 및 이메일/이름 검색을 지원합니다.
              </p>
            </div>

            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              👤
            </div>
          </div>

          <div className="mt-6">
            <Button
              asChild
              className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
            >
              <Link href="/admin/members">회원 관리로 이동</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 게시글 목록 테이블 */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="text-sm text-slate-600">
            최근 게시글 <span className="font-semibold">{posts.length}</span>개
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 font-semibold">제목</th>
              <th className="p-4 font-semibold">카테고리</th>
              <th className="p-4 font-semibold">작성일</th>
              <th className="p-4 font-semibold text-right">관리</th>
            </tr>
          </thead>

          <tbody>
            {posts.map((post) => (
              <tr
                key={post.id}
                className="border-b hover:bg-slate-50 transition"
              >
                <td className="p-4 font-medium">{post.title}</td>
                <td className="p-4 text-slate-500">{post.category}</td>
                <td className="p-4 text-slate-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/post/${post.id}`}>수정</Link>
                  </Button>
                </td>
              </tr>
            ))}

            {posts.length === 0 && (
              <tr>
                <td colSpan={4} className="p-10 text-center text-slate-500">
                  게시글이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
