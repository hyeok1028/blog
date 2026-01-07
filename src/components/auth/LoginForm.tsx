"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // 1. useRouter 추가
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Github, ArrowRight, Loader2 } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // 2. router 초기화

  // 이메일 로그인 핸들러
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // 자동 리다이렉트를 끄고 수동으로 제어
      });

      if (result?.error) {
        // 로그인 실패 시 처리
        alert("로그인 정보가 올바르지 않습니다.");
      } else {
        // 3. 로그인 성공 시 메인으로 이동 및 페이지 새로고침
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Login Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Github 로그인 핸들러
  const handleGithubLogin = () => {
    signIn("github", { callbackUrl: "/" });
  };

  return (
    <Card className="max-w-5xl mx-auto overflow-hidden rounded-3xl border-slate-100 shadow-xl bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-11">
        {/* Left: 브랜드 섹션 */}
        <div className="hidden lg:flex lg:col-span-4 bg-slate-50 p-12 flex-col justify-between border-r border-slate-50">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold tracking-tight">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Welcome Back
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 leading-[1.1]">
              Keep <br />
              <span className="text-emerald-600">Growing.</span>
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              다시 오신 것을 환영합니다. <br />
              당신의 지식을 이어나가 보세요.
            </p>
          </div>

          <div className="space-y-5">
            {[
              {
                text: "작성 중인 임시글 확인",
                icon: <ArrowRight className="w-4 h-4" />,
              },
              {
                text: "구독 중인 카테고리 업데이트",
                icon: <ArrowRight className="w-4 h-4" />,
              },
              {
                text: "새로운 댓글 및 공감 알림",
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
            © 2026 Hana.log — Private Tech Blog.
          </div>
        </div>

        {/* Right: 로그인 폼 */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16">
          <CardHeader className="p-0 mb-10">
            <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">
              Sign in
            </CardTitle>
            <p className="mt-2 text-slate-400 font-medium">
              등록된 이메일 계정으로 로그인하세요.
            </p>
          </CardHeader>

          <CardContent className="p-0">
            <form onSubmit={handleEmailLogin} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-[13px] font-bold text-slate-700 ml-1"
                >
                  이메일
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 pl-12 rounded-2xl border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  {/* 4. university-font-bold 오타 속성 제거 완료 */}
                  <Label
                    htmlFor="password"
                    className="text-[13px] font-bold text-slate-700"
                  >
                    비밀번호
                  </Label>
                  <Link
                    href="#"
                    className="text-[11px] font-semibold text-emerald-600 hover:underline"
                  >
                    비밀번호 찾기
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pl-12 rounded-2xl border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-lg transition-all shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Login to Dashboard"
                )}
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase">
                  <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">
                    Or Continue with
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGithubLogin}
                className="w-full h-12 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold transition-all flex gap-3"
              >
                <Github className="w-5 h-5" />
                Github 계정으로 로그인
              </Button>

              <div className="flex items-center justify-center gap-2 text-[14px] text-slate-500 pt-2">
                <span>아직 회원이 아니신가요?</span>
                <Link
                  href="/register"
                  className="font-bold text-slate-900 hover:text-emerald-600 underline underline-offset-4 decoration-slate-200 hover:decoration-emerald-500 transition-all"
                >
                  무료 회원가입
                </Link>
              </div>
            </form>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
