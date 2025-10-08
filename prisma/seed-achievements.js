const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding achievements...");

  const achievements = [
    {
      name: "First Round",
      description: "Complete your first round",
      icon: "🎯",
      category: "Milestone",
      criteria: "Complete 1 round",
      points: 10,
    },
    {
      name: "Century Club",
      description: "Play 100 rounds",
      icon: "💯",
      category: "Milestone",
      criteria: "Complete 100 rounds",
      points: 100,
    },
    {
      name: "Course Master",
      description: "Play 10 different courses",
      icon: "🗺️",
      category: "Exploration",
      criteria: "Play 10 different courses",
      points: 50,
    },
    {
      name: "Under Par",
      description: "Shoot under par on any course",
      icon: "🏆",
      category: "Performance",
      criteria: "Shoot under par",
      points: 75,
    },
    {
      name: "Eagle Eye",
      description: "Score an eagle (2 under par)",
      icon: "🦅",
      category: "Performance",
      criteria: "Score an eagle",
      points: 100,
    },
    {
      name: "Ace",
      description: "Score a hole-in-one",
      icon: "🎯",
      category: "Performance",
      criteria: "Score a hole-in-one",
      points: 200,
    },
    {
      name: "Weather Warrior",
      description: "Play in 5 different weather conditions",
      icon: "🌦️",
      category: "Adventure",
      criteria: "Play in 5 different weather conditions",
      points: 30,
    },
    {
      name: "Consistent",
      description: "Play 5 rounds in a week",
      icon: "📅",
      category: "Dedication",
      criteria: "Play 5 rounds in a week",
      points: 40,
    },
    {
      name: "Social Player",
      description: "Add 5 friends",
      icon: "👥",
      category: "Social",
      criteria: "Add 5 friends",
      points: 25,
    },
    {
      name: "Goal Setter",
      description: "Complete your first goal",
      icon: "🎯",
      category: "Progress",
      criteria: "Complete a goal",
      points: 20,
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.create({
      data: achievement,
    });
  }

  console.log("Achievements seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
