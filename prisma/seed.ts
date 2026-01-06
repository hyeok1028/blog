// prisma/seed.ts
import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/generated/prisma";

async function main() {
  console.log("🌱 시딩 시작...");

  // 1) 카테고리 데이터 정의 및 upsert 루프
  const categories = ["JavaScript", "TypeScript", "React", "Next.js", "MySQL"];

  for (const name of categories) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {}, // 이미 존재하면 업데이트 하지 않음
      create: { name },
    });
    console.log("🚀 ~ category:", category);
  }

  // 2) 관리자 계정 데이터 정의 및 upsert
  const adminEmail = "admin@naver.com";
  const rs = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN }, // 이미 존재하면 role만 ADMIN으로 보정
    create: {
      email: adminEmail,
      role: Role.ADMIN,
      name: "관리자",
    },
  });
  console.log("🚀 ~ rs:", rs);

  console.log("✅ 시딩 완료.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ 시드 실패:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
