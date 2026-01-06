// src/lib/categoryActions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export async function addCategory(formData: FormData) {
  const session = await auth();

  // 관리자만 허용(원치 않으면 이 블록 제거)
  if (session?.user?.role !== "ADMIN") {
    return { error: "관리자만 카테고리를 추가할 수 있습니다." };
  }

  const raw = (formData.get("name") as string | null) ?? "";
  const name = raw.trim();

  if (!name) return { error: "카테고리 이름을 입력해주세요." };
  if (name.length > 30)
    return { error: "카테고리 이름은 30자 이하로 입력해주세요." };

  try {
    await prisma.category.create({ data: { name } });
    revalidatePath("/", "layout");
    return { success: true as const };
  } catch (e: unknown) {
    // 이미 존재하는 name(unique)인 경우
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return { error: "이미 존재하는 카테고리입니다." };
    }
    return { error: "카테고리 추가 중 오류가 발생했습니다." };
  }
}
