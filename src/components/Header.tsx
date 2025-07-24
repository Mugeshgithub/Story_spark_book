
"use client";

import Link from 'next/link';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { LogIn, LogOut, User, GalleryHorizontal, PlusCircle } from 'lucide-react';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm px-4 md:px-6">
      <div className="flex h-24 items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="Story Spark Home">
          <div className="w-4 h-4 rounded-full bg-pink-500"></div>
          <span className="text-xl font-semibold text-foreground tracking-wide">
            Story Spark
          </span>
        </Link>
        <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-2 text-sm font-medium tracking-widest text-muted-foreground uppercase">
                <Button variant="ghost" asChild>
                  <Link href="/story-creator" className="text-foreground font-bold hover:text-primary transition-colors">Create</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/gallery" className="hover:text-primary transition-colors">Gallery</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/#about-section" className="hover:text-primary transition-colors">About</Link>
                </Button>
            </nav>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                      <AvatarFallback>
                        {user.email ? user.email.charAt(0).toUpperCase() : <User />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName || 'Storyteller'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                   <DropdownMenuItem asChild>
                     <Link href="/story-creator"><PlusCircle className="mr-2 h-4 w-4" />New Story</Link>
                   </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                     <Link href="/gallery"><GalleryHorizontal className="mr-2 h-4 w-4" />My Gallery</Link>
                   </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
                <Button asChild>
                    <Link href="/login">
                        <LogIn className="mr-2 h-4 w-4" />
                        Login
                    </Link>
                </Button>
            )}
        </div>
      </div>
    </header>
  );
}
