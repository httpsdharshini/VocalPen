
'use server';

/**
 * @fileOverview Implements student answer transcription via voice.
 *
 * - transcribeStudentAnswer - A function that transcribes student audio.
 * - TranscribeStudentAnswerInput - The input type for the function.
 * - TranscribeStudentAnswerOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// =======================
// SCHEMAS
// =======================

const TranscribeStudentAnswerInputSchema = z.object({
  audioDataUri: z.string().min(1).describe("Audio Data URI: 'data:<mimetype>;base64,<encoded_data>'"),
});

export type TranscribeStudentAnswerInput = z.infer<typeof TranscribeStudentAnswerInputSchema>;

const TranscribeStudentAnswerOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text from the audio.'),
});

export type TranscribeStudentAnswerOutput = z.infer<typeof TranscribeStudentAnswerOutputSchema>;

// =======================
// PROMPT
// =======================

const transcribeStudentAnswerPrompt = ai.definePrompt({
  name: 'transcribeStudentAnswerPrompt',
  input: {schema: TranscribeStudentAnswerInputSchema},
  output: {schema: TranscribeStudentAnswerOutputSchema},
  prompt: `You are an accurate transcription system. Transcribe the student’s audio exactly.

{{media url=audioDataUri}}`,
  model: 'gemini-pro-vision',
});

// =======================
// FLOW
// =======================

const transcribeStudentAnswerFlow = ai.defineFlow(
  {
    name: 'transcribeStudentAnswerFlow',
    inputSchema: TranscribeStudentAnswerInputSchema,
    outputSchema: TranscribeStudentAnswerOutputSchema,
  },
  async (input) => {
    TranscribeStudentAnswerInputSchema.parse(input);

    const { output } = await transcribeStudentAnswerPrompt(input);

    if (!output || typeof output.transcription !== 'string') {
      console.error('Transcription failed: Model output was invalid.', output);
      throw new Error('Transcription failed: No valid text returned from the model.');
    }

    return { transcription: output.transcription };
  }
);

// =======================
// EXPORT FUNCTION
// =======================

export async function transcribeStudentAnswer(
  input: TranscribeStudentAnswerInput
): Promise<TranscribeStudentAnswerOutput> {
  return transcribeStudentAnswerFlow(input);
}
