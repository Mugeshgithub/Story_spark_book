import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

export interface SessionData {
  id: string;
  title: string;
  content: string;
  chatHistory: any[];
  images: {
    coverImage?: string;
    illustrations: string[];
    drawings: string[];
  };
  createdAt: number;
  updatedAt: number;
}

class GoogleDriveService {
  private auth: any = null;
  private drive: any = null;
  private folderId: string | null = null;
  private isInitialized = false;
  private useLocalStorage = false;
  private storageDir = path.join(process.cwd(), 'data');

  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing Google Drive service...');
      
      // Check if we have the required environment variables
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.log('Missing Google OAuth credentials, falling back to local file storage');
        this.useLocalStorage = true;
        
        // Ensure storage directory exists
        if (!fs.existsSync(this.storageDir)) {
          fs.mkdirSync(this.storageDir, { recursive: true });
        }
        
        return true;
      }

      // For now, let's use local file storage as a fallback
      console.log('Using local file storage fallback for now');
      this.useLocalStorage = true;
      
      // Ensure storage directory exists
      if (!fs.existsSync(this.storageDir)) {
        fs.mkdirSync(this.storageDir, { recursive: true });
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing Google Drive service:', error);
      this.useLocalStorage = true;
      return true;
    }
  }

  private async findOrCreateFolder(): Promise<string> {
    // For local storage, we don't need a folder
    return 'local';
  }

  private getSessionsFilePath(): string {
    return path.join(this.storageDir, 'sessions.json');
  }

  private getSessionFilePath(sessionId: string): string {
    return path.join(this.storageDir, `session_${sessionId}.json`);
  }

  private getImageFilePath(fileName: string): string {
    return path.join(this.storageDir, fileName);
  }

  private readSessionsList(): Array<{ id: string; name: string; createdTime: string; fileId: string }> {
    try {
      const sessionsPath = this.getSessionsFilePath();
      if (fs.existsSync(sessionsPath)) {
        const data = fs.readFileSync(sessionsPath, 'utf8');
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error reading sessions list:', error);
      return [];
    }
  }

  private writeSessionsList(sessions: Array<{ id: string; name: string; createdTime: string; fileId: string }>): void {
    try {
      const sessionsPath = this.getSessionsFilePath();
      fs.writeFileSync(sessionsPath, JSON.stringify(sessions, null, 2));
    } catch (error) {
      console.error('Error writing sessions list:', error);
    }
  }

  async uploadImage(imageData: string, fileName: string): Promise<string> {
    try {
      if (this.useLocalStorage) {
        // Store image in local file system
        const imagePath = this.getImageFilePath(fileName);
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(imagePath, buffer);
        return fileName;
      }

      // Google Drive upload logic would go here
      throw new Error('Google Drive upload not implemented yet');
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  async uploadSession(sessionData: SessionData): Promise<string> {
    try {
      console.log('Starting uploadSession with data:', { id: sessionData.id, title: sessionData.title });
      
      if (this.useLocalStorage) {
        // Store session in local file system
        const sessionPath = this.getSessionFilePath(sessionData.id);
        fs.writeFileSync(sessionPath, JSON.stringify(sessionData, null, 2));
        
        // Also store in the sessions list
        const sessions = this.readSessionsList();
        const sessionInfo = {
          id: sessionData.id,
          name: sessionData.title,
          createdTime: new Date().toISOString(),
          fileId: sessionData.id
        };
        
        // Remove existing session if it exists
        const filteredSessions = sessions.filter(s => s.id !== sessionData.id);
        filteredSessions.unshift(sessionInfo);
        this.writeSessionsList(filteredSessions);
        
        console.log('Session stored locally with path:', sessionPath);
        return sessionData.id;
      }

      // Google Drive upload logic would go here
      throw new Error('Google Drive upload not implemented yet');
    } catch (error) {
      console.error('Error uploading session:', error);
      throw error;
    }
  }

  async downloadSession(fileId: string): Promise<SessionData> {
    try {
      if (this.useLocalStorage) {
        const sessionPath = this.getSessionFilePath(fileId);
        if (!fs.existsSync(sessionPath)) {
          throw new Error('Session not found');
        }
        const data = fs.readFileSync(sessionPath, 'utf8');
        return JSON.parse(data);
      }

      // Google Drive download logic would go here
      throw new Error('Google Drive download not implemented yet');
    } catch (error) {
      console.error('Error downloading session:', error);
      throw error;
    }
  }

  async listSessions(): Promise<Array<{ id: string; name: string; createdTime: string; fileId: string }>> {
    try {
      if (this.useLocalStorage) {
        return this.readSessionsList();
      }

      // Google Drive list logic would go here
      return [];
    } catch (error) {
      console.error('Error listing sessions:', error);
      return [];
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      if (this.useLocalStorage) {
        const sessionPath = this.getSessionFilePath(fileId);
        if (fs.existsSync(sessionPath)) {
          fs.unlinkSync(sessionPath);
        }
        
        // Also remove from sessions list
        const sessions = this.readSessionsList();
        const filteredSessions = sessions.filter(s => s.fileId !== fileId);
        this.writeSessionsList(filteredSessions);
        return;
      }

      // Google Drive delete logic would go here
      throw new Error('Google Drive delete not implemented yet');
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  getFileUrl(fileId: string): string {
    if (this.useLocalStorage) {
      return `local://${fileId}`;
    }
    return `https://drive.google.com/uc?id=${fileId}`;
  }
}

export const googleDriveService = new GoogleDriveService();