'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hey! I'm Scout, your AI project assistant. Ask me anything about your website build.",
            timestamp: new Date(),
        },
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const mockResponses = [
        "Your website is currently in the development phase. The design mockups were approved last week!",
        "Based on the timeline, we're on track for the Feb 5th launch date. No blockers so far.",
        "Great question! The contact form will integrate with your existing CRM via webhook.",
        "I can see the dev team pushed 12 commits today. They're working on the checkout flow.",
        "Would you like me to schedule a review call with the team? I can find available times.",
    ];

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate AI response
        await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1500));

        const response: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
            timestamp: new Date(),
        };

        setIsTyping(false);
        setMessages((prev) => [...prev, response]);
    };

    return (
        <>
            {/* Floating Button */}
            <motion.button
                onClick={() => setIsOpen(true)}
                className={`
          fixed bottom-20 right-6 z-40
          w-14 h-14 rounded-full
          bg-cobalt text-white
          flex items-center justify-center
          shadow-lg shadow-cobalt/30
          hover:shadow-xl hover:shadow-cobalt/40
          transition-shadow duration-300
          ${isOpen ? 'hidden' : 'block'}
        `}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <MessageCircle size={24} />
            </motion.button>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="fixed bottom-20 right-6 z-50 w-96 h-[500px]
              bg-carbon border border-steel rounded-lg
              shadow-2xl shadow-black/50
              flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-steel">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-cobalt/20 flex items-center justify-center">
                                    <Bot size={16} className="text-cobalt" />
                                </div>
                                <div>
                                    <h3 className="font-mono text-sm font-bold text-bone">LLAMA 4 SCOUT</h3>
                                    <p className="font-mono text-[10px] text-ash">AI Project Assistant</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded hover:bg-steel transition-colors"
                            >
                                <X size={16} className="text-ash" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`
                    w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                    ${msg.role === 'assistant' ? 'bg-cobalt/20' : 'bg-steel'}
                  `}>
                                        {msg.role === 'assistant' ? (
                                            <Bot size={14} className="text-cobalt" />
                                        ) : (
                                            <User size={14} className="text-ash" />
                                        )}
                                    </div>
                                    <div className={`
                    max-w-[75%] p-3 rounded-lg
                    ${msg.role === 'assistant'
                                            ? 'bg-graphite border border-steel text-bone'
                                            : 'bg-cobalt text-white'}
                  `}>
                                        <p className="font-mono text-xs leading-relaxed">{msg.content}</p>
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-3"
                                >
                                    <div className="w-7 h-7 rounded-full bg-cobalt/20 flex items-center justify-center">
                                        <Bot size={14} className="text-cobalt" />
                                    </div>
                                    <div className="bg-graphite border border-steel p-3 rounded-lg">
                                        <div className="flex gap-1">
                                            {[0, 1, 2].map((i) => (
                                                <motion.span
                                                    key={i}
                                                    className="w-2 h-2 bg-cobalt rounded-full"
                                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                                    transition={{
                                                        duration: 1,
                                                        repeat: Infinity,
                                                        delay: i * 0.2
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-steel">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask about your project..."
                                    className="flex-1 px-4 py-2 bg-graphite border border-steel
                    rounded font-mono text-xs text-bone
                    placeholder:text-ash/50
                    focus:outline-none focus:border-cobalt
                    transition-colors"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim()}
                                    className="px-4 py-2 bg-cobalt text-white rounded
                    hover:bg-cobalt-dim transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default ChatWidget;
