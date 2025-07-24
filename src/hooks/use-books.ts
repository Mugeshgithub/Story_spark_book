
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Book } from '@/lib/types';
import slugify from 'slugify';
import { useToast } from './use-toast';
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from '@/lib/firebase';
import { useAuth } from './use-auth';

const LOCAL_STORAGE_KEY = 'story-spark-books';

const createSlug = (title: string) => {
  if (!title) return `untitled-${Date.now()}`;
  return slugify(title, { lower: true, strict: true, trim: true });
};

const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    let timeout: NodeJS.Timeout | null = null;

    const debounced = (...args: Parameters<F>): Promise<ReturnType<F>> =>
      new Promise(resolve => {
        if (timeout) {
          clearTimeout(timeout);
        }

        timeout = setTimeout(() => resolve(func(...args)), waitFor);
      });

    return debounced;
};

export function useBooks() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const getLocalStorageKey = useCallback(() => {
    return user ? `${LOCAL_STORAGE_KEY}-${user.uid}` : null;
  }, [user]);

  // Load books from localStorage
  useEffect(() => {
    const key = getLocalStorageKey();
    if (!key) {
        setBooks([]);
        setIsLoading(false);
        return;
    };
    
    setIsLoading(true);
    try {
      const storedBooks = localStorage.getItem(key);
      if (storedBooks) {
        const parsedBooks = JSON.parse(storedBooks);
        // Validate that we have an array of books
        if (Array.isArray(parsedBooks)) {
          setBooks(parsedBooks);
        } else {
          console.warn('Invalid books data in localStorage, resetting');
          setBooks([]);
        }
      } else {
        setBooks([]);
      }
    } catch (error) {
      console.error("Failed to load books from local storage", error);
      toast({ variant: 'destructive', title: 'Could not load your stories.' });
      setBooks([]);
    }
    setIsLoading(false);
  }, [toast, getLocalStorageKey]);

  // Save books to localStorage with error handling
  const persistBooks = useCallback((updatedBooks: Book[]) => {
    const key = getLocalStorageKey();
    if (!key) return;

    try {
        setBooks(updatedBooks);
        localStorage.setItem(key, JSON.stringify(updatedBooks));
        console.log('Books saved to localStorage:', updatedBooks.length);
    } catch (error) {
        console.error("Error persisting books", error);
        
        // Try to save with smaller chunks if the data is too large
        try {
          const smallerBooks = updatedBooks.map(book => ({
            ...book,
            content: book.content.length > 10000 ? book.content.substring(0, 10000) + '...' : book.content
          }));
          localStorage.setItem(key, JSON.stringify(smallerBooks));
          toast({ 
            variant: 'destructive', 
            title: 'Story content was truncated', 
            description: 'Your story was too large and had to be shortened to save properly.'
          });
        } catch (secondError) {
          console.error("Failed to save even truncated books", secondError);
          toast({ 
            variant: 'destructive', 
            title: 'Save failed', 
            description: 'Could not save your stories. Please try clearing some browser data.'
          });
        }
    }
  }, [getLocalStorageKey, toast]);
  
  // Create a new book
  const addBook = useCallback(async (): Promise<Book | null> => {
    if (!user) {
        toast({ variant: 'destructive', title: 'You must be logged in to create a story.' });
        return null;
    }
    
    const newBookTitle = `Untitled Story`;
    const newBook: Book = {
      id: `${Date.now()}`,
      userId: user.uid,
      slug: createSlug(`${newBookTitle}-${Date.now()}`),
      title: newBookTitle,
      coverImage: `https://placehold.co/400x600.png`,
      content: `<h2>${newBookTitle}</h2><p>This is the first page of your new book. Start writing your story here!</p>`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      drawingUrl: null,
    };

    const updatedBooks = [...books, newBook];
    persistBooks(updatedBooks);
    
    toast({
      title: "New story created!",
      description: "Your new story has been saved.",
      duration: 2000,
    });
    
    return newBook;
  }, [books, persistBooks, user, toast]);

  // Get book by slug
  const getBookBySlug = useCallback((slug: string): Book | null => {
    return books.find(book => book.slug === slug) || null;
  }, [books]);

  // Update book with immediate save
  const updateBook = useCallback((bookToUpdate: Partial<Book> & { id: string }) => {
     const updatedBooks = books.map(book => {
        if (book.id === bookToUpdate.id) {
            const changes = { ...bookToUpdate };
            return { ...book, ...changes, updatedAt: Date.now() };
        }
        return book;
    });
    persistBooks(updatedBooks);
  }, [books, persistBooks]);

  // Debounced update for frequent changes
  const debouncedUpdateBook = useMemo(
    () => debounce((bookToUpdate: Partial<Book> & { id: string }) => {
        updateBook(bookToUpdate);
    }, 1000), // Reduced from 1500ms to 1000ms for faster saving
    [updateBook]
  );

  // Delete book
  const deleteBook = useCallback(async (id: string) => {
    const bookToDelete = books.find(b => b.id === id);
    if (!bookToDelete) {
        toast({ variant: 'destructive', title: 'Could not find the story to delete.' });
        return;
    }

    try {
        const promises: Promise<void>[] = [];

        // Delete associated cover image from Storage if it's not the placeholder
        if (bookToDelete.coverImage && typeof bookToDelete.coverImage === 'string' && !bookToDelete.coverImage.startsWith('https://placehold.co/')) {
          try {
              const coverImageRef = ref(storage, bookToDelete.coverImage);
              promises.push(deleteObject(coverImageRef));
          } catch (e) {
              console.warn("Could not delete cover image (might not exist in storage):", bookToDelete.coverImage, e);
          }
        }
        
        // Delete associated drawing image from Storage if it exists
        if (bookToDelete.drawingUrl && typeof bookToDelete.drawingUrl === 'string') {
          try {
              const drawingRef = ref(storage, bookToDelete.drawingUrl);
              promises.push(deleteObject(drawingRef));
          } catch (e) {
              console.warn("Could not delete drawing image (might not exist in storage):", bookToDelete.drawingUrl, e);
          }
        }

        await Promise.all(promises);

        const updatedBooks = books.filter(book => book.id !== id);
        persistBooks(updatedBooks);

        toast({
          title: "Story deleted",
          description: "Your story has been removed.",
          duration: 2000,
        });

    } catch (error) {
      console.error("Error deleting book:", error);
      toast({ variant: 'destructive', title: 'Error deleting story', description: 'Could not remove the story. Please try again.' });
    }
  }, [books, persistBooks, toast]);
  
  // Rename book
  const renameBook = useCallback((id: string, newTitle: string) => {
    if (!newTitle.trim()) {
      toast({ variant: 'destructive', title: 'Invalid title', description: 'Story title cannot be empty.' });
      return;
    }
    
    const newSlug = createSlug(newTitle);
    const updatedBooks = books.map(book => {
        if (book.id === id) {
            return { ...book, title: newTitle, slug: newSlug, updatedAt: Date.now() };
        }
        return book;
    });
    persistBooks(updatedBooks);
    
    toast({
      title: "Story renamed",
      description: `Story renamed to "${newTitle}"`,
      duration: 2000,
    });
  }, [books, persistBooks, toast]);

  // Force save all books (useful for debugging)
  const forceSave = useCallback(() => {
    persistBooks(books);
    toast({
      title: "Stories saved",
      description: "All stories have been saved to local storage.",
      duration: 2000,
    });
  }, [books, persistBooks, toast]);

  return { 
    books, 
    isLoading, 
    addBook, 
    getBookBySlug, 
    updateBook, 
    deleteBook, 
    renameBook, 
    debouncedUpdateBook,
    forceSave
  };
}
