'use server';
/**
 * @fileOverview Flow for transcribing student answers from speech to text.
 *
 * - transcribeStudentAnswer - A function that transcribes student's spoken answers into text.
 * - TranscribeStudentAnswerInput - The input type for the transcribeStudentAnswer function.
 * - TranscribeStudentAnswerOutput - The return type for the transcribeStudentAnswer function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';

const TranscribeStudentAnswerInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      'The audio data URI of the student\'s answer, including MIME type and Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected description
    ),
});
export type TranscribeStudentAnswerInput = z.infer<typeof TranscribeStudentAnswerInputSchema>;

const TranscribeStudentAnswerOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text of the student\'s answer.'),
});
export type TranscribeStudentAnswerOutput = z.infer<typeof TranscribeStudentAnswerOutputSchema>;

export async function transcribeStudentAnswer(input: TranscribeStudentAnswerInput): Promise<TranscribeStudentAnswerOutput> {
  return transcribeStudentAnswerFlow(input);
}

const transcribeStudentAnswerPrompt = ai.definePrompt({
  name: 'transcribeStudentAnswerPrompt',
  input: {schema: TranscribeStudentAnswerInputSchema},
  output: {schema: TranscribeStudentAnswerOutputSchema},
  model: googleAI.model('gemini-pro'),
  prompt: `Transcribe the following audio recording of a student's answer into text:\n\n{{media url=audioDataUri}}`,
});

const transcribeStudentAnswerFlow = ai.defineFlow(
  {
    name: 'transcribeStudentAnswerFlow',
    inputSchema: TranscribeStudentAnswerInputSchema,
    outputSchema: TranscribeStudentAnswerOutputSchema,
  },
  async input => {
    const {output} = await transcribeStudentAnswerPrompt(input);
    return output!;
  }
);
