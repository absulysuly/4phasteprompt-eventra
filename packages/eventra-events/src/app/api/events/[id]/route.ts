import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

const prisma = new PrismaClient();

// PATCH = update, DELETE = remove, both authenticated
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({error: "Unauthorized"}, {status: 401});
  const { id, ...update } = await req.json();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({error: "User not found"}, {status: 400});
  // only allow event owner
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) return NextResponse.json({error: "Not permitted"}, {status: 403});
  const event = await prisma.event.update({ where: { id }, data: update });
  return NextResponse.json({ success: true, event });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({error: "Unauthorized"}, {status: 401});
  const { id } = await req.json();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({error: "User not found"}, {status: 400});
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) return NextResponse.json({error: "Not permitted"}, {status: 403});
  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
