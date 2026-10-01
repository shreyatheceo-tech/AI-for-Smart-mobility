import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Bot,
  Send,
  X,
  Minimize2,
  RotateCcw,
  Compass,
  ArrowRight,
  Shield,
  Leaf,
  CloudRain,
  Accessibility,
  Zap,
  MapPin,
  Clock,
  ChevronRight,
  Info,
  Layers,
} from 'lucide-react';
import { api } from '../services/api.js';
import { ChatMessage, PriorityType } from '../types/index.js';

interface MessageItem extends ChatMessage {
  id: string;
  timestamp: string;
}

const INITIAL_SUGGESTIONS = [
  '⚡ How do I beat peak-hour traffic?',
  '🌱 Show me lowest carbon route options',
  '☔ What should I keep in mind if it rains?',
  '♿ Find wheelchair accessible transit',
  '💰 How can I save on daily commutes?',
];

export const AiAssistantWidget: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: `Hello traveler! ✨ I'm **MobiMind AI**, your Intelligent Smart Mobility Copilot powered by Google Gemini.\n\nI can analyze real-time multi-modal routes, balance travel trade-offs (Speed vs Cost vs Safety vs Carbon), and guide your daily commutes!\n\nTell me where you want to go or tap any topic below to get started.`,
      timestamp: 'Just now',
    },
  ]);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(INITIAL_SUGGESTIONS);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isMinimized]);

  // Hide welcome bubble after 10 seconds or when opened
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeBubble(false);
    }, 12000);
    return () => clearTimeout(timer);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setShowWelcomeBubble(false);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: `Chat cleared! How can I help you navigate the city today? ✨`,
        timestamp: 'Just now',
      },
    ]);
    setSuggestedPrompts(INITIAL_SUGGESTIONS);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: MessageItem = {
      id: userMsgId,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build context from current location / pathname
      const context: any = {};
      if (location.pathname.startsWith('/app')) {
        context.activePriority = 'smart-mobility';
      }

      // Convert history for API
      const historyPayload = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await api.chat({
        message: query,
        history: historyPayload,
        context,
      });

      if (res && res.reply) {
        const botMsg: MessageItem = {
          id: `bot-${Date.now()}`,
          role: 'model',
          text: res.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickAction: res.quickAction,
        };

        setMessages((prev) => [...prev, botMsg]);
        if (res.suggestedPrompts && res.suggestedPrompts.length > 0) {
          setSuggestedPrompts(res.suggestedPrompts);
        }
      }
    } catch (err: any) {
      console.error('[AI Assistant Chat Error]:', err);
      const fallbackMsg: MessageItem = {
        id: `bot-fallback-${Date.now()}`,
        role: 'model',
        text: `I'm currently recalibrating my live network telemetry. In the meantime, you can explore instant multi-modal routes directly on our **Route Planner**!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTriggerAction = (action?: { type: 'PLAN_ROUTE'; origin: string; destination: string; priority?: PriorityType }) => {
    if (!action) return;
    const { origin, destination, priority = 'fastest' } = action;
    const url = `/app?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&priority=${encodeURIComponent(priority)}`;
    navigate(url);
    setIsMinimized(true);
  };

  // Helper to render markdown-like text nicely
  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={i} className="h-2" />;
      }

      // Bullet points
      if (trimmed.startsWith('•') || trimmed.startsWith('*') || trimmed.startsWith('-')) {
        const content = trimmed.replace(/^[•*-]\s*/, '');
        return (
          <div key={i} className="flex items-start gap-2 my-1 pl-1 text-[13px] leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-500 mt-1.5 flex-shrink-0" />
            <span>{renderInlineBold(content)}</span>
          </div>
        );
      }

      return (
        <p key={i} className="text-[13px] leading-relaxed my-1">
          {renderInlineBold(line)}
        </p>
      );
    });
  };

  const renderInlineBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-warm-charcoal">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* 3D Floating Invitation Speech Bubble (Dismissable) */}
      {!isOpen && showWelcomeBubble && (
        <div className="fixed bottom-24 right-6 z-50 max-w-[260px] animate-bounce-subtle">
          <div className="clay-card bg-white/95 border border-white/80 p-3.5 rounded-cute shadow-float text-xs text-warm-charcoal relative">
            <button
              onClick={() => setShowWelcomeBubble(false)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-warm-200 text-warm-500 hover:text-warm-800 flex items-center justify-center text-[10px] squish-click"
              title="Dismiss"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" />
              <span className="font-bold text-sage-700">MobiMind Copilot</span>
            </div>
            <p className="text-warm-charcoal/80">
              Need help planning the smartest commute or checking live traffic? Chat with Gemini AI!
            </p>
            <button
              onClick={handleOpen}
              className="mt-2 text-[11px] font-semibold text-sage-600 hover:text-sage-700 flex items-center gap-1 underline underline-offset-2"
            >
              Start chatting <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Floating 3D Tactile Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => {
            if (isOpen && !isMinimized) {
              setIsOpen(false);
            } else {
              handleOpen();
            }
          }}
          className={`group flex items-center gap-2.5 px-4 py-3 rounded-full clay-card border border-white/90 shadow-float hover:shadow-float-hover hover:-translate-y-1 active:translate-y-0.5 squish-click transition-all duration-300 ${
            isOpen && !isMinimized
              ? 'bg-rose-50 border-rose-200 text-warm-charcoal ring-2 ring-rose-300/40'
              : 'bg-warm-creamy text-warm-charcoal hover:bg-white'
          }`}
          aria-label="Open AI Assistant"
        >
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-sage-500 via-rose-400 to-lavender-400 flex items-center justify-center shadow-neumorphic-sm text-white group-hover:scale-105 transition-transform">
            <Bot className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-sage-400 border-2 border-white animate-pulse" />
          </div>

          <div className="flex flex-col text-left pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tracking-tight">Ask MobiMind AI</span>
              <Sparkles className="w-3 h-3 text-rose-500" />
            </div>
            <span className="text-[10px] text-warm-charcoal/60 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sage-500" />
              Gemini 3.5 Online
            </span>
          </div>
        </button>
      </div>

      {/* 3D Animated Chat Dialog Window */}
      {isOpen && (
        <div
          className={`fixed right-4 sm:right-6 bottom-24 z-50 w-[calc(100vw-32px)] sm:w-[440px] transition-all duration-300 ${
            isMinimized
              ? 'h-14 overflow-hidden rounded-cute'
              : 'h-[82vh] max-h-[640px] rounded-cute-lg flex flex-col'
          } clay-card bg-warm-creamy/95 backdrop-blur-xl border border-white/90 shadow-float overflow-hidden`}
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-white/80 border-b border-cream-200/80 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sage-500 via-rose-400 to-lavender-400 flex items-center justify-center text-white shadow-neumorphic-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-warm-charcoal">MobiMind Copilot</h3>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sage-100 text-sage-700 font-semibold border border-sage-200">
                    Gemini AI
                  </span>
                </div>
                <p className="text-[10px] text-warm-charcoal/60">
                  Intelligent Urban Mobility & Transit Advisory
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="w-7 h-7 rounded-full text-warm-charcoal/60 hover:text-warm-charcoal hover:bg-cream-200 flex items-center justify-center transition-colors squish-click"
                title="Restart conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-7 h-7 rounded-full text-warm-charcoal/60 hover:text-warm-charcoal hover:bg-cream-200 flex items-center justify-center transition-colors squish-click"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full text-warm-charcoal/60 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors squish-click"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Context bar */}
              <div className="px-4 py-1.5 bg-cream-100/70 border-b border-cream-200/50 flex items-center justify-between text-[11px] text-warm-charcoal/70">
                <span className="flex items-center gap-1.5 font-medium">
                  <Compass className="w-3 h-3 text-sage-600" />
                  Mode: Multi-Modal Intelligent Routing
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/80 border border-cream-300 font-semibold text-warm-charcoal/80">
                  Real-time Active
                </span>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scroll-smooth">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    } cascade-item`}
                  >
                    <div
                      className={`max-w-[86%] rounded-cute px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-rose-100 to-rose-50 text-warm-charcoal border border-rose-200/70 shadow-neumorphic-sm rounded-br-sm'
                          : 'clay-card bg-white/95 text-warm-charcoal border border-white/80 shadow-neumorphic-sm rounded-bl-sm'
                      }`}
                    >
                      {/* Message author badge for AI */}
                      {msg.role === 'model' && (
                        <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-cream-200/60">
                          <Sparkles className="w-3 h-3 text-rose-500" />
                          <span className="text-[10px] font-bold text-warm-charcoal/70 tracking-wide uppercase">
                            MobiMind Intelligence
                          </span>
                        </div>
                      )}

                      <div className="text-warm-charcoal">
                        {renderFormattedText(msg.text)}
                      </div>

                      {/* Interactive Quick Action Card if AI proposed planning a route */}
                      {msg.quickAction && msg.quickAction.type === 'PLAN_ROUTE' && (
                        <div className="mt-3 p-3 rounded-cute bg-cream-100/90 border border-sage-200 shadow-neumorphic-inset flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-sage-800 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-rose-500" />
                              Ready to Plan Commute
                            </span>
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white text-sage-700 font-bold border border-sage-300">
                              {msg.quickAction.priority || 'Fastest'}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-warm-charcoal flex items-center gap-1.5">
                            <span>{msg.quickAction.origin}</span>
                            <ArrowRight className="w-3 h-3 text-warm-400" />
                            <span>{msg.quickAction.destination}</span>
                          </div>
                          <button
                            onClick={() => handleTriggerAction(msg.quickAction)}
                            className="mt-1 w-full py-2 px-3 rounded-full bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-float squish-click"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            Launch in Route Planner
                          </button>
                        </div>
                      )}

                      <div className="text-[9px] text-warm-charcoal/50 text-right mt-1.5">
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-start gap-2.5 cascade-item">
                    <div className="w-7 h-7 rounded-full bg-sage-100 flex items-center justify-center text-sage-600 flex-shrink-0">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="clay-card bg-white/90 border border-white/80 px-4 py-3 rounded-cute shadow-neumorphic-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sage-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-lavender-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-xs text-warm-charcoal/60 font-medium ml-1">
                        MobiMind is analyzing transit options...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions Chips Carousel */}
              <div className="px-4 py-2 bg-white/60 border-t border-cream-200/60 overflow-x-auto flex gap-1.5 no-scrollbar flex-shrink-0">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isLoading}
                    className="flex-shrink-0 text-[11px] font-medium px-3 py-1.5 rounded-full bg-cream-100 hover:bg-rose-50 text-warm-charcoal/80 hover:text-warm-charcoal border border-cream-300 hover:border-rose-200 shadow-neumorphic-sm transition-all squish-click disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <div className="p-3.5 bg-white/90 border-t border-cream-200/80 flex-shrink-0">
                <div className="bg-cream-100 shadow-neumorphic-inset rounded-full p-1.5 flex items-center gap-2 border border-cream-200/60 focus-within:border-sage-400 transition-colors">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about routes, weather, fares, safety..."
                    disabled={isLoading}
                    className="flex-1 bg-transparent px-3 py-1 text-xs text-warm-charcoal placeholder-warm-charcoal/40 focus:outline-none"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || isLoading}
                    className="w-8 h-8 rounded-full bg-sage-600 hover:bg-sage-700 disabled:opacity-40 disabled:hover:bg-sage-600 text-white flex items-center justify-center shadow-float squish-click transition-all flex-shrink-0"
                    title="Send message"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between px-2 pt-1.5 text-[10px] text-warm-charcoal/50">
                  <span>Press Enter to send</span>
                  <span className="flex items-center gap-1 font-medium text-sage-600">
                    <Sparkles className="w-2.5 h-2.5" />
                    Google Gemini 3.5 AI Copilot
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
