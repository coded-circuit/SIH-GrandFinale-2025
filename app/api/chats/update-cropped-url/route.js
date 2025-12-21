import connectDB from "@/lib/mongodb";
import Chat from "@/models/Chat";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

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
    const { imageUrl, croppedUrl } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: "Image URL is required" },
        { status: 400 }
      );
    }

    if (!croppedUrl) {
      return NextResponse.json(
        { success: false, error: "Cropped URL is required" },
        { status: 400 }
      );
    }

    // Find the chat by imageUrl and update its croppedUrl
    const updatedChat = await Chat.findOneAndUpdate(
      { imageUrl: imageUrl, user: session.user.id },
      { croppedUrl: croppedUrl },
      { new: true }
    );

    if (!updatedChat) {
      return NextResponse.json(
        { success: false, error: "Chat not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cropped URL updated",
      chat: updatedChat,
    });
  } catch (error) {
    console.error("Update Cropped URL Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

