import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const groups = await prisma.group.findMany({
    where: {
      members: {
        some: { userId: me.id }
      }
    },
    include: {
      members: {
        include: { user: true }
      },
      _count: { select: { members: true } }
    }
  });

  return NextResponse.json({ groups });
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, description } = body;

  const group = await prisma.group.create({
    data: {
      name,
      description,
      createdBy: me.id,
      members: {
        create: {
          userId: me.id,
          role: 'ADMIN'
        }
      }
    },
    include: {
      members: {
        include: { user: true }
      }
    }
  });

  return NextResponse.json({ group });
}
