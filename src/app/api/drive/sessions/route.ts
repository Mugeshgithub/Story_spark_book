import { NextRequest, NextResponse } from 'next/server';
import { googleDriveService } from '@/lib/google-drive';

export async function GET() {
  try {
    console.log('Starting GET /api/drive/sessions');
    
    // Initialize Google Drive service
    await googleDriveService.initialize();

    // List sessions from Google Drive (or local storage)
    const sessions = await googleDriveService.listSessions();

    console.log('Retrieved sessions:', sessions.length);

    return NextResponse.json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error('Error listing sessions:', error);
    return NextResponse.json(
      { error: 'Failed to list sessions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Starting POST /api/drive/sessions');
    
    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json(
        { error: 'Missing file ID' },
        { status: 400 }
      );
    }

    // Initialize Google Drive service
    await googleDriveService.initialize();

    // Download session from Google Drive (or local storage)
    const sessionData = await googleDriveService.downloadSession(fileId);

    console.log('Downloaded session:', sessionData.id);

    return NextResponse.json({
      success: true,
      session: sessionData,
    });
  } catch (error) {
    console.error('Error downloading session:', error);
    return NextResponse.json(
      { error: 'Failed to download session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('Starting DELETE /api/drive/sessions');
    
    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json(
        { error: 'Missing file ID' },
        { status: 400 }
      );
    }

    // Initialize Google Drive service
    await googleDriveService.initialize();

    // Delete session from Google Drive (or local storage)
    await googleDriveService.deleteFile(fileId);

    console.log('Deleted session:', fileId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 