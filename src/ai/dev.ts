import { config } from 'dotenv';
config();

import '@/ai/flows/chat-with-story-ai.ts';
import '@/ai/flows/generate-image-for-story.ts';
import '@/ai/flows/kindle-expert-flow.ts';
import '@/services/amazon-service.ts';
