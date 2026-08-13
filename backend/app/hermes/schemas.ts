export interface HermesToolCall {
  id: string;
  tool_name: string;
  arguments: Record<string, any>;
  status: 'PENDING' | 'EXECUTING' | 'SUCCESS' | 'FAILED';
  result?: any;
  error?: string;
  execution_time_ms?: number;
}

export interface HermesMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  tool_call_id?: string;
  tool_calls?: {
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }[];
}

export interface HermesStatusResponse {
  status: 'ONLINE' | 'CONNECTED' | 'OFFLINE';
  enabled: boolean;
  provider: string;
  model: string;
  base_url: string;
  message: string;
  capabilities: string[];
}

export interface HermesChatRequest {
  message: string;
  conversation_id?: string;
  dataset_id?: string;
  engine_id?: number;
  history?: HermesMessage[];
}

export interface HermesStructuredResult {
  engine_id?: number;
  dataset_id?: string;
  current_cycle?: number;
  predicted_rul?: number;
  model_used?: string;
  risk_level?: string;
  observed_data_summary: string;
  model_output_summary: string;
  analytical_findings: string[];
  agent_interpretation: string;
  engineering_considerations: string[];
  cautionary_note: string;
}

export interface HermesChatResponse {
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  response: string;
  conversation_id?: string;
  provider?: string;
  model_used: string;
  structured_result?: HermesStructuredResult;
  tool_activity: HermesToolCall[];
  hermes_status: 'ONLINE' | 'CONNECTED' | 'OFFLINE';
  timestamp: string;
  error?: string;
}
