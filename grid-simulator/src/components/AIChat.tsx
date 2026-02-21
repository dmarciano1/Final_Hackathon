"use client";

import { useState, useEffect, useRef } from "react";
import { useChat, Message } from "ai/react";
import { useSimulationStore } from "../store/useSimulationStore";
import { Send, AlertTriangle, MessageSquare, X } from "lucide-react";

export default function AIChat() {
    const { messages, input, handleInputChange, handleSubmit, append } = useChat();
    const { nodes, metrics, activeFilters } = useSimulationStore();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const gridStateSummary = JSON.stringify({
        metrics,
        activeFilters: activeFilters.map(f => f.label),
        criticalNodes: Object.values(nodes)
            .filter((n) => n.status === "warning" || n.status === "offline")
            .map((n) => ({
                id: n.id,
                status: n.status,
                load: Math.round((n.currentLoad / n.capacity) * 100) + "%",
            })),
    });

    useEffect(() => {
        const critical = Object.values(nodes).find((n) => n.status === "offline");
        if (critical) {
            const lastMsg = messages[messages.length - 1];
            if (!lastMsg || lastMsg.role !== "assistant" || !lastMsg.content.includes(critical.id)) {
                append({
                    role: "user",
                    content: `SYSTEM ALERT: Node ${critical.name} (${critical.id}) went off-line. Cascade failure possible. Please alert the user and suggest interventions (add solar, add battery, shed load). Current state: ${gridStateSummary}`,
                });
            }
        }
    }, [nodes, append, messages, gridStateSummary]);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSubmit(e, {
            data: { gridStateSummary },
        });
    };

    const unreadCount = messages.filter(
        (m: Message) => m.role === "assistant" && !m.content.startsWith("SYSTEM ALERT:")
    ).length;

    if (!expanded) {
        return (
            <button
                onClick={() => setExpanded(true)}
                className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-2.5 text-sm font-semibold text-gray-200 hover:bg-black/60 transition-all shadow-lg"
            >
                <MessageSquare size={14} className="text-blue-400" />
                AI Operator
                {unreadCount > 0 && (
                    <span className="bg-blue-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>
        );
    }

    return (
        <div className="w-80 h-[420px] bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setExpanded(false)}
                className="w-full flex items-center justify-between px-5 py-3 border-b border-white/10 hover:bg-white/5 transition-colors flex-shrink-0"
            >
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_6px_rgba(59,130,246,0.6)]" />
                    <span className="text-sm font-bold text-white">Grid Operator AI</span>
                </div>
                <X size={14} className="text-gray-400" />
            </button>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar">
                {messages
                    .filter((m: Message) => !m.content.startsWith("SYSTEM ALERT:"))
                    .map((m: Message) => (
                        <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${m.role === "user"
                                    ? "bg-blue-500/20 text-blue-100 border border-blue-500/30"
                                    : "bg-black/40 text-gray-200 border border-white/10 shadow-inner"
                                    }`}
                            >
                                {m.role === "assistant" && m.content.includes("CRITICAL") && (
                                    <AlertTriangle size={12} className="text-red-400 mb-1 inline mr-1" />
                                )}
                                {m.content}
                            </div>
                        </div>
                    ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={onSubmit} className="relative px-4 py-3 border-t border-white/10 flex-shrink-0">
                <input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask Operator..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-3 pr-10 text-xs focus:outline-none focus:border-[#64FFDA]/50 text-white placeholder-gray-500 transition-colors"
                />
                <button
                    type="submit"
                    disabled={!input.trim()}
                    className="absolute right-7 top-1/2 -translate-y-1/2 text-[#64FFDA] hover:text-white disabled:opacity-30 transition-colors"
                >
                    <Send size={14} />
                </button>
            </form>
        </div>
    );
}
