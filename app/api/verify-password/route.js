import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (!correctPassword) {
      return NextResponse.json(
        { message: "Password protection not configured" },
        { status: 500 }
      );
    }

    if (password === correctPassword) {
      const response = NextResponse.json({ success: true });
      response.cookies.set("password_verified", "true", {
        maxAge: 2592000, // 30 days
        path: "/",
      });
      return response;
    } else {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
