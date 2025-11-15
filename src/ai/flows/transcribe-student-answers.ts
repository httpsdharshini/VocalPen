// transcribeStudentAnswer.ts
'use server';

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';

// =======================
// SCHEMAS
// =======================

const TranscribeStudentAnswerInputSchema = z.object({
  // expecting 'data:audio/wav;base64,...' (or other mimetype)
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
  model: googleAI.model('gemini-pro-vision'),
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
    // validate input (zod)
    TranscribeStudentAnswerInputSchema.parse(input);

    // Call the prompt. Some GenKit versions return `response` or `output`.
    // This code assumes prompt call returns { output } with the typed schema.
    const { output } = await transcribeStudentAnswerPrompt(input);

    if (!output || !output.transcription) {
      throw new Error('Transcription failed: no output from model.');
    }

    return output!;
  }
);

export async function transcribeStudentAnswer(
  input: TranscribeStudentAnswerInput
): Promise<TranscribeStudentAnswerOutput> {
  return transcribeStudentAnswerFlow(input);
}
