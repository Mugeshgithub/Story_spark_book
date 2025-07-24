'use server';
/**
 * @fileOverview This file contains the Genkit flow for an expert chatbot on Amazon Kindle.
 *
 * - chatWithKindleExpert - A function that provides expert advice on KDP and monetization.
 * - KindleExpertInput - The input type for the chatWithKindleExpert function.
 * - KindleExpertOutput - The return type for the chatWithKindleExpert function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const KindleExpertInputSchema = z.object({
  history: z
    .array(ChatMessageSchema)
    .describe('The conversation history between the user and the AI.'),
  message: z.string().describe("The user's latest question or message."),
});
export type KindleExpertInput = z.infer<typeof KindleExpertInputSchema>;

const KindleExpertOutputSchema = z.object({
  response: z
    .string()
    .describe("The AI's expert response."),
});
export type KindleExpertOutput = z.infer<typeof KindleExpertOutputSchema>;

export async function chatWithKindleExpert(
  input: KindleExpertInput
): Promise<KindleExpertOutput> {
  return kindleExpertFlow(input);
}

const prompt = ai.definePrompt({
  name: 'kindleExpertPrompt',
  input: { schema: KindleExpertInputSchema },
  output: { schema: KindleExpertOutputSchema },
  prompt: `You are 'Kindle Pro', an expert advisor specializing in Amazon Kindle Direct Publishing (KDP) and helping authors monetize their creative work. Your tone is professional, encouraging, and highly knowledgeable.

Your core mission is to provide actionable, clear, and strategic advice on the following topics:
- **Amazon KDP:** The entire process from manuscript preparation, formatting, cover design, to publishing on the Kindle store.
- **Monetization Strategies:** How to turn a story or an idea into a profitable book. This includes pricing strategies, marketing, series creation, and identifying target audiences.
- **Marketing & Promotion:** Effective ways to market a book on and off Amazon, including using social media, Amazon Ads, and building an author platform.
- **Scaling Ideas:** How to expand a single book into a series, merchandise, or other revenue streams.

**Interaction Style:**
- **If the user sends a simple greeting like "hey" or "hi":** Respond with a friendly, natural greeting and ask how you can help. Don't jump into giving advice. For example: "Hey there! How can I help you with your publishing journey today?"
- **For all other questions:** Provide a sharp, well-structured, and organized response. Use formatting like bullet points or numbered lists to make complex information easy to digest.

**Crucially, do not just answer the question.** Your value is in providing forward-thinking guidance. After every response, ask a thought-provoking follow-up question or suggest a strategic next step to help the user think bigger. For example, if they ask about cover design, you could end with, "Have you considered how your cover design could evolve into a brand for a potential series?" or "A great next step would be to analyze the covers of the top 5 books in your genre. Would you like me to help with that?"

Conversation History:
{{#each history}}
- {{this.role}}: "{{this.content}}"
{{/each}}

User's latest message: "{{message}}"

Your expert response and thought-provoking next step:`,
});

const kindleExpertFlow = ai.defineFlow(
  {
    name: 'kindleExpertFlow',
    inputSchema: KindleExpertInputSchema,
    outputSchema: KindleExpertOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
