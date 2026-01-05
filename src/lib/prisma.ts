// src/lib/prisma.ts

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

function makeAdapter() {
	const raw = process.env.DATABASE_URL;
	if (!raw) throw new Error("DATABASE_URL is not set");

	const u = new URL(raw);

	return new PrismaMariaDb({
		host: u.hostname,
		port: u.port ? Number(u.port) : 3306,
		user: decodeURIComponent(u.username),
		password: decodeURIComponent(u.password),
		database: u.pathname.replace(/^\//, ""),
	});
}

export const prisma: PrismaClient =
	globalForPrisma.prisma ??
	(() => {
		const client = new PrismaClient({ adapter: makeAdapter() });
		if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
		return client;
	})();
