import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req, { params }) {
  const { id } = params;
  const body = await req.json();

  try {
    const updated = await prisma.announcement.update({
      where: { id },
      data: { title: body.title, content: body.content },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error updating announcement:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;

  try {
    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ message: "Announcement deleted" });
  } catch (err) {
    console.error("Error deleting announcement:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
