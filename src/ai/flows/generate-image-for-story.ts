
'use server';
/**
 * @fileOverview This file contains the Genkit flow for generating an image based on story text.
 *
 * - generateImageForStory - A function that creates a storybook-style illustration.
 * - GenerateImageForStoryInput - The input type for the generateImageForStory function.
 * - GenerateImageForStoryOutput - The return type for the generateImageForStory function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateImageForStoryInputSchema = z.object({
  storyText: z.string().describe('The text from the story page to illustrate.'),
  storyTitle: z.string().optional().describe('The title of the story.'),
});
export type GenerateImageForStoryInput = z.infer<
  typeof GenerateImageForStoryInputSchema
>;

const GenerateImageForStoryOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe(
      "The generated image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type GenerateImageForStoryOutput = z.infer<
  typeof GenerateImageForStoryOutputSchema
>;

export async function generateImageForStory(
  input: GenerateImageForStoryInput
): Promise<GenerateImageForStoryOutput> {
  return generateImageForStoryTool(input);
}

export const generateImageForStoryTool = ai.defineTool(
  {
    name: 'generateImageForStory',
    description: 'Generates an illustration for the story based on a description.',
    inputSchema: GenerateImageForStoryInputSchema,
    outputSchema: GenerateImageForStoryOutputSchema,
  },
  async ({ storyText, storyTitle }) => {
    const prompt = `Create a beautiful, child-friendly illustration for a children's storybook (ages 4-7).

STORY CONTEXT:
Title: "${storyTitle || 'Untitled'}"
Scene: "${storyText}"

REQUIREMENTS:
1. **EXACT MATCH**: The illustration MUST show exactly what is described in the story text
2. **CHILD-FRIENDLY**: Bright, cheerful colors, simple shapes, cute characters
3. **CLEAR & SIMPLE**: Easy for young children to understand and enjoy
4. **STORYBOOK STYLE**: Soft, warm, inviting art style like classic children's books
5. **FOCUS ON MAIN ELEMENTS**: Highlight the key characters and actions from the story

ART STYLE:
- Soft, rounded shapes
- Bright, vibrant colors (but not overwhelming)
- Simple backgrounds that don't distract
- Characters with friendly, expressive faces
- Clean, clear outlines
- Warm, inviting atmosphere

TECHNICAL SPECS:
- High contrast for clarity
- Simple composition
- No complex details that confuse young children
- Focus on the main story elements

IMPORTANT: The image MUST directly illustrate the specific scene described in the story text. If the story mentions mountain goats, show mountain goats. If it mentions a specific action, show that action clearly.`;

    // Try Gemini first (your original setup)
    try {
    const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
      prompt: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

      if (media && media.url) {
        return {
          imageUrl: media.url,
        };
      }
    } catch (error) {
      console.log('Gemini failed, trying Hugging Face...', error);
    }

    // Try Hugging Face with your API key
    try {
      // Use Stable Diffusion XL Base 1.0 - optimized for speed
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY || ''}`,
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            num_inference_steps: 20, // Slightly increased for better quality
            guidance_scale: 8.5, // Increased for better prompt adherence
            width: 512,
            height: 512,
            negative_prompt: "complex, detailed, realistic, dark, scary, adult, mature, abstract, confusing, cluttered, busy background",
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const imageBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(imageBuffer).toString('base64');
        
        return {
          imageUrl: `data:image/jpeg;base64,${base64}`,
        };
      } else {
        console.log('Hugging Face API error:', response.status, response.statusText);
        // Continue to fallback
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Hugging Face request timed out, using placeholder...');
      } else {
        console.log('Hugging Face failed, trying faster model...', error);
        
        // Try a faster model as fallback
        try {
          const fastResponse = await fetch('https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY || ''}`,
            },
            body: JSON.stringify({
              inputs: prompt,
              parameters: {
                num_inference_steps: 15, // Even faster but still good quality
                guidance_scale: 8.0, // Better prompt adherence
                width: 512,
                height: 512,
                negative_prompt: "complex, detailed, realistic, dark, scary, adult, mature, abstract, confusing, cluttered, busy background",
              },
            }),
          });

          if (fastResponse.ok) {
            const imageBuffer = await fastResponse.arrayBuffer();
            const base64 = Buffer.from(imageBuffer).toString('base64');
            
            return {
              imageUrl: `data:image/jpeg;base64,${base64}`,
            };
          }
        } catch (fastError) {
          console.log('Fast model also failed, using placeholder...', fastError);
        }
      }
    }

    // Create an enhanced SVG placeholder with story context and better visuals
    const storyContext = storyText.substring(0, 50) + (storyText.length > 50 ? '...' : '');
    const title = storyTitle || 'Untitled';
    
    // Create a more sophisticated placeholder with story elements
    const placeholderSvg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
          </radialGradient>
        </defs>
        <rect width="400" height="300" fill="url(#grad1)"/>
        <circle cx="200" cy="150" r="60" fill="url(#glow)"/>
        <circle cx="200" cy="150" r="50" fill="white" opacity="0.9"/>
        <text x="200" y="140" font-family="Arial, sans-serif" font-size="32" text-anchor="middle" fill="#333">
          🎨
        </text>
        <text x="200" y="170" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="white" font-weight="bold">
          ${title}
        </text>
        <text x="200" y="190" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" fill="white" opacity="0.8">
          ${storyContext}
        </text>
        <text x="200" y="220" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="white">
          ✨ AI Image Generation
        </text>
        <text x="200" y="240" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" fill="white" opacity="0.7">
          Child-Friendly Images | Optimized for Ages 4-7
        </text>
        <circle cx="200" cy="260" r="3" fill="white" opacity="0.5">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
        </circle>
      </svg>
    `;
    
    const base64Svg = Buffer.from(placeholderSvg).toString('base64');

    return {
      imageUrl: `data:image/svg+xml;base64,${base64Svg}`,
    };
  }
);
