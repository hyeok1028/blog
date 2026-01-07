// src/components/CategorySidebar.tsx
"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { usePathname } from "next/navigation"; // 현재 경로 확인용
import { addCategory } from "@/lib/categoryActions";
import { Folder, Hash, Plus, ChevronRight, LayoutGrid } from "lucide-react"; // 아이콘 추가

type CategoryCount = {
  name: string;
  count: number;
};

export default function CategorySidebar({
  categories,
  totalCount,
  isAdmin,
}: {
  categories: CategoryCount[];
  totalCount: number;
  isAdmin: boolean;
}) {
  const inputId = useId();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 현재 링크가 활성화되었는지 확인하는 함수
  const isActive = (href: string) => pathname === href;

  return (
    <aside className="sticky top-10 flex flex-col gap-8 w-full max-w-[260px]">
      {/* 로고 영역 */}
      <div className="px-2">
        <Link href="/" className="group inline-block">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold group-hover:bg-emerald-500 transition-colors">
              H
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Hana.log
            </h1>
          </div>
          <p className="text-[11px] font-bold text-emerald-600/60 uppercase tracking-widest pl-10">
            hanaro tech
          </p>
        </Link>
      </div>

      {/* 내비게이션 영역 */}
      <nav className="flex flex-col gap-1">
        <div className="px-3 mb-2">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            Categories
          </p>
        </div>

        {/* 전체보기 */}
        <Link
          href="/all"
          className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
            isActive("/all")
              ? "bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100/50"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-3">
            <LayoutGrid
              className={`w-4 h-4 ${
                isActive("/all")
                  ? "text-emerald-600"
                  : "text-slate-400 group-hover:text-slate-600"
              }`}
            />
            <span className="text-[14px] font-bold">전체보기</span>
          </div>
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              isActive("/all")
                ? "bg-emerald-200/50 text-emerald-800"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {totalCount}
          </span>
        </Link>

        {/* 카테고리 목록 */}
        <div className="mt-1 space-y-1">
          {categories.map((cat) => {
            const href = `/category/${encodeURIComponent(cat.name)}`;
            const active = isActive(href);
            return (
              <Link
                key={cat.name}
                href={href}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  active
                    ? "bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100/50"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Hash
                    className={`w-4 h-4 ${
                      active
                        ? "text-emerald-600"
                        : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  <span className="text-[14px] font-bold">{cat.name}</span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    active
                      ? "bg-emerald-200/50 text-emerald-800"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {cat.count}
                </span>
              </Link>
            );
          })}
        </div>

        {/* 관리자 카테고리 추가 */}
        {isAdmin && (
          <div className="mt-4 px-2">
            {!open ? (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] font-bold text-slate-400 hover:text-emerald-600 transition-colors group"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            ) : (
              <form
                className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 animate-in fade-in slide-in-from-top-2"
                action={async (formData) => {
                  setPending(true);
                  setError(null);
                  const res = await addCategory(formData);
                  if (res?.error) {
                    setError(res.error);
                    setPending(false);
                    return;
                  }
                  setPending(false);
                  setOpen(false);
                }}
              >
                <input
                  id={inputId}
                  name="name"
                  placeholder="카테고리명..."
                  className="w-full h-10 px-3 rounded-xl border border-emerald-100 bg-white text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                {error && (
                  <p className="text-[11px] text-red-500 mt-2 font-medium">
                    {error}
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <button
                    type="submit"
                    disabled={pending}
                    className="flex-1 h-8 rounded-lg bg-emerald-600 text-white text-[12px] font-bold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {pending ? "..." : "추가"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 text-[12px] font-bold hover:bg-slate-50"
                  >
                    취소
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </nav>
    </aside>
  );
}
