import { AssemblyAI } from 'assemblyai';

// Validate environment variable
if (!process.env.ASSEMBLYAI_API_KEY) {
  throw new Error('ASSEMBLYAI_API_KEY environment variable is required');
}

/**
 * AssemblyAI client instance
 * Used for both traditional transcription and streaming
 */
export const assemblyaiClient = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
}); 