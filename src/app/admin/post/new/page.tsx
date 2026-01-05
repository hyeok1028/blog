// src/app/admin/post/new/page.tsx
"use client";

import { createPost } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function NewPostPage() {
  const router = useRouter();
  const categories = ["JavaScript", "TypeScript", "React", "Next.js", "MySQL"];

  async function handleSubmit(formData: FormData) {
    const result = await createPost(formData);
    if (result.success) {
      alert("글이 등록되었습니다!");
      router.push("/"); // 메인으로 이동하여 잔디 확인
    } else {
      alert(result.error);
    }
  }

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>새 기술 포스트 작성</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>제목</Label>
              <Input
                name="title"
                placeholder="기술 주제를 입력하세요"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>카테고리</Label>
              <select
                name="category"
                className="w-full border p-2 rounded-md"
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>내용</Label>
              <textarea
                name="content"
                className="w-full min-h-[300px] border p-4 rounded-md"
                placeholder="Markdown 또는 일반 텍스트로 내용을 작성하세요"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              포스트 발행하기
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
