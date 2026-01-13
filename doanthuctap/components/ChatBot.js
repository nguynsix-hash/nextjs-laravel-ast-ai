"use client";
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import httpAxios from '@/services/httpAxios';

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: 'Xin chào! 👋 Tôi là trợ lý AI của cửa hàng.\n\nTôi có thể giúp bạn về:\n• Thông tin sản phẩm\n• Đơn hàng & Giao hàng\n• Chính sách đổi trả\n• Phương thức thanh toán\n\nHãy nhắn tin để bắt đầu!',
            time: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            text: input.trim(),
            time: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        const userInput = input.trim();
        setInput('');
        setIsTyping(true);

        try {
            // Call Gemini API through backend
            const response = await httpAxios.post('/chat', {
                message: userInput
            });

            const botResponse = {
                id: Date.now() + 1,
                type: 'bot',
                text: response.message || 'Xin lỗi, tôi không thể xử lý yêu cầu này.',
                time: new Date()
            };
            setMessages(prev => [...prev, botResponse]);

        } catch (error) {
            console.error('Chat error:', error);
            const errorResponse = {
                id: Date.now() + 1,
                type: 'bot',
                text: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ hotline để được hỗ trợ. 📞',
                time: new Date()
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Quick suggestions
    const suggestions = [
        'Giao hàng mất bao lâu?',
        'Chính sách đổi trả',
        'Phương thức thanh toán',
    ];

    const handleSuggestion = (text) => {
        setInput(text);
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 ${isOpen
                        ? 'bg-red-500 hover:bg-red-600 rotate-0'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                    }`}
            >
                {isOpen ? (
                    <X size={24} className="text-white" />
                ) : (
                    <div className="relative">
                        <MessageCircle size={24} className="text-white" />
                        <Sparkles size={12} className="text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                    </div>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex items-center gap-3">
                        <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center relative">
                            <Bot size={24} />
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-indigo-600"></span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold flex items-center gap-2">
                                Trợ lý AI
                                <Sparkles size={14} className="text-yellow-300" />
                            </h3>
                            <p className="text-xs text-indigo-100">Powered by Gemini</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 hover:bg-white/20 rounded-full transition"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex items-end gap-2 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                                    {/* Avatar */}
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.type === 'bot'
                                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                                            : 'bg-gray-300 text-gray-600'
                                        }`}>
                                        {msg.type === 'bot' ? <Bot size={14} /> : <User size={14} />}
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={`px-4 py-3 rounded-2xl ${msg.type === 'user'
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-md'
                                            : 'bg-white text-gray-800 shadow-md border rounded-bl-md'
                                        }`}>
                                        <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
                                        <p className={`text-[10px] mt-1.5 ${msg.type === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                                            {msg.time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center">
                                    <Bot size={14} />
                                </div>
                                <div className="bg-white px-4 py-3 rounded-2xl shadow-md border">
                                    <div className="flex gap-1.5">
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400 ml-1">AI đang suy nghĩ...</span>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestions */}
                    {messages.length <= 2 && (
                        <div className="px-4 py-2 bg-gray-50 border-t flex gap-2 overflow-x-auto">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSuggestion(s)}
                                    className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-600 text-xs font-medium rounded-full hover:bg-indigo-50 whitespace-nowrap transition"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 bg-white border-t">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Nhập câu hỏi..."
                                disabled={isTyping}
                                className="flex-1 px-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:opacity-50"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                                className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
                            >
                                {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
