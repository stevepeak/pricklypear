import OpenAI from 'https://esm.sh/openai@4.28.0';

export function getOpenAIClient() {
  return new OpenAI({
    apiKey: Deno.env.get('OPENAI_API_KEY'),
  });
}
