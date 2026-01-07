const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Opponent {
  name: string;
  title: string;
  depth: number;
  blunder_chance: number;
}

export interface MoveResponse {
  move: string;
  fen: string;
  is_checkmate: boolean;
  is_stalemate: boolean;
  is_check: boolean;
}

export async function getOpponents(): Promise<Record<number, Opponent>> {
  const response = await fetch(`${API_BASE_URL}/opponents`);
  if (!response.ok) throw new Error('Failed to fetch opponents');
  return response.json();
}

export async function getAIMove(fen: string, level: number): Promise<MoveResponse> {
  const response = await fetch(`${API_BASE_URL}/get-move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fen, level }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    console.error('AI move error:', errorData);
    throw new Error(errorData.detail || 'Failed to get AI move');
  }
  return response.json();
}

export async function validateMove(fen: string, move: string) {
  const response = await fetch(`${API_BASE_URL}/validate-move?fen=${fen}&move=${move}`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to validate move');
  return response.json();
}

export async function warmupBackend(timeoutMs: number = 10000): Promise<{ success: boolean; duration: number }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const startTime = performance.now();

  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const duration = performance.now() - startTime;

    if (!response.ok) {
      return { success: false, duration };
    }

    return { success: true, duration };
  } catch (error) {
    clearTimeout(timeoutId);
    const duration = performance.now() - startTime;
    console.error('Backend warmup failed:', error);
    return { success: false, duration };
  }
}
