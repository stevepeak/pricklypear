import OpenAI from 'https://esm.sh/openai@4.28.0';
import { env } from './env.ts';

export function getOpenAIClient() {
  return new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });
}
