import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.course.count();
  if (count > 0) return;
  const course = await prisma.course.create({
    data: {
      name: "Ekeberg",
      holes: 18,
      holePars: {
        create: Array.from({ length: 18 }, (_, i) => ({ hole: i + 1, par: i === 2 ? 4 : 3 })),
      },
    },
  });
  console.log("Seeded course", course.name);
}

main().finally(async () => prisma.$disconnect());


