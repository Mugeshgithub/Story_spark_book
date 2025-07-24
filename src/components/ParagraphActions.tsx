
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { Button } from './ui/button';
import { Image as ImageIcon, LoaderCircle, RefreshCw, Undo, Redo, BookImage } from 'lucide-react';
import { generateImageForStory } from '@/ai/flows/generate-image-for-story';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface ParagraphActionsProps {
  editor: Editor;
  pos: number;
}

export function ParagraphActions({ editor, pos }: ParagraphActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { toast } = useToast();
  
  const currentImageUrl = history[historyIndex];

  const handleGenerateImage = useCallback(async () => {
    setIsLoading(true);
    const node = editor.state.doc.nodeAt(pos);
    if (node) {
      const paragraphText = node.textContent;
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Image generation timed out')), 20000); // 20 second timeout
        });
        
        const resultPromise = generateImageForStory({ storyText: paragraphText });
        
        const result = await Promise.race([resultPromise, timeoutPromise]) as any;
        
        if (result.imageUrl) {
          const newHistory = history.slice(0, historyIndex + 1);
          newHistory.push(result.imageUrl);
          setHistory(newHistory);
          setHistoryIndex(newHistory.length - 1);
        }
      } catch (error) {
        console.error("Image generation failed", error);
        const errorMessage = error instanceof Error && error.message === 'Image generation timed out' 
          ? 'Image generation took too long. Please try again.'
          : 'Could not generate an image for this paragraph.';
        
        toast({
          variant: 'destructive',
          title: 'Image generation failed',
          description: errorMessage
        });
      }
    }
    setIsLoading(false);
  }, [editor, pos, toast, history, historyIndex]);

  const insertImageIntoEditor = useCallback(() => {
    if (currentImageUrl) {
        const insertPos = pos + editor.state.doc.nodeAt(pos)!.nodeSize;
        editor.chain().focus().insertContentAt(insertPos, {
            type: 'image',
            attrs: { src: currentImageUrl },
        }).run();
        setHistory([]);
        setHistoryIndex(-1);
    }
  }, [editor, currentImageUrl, pos]);
  
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  }

  if (currentImageUrl) {
    return (
        <div className="not-prose my-4 p-2 border rounded-md bg-muted/50 relative group">
            <img src={currentImageUrl} alt="Generated illustration" className="rounded-md w-full h-auto" />
            <div className="absolute bottom-2 right-2 flex items-center justify-end gap-2 bg-background/50 p-1 rounded-md">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="outline" onClick={handleUndo} disabled={historyIndex <= 0}>
                                <Undo className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Previous</p></TooltipContent>
                    </Tooltip>
                     <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="outline" onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
                                <Redo className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Next</p></TooltipContent>
                    </Tooltip>
                     <Tooltip>
                        <TooltipTrigger asChild>
                             <Button size="icon" variant="outline" onClick={handleGenerateImage} disabled={isLoading}>
                                {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Generate New</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <Button size="sm" onClick={insertImageIntoEditor}>
                    <BookImage className="mr-2 h-4 w-4" />
                    Insert
                </Button>
            </div>
      </div>
    );
  }

  if (isLoading) {
    return (
        <div className="flex items-center justify-center my-4 p-2 text-muted-foreground not-prose">
            <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
            <span>Generating your illustration... (this may take 10-15 seconds)</span>
        </div>
    )
  }

  return (
    <div className="text-center my-2 not-prose">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-muted-foreground"
                        onClick={handleGenerateImage}
                        disabled={isLoading}
                    >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Illustrate this?
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Create an image based on the paragraph above</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </div>
  );
}
