// src/types/comment.ts
import type { Comment, User } from "@prisma/client";

/**
 * 댓글 + 작성자 정보가 포함된 타입
 * (상세 페이지, 댓글 UI에서 사용)
 */
export type CommentWithAuthor = Comment & {
  author: Pick<User, "id" | "email">;
};
