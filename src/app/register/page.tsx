import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="w-full bg-slate-50/50">
      {" "}
      {/* 배경색을 약간 주면 카드가 더 돋보입니다 */}
      <div className="min-h-screen flex flex-col items-center pt-12 pb-24 px-4">
        {/* max-w-4xl을 지우고 컴포넌트 자체가 너비를 결정하게 하거나 5xl로 변경 */}
        <div className="w-full max-w-5xl">
          <RegisterForm />
          <div className="mt-8 text-center text-xs text-slate-400">
            문제가 있나요?{" "}
            <span className="text-slate-500 font-medium underline decoration-slate-200">
              관리자에게 문의하세요.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
