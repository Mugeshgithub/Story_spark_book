import { useState, useCallback } from 'react';
import { useGoogleDrive } from './use-google-drive';
import type { SessionData } from '@/lib/google-drive';
import slugify from 'slugify';

export function useDriveBooks() {
  const {
    isLoading,
    uploadSession,
    listSessions,
    downloadSession,
    deleteSession,
  } = useGoogleDrive();

  const [books, setBooks] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(false);

  // List all books (sessions) from Google Drive
  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const files = await listSessions();
      // Download each session's content
      const sessions: SessionData[] = [];
      for (const file of files) {
        const session = await downloadSession(file.id);
        if (session) sessions.push(session);
      }
      setBooks(sessions);
      return sessions;
    } catch (error) {
      setBooks([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [listSessions, downloadSession]);

  // Create a new book (session) and save to Google Drive
  const addBook = useCallback(async () => {
    const now = Date.now();
    const newBook: SessionData = {
      id: `${now}`,
      title: 'Untitled Story',
      content: '<h2>Untitled Story</h2><p>This is the first page of your new book. Start writing your story here!</p>',
      chatHistory: [],
      images: { coverImage: undefined, illustrations: [], drawings: [] },
      createdAt: now,
      updatedAt: now,
    };
    const result = await uploadSession(newBook);
    if (result) {
      await fetchBooks();
      return newBook;
    }
    return null;
  }, [uploadSession, fetchBooks]);

  // Get a book by session ID (this is the main function we need)
  const getBookById = useCallback(
    async (sessionId: string): Promise<SessionData | null> => {
      try {
        const session = await downloadSession(sessionId);
        return session || null;
      } catch (error) {
        console.error('Error loading session by ID:', error);
        return null;
      }
    },
    [downloadSession]
  );

  // Get a book by slug (for backward compatibility)
  const getBookBySlug = useCallback(
    async (slug: string): Promise<SessionData | null> => {
      // First try to load by session ID (if the slug is actually a session ID)
      try {
        const session = await downloadSession(slug);
        if (session) return session;
      } catch (error) {
        // If that fails, try to find by slug
        if (!books.length) await fetchBooks();
        const found = books.find((b) => slugify(b.title, { lower: true, strict: true, trim: true }) === slug);
        return found || null;
      }
      return null;
    },
    [books, fetchBooks, downloadSession]
  );

  // Update a book (session) in Google Drive
  const updateBook = useCallback(async (updates: Partial<SessionData> & { id: string }) => {
    const book = books.find((b) => b.id === updates.id);
    if (!book) return;
    const updatedBook = { ...book, ...updates, updatedAt: Date.now() };
    await uploadSession(updatedBook);
    await fetchBooks();
  }, [books, uploadSession, fetchBooks]);

  // Delete a book (session) in Google Drive
  const removeBook = useCallback(async (id: string) => {
    // Find the file ID by matching the session ID
    const files = await listSessions();
    for (const file of files) {
      const session = await downloadSession(file.id);
      if (session && session.id === id) {
        await deleteSession(file.id);
        break;
      }
    }
    await fetchBooks();
  }, [listSessions, downloadSession, deleteSession, fetchBooks]);

  return {
    books,
    isLoading: loading || isLoading,
    fetchBooks,
    addBook,
    getBookBySlug,
    getBookById,
    updateBook,
    removeBook,
  };
} 