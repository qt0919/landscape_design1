
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { sendMessageToChat } from '../services/geminiService';
import { ChatIcon, CloseIcon, SendIcon } from './icons';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hi! I'm Bloom, your gardening assistant. Ask me anything!" },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (userInput.trim() === '' || isLoading) return;
    
    const newMessages: ChatMessage[] = [...messages, { role: 'user', text: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await sendMessageToChat(userInput);
      setMessages([...newMessages, { role: 'model', text: response }]);
    } catch (error) {
      const err = error as Error;
      setMessages([...newMessages, { role: 'model', text: err.message || 'Something went wrong.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-green-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-green-700 transition-transform transform hover:scale-110 z-50"
        aria-label="Toggle chat"
      >
        {isOpen ? <CloseIcon className="w-8 h-8"/> : <ChatIcon className="w-8 h-8"/>}
      </button>
      
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-full max-w-sm h-[60vh] bg-white rounded-2xl shadow-2xl flex flex-col z-40 border border-gray-200">
          <header className="bg-green-600 text-white p-4 rounded-t-2xl">
            <h3 className="font-bold text-lg text-center">Chat with Bloom</h3>
          </header>
          
          <div className="flex-1 p-4 overflow-y-auto bg-green-50/50">
            {messages.map((msg, index) => (
              <div key={index} className={`flex my-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
             {isLoading && (
              <div className="flex justify-start my-2">
                <div className="max-w-xs px-4 py-2 rounded-2xl bg-gray-200 text-gray-800 rounded-bl-none">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse mx-1"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse mx-1 delay-150"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse mx-1 delay-300"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex items-center">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about gardening..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className="ml-3 p-3 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:bg-green-300"
                aria-label="Send message"
              >
                <SendIcon className="w-5 h-5"/>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
