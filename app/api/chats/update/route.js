import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Chat from "@/models/Chat";
import connectDB from "@/lib/mongodb";

export async function POST(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { imageUrl, routineId = null, responses = [], metadata = {} } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: "Image URL missing" },
        { status: 400 }
      );
    }

    let chat = await Chat.findOne({
      user: session.user.id,
      imageUrl,
      routine: routineId??null,
    });

      chat.responses.push(...responses);
      await chat.save();

    return NextResponse.json({
      success: true,
      message: "Chat saved",
      chat,
    });
  } catch (error) {
    console.error("Chat Create Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
