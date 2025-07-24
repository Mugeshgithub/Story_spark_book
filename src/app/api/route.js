
// This is a placeholder file for the root of the API.
// You can add a basic response here if you want.
import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET(request) {
  return NextResponse.json({ message: 'Welcome to the Story Spark API!' });
}
