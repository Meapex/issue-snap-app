// 'use server';

/**
 * @fileOverview Generates a draft complaint from an image using a VLM model.
 *
 * - generateComplaintFromImage - A function that handles the complaint generation process.
 * - GenerateComplaintFromImageInput - The input type for the generateComplaintFromImage function.
 * - GenerateComplaintFromImageOutput - The return type for the generateComplaintFromImage function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateComplaintFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of the issue, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
  locationDescription: z.string().describe('A description of the location where the issue was photographed.'),
});
export type GenerateComplaintFromImageInput = z.infer<
  typeof GenerateComplaintFromImageInputSchema
>;

const GenerateComplaintFromImageOutputSchema = z.object({
  complaintDraft: z.string().describe('A draft complaint generated from the image.'),
});
export type GenerateComplaintFromImageOutput = z.infer<
  typeof GenerateComplaintFromImageOutputSchema
>;

export async function generateComplaintFromImage(
  input: GenerateComplaintFromImageInput
): Promise<GenerateComplaintFromImageOutput> {
  return generateComplaintFromImageFlow(input);
}

const generateComplaintPrompt = ai.definePrompt({
  name: 'generateComplaintPrompt',
  input: {schema: GenerateComplaintFromImageInputSchema},
  output: {schema: GenerateComplaintFromImageOutputSchema},
  prompt: `You are an AI assistant that helps users generate complaint drafts from images of issues.

You will receive a photo of the issue and a description of the location where the issue was photographed.

Based on the image and location description, generate a draft complaint describing the problem.

Location Description: {{{locationDescription}}}
Photo: {{media url=photoDataUri}}

Complaint Draft:`, 
});

const generateComplaintFromImageFlow = ai.defineFlow(
  {
    name: 'generateComplaintFromImageFlow',
    inputSchema: GenerateComplaintFromImageInputSchema,
    outputSchema: GenerateComplaintFromImageOutputSchema,
  },
  async input => {
    const {output} = await generateComplaintPrompt(input);
    return output!;
  }
);
