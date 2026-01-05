// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth"; // src/auth.ts에서 정의한 handlers를 가져옵니다.
export const { GET, POST } = handlers;
