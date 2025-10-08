import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { formatDateEuropean } from "@/lib/dateUtils";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { platforms } = body; // ['twitter', 'facebook', 'instagram', 'whatsapp']

  const round = await prisma.round.findFirst({
    where: { id, userId: me.id },
    include: {
      course: true,
      scores: true,
      weather: true
    }
  });

  if (!round) {
    return NextResponse.json({ error: "Round not found" }, { status: 404 });
  }

  // Mark round as shared
  await prisma.round.update({
    where: { id },
    data: { shared: true }
  });

  // Generate share content
  const shareContent = generateShareContent(round, me.name || 'Disc Golfer');

  // Create share URLs for different platforms
  const shareUrls = platforms.map((platform: string) => ({
    platform,
    url: generateShareUrl(platform, shareContent),
    content: shareContent
  }));

  return NextResponse.json({ shareUrls, shareContent });
}

function generateShareContent(round: any, playerName: string): string {
  const courseName = round.course.name;
  const score = round.totalStrokes;
  const par = round.scores.reduce((sum: number, s: any) => sum + (s.strokes || 0), 0);
  const diff = score - par;
  const diffText = diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : 'E';
  
  let content = `🏆 Just played ${courseName}!\n`;
  content += `📊 Score: ${score} (${diffText} to par)\n`;
  content += `📅 ${formatDateEuropean(round.startedAt)}\n`;
  
  if (round.weather) {
    content += `🌤️ Weather: ${round.weather.conditions || 'Unknown'}\n`;
  }
  
  content += `#DiscGolf #${courseName.replace(/\s+/g, '')} #DiscGolfApp`;
  
  return content;
}

function generateShareUrl(platform: string, content: string): string {
  const encodedContent = encodeURIComponent(content);
  
  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodedContent}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodedContent}`;
    case 'whatsapp':
      return `https://wa.me/?text=${encodedContent}`;
    case 'instagram':
      // Instagram doesn't support direct text sharing, return content for copy
      return `data:text/plain,${content}`;
    default:
      return `data:text/plain,${content}`;
  }
}
