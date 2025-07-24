"use client";

import { useState, useCallback } from 'react';
import { useToast } from './use-toast';
import type { SessionData } from '@/lib/google-drive';

interface DriveFile {
  id: string;
  name: string;
  createdTime: string;
}

export function useGoogleDrive() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const uploadImage = useCallback(async (imageData: string, fileName: string): Promise<{ fileId: string; fileUrl: string } | null> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/drive/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData, fileName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      toast({
        title: 'Image uploaded successfully!',
        description: 'Your image has been saved locally.',
      });

      return {
        fileId: data.fileId,
        fileUrl: data.fileUrl,
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'Failed to upload image locally.',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const uploadSession = useCallback(async (sessionData: SessionData): Promise<{ fileId: string; fileUrl: string } | null> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/drive/upload-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload session');
      }

      toast({
        title: 'Session saved successfully!',
        description: 'Your story session has been saved locally.',
      });

      return {
        fileId: data.fileId,
        fileUrl: data.fileUrl,
      };
    } catch (error) {
      console.error('Error uploading session:', error);
      toast({
        variant: 'destructive',
        title: 'Save failed',
        description: 'Failed to save session locally.',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const listSessions = useCallback(async (): Promise<DriveFile[]> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/drive/sessions', {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to list sessions');
      }

      return data.sessions || [];
    } catch (error) {
      console.error('Error listing sessions:', error);
      toast({
        variant: 'destructive',
        title: 'Load failed',
        description: 'Failed to load sessions from Google Drive.',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const downloadSession = useCallback(async (fileId: string): Promise<SessionData | null> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/drive/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to download session');
      }

      toast({
        title: 'Session loaded successfully!',
        description: 'Your story session has been loaded from Google Drive.',
      });

      return data.session;
    } catch (error) {
      console.error('Error downloading session:', error);
      toast({
        variant: 'destructive',
        title: 'Load failed',
        description: 'Failed to load session from Google Drive.',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const deleteSession = useCallback(async (fileId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/drive/sessions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete session');
      }

      toast({
        title: 'Session deleted successfully!',
        description: 'Your story session has been removed from Google Drive.',
      });

      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: 'Failed to delete session from Google Drive.',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    isLoading,
    uploadImage,
    uploadSession,
    listSessions,
    downloadSession,
    deleteSession,
  };
} 