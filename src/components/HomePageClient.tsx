
"use client";

import Link from 'next/link';
import { Button } from './ui/button';
import { Instagram, Sparkles, Pencil, BrainCircuit, LoaderCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { ZipGame } from './ZipGame';
import { useDriveBooks } from '@/hooks/use-drive-books';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { InputDialog } from './InputDialog';

export function HomePageClient() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const { addBook } = useDriveBooks();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (containerRef) {
        const rect = containerRef.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) / 20;
        const y = (event.clientY - rect.top - rect.height / 2) / 20;
        setMousePosition({ x, y });
      }
    };

    if (containerRef) {
      containerRef.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (containerRef) {
        containerRef.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [containerRef]);

  const iconStyle = (factor: number) => ({
    transform: `translate(${mousePosition.x * factor}px, ${mousePosition.y * factor}px)`,
    transition: 'transform 0.1s ease-out',
  });
  
  const lineStyle = {
    transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
    transition: 'transform 0.1s ease-out',
  };

  const handleStartNewStory = () => {
    setShowNameDialog(true);
  };

  const handleCreateStory = async (storyName: string) => {
    setIsCreating(true);
    setShowNameDialog(false);
    
    try {
      const newBook = await addBook();
      
      if (newBook && newBook.id) {
        // Update the title with the user's input
        const updatedBook = { ...newBook, title: storyName || 'Untitled Story' };
        // We'll update the title in the story creator page
        router.push(`/story-creator/${newBook.id}?title=${encodeURIComponent(storyName || 'Untitled Story')}`);
      } else {
        toast({ variant: 'destructive', title: 'Error creating story' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error creating story' });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
        <div className="flex h-[calc(100vh-6rem)] w-full font-body bg-background">
        {/* Left Column */}
        <div className="flex w-full flex-col p-8 md:w-1/2 md:p-12 lg:p-16">
            <main className="flex flex-grow flex-col justify-center">
            <div className="max-w-lg">
                <div className="flex items-center">
                <h1 className="font-serif text-5xl font-bold text-foreground md:text-6xl">
                    SPARK
                </h1>
                <div className="ml-4 -mt-4 flex flex-col items-start">
                    <span className="text-lg font-light tracking-wider md:text-xl">YOUR</span>
                    <div className="flex items-center">
                    <span className="text-lg font-light tracking-wider md:text-xl">IMAGINATION</span>
                    <div className="ml-2 flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-primary"></div>
                        <div className="h-2.5 w-2.5 rounded-full bg-purple-500"></div>
                    </div>
                    </div>
                </div>
                </div>

                <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground font-sans">
                Hey, Naru. Welcome to your space !<br/>
                Have an amazing Journey with your Sparky
                </p>

                <Button 
                    variant="link" 
                    className="mt-8 p-0 text-base text-primary no-underline hover:no-underline"
                    onClick={handleStartNewStory}
                    disabled={isCreating}
                >
                    {isCreating ? (
                        <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Creating Story...
                        </>
                    ) : (
                        'Start a New Story'
                    )}
                </Button>
            </div>
            </main>
        </div>
        
        {/* Right Column - Animation */}
        <div ref={setContainerRef} className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-muted/30 md:flex">
             <div className="absolute h-[500px] w-[500px]" style={lineStyle}>
                {/* Connecting Lines */}
                <div className="absolute left-[130px] top-[245px] h-px w-[120px] bg-border"></div>
                <div className="absolute left-[245px] top-[130px] h-[120px] w-px bg-border"></div>
                <div className="absolute right-[130px] top-[245px] h-px w-[120px] bg-border"></div>
                <div className="absolute left-[245px] bottom-[130px] h-[120px] w-px bg-border"></div>
             </div>
             
             <div className="relative h-[500px] w-[500px]">
                {/* Central Icon */}
                <Card style={iconStyle(1)} className="absolute left-1/2 top-1/2 z-10 grid h-28 w-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl bg-primary/10 shadow-lg animate-float [animation-duration:10s]">
                    <Sparkles className="h-12 w-12 text-primary" />
                </Card>

                {/* Satellite Icons */}
                <Card style={iconStyle(-1.5)} className="absolute left-0 top-1/2 grid h-20 w-20 -translate-y-1/2 place-items-center rounded-2xl shadow-md animate-float [animation-delay:-2s] [animation-duration:12s]">
                    <BrainCircuit className="h-8 w-8 text-green-500" />
                </Card>
                <Card style={iconStyle(1.2)} className="absolute right-0 top-1/2 grid h-20 w-20 -translate-y-1/2 place-items-center rounded-2xl shadow-md animate-float [animation-delay:-1s] [animation-duration:9s]">
                    <Pencil className="h-8 w-8 text-rose-500" />
                </Card>
                <Card style={iconStyle(-1)} className="absolute left-1/2 top-0 grid h-20 w-20 -translate-x-1/2 place-items-center rounded-2xl shadow-md animate-float [animation-delay:-4s] [animation-duration:14s]">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-2.82 11.18a1 1 0 0 1-1.42-1.42l5-5a1 1 0 0 1 1.42 1.42z"/><path d="M12 22a10 10 0 0 0 7.18-2.82l-5-5a1 1 0 0 0-1.42 1.42z"/></svg>
                </Card>
                 <Card style={iconStyle(1.5)} className="absolute bottom-0 left-1/2 grid h-20 w-20 -translate-x-1/2 place-items-center rounded-2xl shadow-md animate-float [animation-delay:-3s] [animation-duration:11s]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0"/></svg>
                </Card>

                {/* Corner elements - could be avatars or other elements */}
                <div style={iconStyle(0.8)} className="absolute left-8 top-8 h-12 w-12 rounded-full bg-background shadow-sm animate-float [animation-duration:13s]"></div>
                 <div style={iconStyle(-0.8)} className="absolute right-8 bottom-8 h-12 w-12 rounded-full bg-background shadow-sm animate-float [animation-delay:-2s] [animation-duration:13s]"></div>
             </div>
        </div>
        </div>
        <section id="about-section" className="w-full py-12 md:py-24 lg:py-32 bg-background">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-serif">About Story Spark</h2>
                        <p className="max-w-[900px] text-muted-foreground text-base">
                            Story Spark is a magical place where ideas come to life. With the help of an AI companion, Sparky, you can brainstorm, write, illustrate, and create beautiful stories from scratch. It's a tool for writers, dreamers, and anyone with a story to tell.
                        </p>
                    </div>
                     <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
                        <div className="flex flex-col justify-center space-y-4">
                           <div className="space-y-2">
                            <h3 className="text-2xl font-bold tracking-tighter sm:text-3xl font-serif text-left">Narmadha's Space</h3>
                            <p className="max-w-[600px] text-muted-foreground text-base text-left">
                                This is Narmadha's creative space. As the creator and primary storyteller here, she uses Story Spark to bring her imaginative worlds and characters to life. Every story in the gallery is a piece of her journey, crafted with passion and a little help from her AI partner, Sparky.
                            </p>
                           </div>
                        </div>
                        <div className="relative mx-auto w-full max-w-xs lg:order-last">
                           <ZipGame />
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <footer className="border-t">
            <div className="container mx-auto flex items-center justify-between py-6 px-4 md:px-6">
                <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Story Spark. All Rights Reserved.</p>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                    <Instagram size={20}/>
                </Link>
            </div>
        </footer>

        {/* Story Name Dialog */}
        <InputDialog
            open={showNameDialog}
            onOpenChange={setShowNameDialog}
            title="Name Your Story"
            description="What would you like to call your new story?"
            inputLabel="Story Title"
            inputPlaceholder="Enter a title for your story"
            submitButtonText="Create Story"
            onSumbit={handleCreateStory}
            defaultValue=""
        />
    </div>
  );
}
