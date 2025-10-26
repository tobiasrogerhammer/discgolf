import { mutation } from "./_generated/server";

export const seedCourses = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if courses already exist
    const existingCourses = await ctx.db.query("courses").collect();
    if (existingCourses.length > 0) {
      console.log("Courses already exist, skipping seed");
      return;
    }

    // Create sample courses
    const course1 = await ctx.db.insert("courses", {
      name: "Ekeberg Disc Golf Course",
      location: "Oslo, Norway",
      description: "A beautiful 18-hole course with great views of Oslo",
      holes: 18,
      estimatedLengthMeters: 5400,
      latitude: 59.9042,
      longitude: 10.7522,
      difficulty: "Intermediate",
      createdAt: Date.now(),
    });

    const course2 = await ctx.db.insert("courses", {
      name: "Krokhol Disc Golf Course",
      location: "Sandvika, Norway",
      description: "Challenging course with technical holes",
      holes: 18,
      estimatedLengthMeters: 4800,
      latitude: 59.8906,
      longitude: 10.5278,
      difficulty: "Advanced",
      createdAt: Date.now(),
    });

    const course3 = await ctx.db.insert("courses", {
      name: "Stovner Disc Golf Course",
      location: "Oslo, Norway",
      description: "Beginner-friendly course perfect for learning",
      holes: 9,
      estimatedLengthMeters: 2400,
      latitude: 59.9500,
      longitude: 10.9167,
      difficulty: "Beginner",
      createdAt: Date.now(),
    });

    // Create holes for Ekeberg
    const ekebergHoles = [
      { hole: 1, par: 3, distanceMeters: 280 },
      { hole: 2, par: 3, distanceMeters: 320 },
      { hole: 3, par: 4, distanceMeters: 420 },
      { hole: 4, par: 3, distanceMeters: 290 },
      { hole: 5, par: 3, distanceMeters: 310 },
      { hole: 6, par: 4, distanceMeters: 380 },
      { hole: 7, par: 3, distanceMeters: 260 },
      { hole: 8, par: 3, distanceMeters: 300 },
      { hole: 9, par: 4, distanceMeters: 400 },
      { hole: 10, par: 3, distanceMeters: 270 },
      { hole: 11, par: 3, distanceMeters: 330 },
      { hole: 12, par: 4, distanceMeters: 410 },
      { hole: 13, par: 3, distanceMeters: 250 },
      { hole: 14, par: 3, distanceMeters: 340 },
      { hole: 15, par: 4, distanceMeters: 390 },
      { hole: 16, par: 3, distanceMeters: 300 },
      { hole: 17, par: 3, distanceMeters: 320 },
      { hole: 18, par: 4, distanceMeters: 450 },
    ];

    for (const hole of ekebergHoles) {
      await ctx.db.insert("courseHoles", {
        courseId: course1,
        ...hole,
      });
    }

    // Create holes for Krokhol
    const krokholHoles = [
      { hole: 1, par: 3, distanceMeters: 300 },
      { hole: 2, par: 4, distanceMeters: 450 },
      { hole: 3, par: 3, distanceMeters: 280 },
      { hole: 4, par: 4, distanceMeters: 420 },
      { hole: 5, par: 3, distanceMeters: 320 },
      { hole: 6, par: 4, distanceMeters: 400 },
      { hole: 7, par: 3, distanceMeters: 290 },
      { hole: 8, par: 4, distanceMeters: 380 },
      { hole: 9, par: 3, distanceMeters: 310 },
      { hole: 10, par: 4, distanceMeters: 440 },
      { hole: 11, par: 3, distanceMeters: 270 },
      { hole: 12, par: 4, distanceMeters: 410 },
      { hole: 13, par: 3, distanceMeters: 330 },
      { hole: 14, par: 4, distanceMeters: 390 },
      { hole: 15, par: 3, distanceMeters: 300 },
      { hole: 16, par: 4, distanceMeters: 430 },
      { hole: 17, par: 3, distanceMeters: 280 },
      { hole: 18, par: 4, distanceMeters: 460 },
    ];

    for (const hole of krokholHoles) {
      await ctx.db.insert("courseHoles", {
        courseId: course2,
        ...hole,
      });
    }

    // Create holes for Stovner
    const stovnerHoles = [
      { hole: 1, par: 3, distanceMeters: 200 },
      { hole: 2, par: 3, distanceMeters: 220 },
      { hole: 3, par: 3, distanceMeters: 180 },
      { hole: 4, par: 3, distanceMeters: 250 },
      { hole: 5, par: 3, distanceMeters: 210 },
      { hole: 6, par: 3, distanceMeters: 240 },
      { hole: 7, par: 3, distanceMeters: 190 },
      { hole: 8, par: 3, distanceMeters: 230 },
      { hole: 9, par: 3, distanceMeters: 220 },
    ];

    for (const hole of stovnerHoles) {
      await ctx.db.insert("courseHoles", {
        courseId: course3,
        ...hole,
      });
    }

    console.log("Seeded courses and holes successfully");
    return { courses: [course1, course2, course3] };
  },
});

