'use server';
/**
 * @fileOverview A speech-to-text AI flow.
 *
 * - speechToText - A function that handles the audio transcription.
 * - SpeechToTextInput - The input type for the speechToText function.
 * - SpeechToTextOutput - The return type for the speechToText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Part } from '@genkit-ai/google-genai';

const SpeechToTextInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A chunk of audio, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SpeechToTextInput = z.infer<typeof SpeechToTextInputSchema>;

const SpeechToTextOutputSchema = z.object({
  text: z.string().describe('The transcribed text.'),
});
export type SpeechToTextOutput = z.infer<typeof SpeechToTextOutputSchema>;

export async function speechToText(
  input: SpeechToTextInput
): Promise<SpeechToTextOutput> {
  return speechToTextFlow(input);
}

const speechToTextFlow = ai.defineFlow(
  {
    name: 'speechToTextFlow',
    inputSchema: SpeechToTextInputSchema,
    outputSchema: SpeechToTextOutputSchema,
  },
  async ({ audioDataUri }) => {
    const audioPart: Part = {
      media: {
        url: audioDataUri,
      },
    };

    const { text } = await ai.generate({
      model: 'gemini-1.5-flash',
      prompt: [
        audioPart,
        'Transcribe this audio. The audio is a person answering an exam question.',
      ],
    });

    return { text };
  }
);
