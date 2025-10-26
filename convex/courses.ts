import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("courses").collect();
  },
});

export const getById = query({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const courses = await ctx.db.query("courses").collect();
    const searchTerm = args.query.toLowerCase();
    
    return courses.filter(course => 
      course.name.toLowerCase().includes(searchTerm) ||
      course.location?.toLowerCase().includes(searchTerm) ||
      course.description?.toLowerCase().includes(searchTerm)
    );
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    location: v.optional(v.string()),
    description: v.optional(v.string()),
    addressUrl: v.optional(v.string()),
    holes: v.number(),
    estimatedLengthMeters: v.optional(v.number()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    difficulty: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("courses", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getHoles = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("courseHoles")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();
  },
});

export const createHoles = mutation({
  args: {
    courseId: v.id("courses"),
    holes: v.array(v.object({
      hole: v.number(),
      par: v.number(),
      distanceMeters: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const holeIds = [];
    for (const hole of args.holes) {
      const holeId = await ctx.db.insert("courseHoles", {
        courseId: args.courseId,
        ...hole,
      });
      holeIds.push(holeId);
    }
    return holeIds;
  },
});

// Update Ekeberg course with correct data
export const updateEkebergCourse = mutation({
  handler: async (ctx) => {
    // First, find the Ekeberg course
    const courses = await ctx.db.query("courses").collect();
    const ekebergCourse = courses.find(course => 
      course.name.toLowerCase().includes('ekeberg')
    );
    
    if (!ekebergCourse) {
      throw new Error("Ekeberg course not found");
    }
    
    // Delete existing holes
    const existingHoles = await ctx.db
      .query("courseHoles")
      .withIndex("by_course", (q) => q.eq("courseId", ekebergCourse._id))
      .collect();
    
    for (const hole of existingHoles) {
      await ctx.db.delete(hole._id);
    }
    
    // Create new holes with correct Ekeberg data (from the image)
    const ekebergHoles = [
      { hole: 1, par: 3, distanceMeters: 59 }, // 195 ft
      { hole: 2, par: 3, distanceMeters: 66 }, // 215 ft
      { hole: 3, par: 4, distanceMeters: 111 }, // 364 ft
      { hole: 4, par: 3, distanceMeters: 80 }, // 264 ft
      { hole: 5, par: 3, distanceMeters: 74 }, // 244 ft
      { hole: 6, par: 3, distanceMeters: 70 }, // 230 ft
      { hole: 7, par: 3, distanceMeters: 44 }, // 144 ft
      { hole: 8, par: 3, distanceMeters: 67 }, // 219 ft
      { hole: 9, par: 3, distanceMeters: 53 }, // 173 ft
      { hole: 10, par: 3, distanceMeters: 40 }, // 132 ft
      { hole: 11, par: 3, distanceMeters: 68 }, // 224 ft
      { hole: 12, par: 3, distanceMeters: 57 }, // 186 ft
      { hole: 13, par: 3, distanceMeters: 62 }, // 205 ft
      { hole: 14, par: 3, distanceMeters: 62 }, // 205 ft
      { hole: 15, par: 3, distanceMeters: 113 }, // 370 ft
      { hole: 16, par: 3, distanceMeters: 54 }, // 178 ft
      { hole: 17, par: 3, distanceMeters: 45 }, // 148 ft
      { hole: 18, par: 3, distanceMeters: 90 }, // 294 ft
    ];
    
    const holeIds = [];
    for (const hole of ekebergHoles) {
      const holeId = await ctx.db.insert("courseHoles", {
        courseId: ekebergCourse._id,
        ...hole,
      });
      holeIds.push(holeId);
    }
    
    return { courseId: ekebergCourse._id, holeIds };
  },
});

// Update Krokhol Blue Layout course with correct data
export const updateKrokholCourse = mutation({
  handler: async (ctx) => {
    // First, find the Krokhol course
    const courses = await ctx.db.query("courses").collect();
    const krokholCourse = courses.find(course => 
      course.name.toLowerCase().includes('krokhol')
    );
    
    if (!krokholCourse) {
      throw new Error("Krokhol course not found");
    }
    
    // Delete existing holes
    const existingHoles = await ctx.db
      .query("courseHoles")
      .withIndex("by_course", (q) => q.eq("courseId", krokholCourse._id))
      .collect();
    
    for (const hole of existingHoles) {
      await ctx.db.delete(hole._id);
    }
    
    // Create new holes with correct Krokhol Blue Layout data (from the image)
    const krokholHoles = [
      { hole: 1, par: 3, distanceMeters: 111 }, // 364 ft
      { hole: 2, par: 4, distanceMeters: 144 }, // 472 ft
      { hole: 3, par: 3, distanceMeters: 69 }, // 226 ft
      { hole: 4, par: 3, distanceMeters: 117 }, // 384 ft
      { hole: 5, par: 3, distanceMeters: 112 }, // 367 ft
      { hole: 6, par: 3, distanceMeters: 77 }, // 253 ft
      { hole: 7, par: 4, distanceMeters: 142 }, // 466 ft
      { hole: 8, par: 5, distanceMeters: 219 }, // 719 ft
      { hole: 9, par: 3, distanceMeters: 75 }, // 246 ft
      { hole: 10, par: 3, distanceMeters: 105 }, // 344 ft
      { hole: 11, par: 3, distanceMeters: 87 }, // 285 ft
      { hole: 12, par: 4, distanceMeters: 189 }, // 620 ft
      { hole: 13, par: 3, distanceMeters: 86 }, // 282 ft
      { hole: 14, par: 3, distanceMeters: 70 }, // 230 ft
      { hole: 15, par: 3, distanceMeters: 66 }, // 217 ft
      { hole: 16, par: 5, distanceMeters: 231 }, // 758 ft
      { hole: 17, par: 3, distanceMeters: 76 }, // 249 ft
      { hole: 18, par: 4, distanceMeters: 150 }, // 492 ft
    ];
    
    const holeIds = [];
    for (const hole of krokholHoles) {
      const holeId = await ctx.db.insert("courseHoles", {
        courseId: krokholCourse._id,
        ...hole,
      });
      holeIds.push(holeId);
    }
    
    return { courseId: krokholCourse._id, holeIds };
  },
});

// Add Langhus Disc Golf Course
export const addLanghusCourse = mutation({
  handler: async (ctx) => {
    // Check if Langhus course already exists
    const existingCourses = await ctx.db.query("courses").collect();
    const langhusCourse = existingCourses.find(course => 
      course.name.toLowerCase().includes('langhus')
    );
    
    if (langhusCourse) {
      console.log("Langhus course already exists, skipping");
      return { courseId: langhusCourse._id, message: "Course already exists" };
    }
    
    // Create the Langhus course
    const courseId = await ctx.db.insert("courses", {
      name: "Langhus Disc Golf Course",
      location: "Langhus, Norway",
      description: "Short - highly technical 18-hole course",
      holes: 18,
      estimatedLengthMeters: 1291, // 4237 ft converted to meters
      difficulty: "Intermediate",
      createdAt: Date.now(),
    });

    // Create the holes with the exact data from the screenshot
    const langhusHoles = [
      { hole: 1, par: 3, distanceMeters: 57 }, // 188 ft
      { hole: 2, par: 3, distanceMeters: 51 }, // 168 ft
      { hole: 3, par: 4, distanceMeters: 117 }, // 383 ft
      { hole: 4, par: 4, distanceMeters: 91 }, // 298 ft
      { hole: 5, par: 3, distanceMeters: 46 }, // 150 ft
      { hole: 6, par: 4, distanceMeters: 110 }, // 361 ft
      { hole: 7, par: 3, distanceMeters: 66 }, // 215 ft
      { hole: 8, par: 3, distanceMeters: 59 }, // 194 ft
      { hole: 9, par: 3, distanceMeters: 55 }, // 179 ft
      { hole: 10, par: 3, distanceMeters: 86 }, // 281 ft
      { hole: 11, par: 3, distanceMeters: 75 }, // 246 ft
      { hole: 12, par: 3, distanceMeters: 60 }, // 198 ft
      { hole: 13, par: 3, distanceMeters: 71 }, // 234 ft
      { hole: 14, par: 3, distanceMeters: 55 }, // 179 ft
      { hole: 15, par: 3, distanceMeters: 48 }, // 158 ft
      { hole: 16, par: 3, distanceMeters: 73 }, // 239 ft
      { hole: 17, par: 3, distanceMeters: 106 }, // 349 ft
      { hole: 18, par: 3, distanceMeters: 66 }, // 217 ft
    ];
    
    const holeIds = [];
    for (const hole of langhusHoles) {
      const holeId = await ctx.db.insert("courseHoles", {
        courseId: courseId,
        ...hole,
      });
      holeIds.push(holeId);
    }
    
    return { 
      courseId: courseId, 
      holeIds,
      message: "Langhus Disc Golf Course added successfully",
      totalHoles: langhusHoles.length,
      totalPar: langhusHoles.reduce((sum, hole) => sum + hole.par, 0)
    };
  },
});

// Update Stovner Discgolfpark with Main 2025 layout
export const updateStovnerCourse2025 = mutation({
  handler: async (ctx) => {
    // Find the existing Stovner course
    const existingCourses = await ctx.db.query("courses").collect();
    const stovnerCourse = existingCourses.find(course => 
      course.name.toLowerCase().includes('stovner')
    );
    
    if (!stovnerCourse) {
      // Create new Stovner course if it doesn't exist
      const courseId = await ctx.db.insert("courses", {
        name: "Stovner Discgolfpark",
        location: "Oslo, Norway",
        description: "Long - technical 18-hole course",
        holes: 18,
        estimatedLengthMeters: 2031, // 6664 ft converted to meters
        difficulty: "Advanced",
        createdAt: Date.now(),
      });

      // Create the holes with the Main 2025 layout data
      const stovnerHoles = [
        { hole: 1, par: 3, distanceMeters: 88 }, // 290 ft
        { hole: 2, par: 3, distanceMeters: 78 }, // 256 ft
        { hole: 3, par: 3, distanceMeters: 114 }, // 374 ft
        { hole: 4, par: 3, distanceMeters: 119 }, // 389 ft
        { hole: 5, par: 3, distanceMeters: 130 }, // 425 ft
        { hole: 6, par: 3, distanceMeters: 124 }, // 407 ft
        { hole: 7, par: 4, distanceMeters: 205 }, // 673 ft
        { hole: 8, par: 3, distanceMeters: 75 }, // 247 ft
        { hole: 9, par: 3, distanceMeters: 92 }, // 303 ft
        { hole: 10, par: 4, distanceMeters: 165 }, // 541 ft
        { hole: 11, par: 4, distanceMeters: 195 }, // 639 ft
        { hole: 12, par: 3, distanceMeters: 87 }, // 286 ft
        { hole: 13, par: 3, distanceMeters: 131 }, // 429 ft
        { hole: 14, par: 3, distanceMeters: 91 }, // 298 ft
        { hole: 15, par: 3, distanceMeters: 98 }, // 320 ft
        { hole: 16, par: 3, distanceMeters: 66 }, // 217 ft
        { hole: 17, par: 3, distanceMeters: 71 }, // 232 ft
        { hole: 18, par: 3, distanceMeters: 103 }, // 337 ft
      ];
      
      const holeIds = [];
      for (const hole of stovnerHoles) {
        const holeId = await ctx.db.insert("courseHoles", {
          courseId: courseId,
          ...hole,
        });
        holeIds.push(holeId);
      }
      
      return { 
        courseId: courseId, 
        holeIds,
        message: "Stovner Discgolfpark created with Main 2025 layout",
        totalHoles: stovnerHoles.length,
        totalPar: stovnerHoles.reduce((sum, hole) => sum + hole.par, 0)
      };
    }
    
    // Update existing course with new layout data
    await ctx.db.patch(stovnerCourse._id, {
      description: "Long - technical 18-hole course (Main 2025 layout)",
      estimatedLengthMeters: 2031, // 6664 ft converted to meters
      difficulty: "Advanced",
    });

    // Delete existing holes
    const existingHoles = await ctx.db
      .query("courseHoles")
      .withIndex("by_course", (q) => q.eq("courseId", stovnerCourse._id))
      .collect();
    
    for (const hole of existingHoles) {
      await ctx.db.delete(hole._id);
    }
    
    // Create new holes with Main 2025 layout
    const stovnerHoles = [
      { hole: 1, par: 3, distanceMeters: 88 }, // 290 ft
      { hole: 2, par: 3, distanceMeters: 78 }, // 256 ft
      { hole: 3, par: 3, distanceMeters: 114 }, // 374 ft
      { hole: 4, par: 3, distanceMeters: 119 }, // 389 ft
      { hole: 5, par: 3, distanceMeters: 130 }, // 425 ft
      { hole: 6, par: 3, distanceMeters: 124 }, // 407 ft
      { hole: 7, par: 4, distanceMeters: 205 }, // 673 ft
      { hole: 8, par: 3, distanceMeters: 75 }, // 247 ft
      { hole: 9, par: 3, distanceMeters: 92 }, // 303 ft
      { hole: 10, par: 4, distanceMeters: 165 }, // 541 ft
      { hole: 11, par: 4, distanceMeters: 195 }, // 639 ft
      { hole: 12, par: 3, distanceMeters: 87 }, // 286 ft
      { hole: 13, par: 3, distanceMeters: 131 }, // 429 ft
      { hole: 14, par: 3, distanceMeters: 91 }, // 298 ft
      { hole: 15, par: 3, distanceMeters: 98 }, // 320 ft
      { hole: 16, par: 3, distanceMeters: 66 }, // 217 ft
      { hole: 17, par: 3, distanceMeters: 71 }, // 232 ft
      { hole: 18, par: 3, distanceMeters: 103 }, // 337 ft
    ];
    
    const holeIds = [];
    for (const hole of stovnerHoles) {
      const holeId = await ctx.db.insert("courseHoles", {
        courseId: stovnerCourse._id,
        ...hole,
      });
      holeIds.push(holeId);
    }
    
    return { 
      courseId: stovnerCourse._id, 
      holeIds,
      message: "Stovner Discgolfpark updated with Main 2025 layout",
      totalHoles: stovnerHoles.length,
      totalPar: stovnerHoles.reduce((sum, hole) => sum + hole.par, 0)
    };
  },
});

// Add Oppegård IL Diskgolfbane Main Course
export const addOppegardCourse = mutation({
  handler: async (ctx) => {
    // Check if Oppegård course already exists
    const existingCourses = await ctx.db.query("courses").collect();
    const oppegardCourse = existingCourses.find(course => 
      course.name.toLowerCase().includes('oppegård') || course.name.toLowerCase().includes('oppegard')
    );
    
    if (oppegardCourse) {
      console.log("Oppegård course already exists, skipping");
      return { courseId: oppegardCourse._id, message: "Course already exists" };
    }
    
    // Create the Oppegård course
    const courseId = await ctx.db.insert("courses", {
      name: "Oppegård IL Diskgolfbane",
      location: "Oppegård, Norway",
      description: "Short - technical 9-hole course",
      holes: 9,
      estimatedLengthMeters: 654, // 2146 ft converted to meters
      difficulty: "Intermediate",
      createdAt: Date.now(),
    });

    // Create the holes with the exact data from the screenshot
    const oppegardHoles = [
      { hole: 1, par: 3, distanceMeters: 62 }, // 204 ft
      { hole: 2, par: 3, distanceMeters: 65 }, // 214 ft
      { hole: 3, par: 3, distanceMeters: 85 }, // 280 ft
      { hole: 4, par: 3, distanceMeters: 77 }, // 251 ft
      { hole: 5, par: 3, distanceMeters: 64 }, // 211 ft
      { hole: 6, par: 3, distanceMeters: 66 }, // 217 ft
      { hole: 7, par: 3, distanceMeters: 73 }, // 239 ft
      { hole: 8, par: 3, distanceMeters: 57 }, // 187 ft
      { hole: 9, par: 3, distanceMeters: 105 }, // 343 ft
    ];
    
    const holeIds = [];
    for (const hole of oppegardHoles) {
      const holeId = await ctx.db.insert("courseHoles", {
        courseId: courseId,
        ...hole,
      });
      holeIds.push(holeId);
    }
    
    return { 
      courseId: courseId, 
      holeIds,
      message: "Oppegård IL Diskgolfbane added successfully",
      totalHoles: oppegardHoles.length,
      totalPar: oppegardHoles.reduce((sum, hole) => sum + hole.par, 0)
    };
  },
});


