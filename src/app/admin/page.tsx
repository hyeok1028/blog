import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
// 모던한 아이콘 사용을 위해 lucide-react 임포트
import { FileText, Users, ChevronRight } from "lucide-react";

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
      {/* 헤더: 좌측 상단의 '새 글 작성' 버튼 제거 완료 */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            블로그 게시글 및 회원 관리
          </p>
        </div>
      </div>

      {/* 관리 카드 영역 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* 게시글 관리 카드: 클릭 시 /all 이동 및 아이콘 변경 */}
        <div className="group bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link href="/all" className="inline-block">
                <h2 className="text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  게시글 관리
                </h2>
              </Link>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                블로그의 모든 콘텐츠를 확인하고
                <br />
                목록에서 수정 및 삭제할 수 있습니다.
              </p>
            </div>

            {/* 모던한 이미지(아이콘)로 변경 */}
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <FileText className="w-7 h-7" />
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <Button
              asChild
              className="bg-emerald-600 hover:bg-emerald-700 rounded-full px-6"
            >
              <Link href="/admin/post/new">새 글 작성</Link>
            </Button>

            {/* 목록 보기 클릭 시 /all로 이동 */}
            <Button
              asChild
              variant="outline"
              className="rounded-full px-6 border-slate-200"
            >
              <Link href="/all" className="flex items-center gap-1">
                목록 보기 <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* 회원 관리 카드 */}
        <div className="group bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                회원 관리
              </h2>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                회원 목록 조회 및 이메일/이름 검색을
                <br />
                통해 사용자를 관리합니다.
              </p>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <Users className="w-7 h-7" />
            </div>
          </div>

          <div className="mt-8">
            <Button
              asChild
              variant="outline"
              className="rounded-full px-6 border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
            >
              <Link href="/admin/members">회원 관리로 이동</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 게시글 목록 테이블 영역 */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-8 py-5 border-b bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">최근 작성된 글</h3>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total <span className="text-emerald-600">{posts.length}</span> Posts
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-white border-b">
            <tr>
              <th className="px-8 py-4 font-bold text-sm text-slate-500 uppercase tracking-wider">
                제목
              </th>
              <th className="px-8 py-4 font-bold text-sm text-slate-500 uppercase tracking-wider">
                카테고리
              </th>
              <th className="px-8 py-4 font-bold text-sm text-slate-500 uppercase tracking-wider">
                작성일
              </th>
              <th className="px-8 py-4 font-bold text-sm text-slate-500 uppercase tracking-wider text-right">
                관리
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {posts.map((post) => (
              <tr
                key={post.id}
                className="hover:bg-slate-50 transition-colors group"
              >
                <td className="px-8 py-4 font-semibold text-slate-900">
                  {post.title}
                </td>
                <td className="px-8 py-4">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                    {post.category}
                  </span>
                </td>
                <td className="px-8 py-4 text-slate-400 text-sm">
                  {new Date(post.createdAt).toLocaleDateString()}
                </td>
                <td className="px-8 py-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-slate-400 hover:text-emerald-600"
                  >
                    <Link href={`/admin/post/${post.id}`}>수정</Link>
                  </Button>
                </td>
              </tr>
            ))}

            {posts.length === 0 && (
              <tr>
                <td colSpan={4} className="p-20 text-center text-slate-400">
                  작성된 게시글이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
