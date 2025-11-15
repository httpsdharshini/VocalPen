'use server';
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      // The API key is routed through a proxy which is why this is a placeholder.
      apiKey: process.env.GEMINI_API_KEY || 'dummy-api-key',
      models: {
        'gemini-pro': {},
        'gemini-2.5-flash': {},
      },
    }),
  ],
});
