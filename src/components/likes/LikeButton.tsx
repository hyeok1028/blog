"use client";

import { useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleLike } from "@/lib/actions";

type LikeState = {
  liked: boolean;
  count: number;
};

export default function LikeButton({
  postId,
  initialLiked,
  initialCount,
  disabled,
}: {
  postId: number;
  initialLiked: boolean;
  initialCount: number;
  disabled: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const [optimistic, setOptimistic] = useOptimistic<LikeState, "toggle">(
    { liked: initialLiked, count: initialCount },
    (state) => ({
      liked: !state.liked,
      count: state.liked ? state.count - 1 : state.count + 1,
    })
  );

  return (
    <Button
      type="button"
      variant="outline"
      className={[
        "rounded-xl",
        optimistic.liked
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          : "hover:bg-slate-50",
      ].join(" ")}
      disabled={disabled || isPending}
      onClick={() => {
        // 즉시 UI 반영
        setOptimistic("toggle");

        // 서버 반영은 transition으로 비동기 처리
        startTransition(async () => {
          try {
            await toggleLike(postId);
          } catch {}
        });
      }}
      title={disabled ? "로그인이 필요합니다." : undefined}
    >
      <Heart
        className={[
          "w-4 h-4 mr-2",
          optimistic.liked ? "fill-emerald-600 text-emerald-600" : "",
        ].join(" ")}
      />
      {optimistic.liked ? "좋아요 취소" : "좋아요"} · {optimistic.count}
    </Button>
  );
}
