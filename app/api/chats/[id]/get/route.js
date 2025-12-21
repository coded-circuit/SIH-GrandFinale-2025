import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import Chat from "@/models/Chat";
import connectDB from "@/lib/mongodb";

export async function GET(req,{params}) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }
    
   const {id} = await params;
    if (!id) {
        return NextResponse.json(
            { success: false, error: "Chat ID is required" },
            { status: 400 }
        );
    }

    const chats = await Chat.findOne({ _id: id, user: session.user.id });

    if (!chats) {
        return NextResponse.json(
            { success: false, error: "Chat not found" },
            { status: 404 }
        );
    }

    return NextResponse.json({ success: true, chats });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
 