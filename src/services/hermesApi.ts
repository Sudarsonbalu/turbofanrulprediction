import { HermesStatusResponse, HermesChatResponse } from '../../backend/app/hermes/schemas';

export async function fetchHermesStatus(): Promise<HermesStatusResponse> {
  try {
    const response = await fetch('/api/hermes/health');
    if (!response.ok) {
      return {
        status: 'OFFLINE',
        enabled: true,
        provider: 'Nous Portal',
        model: 'upstage/solar-pro4',
        message: 'Failed to connect to Hermes health check endpoint.',
        base_url: 'http://127.0.0.1:8650/v1',
        capabilities: []
      };
    }
    return response.json();
  } catch {
    return {
      status: 'OFFLINE',
      enabled: true,
      provider: 'Nous Portal',
      model: 'upstage/solar-pro4',
      message: 'Hermes API service unreachable.',
      base_url: 'http://127.0.0.1:8650/v1',
      capabilities: []
    };
  }
}

export async function fetchHermesCapabilities(): Promise<any> {
  const response = await fetch('/api/hermes/capabilities');
  if (!response.ok) {
    throw new Error('Failed to fetch Hermes capabilities.');
  }
  return response.json();
}

export async function sendHermesTask(
  message: string,
  conversationId?: string,
  datasetId?: string,
  engineId?: number
): Promise<HermesChatResponse> {
  const response = await fetch('/api/hermes/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      conversation_id: conversationId,
      dataset_id: datasetId,
      engine_id: engineId
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'AI service is temporarily unavailable. Please try again.');
  }

  return response.json();
}

export async function analyzeEngineWithHermes(
  datasetId: string,
  engineId: number
): Promise<HermesChatResponse> {
  const response = await fetch('/api/hermes/analyze-engine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataset_id: datasetId, engine_id: engineId })
  });

  if (!response.ok) {
    throw new Error(`Failed to analyze Engine #${engineId} with Hermes.`);
  }

  return response.json();
}

export async function compareEnginesWithHermes(
  datasetId: string
): Promise<HermesChatResponse> {
  const response = await fetch('/api/hermes/compare-engines', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataset_id: datasetId })
  });

  if (!response.ok) {
    throw new Error('Failed to compare engines with Hermes.');
  }

  return response.json();
}
