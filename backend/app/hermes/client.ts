import { HermesMessage, HermesStatusResponse } from './schemas';
import { HERMES_READONLY_TOOLS } from './tools';

export class HermesApiClient {
  private baseUrl: string;
  private apiKey: string;
  private model: string;
  private enabled: boolean;
  private timeoutMs: number;
  private maxRetries: number;
  private provider: string = 'Nous Portal';

  constructor() {
    this.enabled = process.env.HERMES_ENABLED !== 'false';
    const envUrl = process.env.HERMES_BASE_URL || 'http://127.0.0.1:8650/v1';
    this.baseUrl = envUrl.replace(/\/+$/, '');
    this.apiKey = process.env.HERMES_API_KEY || 'sk-unused';
    this.model = process.env.HERMES_MODEL || 'upstage/solar-pro4';
    this.timeoutMs = parseInt(process.env.HERMES_TIMEOUT || '60000', 10);
    this.maxRetries = parseInt(process.env.HERMES_MAX_RETRIES || '2', 10);
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public getModel(): string {
    return this.model;
  }

  public getProvider(): string {
    return this.provider;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  private getChatEndpoint(): string {
    if (this.baseUrl.endsWith('/v1')) {
      return `${this.baseUrl}/chat/completions`;
    }
    return `${this.baseUrl}/v1/chat/completions`;
  }

  private getModelsEndpoint(): string {
    if (this.baseUrl.endsWith('/v1')) {
      return `${this.baseUrl}/models`;
    }
    return `${this.baseUrl}/v1/models`;
  }

  public async checkStatus(): Promise<HermesStatusResponse> {
    const capabilities = HERMES_READONLY_TOOLS.map(t => t.function.name);

    if (!this.enabled) {
      return {
        status: 'OFFLINE',
        enabled: false,
        provider: this.provider,
        model: this.model,
        base_url: this.baseUrl,
        message: 'HERMES_ENABLED is set to false.',
        capabilities
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const healthUrl = this.getModelsEndpoint();
      const headers: Record<string, string> = { 'Accept': 'application/json' };
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const res = await fetch(healthUrl, {
        method: 'GET',
        headers,
        signal: controller.signal
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (res && res.ok) {
        return {
          status: 'ONLINE',
          enabled: true,
          provider: this.provider,
          model: this.model,
          base_url: this.baseUrl,
          message: 'Hermes AI Proxy Service connected via Nous Portal.',
          capabilities
        };
      }
    } catch {
      // Endpoint unreachable
    }

    return {
      status: 'OFFLINE',
      enabled: true,
      provider: this.provider,
      model: this.model,
      base_url: this.baseUrl,
      message: `Hermes AI Proxy Service (${this.baseUrl}) is unreachable or offline. Deterministic diagnostic tools active.`,
      capabilities
    };
  }

  public async callChatCompletions(
    messages: HermesMessage[],
    tools = HERMES_READONLY_TOOLS
  ): Promise<any> {
    if (!this.enabled) {
      throw new Error('Hermes AI service is disabled by configuration.');
    }

    const endpoint = this.getChatEndpoint();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const payload = {
      model: this.model,
      messages,
      tools: tools.length > 0 ? tools : undefined,
      tool_choice: 'auto',
      temperature: 0.2,
      max_tokens: 1500
    };

    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt <= this.maxRetries) {
      attempt++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          if (!json || !json.choices || json.choices.length === 0) {
            throw new Error('Received empty choice response from Hermes AI service.');
          }
          return json;
        }

        const errorText = await res.text().catch(() => '');
        let userFacingError = `Hermes service error (${res.status})`;

        if (res.status === 401 || res.status === 403) {
          userFacingError = 'Authentication failed with Hermes AI service.';
        } else if (res.status === 404) {
          userFacingError = 'Hermes chat completion endpoint not found.';
        } else if (res.status === 422) {
          userFacingError = 'Invalid payload format sent to Hermes AI service.';
        } else if (res.status === 429) {
          userFacingError = 'Hermes AI service rate limit exceeded. Please retry shortly.';
        } else if (res.status >= 500) {
          userFacingError = 'Hermes AI service is temporarily unavailable. Please try again.';
        }

        lastError = new Error(`${userFacingError}: ${errorText || res.statusText}`);
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          lastError = new Error('Hermes AI request timed out. Please try again.');
        } else {
          lastError = err instanceof Error ? err : new Error(String(err));
        }
      }

      // If attempt failed and retries remain, wait briefly before retrying
      if (attempt <= this.maxRetries) {
        await new Promise(r => setTimeout(r, 500 * attempt));
      }
    }

    throw lastError || new Error('Hermes AI service request failed after retries.');
  }
}

export const hermesClient = new HermesApiClient();
