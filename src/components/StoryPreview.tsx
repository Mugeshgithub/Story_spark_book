
"use client";

import { Card, CardContent, CardHeader } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { TiptapEditor } from "./TiptapEditor";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { Download, Paintbrush, LoaderCircle } from "lucide-react";
import { exportToPdf } from "@/lib/pdf";
import { Input } from "./ui/input";
import { useState, useEffect, useCallback, useTransition } from "react";
import { DrawingCanvas } from "./DrawingCanvas";
import { useGoogleDrive } from '@/hooks/use-google-drive';
import type { Book } from '@/lib/types';

interface StoryPreviewProps {
  book: Book | null;
  onContentChange: (newContent: string) => void;
  onBookChange: (updates: Partial<Book>) => void;
}

export function StoryPreview({ book, onContentChange, onBookChange }: StoryPreviewProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(book?.title || '');
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setTitle(book?.title || '');
  }, [book?.title]);

  const handleTitleBlur = () => {
    if (title.trim() && title !== book?.title) {
        onBookChange({ title });
    } else {
        setTitle(book?.title || ''); // revert if empty or unchanged
    }
  }

  const handleDownloadPdf = async () => {
    if (!book?.title) {
        toast({
            variant: 'destructive',
            title: 'Please set a title first',
            description: 'Your story needs a title before it can be exported.',
        });
        return;
    }

    toast({
        title: 'Generating PDF...',
        description: 'Your story is being prepared for download.',
    });
    try {
        await exportToPdf(book);
    } catch (error) {
        console.error("PDF Export failed", error);
        toast({
            variant: 'destructive',
            title: 'PDF Generation Failed',
            description: 'There was an error creating your PDF. Please try again.',
        });
    }
  }

  const { uploadImage } = useGoogleDrive();

  const handleDrawingSave = useCallback(async (drawingDataUrl: string) => {
    if (!book) return;
    
    setIsUploading(true);

    try {
      if (drawingDataUrl === "DELETE") {
        // Clear the drawing
        onBookChange({ drawingUrl: null });
        toast({ title: "Drawing Cleared" });
      } else {
        const fileName = `drawing-${book.id}-${Date.now()}.png`;
        const result = await uploadImage(drawingDataUrl, fileName);
        
        if (result) {
          // result is { fileId: string; fileUrl: string }
          onBookChange({ drawingUrl: result.fileUrl });
          toast({ title: "Drawing Saved!" });
        } else {
          throw new Error('Upload failed');
        }
      }
    } catch(error) {
        console.error("Drawing save/upload failed", error);
        toast({ variant: 'destructive', title: 'Drawing could not be saved.' });
    } finally {
        setIsUploading(false);
    }
  }, [book, onBookChange, toast, uploadImage]);


  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <Input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            placeholder="Your Story Title"
            className="font-serif text-2xl font-bold border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto -ml-1"
        />
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setIsDrawingEnabled(!isDrawingEnabled)} title="Toggle Drawing Tools">
                <Paintbrush className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleDownloadPdf} disabled={!book?.title}>
                <Download className="mr-2 h-4 w-4" />
                PDF
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden relative p-0">
        <ScrollArea className="h-full w-full">
            <TiptapEditor 
                content={book?.content || ''} 
                onChange={onContentChange} 
            />
        </ScrollArea>
        {isDrawingEnabled && (
            <DrawingCanvas
                initialDataUrl={book?.drawingUrl || null}
                onSave={handleDrawingSave}
            />
        )}
        {(isUploading || isPending) && (
            <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-20">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-muted-foreground">Saving your masterpiece...</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
