
import { NextResponse } from 'next/server';

// This API route was for the Firestore database. Since we've switched to 
// local storage, this route is no longer functional.
// It will now return a simple message indicating it's inactive.

export const dynamic = 'force-static';

export async function GET(request: Request) {
    return new Response(JSON.stringify({ 
        message: 'This API route is inactive. Data is now stored in your browser\'s local storage.' 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
}
