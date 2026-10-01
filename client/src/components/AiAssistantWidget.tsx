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
      // Slight delay to ensure DOM is ready
      const t = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(t);
    }
  }, [messages, isOpen, isMinimized]);

  // Hide welcome bubble after 14 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeBubble(false);
    }, 14000);
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
      const context: any = {};
      if (location.pathname.startsWith('/app')) {
        context.activePriority = 'smart-mobility';
      }

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
        text: `I am currently synchronizing with transit telemetry. You can still plan direct routes on the **Route Planner** anytime!`,
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

  // ----------------- RICH MARKDOWN RENDERER WITH DARK HIGH-CONTRAST TEXT ----------------- //

  const renderItalicOnly = (text: string) => {
    const parts = text.split(/(\*.*?\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return (
          <em key={index} className="italic text-stone-900 font-medium">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  const renderInlineStyles = (text: string) => {
    const boldParts = text.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith('**') && bPart.endsWith('**')) {
        const inner = bPart.slice(2, -2);
        return (
          <strong key={`b-${bIdx}`} className="font-bold text-black">
            {renderItalicOnly(inner)}
          </strong>
        );
      }
      return <span key={`nb-${bIdx}`}>{renderItalicOnly(bPart)}</span>;
    });
  };

  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={i} className="h-1.5" />;
      }

      // Sub-bullet (e.g. "    *   ...")
      const isSubBullet = line.startsWith('    *') || line.startsWith('  *') || line.startsWith('\t*');
      if (isSubBullet) {
        const content = trimmed.replace(/^[*•-]\s*/, '');
        return (
          <div key={i} className="flex items-start gap-2 my-1 pl-4 text-xs text-stone-900 leading-relaxed font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-500 mt-1.5 flex-shrink-0" />
            <span>{renderInlineStyles(content)}</span>
          </div>
        );
      }

      // Main Bullet point
      if (trimmed.startsWith('•') || trimmed.startsWith('*') || trimmed.startsWith('-')) {
        const content = trimmed.replace(/^[•*-]\s*/, '');
        return (
          <div key={i} className="flex items-start gap-2 my-1.5 pl-1 text-[13px] text-stone-950 leading-relaxed font-medium">
            <span className="w-2 h-2 rounded-full bg-sage-600 mt-1.5 flex-shrink-0" />
            <span>{renderInlineStyles(content)}</span>
          </div>
        );
      }

      // Headings (###)
      if (trimmed.startsWith('###')) {
        const headingText = trimmed.replace(/^###\s*/, '');
        return (
          <h4 key={i} className="text-xs font-bold text-stone-950 uppercase tracking-wide mt-2.5 mb-1">
            {renderInlineStyles(headingText)}
          </h4>
        );
      }

      // Numbered item (e.g. "1. ", "Step 1: ")
      const numMatch = trimmed.match(/^(\d+\.|\bStep\s+\d+:?)\s*(.*)/i);
      if (numMatch) {
        return (
          <div key={i} className="flex items-start gap-2 my-1.5 pl-1 text-[13px] text-stone-950 leading-relaxed font-medium">
            <span className="font-extrabold text-sage-900 min-w-[18px]">{numMatch[1]}</span>
            <span>{renderInlineStyles(numMatch[2])}</span>
          </div>
        );
      }

      // Regular paragraph with dark text
      return (
        <p key={i} className="text-[13px] text-stone-950 leading-relaxed my-1 font-medium">
          {renderInlineStyles(line)}
        </p>
      );
    });
  };

  return (
    <>
      {/* 3D Floating Invitation Speech Bubble (Dismissable) */}
      {!isOpen && showWelcomeBubble && (
        <div className="fixed bottom-24 right-6 z-[9999] max-w-[280px] animate-bounce-subtle">
          <div className="clay-card bg-white border border-stone-300 p-3.5 rounded-cute shadow-float text-stone-950 relative">
            <button
              onClick={() => setShowWelcomeBubble(false)}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-stone-200 text-stone-800 hover:text-black hover:bg-stone-300 flex items-center justify-center text-xs squish-click shadow-sm"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sage-600 animate-pulse" />
              <span className="font-extrabold text-stone-900 text-xs">MobiMind Copilot</span>
            </div>
            <p className="text-stone-900 text-xs font-semibold leading-relaxed">
              Need help finding the fastest, greenest, or safest route? Ask Google Gemini!
            </p>
            <button
              onClick={handleOpen}
              className="mt-2 text-xs font-bold text-sage-700 hover:text-sage-900 flex items-center gap-1 underline underline-offset-2"
            >
              Start chatting <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating 3D Tactile Trigger Button */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <button
          onClick={() => {
            if (isOpen && !isMinimized) {
              setIsOpen(false);
            } else {
              handleOpen();
            }
          }}
          className={`group flex items-center gap-2.5 px-4 py-3 rounded-full clay-card border border-stone-200 shadow-float hover:shadow-float-hover hover:-translate-y-1 active:translate-y-0.5 squish-click transition-all duration-300 ${
            isOpen && !isMinimized
              ? 'bg-rose-50 border-rose-300 text-stone-950 ring-2 ring-rose-400/40'
              : 'bg-white text-stone-950 hover:bg-stone-50'
          }`}
          aria-label="Open AI Assistant"
        >
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-sage-600 via-rose-500 to-lavender-500 flex items-center justify-center shadow-neumorphic-sm text-white group-hover:scale-105 transition-transform">
            <Bot className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
          </div>

          <div className="flex flex-col text-left pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-extrabold text-stone-950 tracking-tight">Ask MobiMind AI</span>
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <span className="text-[11px] text-stone-700 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Gemini 3.5 Online
            </span>
          </div>
        </button>
      </div>

      {/* 3D Animated Chat Dialog Window */}
      {isOpen && (
        <div
          className={`fixed right-4 sm:right-6 bottom-24 z-[9999] w-[calc(100vw-32px)] sm:w-[440px] transition-all duration-300 ${
            isMinimized
              ? 'h-14 overflow-hidden rounded-cute'
              : 'h-[82vh] max-h-[min(650px,calc(100vh-120px))] rounded-cute-lg flex flex-col'
          } clay-card bg-cream-50/98 backdrop-blur-xl border border-stone-300 shadow-float overflow-hidden`}
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-white border-b border-stone-200 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sage-600 via-rose-500 to-lavender-500 flex items-center justify-center text-white shadow-neumorphic-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-stone-950">MobiMind Copilot</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sage-100 text-sage-900 font-extrabold border border-sage-300">
                    Gemini AI
                  </span>
                </div>
                <p className="text-[11px] font-bold text-stone-600">
                  Intelligent Urban Mobility & Transit Advisory
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="w-7 h-7 rounded-full text-stone-700 hover:text-black hover:bg-stone-100 flex items-center justify-center transition-colors squish-click"
                title="Restart conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-7 h-7 rounded-full text-stone-700 hover:text-black hover:bg-stone-100 flex items-center justify-center transition-colors squish-click"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full text-stone-700 hover:text-rose-700 hover:bg-rose-100 flex items-center justify-center transition-colors squish-click"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Context bar */}
              <div className="px-4 py-1.5 bg-stone-100 border-b border-stone-200 flex items-center justify-between text-xs text-stone-900">
                <span className="flex items-center gap-1.5 font-bold text-stone-800">
                  <Compass className="w-3.5 h-3.5 text-sage-700" />
                  Mode: Multi-Modal Intelligent Routing
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-stone-300 font-extrabold text-stone-800">
                  Real-time Active
                </span>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scroll-smooth bg-cream-50/60">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    } cascade-item`}
                  >
                    <div
                      className={`max-w-[88%] rounded-cute px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-rose-100 text-stone-950 border border-rose-300 shadow-neumorphic-sm rounded-br-sm'
                          : 'clay-card bg-white text-stone-950 border border-stone-300 shadow-neumorphic-sm rounded-bl-sm'
                      }`}
                    >
                      {/* Message author badge for AI */}
                      {msg.role === 'model' && (
                        <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-stone-200">
                          <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                          <span className="text-[11px] font-extrabold text-stone-800 tracking-wide uppercase">
                            MobiMind Intelligence
                          </span>
                        </div>
                      )}

                      {/* Main Message Content */}
                      <div className="text-stone-950">
                        {renderFormattedText(msg.text)}
                      </div>

                      {/* Interactive Quick Action Card if AI proposed planning a route */}
                      {msg.quickAction && msg.quickAction.type === 'PLAN_ROUTE' && (
                        <div className="mt-3 p-3 rounded-cute bg-stone-50 border-2 border-sage-300 shadow-neumorphic-inset flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-stone-900 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-rose-600" />
                              Ready to Plan Commute
                            </span>
                            <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-sage-100 text-sage-900 font-extrabold border border-sage-300">
                              {msg.quickAction.priority || 'Fastest'}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-stone-950 flex items-center gap-1.5">
                            <span className="bg-white px-2 py-0.5 rounded border border-stone-200">{msg.quickAction.origin}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
                            <span className="bg-white px-2 py-0.5 rounded border border-stone-200">{msg.quickAction.destination}</span>
                          </div>
                          <button
                            onClick={() => handleTriggerAction(msg.quickAction)}
                            className="mt-1 w-full py-2.5 px-3 rounded-full bg-sage-700 hover:bg-sage-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-float squish-click"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            Launch in Route Planner
                          </button>
                        </div>
                      )}

                      <div className="text-[10px] text-stone-600 font-semibold text-right mt-1.5">
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-start gap-2.5 cascade-item">
                    <div className="w-7 h-7 rounded-full bg-sage-200 flex items-center justify-center text-sage-800 flex-shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="clay-card bg-white border border-stone-300 px-4 py-3 rounded-cute shadow-neumorphic-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sage-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-lavender-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-xs text-stone-900 font-bold ml-1">
                        MobiMind is analyzing transit options...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions Chips Carousel with Dark High-Contrast Text */}
              <div className="px-4 py-2.5 bg-white border-t border-stone-200 overflow-x-auto flex gap-1.5 no-scrollbar flex-shrink-0">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isLoading}
                    className="flex-shrink-0 text-xs font-bold px-3.5 py-1.5 rounded-full bg-stone-50 hover:bg-stone-100 text-stone-950 border border-stone-300 hover:border-stone-400 shadow-sm transition-all squish-click disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Footer with Crisp Contrast */}
              <div className="p-3.5 bg-white border-t border-stone-200 flex-shrink-0">
                <div className="bg-stone-50 shadow-neumorphic-inset rounded-full p-1.5 flex items-center gap-2 border border-stone-300 focus-within:border-sage-600 transition-colors">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about routes, weather, fares, safety..."
                    disabled={isLoading}
                    className="flex-1 bg-transparent px-3 py-1.5 text-xs text-stone-950 placeholder-stone-500 font-semibold focus:outline-none"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || isLoading}
                    className="w-8 h-8 rounded-full bg-sage-700 hover:bg-sage-800 disabled:opacity-40 disabled:hover:bg-sage-700 text-white flex items-center justify-center shadow-float squish-click transition-all flex-shrink-0"
                    title="Send message"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between px-2 pt-1.5 text-[11px] text-stone-600 font-semibold">
                  <span>Press Enter to send</span>
                  <span className="flex items-center gap-1 font-bold text-stone-800">
                    <Sparkles className="w-3 h-3 text-rose-600" />
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
