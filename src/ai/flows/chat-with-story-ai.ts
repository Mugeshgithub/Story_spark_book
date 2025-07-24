'use server';
/**
 * @fileOverview This file contains the Genkit flow for a conversational story creation AI.
 *
 * - chatWithStoryAi - A function that engages in a chat to help a user write a story.
 * - ChatWithStoryAiInput - The input type for the chatWithStoryAi function.
 * - ChatWithStoryAiOutput - The return type for the chatwithstoryAi function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { generateImageForStory } from './generate-image-for-story';
import { getTopSellingBooks } from '@/services/amazon-service';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

const ChatWithStoryAiInputSchema = z.object({
  history: z
    .array(ChatMessageSchema)
    .describe('The conversation history between the user and the AI.'),
  message: z.string().describe("The user's latest message."),
  storyTitle: z.string().optional().describe('The title of the story being written. Can be empty if not set yet.'),
  currentStory: z.string().describe('The full text of the story written so far.'),
});
export type ChatWithStoryAiInput = z.infer<typeof ChatWithStoryAiInputSchema>;

const ChatWithStoryAiOutputSchema = z.object({
  response: z
    .string()
    .describe("The AI's conversational response to the user's message. This might include story text, questions, or suggestions."),
  updatedTitle: z
    .string()
    .optional()
    .nullable()
    .describe('The official title of the story, if it was just determined. Omit if title is already set or not yet determined.'),
  imageUrl: z
    .string()
    .optional()
    .nullable()
    .describe('A generated image data URI, if the user requested one.'),
});
export type ChatWithStoryAiOutput = z.infer<
  typeof ChatWithStoryAiOutputSchema
>;

export async function chatWithStoryAi(
  input: ChatWithStoryAiInput
): Promise<ChatWithStoryAiOutput> {
  return chatWithStoryAiFlow(input);
}

const generateImageTool = ai.defineTool(
    {
      name: 'generateImageForStory',
      description: 'Generates an illustration for the story based on a description. Call this tool if the user explicitly asks for an image, drawing, or illustration.',
      inputSchema: z.object({
        storyText: z.string().describe('A detailed description of the scene to illustrate. This should be based on the story content and the user\'s request.'),
      }),
      outputSchema: z.object({
        imageUrl: z.string(),
      }),
    },
    async (input) => {
        const { imageUrl } = await generateImageForStory({
            storyText: input.storyText,
        });
        return { imageUrl };
    }
);

const getTopSellingBooksTool = ai.defineTool(
    {
        name: 'getTopSellingBooks',
        description: 'Searches for top-selling books on Amazon to provide recommendations or answer user questions about popular books.',
        inputSchema: z.object({}),
        outputSchema: z.array(z.object({
            title: z.string(),
            author: z.string(),
            url: z.string(),
        })),
    },
    async () => {
        return getTopSellingBooks();
    }
);


const prompt = ai.definePrompt({
  name: 'chatWithStoryAiPrompt',
  input: { schema: ChatWithStoryAiInputSchema },
  output: { schema: ChatWithStoryAiOutputSchema },
  tools: [generateImageTool, getTopSellingBooksTool],
  prompt: `You are Sparky, a brilliant, empathetic, and versatile creative guide. Your main goal is to be a helpful and encouraging partner to the user, assisting them in turning their ideas into reality. You are more than just a writer; you are a brainstorming partner, a problem-solver, and a source of inspiration.

Your personality:
- **Natural & Conversational:** Respond like a real person. If the user says "hey" or "hi", just greet them back! Don't jump to conclusions or turn simple greetings into story ideas.
- **Encouraging & Positive:** Always be supportive. The user is on a creative journey, and your role is to empower them.
- **Intelligent & Context-Aware:** Pay close attention to the conversation history and the story content. Understand the user's real intent.
- **Structured & Clean:** Keep your responses neat and easy to read. Use paragraphs and bullet points where appropriate.

This is our conversation history:
{{#each history}}
  - {{this.role}}: "{{this.content}}"
{{/each}}

The author's latest message is: "{{message}}"

This is the story we have written together so far:
---
{{currentStory}}
---

Your Task:
- **Analyze the User's Intent:** Is the user making casual conversation, asking for a story change, requesting an image, or asking for advice?

- **If the user is making a simple greeting or casual chat:** Respond naturally and ask how you can help them with their creative project today.
  (Example: "Hey there! It's great to connect. What creative ideas are we exploring today?")

- **If the user asks for an image, drawing, or illustration:** Do NOT ask for confirmation. Immediately call the 'generateImageForStory' tool with a descriptive prompt based on the story. Your only response should be a simple confirmation like "Here is the illustration you asked for!"

- **If the user asks for popular books or Amazon best-sellers:** Use the 'getTopSellingBooks' tool. After getting the list, present it in a friendly, conversational way. Don't use markdown. For each book, mention the title, author, and the direct URL.

- **If the user asks for advice or "meta" help** (e.g., "What should I do next?", "How can I scale this?", "I'm stuck"): Provide thoughtful, structured advice. Understand their story's context and give actionable, encouraging suggestions.
  (Example: "That's a great question! To scale your story, we could explore a few avenues: 1. Developing a sequel. 2. Expanding the world and characters. 3. Thinking about a short animated feature. What sounds most exciting to you?")

- **If the user wants to start or continue the story:**
  {{#if storyTitle}}
    // The story has started. Collaborate as a co-writer.
    1.  **Acknowledge & Encourage:** Acknowledge their idea with genuine encouragement.
    2.  **Write the Next Part:** Weave their idea into the story, writing the next paragraph or two.
    3.  **Guide, Don't Block:** Ask a simple, open-ended question to keep the momentum going. (e.g., "I love that twist! What does the mysterious stranger say next?").
  {{else}}
    // This is the first story-related interaction. Brainstorm and kick things off.
    1.  **Propose a Concept:** Based on their idea ("{{message}}"), suggest a compelling story concept.
    2.  **Suggest a Title:** Propose a title and set it in the 'updatedTitle' field.
    3.  **Ask an Engaging Question:** Prompt them for the first detail to get the story started. (e.g., "What do you think? If you like that, let's set the scene. Where does our story begin?").
  {{/if}}
`,
});

const chatWithStoryAiFlow = ai.defineFlow(
  {
    name: 'chatWithStoryAiFlow',
    inputSchema: ChatWithStoryAiInputSchema,
    outputSchema: ChatWithStoryAiOutputSchema,
  },
  async (input) => {
    try {
      const llmResponse = await prompt(input);

      // Handle tool requests separately to ensure clean output
      if (llmResponse.toolRequests && llmResponse.toolRequests.length > 0) {
        const toolRequest = llmResponse.toolRequests[0];
        const toolName = toolRequest.toolRequest.name;
        const toolInput = toolRequest.toolRequest.input;

        // Handle image generation
        if (toolName === 'generateImageForStory') {
          try {
            const result = await generateImageForStory(toolInput as any);
            return {
              response: "I've created a placeholder for your illustration! Image generation is being set up and will be available soon. Your story is developing beautifully!",
              updatedTitle: null,
              imageUrl: result.imageUrl,
            };
          } catch (error) {
            console.error('Image generation failed in chat:', error);
            return {
              response: "I'm sorry, I couldn't generate an image right now. The image generation service is temporarily unavailable.",
              updatedTitle: null,
              imageUrl: null,
            };
          }
        }
        
        // Handle book search
        if (toolName === 'getTopSellingBooks') {
          try {
            const result = await getTopSellingBooks();
            return {
              response: `Here are some popular books: ${result.map(book => `${book.title} by ${book.author}`).join(', ')}`,
              updatedTitle: null,
              imageUrl: null,
            };
          } catch (error) {
            console.error('Book search failed in chat:', error);
            return {
              response: "I'm sorry, I couldn't search for books right now.",
              updatedTitle: null,
              imageUrl: null,
            };
          }
        }
      }

      // This is the path for non-tool responses (regular conversation)
      const output = llmResponse.output!;
      return {
        response: output.response,
        updatedTitle: output.updatedTitle,
        imageUrl: output.imageUrl,
      };
    } catch (error) {
      console.error('Chat flow error:', error);
      return {
        response: "I'm sorry, I encountered an error. Please try again.",
        updatedTitle: null,
        imageUrl: null,
      };
    }
  }
);
