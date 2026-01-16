import React, { useState, useRef, useEffect } from 'react';
import { Role, Message } from '../types';
import { Send, Loader2, User } from 'lucide-react';
import { Live2DModelView } from './Live2DModel';
import { api } from '../services/api';

interface ChatWindowProps {
  role: Role;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ role }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 加载历史记录
  useEffect(() => {
    const loadHistory = async () => {
      setMessages([]);
      try {
        const history = await api.getHistory(role.id);
        setMessages(history);
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    };
    loadHistory();
  }, [role.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const assistantMsgId = 'assistant-' + Date.now();
    let assistantContent = '';

    try {
      await api.sendMessageStream(role.id, input, (chunk) => {
        assistantContent += chunk;
        setMessages(prev => {
          const otherMessages = prev.filter(m => m.id !== assistantMsgId);
          return [...otherMessages, {
            id: assistantMsgId,
            role: 'assistant',
            content: assistantContent,
            timestamp: Date.now(),
          }];
        });
      }, () => {
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Chat error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      <div className="p-4 border-b bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            {role.name[0]}
          </div>
          <div>
            <h2 className="font-bold text-gray-800">{role.name}</h2>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span> Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-24 border rounded-lg overflow-hidden bg-gray-50 shadow-inner">
             <Live2DModelView 
               modelUrl="https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/hiyori/hiyori_pro_t10.model3.json"
               width={96}
               height={96}
             />
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-gray-100 text-gray-800 rounded-tl-none'
            }`}>
              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && !messages.some(m => m.role === 'assistant' && m.id.startsWith('assistant-')) && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none">
              <Loader2 className="animate-spin text-gray-400" size={20} />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Message ${role.name}...`}
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
