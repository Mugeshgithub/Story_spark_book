"use client";

import { useState, useRef, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Sparkles, LoaderCircle, Mic, MicOff, GripHorizontal, Download, Save, BookUp, Bot } from 'lucide-react';
import { chatWithStoryAi, ChatMessage } from '@/ai/flows/chat-with-story-ai';
import { useToast } from '@/hooks/use-toast';
import { StoryPreview } from './StoryPreview';
import { Book } from '@/lib/types';
import Image from 'next/image';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
  } from "@/components/ui/resizable"
import { useDriveBooks } from '@/hooks/use-drive-books';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useAuth } from '@/hooks/use-auth';
import slugify from 'slugify';
import type { SessionData } from '@/lib/google-drive';

declare global {
    interface Window {
      SpeechRecognition: any;
      webkitSpeechRecognition: any;
    }
}

interface ChatMessageWithImage extends ChatMessage {
    imageUrl?: string | null;
}

const createSlug = (title: string) => {
    return slugify(title, { lower: true, strict: true, trim: true });
};

export function StoryCreator() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getBookById, updateBook, addBook, fetchBooks } = useDriveBooks();

  const sessionId = typeof params.slug === 'string' ? params.slug : '';
  const [currentBook, setCurrentBook] = useState<SessionData | null>(null);
  const [messages, setMessages] = useState<ChatMessageWithImage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUiLoading, setUiLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const handleSave = useCallback(async (bookUpdates: Partial<SessionData> & { id: string }, silent: boolean = false) => {
    if(!bookUpdates.id) return;
    
    setIsSaving(true);

    try {
        await updateBook(bookUpdates);
        
        setCurrentBook(prev => prev ? { ...prev, ...bookUpdates, updatedAt: Date.now() } : null);

        if (!silent) {
            toast({
                title: "Story Saved!",
                description: "Your progress has been saved.",
                duration: 2000,
            });
        }
    } catch(e) {
        console.error("Failed to save book", e);
        toast({ variant: 'destructive', title: 'Save failed', description: 'Could not save your story. Please try again.'});
    } finally {
        setTimeout(() => setIsSaving(false), 1000);
    }
  }, [updateBook, toast]);

  useEffect(() => {
    // This effect handles authentication and initial data fetching.
    const initialize = async () => {
        if (authLoading) return; // Wait for auth check to complete

        if (!user) {
            router.push('/login');
            return;
        }

        if (sessionId) {
            setUiLoading(true);
            const book = await getBookById(sessionId);
            if (book) {
                setCurrentBook(book);
                
                // Check if we have a title parameter from the URL (from homepage)
                const titleFromUrl = searchParams.get('title');
                if (titleFromUrl && titleFromUrl !== book.title) {
                    // Update the book title with the one from URL
                    const updatedBook = { ...book, title: titleFromUrl };
                    setCurrentBook(updatedBook);
                    
                    // Save the updated title directly without using handleSave
                    try {
                        await updateBook({ id: book.id, title: titleFromUrl });
                    } catch (error) {
                        console.error("Failed to update title:", error);
                    }
                }
            } else {
                toast({ variant: 'destructive', title: 'Story not found' });
                router.replace('/gallery'); // Use replace to avoid broken back button history
            }
            setUiLoading(false);
        }
    };
    initialize();
  }, [sessionId, user, authLoading, getBookById, router, toast, searchParams, updateBook]);


  useEffect(() => {
    setMessages([
        {
          role: 'model',
          content: "Hey Naru, Welcome to your creative space !",
        },
      ]);
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollableViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollableViewport) {
        scrollableViewport.scrollTop = scrollableViewport.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
         setInput(prevInput => prevInput.trim() + ' ' + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      toast({
        variant: 'destructive',
        title: 'Voice recognition error',
        description: event.error === 'not-allowed' ? 'Microphone access denied.' : `Error: ${event.error}`,
      });
      setIsRecording(false);
    };
    
    recognition.onend = () => {
      setIsRecording(false);
    }

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.stop();
    };
  }, [toast]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentBook) return;

    if (isRecording) {
      recognitionRef.current?.stop();
    }

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    const currentStoryForAI = new DOMParser().parseFromString(currentBook.content, 'text/html').body.textContent || ''

    try {
      const result = await chatWithStoryAi({
        history: messages,
        message: input,
        storyTitle: currentBook.title,
        currentStory: currentStoryForAI,
      });

      const aiMessage: ChatMessageWithImage = { 
        role: 'model', 
        content: result.response,
        imageUrl: result.imageUrl,
    };
      setMessages((prev) => [...prev, aiMessage]);
            
      if(result.updatedTitle && currentBook) {
        handleSave({ id: currentBook.id, title: result.updatedTitle });
      }

    } catch (error) {
      console.error('AI chat failed:', error);
      toast({
        variant: 'destructive',
        title: 'Oh no! Sparky is confused.',
        description: 'Could not get a response. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };


  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleContentChange = (newContent: string) => {
    if (!currentBook) return;
    setCurrentBook(prev => prev ? { ...prev, content: newContent } : null);
    
    // --- Added Logging ---
    console.log("Content changed. New content:", newContent);
    // --- End Added Logging ---

    startTransition(() => {
        // debouncedUpdateBook({ id: currentBook.id, content: newContent }); // This line was removed as per the new_code
    });
  };

if (isUiLoading || authLoading || !currentBook) {
  return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)]">
          <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading your creative space...</p>
      </div>
  );
}

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        <ResizablePanel defaultSize={40} minSize={30}>
            <div className="flex flex-col h-full bg-background rounded-lg border">
                <div className="p-4 border-b flex items-center justify-between">
                    <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                            <Bot className="h-6 w-6" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2">
                        {(isSaving || isPending) && <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" />}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" onClick={() => handleSave({id: currentBook.id, content: currentBook.content})}>
                                        <Save className="h-4 w-4" />
                                        <span className="sr-only">Save Progress</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Save Progress</p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" asChild>
                                        <Link href="/gallery"><BookUp className="h-4 w-4"/><span className="sr-only">Gallery</span></Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>View Gallery</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                    <ScrollArea className="h-full" ref={scrollAreaRef}>
                        <div className="space-y-6 max-w-3xl mx-auto pr-4">
                        {messages.map((message, index) => (
                            <div
                            key={index}
                            className={`flex items-start gap-3 ${
                                message.role === 'user' ? 'justify-end' : ''
                            }`}
                            >
                            {message.role === 'model' && (
                                <Avatar>
                                <AvatarFallback><Sparkles /></AvatarFallback>
                                </Avatar>
                            )}
                            <div
                                className={`rounded-lg px-4 py-3 max-w-[85%] whitespace-pre-wrap ${
                                message.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                            >
                                <p className="text-sm">{message.content}</p>
                                {message.imageUrl && (
                                    <div className="mt-4">
                                        <Image
                                            src={message.imageUrl}
                                            alt="Generated by AI"
                                            width={300}
                                            height={300}
                                            className="rounded-md"
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2"
                                            asChild
                                        >
                                            <a href={message.imageUrl} download={`story-spark-image-${Date.now()}.png`}>
                                                <Download className="mr-2 h-4 w-4" />
                                                Download
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-3">
                                <Avatar>
                                <AvatarFallback><Sparkles /></AvatarFallback>
                                </Avatar>
                                <div className="rounded-lg px-4 py-3 max-w-[80%] bg-muted flex items-center">
                                <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                            </div>
                        )}
                        </div>
                    </ScrollArea>
                </div>
                <div className="border-t bg-background p-4 rounded-b-lg">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3 max-w-3xl mx-auto">
                        <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Tell Sparky an idea, or ask a question..."
                        disabled={isLoading}
                        autoFocus
                        />
                        <Button type="button" size="icon" variant={isRecording ? "destructive" : "outline"} onClick={toggleRecording} disabled={isLoading}>
                        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        <span className="sr-only">{isRecording ? "Stop recording" : "Start recording"}</span>
                        </Button>
                        <Button type="submit" disabled={isLoading || !input.trim()}>
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </div>
            </div>
        </ResizablePanel>
        <ResizableHandle withHandle>
            <div className="w-2 flex items-center justify-center">
                <GripHorizontal className="h-4 w-4 text-muted-foreground" />
            </div>
        </ResizableHandle>
        <ResizablePanel defaultSize={60} minSize={30}>
            <StoryPreview
                book={currentBook}
                onContentChange={handleContentChange}
                onBookChange={(updates) => handleSave({...currentBook, ...updates})}
            />
        </ResizablePanel>
    </ResizablePanelGroup>
  );
}