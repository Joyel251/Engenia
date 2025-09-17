import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth.js";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hashPassword("admin123"); // your admin password

  await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: passwordHash,
    },
  });

  console.log("✅ Admin user created!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
