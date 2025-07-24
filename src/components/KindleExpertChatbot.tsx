
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, LoaderCircle, Send, X, Sparkles, MessageSquare } from 'lucide-react';
import { chatWithKindleExpert } from '@/ai/flows/kindle-expert-flow';
import type { ChatMessage } from '@/ai/flows/chat-with-story-ai';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';

export function KindleExpertChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: "Hey Narmadha! I'm your expert advisor, Kindle Pro. How can I help you scale your ideas today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && scrollAreaRef.current) {
      const scrollableViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollableViewport) {
        scrollableViewport.scrollTop = scrollableViewport.scrollHeight;
      }
    }
  }, [messages, isOpen]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatWithKindleExpert({
        history: messages,
        message: input,
      });

      const aiMessage: ChatMessage = { role: 'model', content: result.response };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Kindle Expert chat failed:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred.',
        description: 'Could not get a response from Kindle Pro. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Trigger Button */}
      <Button
        className={cn(
          "fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg transition-all duration-300 ease-in-out hover:scale-110 active:scale-105 z-50",
          "bg-gradient-to-tr from-primary via-purple-500 to-cyan-400 text-white",
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        )}
        size="icon"
        onClick={() => setIsOpen(true)}
      >
        <Sparkles className="h-8 w-8" />
        <span className="sr-only">Open Kindle Pro Chat</span>
      </Button>

      {/* Chat Window */}
      <div className={cn(
          "fixed bottom-6 right-6 w-[360px] h-[520px] transition-all duration-300 ease-in-out z-50",
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      )}>
        <Card className="h-full w-full flex flex-col shadow-2xl bg-card">
            <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
                <div className="flex items-center">
                    <div className="mr-3 h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary animate-float [animation-duration:8s]">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                            <path d="M12 2a10 10 0 0 0-3.536 19.351l-1.465-1.465A8 8 0 1 1 12 20a8.016 8.016 0 0 1-4.228-1.203l1.45-1.45A6 6 0 1 0 12 8a6 6 0 0 0-4.472 2.01L9 11.5H3v-6L4.515 7.015A8 8 0 0 1 12 4a8.01 8.01 0 0 1 5.989 2.782l1.483-1.483A10.015 10.015 0 0 0 12 2Z" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-semibold text-card-foreground">Kindle Pro</p>
                        <p className="text-xs text-muted-foreground">Your AI monetization expert</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-accent hover:text-accent-foreground" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4">
                <ScrollArea className="h-full" ref={scrollAreaRef}>
                    <div className="space-y-6 pr-4">
                    {messages.map((message, index) => (
                        <div
                        key={index}
                        className={cn('flex items-start gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}
                        >
                        {message.role === 'model' && (
                             <div className="h-8 w-8 flex items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                                <Bot className="h-4 w-4"/>
                            </div>
                        )}
                        <div
                            className={cn('rounded-xl px-4 py-3 max-w-[85%] whitespace-pre-wrap text-sm',
                            message.role === 'user'
                                ? 'bg-primary text-primary-foreground rounded-br-none'
                                : 'bg-muted text-muted-foreground rounded-bl-none'
                            )}
                        >
                            {message.content}
                        </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                             <div className="h-8 w-8 flex items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                                <Bot className="h-4 w-4"/>
                            </div>
                            <div className="rounded-xl px-4 py-3 max-w-[80%] bg-muted flex items-center rounded-bl-none">
                                <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        </div>
                    )}
                    </div>
                </ScrollArea>
            </CardContent>

            <CardFooter className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder=""
                    disabled={isLoading}
                    autoFocus
                    className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading || !input.trim()} size="icon" className="rounded-full flex-shrink-0">
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </CardFooter>
        </Card>
      </div>
    </>
  );
}
