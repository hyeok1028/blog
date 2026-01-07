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
  const name = formData.get("name") as string;
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
 * 2. 게시글 생성/수정/삭제 액션 (관리자 전용)
 */
export async function createPost(formData: FormData) {
  const session = await auth();
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
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "게시글 저장 중 오류가 발생했습니다." };
  }
}

export async function updatePost(postId: number, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN")
    return { error: "수정 권한이 없습니다." };

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as string;

  try {
    await prisma.post.update({
      where: { id: postId },
      data: { title, content, category, updatedAt: new Date() },
    });
    revalidatePath("/");
    revalidatePath(`/post/${postId}`);
    return { success: true };
  } catch (error) {
    return { error: "글 수정 중 오류가 발생했습니다." };
  }
}

export async function deletePost(postId: number) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN")
    return { error: "삭제 권한이 없습니다." };

  try {
    await prisma.post.delete({ where: { id: postId } });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "삭제 중 오류가 발생했습니다." };
  }
}

/**
 * 3. 좋아요 토글
 */
export async function toggleLike(postId: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("로그인이 필요합니다.");

  const userId = Number(session.user.id);
  const existingLike = await prisma.like.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existingLike) {
    await prisma.like.delete({ where: { id: existingLike.id } });
  } else {
    await prisma.like.create({ data: { postId, userId } });
  }
  revalidatePath(`/post/${postId}`);
}

/**
 * 4. 댓글 작성 및 수정
 */
export async function createComment(
  postId: number,
  content: string,
  parentId?: number
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("로그인이 필요합니다.");

  await prisma.comment.create({
    data: {
      content,
      postId,
      authorId: Number(session.user.id),
      parentId: parentId || null,
    },
  });
  revalidatePath(`/post/${postId}`);
}

// 댓글 수정 액션
export async function updateComment(commentId: number, content: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("로그인이 필요합니다.");

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return;

  const isAuthor = comment.authorId === Number(session.user.id);
  if (!isAuthor) throw new Error("수정 권한이 없습니다.");

  await prisma.comment.update({
    where: { id: commentId },
    data: {
      content,
      updatedAt: new Date(), // 수정 시간 업데이트
    },
  });

  revalidatePath(`/post/${comment.postId}`);
}

/**
 * 5. 댓글 삭제 (관리자/사용자 차별화 로직)
 */
export async function deleteComment(commentId: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("권한이 없습니다.");

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return;

  const userId = Number(session.user.id);
  const isAdmin = session.user.role === "ADMIN";
  const isAuthor = comment.authorId === userId;

  // 관리자 + 타인의 댓글 → 소프트 삭제
  if (isAdmin && !isAuthor) {
    await prisma.comment.update({
      where: { id: commentId },
      data: { content: "삭제된 댓글입니다" },
    });
  } else if (isAuthor) {
    // 본인 댓글 → 하드 삭제
    await prisma.comment.delete({ where: { id: commentId } });
  } else {
    throw new Error("삭제 권한이 없습니다.");
  }

  revalidatePath(`/post/${comment.postId}`);
}
