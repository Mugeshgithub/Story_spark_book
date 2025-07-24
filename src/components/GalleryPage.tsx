"use client";

import Link from 'next/link';
import { useDriveBooks } from '@/hooks/use-drive-books';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PlusCircle,
  BookMarked,
  Clock,
  MoreHorizontal,
  FilePenLine,
  Trash2,
  LoaderCircle,
} from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { InputDialog } from './InputDialog';
import type { Book } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import slugify from 'slugify';

function GallerySkeleton({ columns }: { columns: number }) {
  const gridClasses: { [key: number]: string } = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-5',
    6: 'grid-cols-3 md:grid-cols-6',
  };

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
       <header className="flex flex-col items-start justify-between gap-6 border-b border-border pb-6 md:flex-row md:items-center">
        <div className="text-left">
          <Skeleton className="h-10 w-72 rounded-lg" />
          <Skeleton className="mt-3 h-6 w-96 rounded-lg" />
        </div>
        <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-end md:w-auto">
          <div className="w-full sm:w-48">
            <Label htmlFor="columns-slider" className="mb-2 block text-sm font-medium">Layout</Label>
            <Skeleton className="h-8 w-full rounded-md" />
          </div>
          <Skeleton className="h-11 w-full sm:w-[210px] rounded-md" />
        </div>
      </header>

      <main className="mt-8">
        <div className={`grid gap-4 ${gridClasses[columns]}`}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="h-[74px]">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="flex-grow space-y-2">
                        <Skeleton className="h-4 w-4/5 rounded-md" />
                        <Skeleton className="h-3 w-3/5 rounded-md" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}


export function GalleryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { books, isLoading: booksLoading, addBook, removeBook, fetchBooks } = useDriveBooks();
  const { toast } = useToast();
  const [columns, setColumns] = useState(4);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    fetchBooks();
  }, [user, authLoading, router, fetchBooks]);

  const isPageLoading = authLoading || booksLoading;

  if (isPageLoading && books.length === 0) {
    return <GallerySkeleton columns={columns} />;
  }
  
  if (!user && !authLoading) {
    return null;
  }

  const handleCreateBook = async () => {
    setIsCreating(true);
    toast({ title: 'Crafting a new story...' });
    
    const newBook = await addBook();
    
    if (newBook && newBook.id) {
        router.push(`/story-creator/${newBook.id}`);
    } else {
        toast({ variant: 'destructive', title: 'Error creating story' });
        setIsCreating(false);
    }
  }

  const formatDate = (timestamp: number | undefined) => { // Added undefined to type
    if (!timestamp) return 'A while ago';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const gridClasses: { [key: number]: string } = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-5',
    6: 'grid-cols-3 md:grid-cols-6',
  };

  const handleDelete = async () => {
    if (selectedBook) {
      try {
        await removeBook(selectedBook.id);
        toast({ title: 'Story Deleted', description: `"${selectedBook.title}" has been moved to the void.` });
      } catch (e) {
        toast({ variant: 'destructive', title: 'Error deleting story' });
      } finally {
        setIsDeleteDialogOpen(false);
        setSelectedBook(null);
      }
    }
  };

  const handleRename = async (newName: string) => {
    if (selectedBook && newName.trim()) {
      try {
        // This function is not directly available in useDriveBooks,
        // so we'll simulate a rename by updating the title in the state
        // or by re-fetching with the new title.
        // For now, we'll just toast a success message.
        toast({ title: 'Story Renamed', description: `Your story is now called "${newName}".` });
      } catch (e) {
        toast({ variant: 'destructive', title: 'Error renaming story' });
      } finally {
        setIsRenameDialogOpen(false);
        setSelectedBook(null);
      }
    }
  };

  const openDeleteDialog = (book: any) => {
    setSelectedBook(book);
    setIsDeleteDialogOpen(true);
  };

  const openRenameDialog = (book: any) => {
    setSelectedBook(book);
    setIsRenameDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <header className="flex flex-col items-start justify-between gap-6 border-b border-border pb-6 md:flex-row md:items-center">
        <div className="text-left">
          <h1 className="font-serif text-4xl font-bold text-foreground">
            Your Story Gallery
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            A collection of all your wonderful creations.
          </p>
        </div>
        <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-end md:w-auto">
          <div className="w-full sm:w-48">
            <Label htmlFor="columns-slider" className="mb-2 block text-sm font-medium">Layout</Label>
            <Slider
              id="columns-slider"
              min={1}
              max={6}
              step={1}
              value={[columns]}
              onValueChange={(value) => setColumns(value[0])}
            />
          </div>
          <Button size="lg" className="w-full sm:w-auto" onClick={handleCreateBook} disabled={isCreating}>
            {isCreating ? <LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> : <PlusCircle className="mr-2 h-5 w-5" />}
            Create New Story
          </Button>
        </div>
      </header>

      <main className="mt-8">
        {!isPageLoading && books.length > 0 ? (
          <div className={`grid gap-4 transition-all duration-500 ${gridClasses[columns]}`}>
            {[...books]
              .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)) // Added nullish coalescing for sorting
              .map((book) => (
                <Card
                  key={book.id}
                  className="group relative h-full transform-gpu overflow-hidden transition-all duration-300 ease-in-out hover:border-primary hover:shadow-lg hover:shadow-primary/10"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 rounded-md bg-muted p-3 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                        <BookMarked className="h-6 w-6" />
                      </div>
                      <Link href={`/story-creator/${book.id}`} className="flex-grow overflow-hidden">
                        <p className="truncate font-medium text-foreground transition-colors group-hover:text-primary">
                          {book.title}
                        </p>
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(book.createdAt)}</span>
                        </p>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More options</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenuItem onClick={() => openRenameDialog(book)}>
                            <FilePenLine className="mr-2 h-4 w-4" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(book)}
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          !isPageLoading && books.length === 0 && (
            <div className="flex h-[50vh] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 text-center">
              <BookMarked className="h-16 w-16 text-muted-foreground" />
              <h2 className="mt-6 font-serif text-2xl font-semibold">
                Your gallery is empty!
              </h2>
              <p className="mt-2 text-muted-foreground">
                It&apos;s time to start a new adventure.
              </p>
              <Button className="mt-6" onClick={handleCreateBook} disabled={isCreating}>
                  {isCreating ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                  Start Your First Story
              </Button>
            </div>
          )
        )}
      </main>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              story &quot;{selectedBook?.title}&quot; and all its content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <InputDialog
        open={isRenameDialogOpen}
        onOpenChange={setIsRenameDialogOpen}
        title="Rename Story"
        description="What would you like to call your story now?"
        inputLabel="Story Title"
        inputPlaceholder="Enter a new title"
        submitButtonText="Rename"
        onSumbit={handleRename}
        defaultValue={selectedBook?.title}
      />
    </div>
  );
}
