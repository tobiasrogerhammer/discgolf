const { PrismaClient } = require("../src/generated/prisma");
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.course.count();
  if (count > 0) return;
  await prisma.course.create({
    data: {
      name: "Ekeberg",
      location: "Oslo, Norway",
      description:
        "A beautiful 18-hole disc golf course with great views of Oslo",
      addressUrl: "https://maps.google.com/?q=Ekeberg+Oslo",
      holes: 18,
      estimatedLengthMeters: 2700,
      latitude: 59.9042,
      longitude: 10.7522,
      holePars: {
        create: [
          { hole: 1, par: 3, distanceMeters: 60 },
          { hole: 2, par: 3, distanceMeters: 66 },
          { hole: 3, par: 4, distanceMeters: 111 },
          { hole: 4, par: 3, distanceMeters: 80 },
          { hole: 5, par: 3, distanceMeters: 74 },
          { hole: 6, par: 3, distanceMeters: 70 },
          { hole: 7, par: 3, distanceMeters: 44 },
          { hole: 8, par: 3, distanceMeters: 67 },
          { hole: 9, par: 3, distanceMeters: 53 },
          { hole: 10, par: 3, distanceMeters: 40 },
          { hole: 11, par: 3, distanceMeters: 68 },
          { hole: 12, par: 3, distanceMeters: 57 },
          { hole: 13, par: 3, distanceMeters: 63 },
          { hole: 14, par: 3, distanceMeters: 63 },
          { hole: 15, par: 3, distanceMeters: 113 },
          { hole: 16, par: 3, distanceMeters: 54 },
          { hole: 17, par: 3, distanceMeters: 45 },
          { hole: 18, par: 3, distanceMeters: 90 },
        ],
      },
    },
  });
}

main().finally(async () => prisma.$disconnect());
