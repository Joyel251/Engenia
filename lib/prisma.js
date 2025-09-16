// lib/prisma.js
import { PrismaClient } from '@prisma/client';

// Ensure a single PrismaClient instance across hot reloads in dev
const globalForPrisma = globalThis;

/** @type {PrismaClient | undefined} */
let prisma = globalForPrisma.__prisma;

if (!prisma) {
	prisma = new PrismaClient();
	globalForPrisma.__prisma = prisma;
}

export default prisma;
