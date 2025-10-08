import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { courseId } = body;
    
    if (!courseId) {
      return NextResponse.json({ error: "Course ID required" }, { status: 400 });
    }

    // Get the course first to check if it exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Update with location data (using Oslo coordinates as default)
    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        location: existingCourse.location || "Oslo, Norway",
        description: existingCourse.description || "A beautiful disc golf course",
        addressUrl: existingCourse.addressUrl || "https://maps.google.com/",
        latitude: 59.9042, // Oslo coordinates
        longitude: 10.7522,
      }
    });
    
    return NextResponse.json({ course });
  } catch (error) {
    console.error("Update course error:", error);
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
  }
}
