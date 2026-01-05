import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await auth();

  // 관리자 권한 확인
  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <Button asChild className="bg-emerald-600">
          <Link href="/admin/post/new">새 글 작성</Link>
        </Button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
