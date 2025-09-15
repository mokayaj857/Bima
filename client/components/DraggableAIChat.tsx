'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'BIMA' | 'ai';
  timestamp: Date;
}

const DraggableAIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant for water monitoring. How can I help you today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 20, y: 0 });
  const [buttonPosition, setButtonPosition] = useState<{ x: number; y: number }>({ x: 20, y: 20 });

  useEffect(() => {
    setPosition({ x: window.innerWidth - 384 - 20, y: window.innerHeight - 550 - 20 });
    setButtonPosition({ x: window.innerWidth - 64 - 20, y: window.innerHeight - 64 - 20 });
  }, []);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('ai-chat-history');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    }
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem('ai-chat-history', JSON.stringify(messages));
  }, [messages]);
  const [isDragging, setIsDragging] = useState(false);
  const [isButtonDragging, setIsButtonDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [buttonDragStart, setButtonDragStart] = useState({ x: 0, y: 0 });
  const chatRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 384 - 20),
        y: Math.min(prev.y, window.innerHeight - 550 - 20),
      }));
      setButtonPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 64 - 20),
        y: Math.min(prev.y, window.innerHeight - 64 - 20),
      }));
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;

        const clampedX = Math.max(0, Math.min(newX, window.innerWidth - 384 - 20));
        const clampedY = Math.max(0, Math.min(newY, window.innerHeight - 480));

        setPosition({ x: clampedX, y: clampedY });
      }

      if (isButtonDragging) {
        const newX = e.clientX - buttonDragStart.x;
        const newY = e.clientY - buttonDragStart.y;

        const clampedX = Math.max(0, Math.min(newX, window.innerWidth - 64 - 20));
        const clampedY = Math.max(0, Math.min(newY, window.innerHeight - 64 - 20));

        setButtonPosition({ x: clampedX, y: clampedY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsButtonDragging(false);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, isButtonDragging, buttonDragStart]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleButtonMouseDown = (e: React.MouseEvent) => {
    setIsButtonDragging(true);
    setButtonDragStart({
      x: e.clientX - buttonPosition.x,
      y: e.clientY - buttonPosition.y,
    });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Call real AI chat API
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.text }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError('Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>


      {/* Floating Button */}
      <button
        ref={buttonRef}
        onClick={() => {
          if (!isOpen) {
            // Position popup to be centered above the button when opening
            setPosition({
              x: Math.max(0, buttonPosition.x + 32 - 192), // Center above button (button half 32, popup half 192)
              y: Math.max(0, buttonPosition.y - 570), // Above with margin
            });
          }
          setIsOpen(!isOpen);
        }}
        onMouseDown={handleButtonMouseDown}
        className="fixed z-50 w-16 h-16 bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 cursor-pointer hover:bg-orange-600 hover:shadow-xl"
        style={{
          left: buttonPosition.x,
          top: buttonPosition.y,
        }}
        aria-label="Open AI Assistant Chat"
      >
        <Bot size={24} />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.1)', // reduced opacity for less blanking
            backdropFilter: 'blur(2px)', // subtle blur
          }}
        />
      )}

      {/* Chat Popup */}
      {isOpen && (
        <div
          ref={chatRef}
          onClick={(e) => e.stopPropagation()}
        className="fixed z-50 w-96 h-[550px] border border-orange-400 rounded-3xl shadow-2xl overflow-hidden chat-popup transform transition-all duration-300 bg-white"
        style={{
          left: position.x,
          top: position.y,
          cursor: isDragging ? 'grabbing' : 'default',
          boxShadow: '0 30px 60px -15px rgba(243, 121, 51, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 40px rgba(243, 121, 51, 0.3)',
        }}
      >
        {/* Header */}
        <div
          className="bg-orange-500 text-white p-4 flex items-center justify-between cursor-grab active:cursor-grabbing rounded-t-3xl"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-3">
            <Bot size={20} />
            <span className="font-bold text-lg">AI Assistant</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-orange-600 transition-colors flex items-center justify-center"
            aria-label="Close chat"
          >
            <X size={16} />
          </button>
        </div>

          {/* Messages */}
          <div className="flex-1 p-5 overflow-y-auto h-[400px] bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex items-start gap-3 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'ai' && (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] p-3 rounded-2xl shadow-md ${
                    message.sender === 'user'
                      ? 'bg-orange-500 text-white ml-auto'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-sm leading-relaxed font-medium">{message.text}</p>
                  <span className={`text-xs mt-3 block font-semibold ${
                    message.sender === 'user' ? 'text-orange-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {message.sender === 'user' && (
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-xl ring-2 ring-green-200">
                    <User size={18} className="text-white" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-white border border-gray-200 p-3 rounded-2xl shadow-lg max-w-[75%]">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm text-gray-700 font-medium">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <X size={16} className="text-white" />
                </div>
                <div className="bg-red-50 border border-red-300 p-3 rounded-2xl max-w-[75%]">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white flex items-center gap-3 rounded-b-3xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask me anything about water monitoring..."
            className="flex-1 px-5 py-3 border border-orange-300 rounded-3xl focus:outline-none focus:ring-4 focus:ring-orange-500 focus:border-orange-500 transition-all duration-500 placeholder-gray-500 text-gray-900 bg-white shadow-sm"
            disabled={isLoading}
            aria-label="Type your message"
          />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-orange-500 text-white rounded-3xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

<style jsx>{`
  .chat-popup {
    animation: slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes slideInUp {
    from {
      transform: translateY(30px) scale(0.95);
      opacity: 0;
    }
    to {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }

  .chat-popup:hover {
    transform: translateY(-2px);
  }

  /* Custom scrollbar */
  .chat-popup ::-webkit-scrollbar {
    width: 6px;
  }

  .chat-popup ::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }

  .chat-popup ::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #F37933, #e66a2a);
    border-radius: 3px;
  }

  .chat-popup ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #e66a2a, #d4601f);
  }
`}</style>

export default DraggableAIChat;
