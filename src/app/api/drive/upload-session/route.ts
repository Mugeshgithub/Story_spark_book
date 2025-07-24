import { NextRequest, NextResponse } from 'next/server';
import { googleDriveService, type SessionData } from '@/lib/google-drive';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting POST /api/drive/upload-session');
    
    const sessionData: SessionData = await request.json();
    console.log('Session data received:', { id: sessionData.id, title: sessionData.title });

    if (!sessionData.id || !sessionData.title) {
      console.error('Missing session id or title');
      return NextResponse.json(
        { error: 'Missing session id or title' },
        { status: 400 }
      );
    }

    console.log('Initializing Google Drive service...');
    
    // Initialize Google Drive service
    const initialized = await googleDriveService.initialize();
    
    if (!initialized) {
      console.error('Failed to initialize Google Drive service');
      return NextResponse.json(
        { error: 'Failed to initialize Google Drive service' },
        { status: 500 }
      );
    }

    console.log('Google Drive service initialized, uploading session...');

    // Upload session to Google Drive (or local storage)
    const fileId = await googleDriveService.uploadSession(sessionData);

    console.log('Session uploaded successfully with file ID:', fileId);

    return NextResponse.json({
      success: true,
      fileId,
      fileUrl: googleDriveService.getFileUrl(fileId),
    });
  } catch (error) {
    console.error('Error uploading session to Google Drive:', error);
    return NextResponse.json(
      { error: 'Failed to upload session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 