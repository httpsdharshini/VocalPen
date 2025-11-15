'use server';

/**
 * @fileOverview Implements voice command based editing of dictated answers.
 *
 * - editAnswerWithVoiceCommands - A function that processes voice commands to edit a text answer.
 * - EditAnswerWithVoiceCommandsInput - The input type for the editAnswerWithVoiceCommands function.
 * - EditAnswerWithVoiceCommandsOutput - The return type for the editAnswerWithVoiceCommands function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EditAnswerWithVoiceCommandsInputSchema = z.object({
  answerText: z.string().describe('The current text of the answer being edited.'),
  voiceCommand: z.string().describe(
    'The voice command issued by the student, e.g., "Strike last word", "Strike last sentence", or "Start over".'
  ),
});
export type EditAnswerWithVoiceCommandsInput = z.infer<typeof EditAnswerWithVoiceCommandsInputSchema>;

const EditAnswerWithVoiceCommandsOutputSchema = z.object({
  editedAnswerText: z
    .string()
    .describe('The edited text of the answer after applying the voice command.'),
});
export type EditAnswerWithVoiceCommandsOutput = z.infer<typeof EditAnswerWithVoiceCommandsOutputSchema>;

export async function editAnswerWithVoiceCommands(
  input: EditAnswerWithVoiceCommandsInput
): Promise<EditAnswerWithVoiceCommandsOutput> {
  return editAnswerWithVoiceCommandsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'editAnswerWithVoiceCommandsPrompt',
  input: {schema: EditAnswerWithVoiceCommandsInputSchema},
  output: {schema: EditAnswerWithVoiceCommandsOutputSchema},
  prompt: `You are an AI assistant that helps students edit their answers using voice commands.

The student has dictated the following answer:
"""
{{{answerText}}}
"""

The student has issued the following voice command:
"""
{{{voiceCommand}}}
"""

Based on the voice command, edit the answer text accordingly.  Here are the supported voice commands:

*   "Strike last word": Remove the last word from the answer.
*   "Strike last sentence": Remove the last sentence from the answer.
*   "Start over": Clear the entire answer.

If the voice command is not recognized or cannot be applied, return the original answer text.
`,
});

const editAnswerWithVoiceCommandsFlow = ai.defineFlow(
  {
    name: 'editAnswerWithVoiceCommandsFlow',
    inputSchema: EditAnswerWithVoiceCommandsInputSchema,
    outputSchema: EditAnswerWithVoiceCommandsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
