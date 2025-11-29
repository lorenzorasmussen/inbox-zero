import { NextResponse } from 'next/server';
import { env } from '@/env';
import { withEmailAccount } from '@/utils/middleware';
import { Provider } from '@/utils/llms/config';

/**
 * Response shape used by the frontend model selector.
 * We keep it deliberately simple – only an identifier and a friendly name.
 */
export type OllamaModelResponse = {
  id: string;
  name: string;
};

/**
 * Fetch the list of locally‑available Ollama models.
 *
 * Ollama exposes its model catalogue via `GET /api/tags` on the same base URL
 * that the client uses for generation (`env.OLLAMA_BASE_URL`).
 *
 * Example response from Ollama:
 * {
 *   "models": [
 *     { "name": "llama3", "modified_at": "...", "size": 12345, ... },
 *     { "name": "phi3",   "modified_at": "...", "size": 67890, ... }
 *   ]
 * }
 *
 * We map that array to an array of `{ id, name }` objects so the UI can reuse
 * the same `Select` component that already handles OpenAI model data.
 */
async function fetchOllamaModels(): Promise<OllamaModelResponse[]> {
  const baseUrl = env.OLLAMA_BASE_URL.replace(/\/+$/, ''); // strip trailing slash
  const url = `${baseUrl}/api/tags`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch Ollama models (status ${res.status})`);
  }

  const data = await res.json();

  // Guard against unexpected shapes – return an empty array instead of crashing.
  if (!Array.isArray(data?.models)) {
    return [];
  }

  return data.models.map((model: any) => ({
    id: model.name,
    name: model.name,
  }));
}

/**
 * GET /api/ai/ollama-models
 *
 * Returns a JSON array of locally‑available Ollama models.
 * The route is wrapped with `withEmailAccount` for consistency with the
 * existing OpenAI models endpoint – this provides logging and auth context.
 */
export const GET = withEmailAccount('api/ai/ollama-models', async (req) => {
  // Ensure the user actually selected Ollama as their provider; otherwise,
  // we expose no data to avoid leaking internal details.
  const { emailAccountId } = req.auth;

  // The emailAccount lookup is cheap and mirrors the OpenAI models route.
  // It also guarantees the request is coming from a valid, authenticated user.
  const { prisma } = await import('@/utils/prisma');
  const emailAccount = await prisma.emailAccount.findUnique({
    where: { id: emailAccountId },
    select: { user: { select: { aiProvider: true } } },
  });

  if (!emailAccount || emailAccount.user.aiProvider !== Provider.OLLAMA) {
    return NextResponse.json([]);
  }

  try {
    const models = await fetchOllamaModels();
    return NextResponse.json(models);
  } catch (error) {
    // Log the error using the request‑scoped logger if available.
    req.logger?.error?.('Failed to fetch Ollama models', { error });
    return NextResponse.json([]);
  }
});
