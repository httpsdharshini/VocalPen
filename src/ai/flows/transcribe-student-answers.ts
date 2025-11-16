// transcribe-student-answers.ts
"use server";

import { ai } from "@/ai/genkit";
import { z } from "zod";

// =======================
// SCHEMAS
// =======================

const TranscribeStudentAnswerInputSchema = z.object({
  audioDataUri: z
    .string()
    .min(10)
    .describe("Audio Data URI: 'data:<mimetype>;base64,<encoded_data>'"),
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
  name: "transcribeStudentAnswerPrompt",
  input: { schema: TranscribeStudentAnswerInputSchema },
  output: { schema: TranscribeStudentAnswerOutputSchema },
  prompt: `
You are an accurate transcription system.
Transcribe the student’s audio exactly.

{{media url=audioDataUri}}
`,
});


// =======================
// FLOW
// =======================

const transcribeStudentAnswerFlow = ai.defineFlow(
  {
    name: "transcribeStudentAnswerFlow",
    inputSchema: TranscribeStudentAnswerInputSchema,
    outputSchema: TranscribeStudentAnswerOutputSchema,
  },
  async (input) => {
    TranscribeStudentAnswerInputSchema.parse(input);

    const result = await transcribeStudentAnswerPrompt(input);

    const transcription = result?.output?.transcription;

    if (!transcription) {
      console.error("Model output:", result);
      throw new Error("Transcription failed: No text returned.");
    }

    return { transcription };
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
