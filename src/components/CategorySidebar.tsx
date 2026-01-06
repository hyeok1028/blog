// src/components/CategorySidebar.tsx
"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { addCategory } from "@/lib/categoryActions";

export default function CategorySidebar({
  categories,
  isAdmin,
}: {
  categories: string[];
  isAdmin: boolean;
}) {
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <Link href="/" className="block">
        <h1 className="text-2xl font-bold text-emerald-700">Hanaog</h1>
        <p className="text-xs text-slate-500 mt-1">hanaro</p>
      </Link>

      <div className="mt-6">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
          Categories
        </p>

        <nav className="mt-3 flex flex-col gap-1">
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

          {/* ✅ ADMIN에게만 노출 */}
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setOpen((v) => !v);
                }}
                className="mt-2 px-3 py-2 rounded-lg text-left text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
              >
                + Add Category
              </button>

              {open && (
                <form
                  className="mt-2 p-3 rounded-xl border border-slate-200 bg-slate-50"
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
                  <label
                    htmlFor={inputId}
                    className="block text-xs font-medium text-slate-600 mb-2"
                  >
                    새 카테고리 이름
                  </label>

                  <input
                    id={inputId}
                    name="name"
                    placeholder="예: Spring"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-emerald-400"
                  />

                  {error && (
                    <p className="text-xs text-red-500 mt-2">{error}</p>
                  )}

                  <div className="flex gap-2 mt-3">
                    <button
                      type="submit"
                      disabled={pending}
                      className="h-9 px-3 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-60 transition"
                    >
                      {pending ? "추가 중..." : "추가"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:border-slate-300 transition"
                    >
                      취소
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </nav>
      </div>
    </div>
  );
}
