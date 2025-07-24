import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter } from 'next/font/google';
import { Playfair_Display } from 'next/font/google';
import { Header } from '@/components/Header';
import { AuthProvider } from '@/hooks/use-auth';
import { KindleExpertChatbot } from '@/components/KindleExpertChatbot';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'Story Spark',
  description: 'Create, enhance, and share your stories.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-body antialiased">
        <AuthProvider>
          <Header />
          <main className="pt-24">{children}</main>
          <Toaster />
          <KindleExpertChatbot />
        </AuthProvider>
      </body>
    </html>
  );
}
