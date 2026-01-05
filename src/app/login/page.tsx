// src/app/login/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	// 1. 이메일 로그인 핸들러
	const handleEmailLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		await signIn("credentials", { email, password, callbackUrl: "/" });
	};

	// 2. Github 로그인 핸들러
	const handleGithubLogin = () => {
		signIn("github", { callbackUrl: "/" });
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<Card className="w-[400px]">
				<CardHeader>
					<CardTitle className="text-2xl font-bold text-center">
						hanaro Blog 로그인
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleEmailLogin} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">이메일</Label>
							<Input
								id="email"
								type="email"
								placeholder="example@email.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">비밀번호</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						<Button type="submit" className="w-full">
							이메일로 로그인
						</Button>
					</form>
				</CardContent>
				<CardFooter className="flex flex-col space-y-2">
					<div className="relative w-full">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-white px-2 text-muted-foreground">Or</span>
						</div>
					</div>
					<Button
						variant="outline"
						className="w-full"
						onClick={handleGithubLogin}
					>
						Github으로 로그인
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
