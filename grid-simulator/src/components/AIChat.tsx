"use client";

import { useChat, Message } from 'ai/react';
import { useSimulationStore } from '../store/useSimulationStore';
import { useEffect, useRef } from 'react';
import { Send, AlertTriangle } from 'lucide-react';

export default function AIChat() {
    const { messages, input, handleInputChange, handleSubmit, append } = useChat();
    const { nodes, events, metrics } = useSimulationStore();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // System context string built from zustand
    const gridStateSummary = JSON.stringify({
        metrics,
        events,
        criticalNodes: Object.values(nodes).filter(n => n.status === 'warning' || n.status === 'offline').map(n => ({ id: n.id, status: n.status, load: Math.round((n.currentLoad / n.capacity) * 100) + '%' }))
    });

    // Watch for critical failures and trigger pro-active AI alert
    useEffect(() => {
        const critical = Object.values(nodes).find(n => n.status === 'offline');
        if (critical) {
            // Only trigger if the last message isn't already about a critical node (lazy debounce)
            const lastMsg = messages[messages.length - 1];
            if (!lastMsg || lastMsg.role !== 'assistant' || !lastMsg.content.includes(critical.id)) {
                append({
                    role: 'user',
                    content: `SYSTEM ALERT: Node ${critical.name} (${critical.id}) went off-line. Cascade failure possible. Please alert the user and suggest interventions (add solar, add battery, shed load). Current state: ${gridStateSummary}`
                });
            }
        }
    }, [nodes, append, messages, gridStateSummary]);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSubmit(e, {
            data: { gridStateSummary } // Pass context to the API route via data payload
        });
    };

    return (
        <div className="w-96 h-full bg-[#0A192F]/80 backdrop-blur-md border border-[#112240] rounded-2xl p-6 flex flex-col shadow-lg z-10 relative">
            <div className="flex items-center gap-3 mb-6 border-b border-[#112240] pb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-[#64FFDA] animate-pulse shadow-[0_0_8px_#64FFDA]" />
                <h2 className="text-xl font-bold text-white">Grid Operator AI</h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                {messages.filter((m: Message) => !m.content.startsWith('SYSTEM ALERT:')).map((m: Message) => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-xl p-3 text-sm leading-relaxed ${m.role === 'user'
                                ? 'bg-[#112240] text-[#64FFDA] border border-[#233554]'
                                : 'bg-transparent text-[#8892B0] border border-[#112240]'
                            }`}>
                            {m.role === 'assistant' && m.content.includes('CRITICAL') && (
                                <AlertTriangle size={14} className="text-red-400 mb-1 inline mr-1" />
                            )}
                            {m.content}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={onSubmit} className="relative mt-auto">
                <input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask Operator..."
                    className="w-full bg-[#0A192F] border border-[#233554] rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-[#64FFDA] text-white placeholder-[#8892B0] shadow-inner transition-colors"
                />
                <button
                    type="submit"
                    disabled={!input.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64FFDA] hover:text-white disabled:opacity-30 disabled:hover:text-[#64FFDA] transition-colors"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
}
