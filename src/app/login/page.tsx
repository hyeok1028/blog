// src/app/login/page.tsx
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="w-full bg-slate-50/50">
      <div className="min-h-screen flex flex-col items-center pt-12 pb-24 px-4">
        <div className="w-full max-w-5xl">
          <LoginForm />
          <div className="mt-8 text-center text-[13px] text-slate-400">
            로그인에 문제가 있나요?{" "}
            <span className="text-slate-500 font-medium underline underline-offset-4 decoration-slate-200 cursor-pointer hover:text-emerald-600 transition-colors">
              고객 지원 센터에 문의하세요.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
