import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Chat from "@/models/Chat";
import connectDB from "@/lib/mongodb";

export async function POST(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { chatId, title } = await req.json();

    if (!chatId || !title?.trim()) {
      return NextResponse.json(
        { success: false, error: "Chat ID and title required" },
        { status: 400 }
      );
    }

    const updated = await Chat.findOneAndUpdate(
      { _id: chatId, user: session.user.id },
      { title: title.trim() },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Chat not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, chat: updated });
  } catch (err) {
    console.error("Update Chat Title Error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
