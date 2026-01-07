import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
// 모던한 아이콘 사용
import {
  FileText,
  Users,
  ChevronRight,
  Plus,
  Settings,
  ShieldCheck,
  LayoutDashboard,
  Calendar,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await auth();

  // 관리자 권한 확인
  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 10, // 대시보드이므로 최근 10개만 우선 노출
  });

  const totalPostsCount = await prisma.post.count();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      {/* 상단 다크 헤더 섹션: 카테고리 보드와 통일감 부여 */}
      <header className="relative py-12 px-10 rounded-[2.5rem] bg-slate-900 overflow-hidden text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-60 h-60 bg-blue-600/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              Administrator
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-2">
              Admin <span className="text-emerald-500">Dashboard</span>
            </h1>
            <p className="text-slate-400 font-medium">
              블로그의 전체 콘텐츠와 회원을 효율적으로 관리하세요.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              asChild
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-14 px-8 font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Link href="/admin/post/new" className="flex items-center gap-2">
                <Plus className="w-5 h-5" /> 새 글 작성하기
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* 관리 퀵 카드 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 게시글 관리 카드 */}
        <div className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm hover:shadow-2xl transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">
                  게시글 관리
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  모든 포스트를 한눈에 확인하고,
                  <br />
                  수정하거나 불필요한 글을 삭제합니다.
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-4xl font-black text-slate-200 group-hover:text-emerald-100 transition-colors">
                {totalPostsCount}
              </span>
            </div>
          </div>

          <div className="mt-10">
            <Button
              asChild
              variant="outline"
              className="w-full h-12 rounded-2xl border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 font-bold transition-all"
            >
              <Link
                href="/all"
                className="flex items-center justify-center gap-2"
              >
                전체 목록 보기 <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* 회원 관리 카드 */}
        <div className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm hover:shadow-2xl transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">
                  회원 관리
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  가입된 사용자 정보를 확인하고,
                  <br />
                  권한 및 활동 상태를 관리합니다.
                </p>
              </div>
            </div>
            <Settings className="text-slate-200 w-10 h-10 group-hover:rotate-90 transition-transform duration-700" />
          </div>

          <div className="mt-10">
            <Button
              asChild
              variant="outline"
              className="w-full h-12 rounded-2xl border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 font-bold transition-all"
            >
              <Link
                href="/admin/members"
                className="flex items-center justify-center gap-2"
              >
                회원 센터 이동 <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 최근 게시글 테이블 섹션 */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
            <h3 className="text-xl font-black text-slate-900">
              최근 작성된 글
            </h3>
          </div>
          <Link
            href="/all"
            className="text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-1"
          >
            전체 보기 <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-5 font-bold text-xs text-slate-400 uppercase tracking-widest">
                  제목
                </th>
                <th className="px-10 py-5 font-bold text-xs text-slate-400 uppercase tracking-widest">
                  카테고리
                </th>
                <th className="px-10 py-5 font-bold text-xs text-slate-400 uppercase tracking-widest">
                  작성일
                </th>
                <th className="px-10 py-5 font-bold text-xs text-slate-400 uppercase tracking-widest text-right">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="px-10 py-6">
                    <span className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {post.title}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[11px] font-black group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="rounded-xl font-bold text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                    >
                      <Link href={`/admin/post/${post.id}`}>수정하기</Link>
                    </Button>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="w-12 h-12 text-slate-100" />
                      <p className="text-slate-400 font-bold">
                        작성된 게시글이 없습니다.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
