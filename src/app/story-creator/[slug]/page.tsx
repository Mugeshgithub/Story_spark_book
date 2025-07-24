
'use client';
import { StoryCreator } from '@/components/StoryCreator';

export default function StoryEditorPage() {
  return (
    <div className="h-[calc(100vh-6rem)] w-full p-4 md:p-6">
      <StoryCreator />
    </div>
  );
}
