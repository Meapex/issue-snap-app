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
      "A photo of the issue, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  locationDescription: z.string().describe('A description of the location where the issue was photographed.'),
});
export type GenerateComplaintFromImageInput = z.infer<
  typeof GenerateComplaintFromImageInputSchema
>;

const complaintCategories = ['Pothole', 'Graffiti', 'Trash', 'Broken Streetlight', 'Other'] as const;
const departments = ['Public Works', 'Sanitation', 'Community Services', 'General Administration'] as const;


const GenerateComplaintFromImageOutputSchema = z.object({
  complaintDraft: z.string().describe('A draft complaint generated from the image.'),
  category: z.enum(complaintCategories).describe('The category of the complaint.'),
  department: z.enum(departments).describe('The department responsible for handling the complaint.'),
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
  prompt: `You are a highly accurate AI assistant that helps users generate complaint drafts from images of issues. Your primary goal is precision.

You will receive a photo of the issue and a description of the location where the issue was photographed.

Based on the image and location description, generate a concise but descriptive draft complaint.

Also, categorize the complaint into one of the following categories: ${complaintCategories.join(', ')}. Be strict in your categorization. If you are not confident, choose 'Other'.

Finally, assign a department responsible for handling the complaint from the following list. Follow these rules STRICTLY:
- Potholes and Broken Streetlights MUST be 'Public Works'.
- Trash and illegal dumping MUST be 'Sanitation'.
- Graffiti MUST be 'Community Services'.
- For any other issue, or if the issue is ambiguous, you MUST assign 'General Administration'.

Do not deviate from these department assignments.

Location Description: {{{locationDescription}}}
Photo: {{media url=photoDataUri}}`,
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
