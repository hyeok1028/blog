// src/app/register/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/lib/actions";

export default function RegisterPage() {
	const [msg, setMsg] = useState("");
	const router = useRouter();

	async function handleSubmit(formData: FormData) {
		const result = await registerUser(formData);
		if (result.error) {
			setMsg(result.error);
		} else {
			alert("가입 성공! 로그인 페이지로 이동합니다.");
			router.push("/login");
		}
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-slate-50">
			<Card className="w-[400px]">
				<CardHeader>
					<CardTitle className="text-center">회원가입 (테스트용)</CardTitle>
				</CardHeader>
				<CardContent>
					<form action={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label>이메일</Label>
							<Input name="email" type="email" required />
						</div>
						<div className="space-y-2">
							<Label>비밀번호</Label>
							<Input name="password" type="password" required />
						</div>
						<div className="space-y-2">
							<Label>권한 선택</Label>
							<select name="role" className="w-full border p-2 rounded">
								<option value="USER">일반 유저 (USER)</option>
								<option value="ADMIN">관리자 (ADMIN)</option>
							</select>
						</div>
						{msg && <p className="text-red-500 text-sm">{msg}</p>}
						<Button type="submit" className="w-full">
							가입하기
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
