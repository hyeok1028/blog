"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { registerUser } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, ShieldCheck, ArrowRight } from "lucide-react";

type RoleValue = "USER" | "ADMIN";

export default function RegisterForm() {
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const roleId = useId();

  const [msg, setMsg] = useState<string>("");
  const [pending, setPending] = useState<boolean>(false);
  const [showAdmin, setShowAdmin] = useState<boolean>(false);
  const [role, setRole] = useState<RoleValue>("USER");

  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setMsg("");

    // 현재 선택된 role 반영
    formData.set("role", role);

    const result = await registerUser(formData);

    if (result?.error) {
      setMsg(result.error);
      setPending(false);
      return;
    }

    setPending(false);
    router.push("/login");
  }

  return (
    <Card className="max-w-5xl mx-auto overflow-hidden rounded-3xl border-slate-100 shadow-xl bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-11">
        {/* Left: 브랜드 섹션 (4/11 비율) */}
        <div className="hidden lg:flex lg:col-span-4 bg-slate-50 p-12 flex-col justify-between border-r border-slate-50">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold tracking-tight">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              HanaLog Beta
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 leading-[1.1]">
              Share your <br />
              <span className="text-emerald-600">Knowledge.</span>
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              간결함이 힘이다. <br />
              복잡한 설정 없이 당신의 기술적 여정을 기록하세요.
            </p>
          </div>

          <div className="space-y-5">
            {[
              {
                text: "Markdown 기반의 쾌적한 에디터",
                icon: <ArrowRight className="w-4 h-4" />,
              },
              {
                text: "깔끔한 카테고리 관리 기능",
                icon: <ArrowRight className="w-4 h-4" />,
              },
              {
                text: "개발자 친화적인 코드 하이라이팅",
                icon: <ArrowRight className="w-4 h-4" />,
              },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-3 text-sm font-medium text-slate-600"
              >
                <span className="p-1 rounded-md bg-white border border-slate-100 shadow-sm text-emerald-500">
                  {item.icon}
                </span>
                {item.text}
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-400">
            © 2026 Hana.log — Built for developers.
          </div>
        </div>

        {/* Right: 회원가입 폼 (7/11 비율) */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16">
          <CardHeader className="p-0 mb-10">
            <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">
              Create Account
            </CardTitle>
            <p className="mt-2 text-slate-400 font-medium">
              이름과 이메일을 입력하여 성장을 시작하세요.
            </p>
          </CardHeader>

          <CardContent className="p-0">
            <form action={handleSubmit} className="space-y-6">
              {/* 이름 필드 추가 */}
              <div className="space-y-2">
                <Label
                  htmlFor={nameId}
                  className="text-[13px] font-bold text-slate-700 ml-1"
                >
                  이름
                </Label>
                <div className="relative group">
                  <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <Input
                    id={nameId}
                    name="name"
                    type="text"
                    placeholder="홍길동"
                    required
                    className="h-12 pl-12 rounded-2xl border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor={emailId}
                  className="text-[13px] font-bold text-slate-700 ml-1"
                >
                  이메일
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <Input
                    id={emailId}
                    name="email"
                    type="email"
                    placeholder="example@mail.com"
                    required
                    className="h-12 pl-12 rounded-2xl border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor={passwordId}
                  className="text-[13px] font-bold text-slate-700 ml-1"
                >
                  비밀번호
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <Input
                    id={passwordId}
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="h-12 pl-12 rounded-2xl border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                  />
                </div>
              </div>

              {/* 관리자 토글 */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdmin((v) => !v)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {showAdmin
                    ? "관리자 설정 닫기"
                    : "관리자 계정으로 가입하시나요?"}
                </button>

                {showAdmin && (
                  <div className="mt-4 p-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor={roleId}
                        className="text-sm font-bold text-emerald-800"
                      >
                        가입 권한
                      </Label>
                      <select
                        id={roleId}
                        name="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value as RoleValue)}
                        className="h-10 rounded-xl border border-emerald-200 bg-white px-3 text-sm font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="USER">일반 사용자</option>
                        <option value="ADMIN">시스템 관리자</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {msg && (
                <div className="p-4 rounded-2xl border border-red-100 bg-red-50 text-[13px] font-medium text-red-600 animate-in zoom-in-95">
                  ⚠️ {msg}
                </div>
              )}

              <Button
                type="submit"
                disabled={pending}
                className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-lg transition-all shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50"
              >
                {pending ? (
                  <span className="flex items-center gap-2">
                    계정 생성 중...
                  </span>
                ) : (
                  "Get Started Free"
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-[14px] text-slate-500 pt-2">
                <span>이미 계정이 있으신가요?</span>
                <Link
                  href="/login"
                  className="font-bold text-slate-900 hover:text-emerald-600 underline underline-offset-4 decoration-slate-200 hover:decoration-emerald-500 transition-all"
                >
                  로그인하기
                </Link>
              </div>
            </form>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
