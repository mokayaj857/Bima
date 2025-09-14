'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle, Loader2 } from 'lucide-react';

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
    setPosition({ x: 20, y: window.innerHeight - 450 });
  }, []);
  const [isDragging, setIsDragging] = useState(false);
  const [isButtonDragging, setIsButtonDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [buttonDragStart, setButtonDragStart] = useState({ x: 0, y: 0 });
  const chatRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 320),
        y: Math.min(prev.y, window.innerHeight - 450),
      }));
      setButtonPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 56),
        y: Math.min(prev.y, window.innerHeight - 56),
      }));
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;

        const clampedX = Math.max(0, Math.min(newX, window.innerWidth - 320));
        const clampedY = Math.max(0, Math.min(newY, window.innerHeight - 450));

        setPosition({ x: clampedX, y: clampedY });
      }

      if (isButtonDragging) {
        const newX = e.clientX - buttonDragStart.x;
        const newY = e.clientY - buttonDragStart.y;

        const clampedX = Math.max(0, Math.min(newX, window.innerWidth - 56));
        const clampedY = Math.max(0, Math.min(newY, window.innerHeight - 56));

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
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1000));

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `I understand you said: "${userMessage.text}". As your water monitoring AI assistant, I'm here to help with sensor data, flow analysis, and anomaly detection. What specific information do you need?`,
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
            // Position popup to the left of the button when opening
            setPosition({
              x: Math.max(0, buttonPosition.x - 320 - 10),
              y: Math.max(0, buttonPosition.y - 450 + 56),
            });
          }
          setIsOpen(!isOpen);
        }}
        onMouseDown={handleButtonMouseDown}
        className="fixed z-50 w-14 h-14 text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-300 cursor-grab active:cursor-grabbing hover:scale-110 animate-pulse"
        style={{
          left: buttonPosition.x,
          top: buttonPosition.y,
          backgroundColor: '#F37933',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e66a2a'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F37933'}
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div
          ref={chatRef}
          className="fixed z-50 w-80 h-[450px] bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden chat-popup"
          style={{
            left: position.x,
            top: position.y,
            cursor: isDragging ? 'grabbing' : 'default',
          }}
        >
          {/* Header */}
          <div
            className="text-white p-3 flex flex-col cursor-grab active:cursor-grabbing rounded-t-lg shadow-md"
            onMouseDown={handleMouseDown}
            style={{ backgroundColor: '#F37933' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle size={20} />
                <span className="font-semibold">AI Assistant</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-1 hover:bg-[#e66a2a] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div
              className="h-1 w-full mt-2 rounded"
              style={{ backgroundColor: '#F3C80F' }}
            ></div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto h-[320px] bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-3 p-2 rounded-lg max-w-[80%] ${
                  message.sender === 'user'
                    ? 'ml-auto text-white'
                    : 'bg-white text-gray-800 border'
                }`}
                style={{
                  backgroundColor: message.sender === 'user' ? '#F37933' : 'white',
                  boxShadow: message.sender === 'user' ? '0 2px 8px rgba(243, 121, 51, 0.5)' : 'none',
                }}
              >
                <p className="text-sm">{message.text}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 p-2 bg-white border rounded-lg max-w-[80%]">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            )}

            {error && (
              <div className="p-2 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F37933]"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-3 py-2 text-white rounded-lg hover:bg-[#e66a2a] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#F37933' }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

<style jsx>{`
  .chat-popup {
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`}</style>

export default DraggableAIChat;
