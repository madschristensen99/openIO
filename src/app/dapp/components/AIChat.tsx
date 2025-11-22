'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your openIO assistant. I can help you with sealed logic, iO concepts, and debugging your contracts. What would you like to know?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateResponse(input)
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const generateResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('seal') || lowerInput.includes('obfuscat')) {
      return 'Sealed logic in openIO uses indistinguishability obfuscation to hide your contract\'s implementation while preserving functionality. The compiler transforms your code into an obfuscated form that can be executed but not reverse-engineered.';
    }
    
    if (lowerInput.includes('compile') || lowerInput.includes('build')) {
      return 'To compile your contract, click the "Compile" button in the toolbar. The openIO compiler will seal your logic using iO, making it invisible while maintaining full functionality.';
    }
    
    if (lowerInput.includes('deploy')) {
      return 'After compilation, use the "Deploy" button to deploy your sealed contract to the openIO network. Once deployed, your contract\'s logic remains hidden from all observers.';
    }
    
    if (lowerInput.includes('error') || lowerInput.includes('bug')) {
      return 'If you\'re encountering errors, check the terminal output for compilation messages. Common issues include syntax errors or missing function definitions. Make sure your contract follows the openIO syntax.';
    }
    
    return 'I can help you understand openIO concepts, debug your contracts, or explain how sealed logic works. Try asking about sealing, compilation, or deployment.';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="ai-chat">
      <div className="chat-header">
        <h3>AI Assistant</h3>
      </div>
      
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`chat-message ${message.role}`}>
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="chat-message assistant typing">
            <div className="message-content">
              <span className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input-container">
        <textarea
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about openIO, sealed logic, or get help..."
          rows={2}
        />
        <button 
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
        >
          Send
        </button>
      </div>
    </div>
  );
}

