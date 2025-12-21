import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Chat from '@/models/Chat';
import connectDB from '@/lib/mongodb';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No session found' },
        { status: 401 }
      );
    }
    const body = await request.json();
    const { isImageUploaded, routineId, responses, metadata } = body;
    if (!isImageUploaded) {
      return NextResponse.json(
        { success: false, error: 'isImageUploaded is required' },
        { status: 400 }
      );
    }
    let userId = null;
    if (!userId) {
      console.error('⚠️ Could not find user ID in session!');
      console.error('Available session keys:', Object.keys(session));
      console.error('Available user keys:', Object.keys(session.user || {}));
      return NextResponse.json(
        { 
          success: false, 
          error: 'User ID not found in session',
          debug: {
            sessionKeys: Object.keys(session),
            userKeys: Object.keys(session.user || {})
          }
        },
        { status: 500 }
      );
    }
    await connectDB();
    console.log('Database connected');
    const chatData = {
      user: userId,  // This is the user ID
      title: `TIFF Analysis - ${metadata?.fileName || new Date().toLocaleDateString()}`,
      isImageUploaded: true,
      routineId: routineId || null,
      responses: responses || [],
      metadata: {
        uploadedAt: metadata?.uploadedAt || new Date(),
        fileName: metadata?.fileName || 'unknown.tiff',
        fileSize: metadata?.fileSize || 0,
        mlResult: metadata?.mlResult || null
      }
    };
    const newChat = await Chat.create(chatData);
    return NextResponse.json({ 
      success: true, 
      chat: {
        _id: newChat._id.toString(),
        user: newChat.user.toString(),
        title: newChat.title,
        isImageUploaded: newChat.isImageUploaded,
        routineId: newChat.routineId,
        responses: newChat.responses,
        metadata: newChat.metadata,
        createdAt: newChat.createdAt
      },
      message: 'Chat created successfully' 
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Chat Create Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create chat',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? {
          name: error.name,
          stack: error.stack,
          errors: error.errors
        } : undefined
      },
      { status: 500 }
    );
  }
}
