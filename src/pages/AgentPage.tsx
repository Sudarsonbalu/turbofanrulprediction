import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Activity,
  CheckCircle2,
  Cpu,
  Database,
  Send,
  Loader2,
  Wrench,
  ChevronRight,
  ShieldAlert,
  RefreshCw,
  Trash2,
  RotateCcw,
  Sparkles,
  Server
} from 'lucide-react';
import { DatasetMetadata } from '../types';
import { fetchHermesStatus, sendHermesTask } from '../services/hermesApi';
import { HermesStatusResponse, HermesChatResponse } from '../../backend/app/hermes/schemas';

interface AgentPageProps {
  dataset: DatasetMetadata | null;
  selectedEngineId: number;
  onSelectEngine: (engineId: number) => void;
}

interface MessageItem {
  id: string;
  sender: 'user' | 'hermes';
  text: string;
  responseObj?: HermesChatResponse;
  timestamp: string;
  isError?: boolean;
}

export const AgentPage: React.FC<AgentPageProps> = ({
  dataset,
  selectedEngineId,
  onSelectEngine
}) => {
  const [hermesStatus, setHermesStatus] = useState<HermesStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [activeEngine, setActiveEngine] = useState<number>(selectedEngineId || 24);
  const [conversationId, setConversationId] = useState<string>(() => `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const datasetId = dataset?.dataset_id || 'train_FD001.txt';

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  };

  useEffect(() => {
    scrollToBottom('smooth');
    const timer = setTimeout(() => {
      scrollToBottom('smooth');
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isProcessing]);

  const loadStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await fetchHermesStatus();
      setHermesStatus(res);
    } catch {
      setHermesStatus({
        status: 'OFFLINE',
        enabled: true,
        provider: 'Nous Portal',
        model: 'upstage/solar-pro4',
        message: 'Hermes API unreachable.',
        base_url: 'http://127.0.0.1:8650/v1',
        capabilities: []
      });
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleSendPrompt = async (promptText?: string) => {
    const textToSend = promptText || inputQuery;
    if (!textToSend.trim() || isProcessing) return;

    const userMsgId = `user_${Date.now()}`;
    const userMsg: MessageItem = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!promptText) setInputQuery('');
    setIsProcessing(true);

    try {
      const chatRes = await sendHermesTask(textToSend, conversationId, datasetId, activeEngine);
      const hermesMsg: MessageItem = {
        id: `hermes_${Date.now()}`,
        sender: 'hermes',
        text: chatRes.response,
        responseObj: chatRes,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, hermesMsg]);
    } catch (err: any) {
      const errMsg: MessageItem = {
        id: `err_${Date.now()}`,
        sender: 'hermes',
        text: err?.message || 'AI service is temporarily unavailable. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetryLast = () => {
    const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user');
    if (lastUserMsg) {
      handleSendPrompt(lastUserMsg.text);
    }
  };

  const handleClearConversation = () => {
    setMessages([]);
    setConversationId(`conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  const samplePrompts = [
    'Which engine needs attention?',
    `Why is Engine #${activeEngine} at high risk?`,
    'Can you explain this RUL prediction?',
    'What sensors look unusual?',
    'Give me a quick fleet summary.'
  ];

  const isOnline = hermesStatus?.status === 'ONLINE' || hermesStatus?.status === 'CONNECTED';

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#DDD8D3]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-none bg-[#FAF9F6] border border-[#DDD8D3] text-[#16191C]">
              <Bot className="w-5 h-5 text-[#A6362A]" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[#16191C] flex items-center gap-2">
                Hermes AI Diagnostic Agent
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#16191C] text-white border border-[#16191C] font-medium">
                  SOLAR PRO 4 READ-ONLY
                </span>
              </h1>
              <p className="text-xs text-[#5A594F] mt-0.5 font-mono">
                Autonomous AI copilot executing authenticated read-only tool calls over C-MAPSS dataset telemetry.
              </p>
            </div>
          </div>
        </div>

        {/* Connection & Model Info Badge */}
        <div className="flex flex-wrap items-center gap-2.5 bg-white px-3 py-1.5 border border-[#DDD8D3] text-xs font-mono rounded-none">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-none ${
                isOnline ? 'bg-[#2F6E5C]' : 'bg-[#B8791A]'
              }`}
            />
            <span className="font-semibold text-[#16191C]">
              {isOnline ? 'HERMES CONNECTED' : 'OFFLINE MODE'}
            </span>
          </div>

          <span className="text-[#DDD8D3]">|</span>

          <div className="text-[11px] text-[#5A594F]">
            Model: <span className="text-[#16191C] font-semibold">{hermesStatus?.model || 'upstage/solar-pro4'}</span>
          </div>

          <button
            onClick={loadStatus}
            className="p-0.5 text-[#5A594F] hover:text-[#16191C] transition-colors ml-1 cursor-pointer"
            title="Re-check status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-[#DDD8D3] rounded-sm p-4 space-y-3 font-sans">
            <h3 className="text-xs font-mono font-semibold uppercase text-[#5A594F] tracking-wider flex items-center justify-between border-b border-[#DDD8D3] pb-2">
              <span>System Context</span>
              <Database className="w-3.5 h-3.5 text-[#16191C]" />
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 bg-[#FAF9F6] border border-[#DDD8D3]">
                <span className="text-[#5A594F]">Active Dataset:</span>
                <span className="text-[#16191C] font-semibold truncate max-w-[140px]">
                  {dataset?.filename || 'train_FD001.txt'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-[#FAF9F6] border border-[#DDD8D3]">
                <span className="text-[#5A594F]">Target Engine:</span>
                <div className="flex items-center gap-1">
                  <span className="text-[#A6362A] font-semibold">#{activeEngine}</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={activeEngine}
                    onChange={e => {
                      const val = parseInt(e.target.value, 10) || 1;
                      setActiveEngine(val);
                      onSelectEngine(val);
                    }}
                    className="w-12 bg-white border border-[#DDD8D3] text-[#16191C] text-[11px] px-1 py-0.5 text-center font-mono rounded-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-2 bg-[#FAF9F6] border border-[#DDD8D3]">
                <span className="text-[#5A594F]">Session ID:</span>
                <span className="text-[#5A594F] text-[10px] truncate max-w-[120px]">
                  {conversationId}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#DDD8D3] rounded-sm p-4 space-y-2 font-mono text-xs">
            <h3 className="text-xs font-mono font-semibold uppercase text-[#5A594F] tracking-wider flex items-center justify-between border-b border-[#DDD8D3] pb-2">
              <span>AI Provider Spec</span>
              <Server className="w-3.5 h-3.5 text-[#2F6E5C]" />
            </h3>
            <div className="p-2.5 bg-[#FAF9F6] border border-[#DDD8D3] space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#5A594F]">Service URL:</span>
                <span className="text-[#16191C] font-medium">{hermesStatus?.base_url || 'http://127.0.0.1:8650/v1'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A594F]">Provider:</span>
                <span className="text-[#2F6E5C] font-semibold">{hermesStatus?.provider || 'Nous Portal'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A594F]">Model Alias:</span>
                <span className="text-[#A6362A] font-semibold">{hermesStatus?.model || 'upstage/solar-pro4'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#DDD8D3] rounded-sm p-4 space-y-3 font-sans">
            <h3 className="text-xs font-mono font-semibold uppercase text-[#5A594F] tracking-wider flex items-center justify-between border-b border-[#DDD8D3] pb-2">
              <span>Read-Only Tool Protocol</span>
              <Wrench className="w-3.5 h-3.5 text-[#2F6E5C]" />
            </h3>

            <div className="space-y-1 text-[11px] font-mono">
              {[
                'get_dataset_summary',
                'get_dataset_quality',
                'get_sensor_statistics',
                'get_sensor_trend',
                'get_engine_details',
                'get_rul_prediction',
                'get_model_metrics',
                'get_feature_importance',
                'compare_engines'
              ].map(t => (
                <div
                  key={t}
                  className="flex items-center justify-between p-1.5 bg-[#FAF9F6] border border-[#DDD8D3] text-[#16191C]"
                >
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-[#2F6E5C] shrink-0" />
                    <code>{t}</code>
                  </span>
                  <span className="text-[9px] text-[#2F6E5C] font-semibold uppercase">
                    AUTHENTICATED
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Conversation Workspace */}
        <div className="lg:col-span-8 flex flex-col space-y-4 font-sans">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono text-[#5A594F] font-semibold uppercase">
              Suggested Telemetry Diagnostics
            </span>
            <div className="flex items-center gap-2">
              {messages.some(m => m.isError) && (
                <button
                  onClick={handleRetryLast}
                  disabled={isProcessing}
                  className="px-2.5 py-1 bg-[#B8791A]/10 text-[#B8791A] border border-[#B8791A]/30 text-xs font-mono font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Retry Request</span>
                </button>
              )}
              {messages.length > 0 && (
                <button
                  onClick={handleClearConversation}
                  disabled={isProcessing}
                  className="px-2.5 py-1 bg-white text-[#16191C] hover:bg-[#FAF9F6] border border-[#DDD8D3] text-xs font-mono font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3 text-[#5A594F]" />
                  <span>Clear Conversation</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendPrompt(p)}
                disabled={isProcessing}
                className="text-left p-2 bg-white hover:bg-[#FAF9F6] border border-[#DDD8D3] text-xs font-sans text-[#16191C] transition-colors flex items-center justify-between group disabled:opacity-50 cursor-pointer rounded-none"
              >
                <span className="truncate pr-2">{p}</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#5A594F] group-hover:text-[#A6362A] shrink-0" />
              </button>
            ))}
          </div>

          {/* Conversation Window */}
          <div className="flex-1 bg-white border border-[#DDD8D3] rounded-sm p-4 min-h-[460px] max-h-[620px] overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#5A594F] space-y-3 font-mono">
                <div className="p-3 bg-[#FAF9F6] border border-[#DDD8D3] text-[#16191C]">
                  <Sparkles className="w-6 h-6 text-[#A6362A]" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#16191C] font-sans">
                    Hermes Agent Standby
                  </h4>
                  <p className="text-xs text-[#5A594F] max-w-md mt-1">
                    Ask questions about engine health, telemetry anomalies, RUL predictions, or fleet risk states.
                  </p>
                </div>
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={`space-y-3 ${
                    msg.sender === 'user' ? 'flex justify-end' : 'flex justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[92%] rounded-sm p-4 border text-xs leading-relaxed space-y-3 ${
                      msg.sender === 'user'
                        ? 'bg-[#FAF9F6] border-[#16191C] text-[#16191C] font-sans'
                        : msg.isError
                        ? 'bg-[#A6362A]/10 border-[#A6362A]/30 text-[#A6362A]'
                        : 'bg-white border-[#DDD8D3] text-[#16191C]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#5A594F] pb-1.5 border-b border-[#DDD8D3]">
                      <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        {msg.sender === 'user' ? (
                          'Your Question'
                        ) : (
                          <>
                            <Bot className="w-3.5 h-3.5 text-[#A6362A]" />
                            <span>Hermes AI Agent Response</span>
                          </>
                        )}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div className="whitespace-pre-wrap font-sans text-xs">{msg.text}</div>

                    {msg.responseObj?.tool_activity && msg.responseObj.tool_activity.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#DDD8D3] space-y-1.5 font-mono text-[11px]">
                        <p className="text-[10px] uppercase text-[#5A594F] font-semibold flex items-center gap-1">
                          <Activity className="w-3 h-3 text-[#16191C]" /> Executed Tool Protocol
                        </p>
                        {msg.responseObj.tool_activity.map(tool => (
                          <div
                            key={tool.id}
                            className="p-2 bg-[#FAF9F6] border border-[#DDD8D3] flex items-center justify-between text-[#16191C]"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <CheckCircle2 className="w-3 h-3 text-[#2F6E5C] shrink-0" />
                              <span className="font-semibold">{tool.tool_name}</span>
                              <span className="text-[#5A594F] text-[10px] truncate">
                                ({JSON.stringify(tool.arguments)})
                              </span>
                            </div>
                            <span className="text-[10px] text-[#5A594F] shrink-0">
                              {tool.execution_time_ms}ms
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="rounded-sm p-3 bg-[#FAF9F6] border border-[#DDD8D3] text-[#16191C] text-xs flex items-center gap-3 font-mono">
                  <Loader2 className="w-4 h-4 animate-spin text-[#16191C]" />
                  <div className="space-y-0.5">
                    <p className="font-semibold">Querying Hermes tools...</p>
                    <p className="text-[10px] text-[#5A594F]">Fetching telemetry details & RUL models</p>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* User Input Form */}
          <div className="bg-white border border-[#DDD8D3] rounded-sm p-3 space-y-2">
            <div className="flex items-center gap-2">
              <textarea
                value={inputQuery}
                onChange={e => setInputQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder={isProcessing ? "Hermes AI is processing query..." : "Ask Hermes AI about engine telemetry, RUL predictions, or fleet maintenance risks..."}
                disabled={isProcessing}
                className="flex-1 bg-[#FAF9F6] border border-[#DDD8D3] rounded-none p-2.5 text-xs font-sans text-[#16191C] placeholder-[#5A594F] focus:outline-none focus:border-[#16191C] resize-none disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => handleSendPrompt()}
                disabled={isProcessing || !inputQuery.trim()}
                className="px-4 py-2.5 bg-[#16191C] text-white hover:bg-[#2C3136] text-xs font-sans font-medium rounded-sm border border-[#16191C] flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer self-stretch justify-center"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>SEND</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#5A594F] font-mono">
              <span>Shift + Enter for line break • Enter to submit</span>
              <span>Target Engine #{activeEngine}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
