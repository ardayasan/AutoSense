"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Car, Sparkles, Loader2, Zap, ArrowRight } from "lucide-react";

interface Message {
    role: "user" | "ai";
    content: string;
}

const SUGGESTED_QUERIES = [
    "Compare BMW 3 Series 2017 vs Audi A4",
    "What is the cheapest Porsche 911?",
    "Show me specs for 2017 Toyota 86",
    "Best MPG cars under $30k"
];

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "ai",
            content: "Hello! I'm AutoSense, your advanced AI car expert. I can help you compare specs, find technical details, and analyze vehicle performance. precise data from over 11,000 cars. How can I assist you today?"
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (queryText: string) => {
        if (!queryText.trim()) return;

        const userMsg = queryText;
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
        setLoading(true);

        try {
            const res = await fetch("http://localhost:8000/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: userMsg }),
            });
            const data = await res.json();

            setMessages((prev) => [...prev, { role: "ai", content: data.response }]);
        } catch (error) {
            setMessages((prev) => [...prev, { role: "ai", content: "Sorry, I encountered an error connecting to the neural core. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestClick = (query: string) => {
        sendMessage(query);
    };

    return (
        <div className="flex flex-col h-[700px] w-full max-w-5xl mx-auto bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative">
            {/* Glow Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50 blur-sm" />

            {/* Header */}
            <div className="bg-white/5 p-6 border-b border-white/5 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20">
                        <Car className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-xl text-white tracking-tight flex items-center gap-2">
                            AutoSense <span className="text-indigo-400 font-normal">Pro</span>
                        </h2>
                        <p className="text-xs font-medium text-slate-400 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            RAG Neural Core Online
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                        <div
                            className={`max-w-[92%] p-5 rounded-2xl text-[15px] leading-relaxed shadow-lg relative ${msg.role === "user"
                                ? "bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-br-sm ml-8"
                                : "bg-slate-900/90 text-slate-200 rounded-bl-sm border border-white/10 mr-8"
                                }`}
                        >
                            {msg.role === "ai" && (
                                <div className="absolute -left-10 top-0 p-2 bg-slate-800 rounded-lg border border-white/10">
                                    <Sparkles className="w-4 h-4 text-indigo-400" />
                                </div>
                            )}
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-slate-900/90 p-4 rounded-2xl rounded-bl-none border border-white/10 flex items-center gap-3 ml-12">
                            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                            <span className="text-sm font-medium text-slate-400">Analyzing vehicle database...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions (Only show when few messages) */}
            {messages.length < 3 && (
                <div className="px-6 pb-2">
                    <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Suggested Queries</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {SUGGESTED_QUERIES.map((q, i) => (
                            <button
                                key={i}
                                onClick={() => handleSuggestClick(q)}
                                className="text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 transition-all group flex items-center justify-between"
                            >
                                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{q}</span>
                                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="p-6 bg-slate-900/80 backdrop-blur-md border-t border-white/5">
                <div className="relative flex items-center gap-3">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Zap className="w-5 h-5 text-slate-500" />
                    </div>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                        placeholder="Ask anything about cars..."
                        className="w-full bg-black/40 border border-white/10 hover:border-indigo-500/50 focus:border-indigo-500 rounded-2xl py-4 pl-12 pr-14 outline-none transition-all text-base placeholder:text-slate-500 text-white shadow-inner"
                    />
                    <button
                        onClick={() => sendMessage(input)}
                        disabled={loading || !input.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                <div className="mt-3 text-center">
                    <p className="text-[10px] text-slate-600">
                        Powered by Local LLM (TinyLlama-1.1B) • Efficient • Private
                    </p>
                </div>
            </div>
        </div>
    );
}
