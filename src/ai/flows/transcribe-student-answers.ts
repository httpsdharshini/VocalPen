'use server';

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';

// =======================
// SCHEMAS
// =======================

const TranscribeStudentAnswerInputSchema = z.object({
  audioDataUri: z.string().describe(
    "Audio Data URI: 'data:<mimetype>;base64,<encoded_data>'"
  ),
});

export type TranscribeStudentAnswerInput = z.infer<
  typeof TranscribeStudentAnswerInputSchema
>;

const TranscribeStudentAnswerOutputSchema = z.object({
  transcription: z.string(),
});

export type TranscribeStudentAnswerOutput = z.infer<
  typeof TranscribeStudentAnswerOutputSchema
>;

// =======================
// PROMPT
// =======================

const transcribeStudentAnswerPrompt = ai.definePrompt({
  name: 'transcribeStudentAnswerPrompt',
  input: { schema: TranscribeStudentAnswerInputSchema },
  output: { schema: TranscribeStudentAnswerOutputSchema },
  model: googleAI.model('gemini-1.5-flash'), // ⬅ REQUIRED for audio transcription
  prompt: `
Transcribe the following audio recording:

{{media url=audioDataUri}}
`,
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
    const { output } = await transcribeStudentAnswerPrompt(input);
    return output!;
  }
);

export async function transcribeStudentAnswer(
  input: TranscribeStudentAnswerInput
): Promise<TranscribeStudentAnswerOutput> {
  return transcribeStudentAnswerFlow(input);
}
