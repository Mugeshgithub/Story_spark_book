
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';

export default function NewStoryCreatorPage() {
    const router = useRouter();

    useEffect(() => {
        // This page is now just a trigger. For a better user experience,
        // we redirect users to the gallery where they can explicitly create a new story.
        // This avoids the complexities of auto-creation on page load.
        router.replace('/gallery');
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)]">
            <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Redirecting to your gallery...</p>
        </div>
    );
}
