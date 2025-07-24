import { NextRequest, NextResponse } from 'next/server';
import { googleDriveService } from '@/lib/google-drive';

export async function POST(request: NextRequest) {
  try {
    const { imageData, fileName } = await request.json();

    if (!imageData || !fileName) {
      return NextResponse.json(
        { error: 'Missing imageData or fileName' },
        { status: 400 }
      );
    }

    // Initialize Google Drive service
    await googleDriveService.initialize();

    // Upload image to Google Drive
    const fileId = await googleDriveService.uploadImage(imageData, fileName);

    return NextResponse.json({
      success: true,
      fileId,
      fileUrl: googleDriveService.getFileUrl(fileId),
    });
  } catch (error) {
    console.error('Error uploading image to Google Drive:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
} 