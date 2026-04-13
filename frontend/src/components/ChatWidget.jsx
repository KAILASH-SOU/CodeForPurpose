import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User as UserIcon } from 'lucide-react';
import API_BASE from '../api.js';

export default function ChatWidget({ userId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Hi! I am the SafeSpend Assistant. How can I help you analyze your finances today?' }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const handleOpenChat = (e) => {
      setIsOpen(true);
      if (e.detail) {
        setInputMsg(e.detail);
      }
    };
    window.addEventListener('open-chat', handleOpenChat);
    return () => window.removeEventListener('open-chat', handleOpenChat);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !userId) return;

    const userMessage = inputMsg.trim();
    setInputMsg('');
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/agent/chat/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          history: messages.filter(m => m.role !== 'system') // send only previous exchanges if needed
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting to my brain right now.' }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Network error occurred. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fade-in"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          background: 'linear-gradient(135deg, var(--accent), var(--pink))',
          color: '#fff',
          border: 'none',
          boxShadow: '0 8px 24px rgba(201, 0, 107, 0.3)',
          display: isOpen ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 1000,
          transition: 'transform 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="fade-in"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '350px',
            height: '500px',
            maxHeight: '80vh',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px',
            background: 'linear-gradient(90deg, var(--accent), #6B2D8B)',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '50%', display: 'flex' }}>
                <Bot size={18} />
              </div>
              <div style={{ fontWeight: 600, fontSize: '15px' }}>SafeSpend AI</div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Message Area */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: 'var(--bg)'
          }}>
            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              return (
                <div key={i} style={{ 
                  display: 'flex', 
                  flexDirection: isUser ? 'row-reverse' : 'row',
                  gap: '8px',
                  alignItems: 'flex-end'
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                    background: isUser ? 'var(--surface)' : 'var(--accent-soft)',
                    color: isUser ? 'var(--text-secondary)' : 'var(--accent)',
                    border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {isUser ? <UserIcon size={14} /> : <Bot size={14} />}
                  </div>
                  <div style={{
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: '14px',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    background: isUser ? 'var(--surface)' : 'var(--pink-soft)',
                    color: isUser ? 'var(--text-primary)' : 'var(--accent-dark)',
                    border: '1px solid',
                    borderColor: isUser ? 'var(--border)' : 'var(--pink-border)',
                    borderBottomRightRadius: isUser ? '4px' : '14px',
                    borderBottomLeftRadius: isUser ? '14px' : '4px'
                  }}>
                    {msg.content}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px', color: 'var(--text-muted)' }}>
                <Bot size={14} />
                <span style={{ fontSize: '12px', fontStyle: 'italic' }}>AI is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form 
            onSubmit={handleSend}
            style={{
              padding: '14px',
              background: 'var(--surface)',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: '8px'
            }}
          >
            <input 
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask about your spending..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '20px',
                border: '1px solid var(--border)',
                outline: 'none',
                background: 'var(--surface-raised)',
                color: 'var(--text-primary)'
              }}
            />
            <button 
              type="submit"
              disabled={loading || !inputMsg.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: inputMsg.trim() ? 'var(--accent)' : 'var(--border-strong)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                cursor: inputMsg.trim() ? 'pointer' : 'default',
                transition: 'background 0.2s'
              }}
            >
              <Send size={16} style={{ marginLeft: '-2px' }} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
