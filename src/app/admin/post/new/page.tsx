// 1. 중괄호를 사용한 Named Import로 수정
import { prisma } from "@/lib/prisma";
import PostForm from "./PostForm";

export default async function NewPostPage() {
  // DB에서 카테고리 목록을 가져옵니다.
  // prisma.category.findMany가 반환하는 타입을 TypeScript가 인식하도록 합니다.
  const categoryData = await prisma.category.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  });

  // 2. 'c'의 타입을 명시하거나, 화살표 함수에서 타입을 지정합니다.
  // categoryData는 { name: string }[] 형태이므로 c는 { name: string }입니다.
  const categoryNames = categoryData.map((c: { name: string }) => c.name);

  return <PostForm categories={categoryNames} />;
}
