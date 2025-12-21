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

    const { chatId } = await req.json();
    if (!chatId) {
      return NextResponse.json(
        { success: false, error: "Chat ID required" },
        { status: 400 }
      );
    }

    const deleted = await Chat.findOneAndDelete({
      _id: chatId,
      user: session.user.id,
    });

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Chat not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Chat deleted" });
  } catch (err) {
    console.error("Delete Chat Error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
