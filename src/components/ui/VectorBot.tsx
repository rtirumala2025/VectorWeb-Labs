'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Sparkles, Send, Bot, User } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useWizardStore } from '@/stores/wizardStore';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

export function VectorBot() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    // Initial message
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "System Online. I can help you with pricing, tech stack questions, or design ideas. What's on your mind?" }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Get project context if available
    const { projectId } = useWizardStore();

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Context-aware proactive messages
    useEffect(() => {
        const addProactiveMessage = (text: string) => {
            setMessages(prev => {
                // Don't duplicate if already the last message
                if (prev[prev.length - 1].content === text) return prev;
                return [...prev, { role: 'assistant', content: text }];
            });
        };

        if (pathname?.includes('/wizard/domain') && isOpen) {
            // Only add if user opens chat here
            // logic can be refined to be less spammy
        }
    }, [pathname, isOpen]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!inputValue.trim() || isTyping) return;

        const userMsg = inputValue.trim();
        setInputValue("");

        // Add User Message
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsTyping(true);

        try {
            // Build history from existing messages (before adding new user message)
            const history = messages.map(m => ({ role: m.role, content: m.content }));

            // Call VectorBot API with context (current page URL) and history
            const response = await apiClient.vectorBotChat(userMsg, pathname || undefined, history);

            // Add Assistant Message
            setMessages(prev => [...prev, { role: 'assistant', content: response.reply }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Connection interrupted. My neural link is unstable right now." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="mb-4 w-96 h-[500px] flex flex-col bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-blue-600/20 p-4 border-b border-white/10 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                <span className="text-xs font-mono font-bold text-blue-100 uppercase tracking-widest">VectorBot Support // Online</span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/50 hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-3 text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white/10 text-gray-200 border border-white/5'
                                        }`}>
                                        <div className="flex items-center gap-2 mb-1 opacity-50 text-[10px] font-mono uppercase tracking-wider">
                                            {msg.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                                            {msg.role === 'user' ? 'YOU' : 'VECTORBOT'}
                                        </div>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start w-full">
                                    <div className="bg-white/5 p-4 border border-white/5">
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/10 bg-white/5 shrink-0">
                            <form onSubmit={handleSendMessage} className="relative">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Type your query..."
                                    className="w-full bg-black/50 border border-white/10 pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600 font-mono"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isTyping}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <Send size={14} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group relative"
            >
                {/* Pulsing Glow */}
                <span className="absolute inset-0 rounded-full bg-blue-500 blur-lg opacity-40 group-hover:opacity-70 group-hover:blur-xl transition-all duration-300 animate-pulse" />

                {/* Orb */}
                <div className={`relative w-14 h-14 rounded-full flex items-center justify-center border border-white/20 shadow-lg ring-1 ring-white/10 transition-all duration-300 ${isOpen ? 'bg-black scale-90' : 'bg-blue-600 hover:scale-105'
                    }`}>
                    {isOpen ? (
                        <X size={24} className="text-white" />
                    ) : (
                        <MessageSquare size={24} className="text-white" />
                    )}
                </div>
            </button>
        </div>
    );
}
