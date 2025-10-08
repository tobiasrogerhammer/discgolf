import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { username, email } = body;

  if (!username && !email) {
    return NextResponse.json({ error: "Username or email required" }, { status: 400 });
  }

  try {
    // Check if user exists by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(username ? [{ name: { contains: username } }] : []),
          ...(email ? [{ email: { contains: email } }] : [])
        ]
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    if (!user) {
      return NextResponse.json({ exists: false, message: "User not found" });
    }

    // Check if this is the current user
    if (user.id === me.id) {
      return NextResponse.json({ exists: true, isCurrentUser: true, message: "Cannot add yourself" });
    }

    // Check if already friends
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: me.id, addresseeId: user.id },
          { requesterId: user.id, addresseeId: me.id }
        ]
      }
    });

    return NextResponse.json({ 
      exists: true, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      isAlreadyFriend: !!existingFriendship,
      message: existingFriendship ? "Already friends" : "User found"
    });

  } catch (error) {
    console.error('Error checking user:', error);
    return NextResponse.json({ error: "Failed to check user" }, { status: 500 });
  }
}
