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
        <div className="w-80 bg-gray-900/90 backdrop-blur-md border-l border-gray-800 p-4 shrink-0 flex flex-col z-10 relative h-full">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <h2 className="text-lg font-bold text-gray-200">AI Grid Operator</h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                {messages.filter((m: Message) => !m.content.startsWith('SYSTEM ALERT:')).map((m: Message) => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-lg p-3 text-sm ${m.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 border border-gray-700 text-gray-300'
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
                    className="w-full bg-black/50 border border-gray-700 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:border-blue-500 text-gray-200"
                />
                <button
                    type="submit"
                    disabled={!input.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-400 disabled:opacity-50"
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
}
