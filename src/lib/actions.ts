// src/lib/actions.ts
"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

/**
 * 1. 유저 회원가입 액션
 */
export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const roleInput = formData.get("role") as string;

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해주세요." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: roleInput === "ADMIN" ? Role.ADMIN : Role.USER,
      },
    });
    return { success: true, user: { email: user.email, role: user.role } };
  } catch (error) {
    console.error(error);
    return { error: "이미 가입된 이메일이거나 서버 오류가 발생했습니다." };
  }
}

/**
 * 2. 게시글 생성 액션 (관리자 전용)
 */
export async function createPost(formData: FormData) {
  const session = await auth();

  // 보안: 관리자 권한 및 세션 확인
  if (session?.user?.role !== "ADMIN" || !session?.user?.id) {
    return { error: "관리자 권한이 없거나 로그인 정보가 없습니다." };
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as string;

  try {
    await prisma.post.create({
      data: {
        title,
        content,
        category,
        authorId: Number(session.user.id),
      },
    });

    // 메인 페이지(잔디밭) 데이터 갱신
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Prisma Error:", error);
    return { error: "게시글 저장 중 오류가 발생했습니다." };
  }
}

/**
 * 3. 게시글 수정 액션 (관리자 전용)
 */
export async function updatePost(postId: number, formData: FormData) {
  const session = await auth();

  // 관리자 권한 확인
  if (session?.user?.role !== "ADMIN") {
    return { error: "수정 권한이 없습니다." };
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as string;

  try {
    await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        content,
        category,
        updatedAt: new Date(), // 수정 시간 갱신 (잔디밭 활동 기록에 반영됨)
      },
    });

    // 관련 페이지 캐시 무효화
    revalidatePath("/");
    revalidatePath(`/post/${postId}`);
    revalidatePath(`/category/${category}`);

    return { success: true };
  } catch (error) {
    console.error("Update Error:", error);
    return { error: "글 수정 중 오류가 발생했습니다." };
  }
}

/**
 * 4. 게시글 삭제 액션 (관리자 전용)
 */
export async function deletePost(postId: number) {
  const session = await auth();

  // 관리자 권한 확인
  if (session?.user?.role !== "ADMIN") {
    return { error: "삭제 권한이 없습니다." };
  }

  try {
    await prisma.post.delete({
      where: { id: postId },
    });

    // 삭제 후 데이터 동기화
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete Error:", error);
    return { error: "삭제 중 오류가 발생했습니다." };
  }
}
