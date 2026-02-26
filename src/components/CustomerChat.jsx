import { useState, useEffect, useRef } from 'react';

function CustomerChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'support',
      text: 'Hello! Welcome to PathWise. How can I help you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Pre-defined quick replies and responses
  const quickReplies = [
    'How do I register?',
    'What is PathWise?',
    'How do I contact support?',
    'How does career guidance work?'
  ];

  // Auto-response system
  const getAutoResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('register') || lowerMessage.includes('sign up') || lowerMessage.includes('create account')) {
      return "To register on PathWise:\n\n1. Click 'Create Account' on the login page\n2. Fill in your details (name, email, password)\n3. Complete the registration form\n4. Wait for verification by our team\n5. Once verified, you can take the assessment and get matched with a career mentor!";
    }
    
    if (lowerMessage.includes('what is pathwise') || lowerMessage.includes('about pathwise') || lowerMessage.includes('pathwise')) {
      return "PathWise is a comprehensive career guidance platform that helps students make informed career decisions.\n\n✨ Key Features:\n• Personalized career assessments\n• Expert career mentor matching\n• One-on-one guidance sessions\n• AI-powered recommendations\n\nOur mission is to empower students with the right guidance for their future!";
    }
    
    if (lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('help')) {
      return "You can reach our support team through:\n\n📧 Email: support@pathwise.com\n📞 Phone: +1-800-PATHWISE\n💬 This chat (we'll respond soon!)\n\nOur support hours are Monday-Friday, 9 AM - 6 PM IST.";
    }
    
    if (lowerMessage.includes('career guidance') || lowerMessage.includes('how does') || lowerMessage.includes('process')) {
      return "Here's how the career guidance process works:\n\n1️⃣ Register & Get Verified\n2️⃣ Complete Interest Assessment\n3️⃣ Chat with Career Coordinator\n4️⃣ Get Matched with Specialized Mentor\n5️⃣ Receive Ongoing Guidance\n\nEach step helps us understand you better and provide personalized recommendations!";
    }
    
    if (lowerMessage.includes('login') || lowerMessage.includes('password') || lowerMessage.includes('forgot')) {
      return "Having login issues?\n\n• Make sure you're using the correct email/username\n• Check if Caps Lock is on\n• If you forgot your password, use the registered email\n• Contact support if you're still having trouble\n\nTip: You can login with either your email or username!";
    }
    
    if (lowerMessage.includes('counsellor') || lowerMessage.includes('mentor') || lowerMessage.includes('counselor')) {
      return "Our career mentors are experienced professionals who:\n\n👨‍🏫 Provide personalized guidance\n📊 Help interpret your assessment results\n🎯 Suggest suitable career paths\n💬 Answer all your career questions\n\nYou'll be matched with a mentor based on your interests and goals!";
    }
    
    if (lowerMessage.includes('assessment') || lowerMessage.includes('test') || lowerMessage.includes('quiz')) {
      return "The Interest Assessment is a key part of PathWise:\n\n📝 Takes about 10-15 minutes\n🎯 Covers multiple areas:\n  • Career interests\n  • Technical vs Creative inclination\n  • Leadership style\n  • Problem-solving approach\n\nYour responses help us match you with the right career path and mentor!";
    }
    
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return "You're welcome! 😊 Is there anything else I can help you with? Feel free to ask any questions about PathWise or career guidance!";
    }
    
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
      return "Hello! 👋 Welcome to PathWise support! How can I assist you today?\n\nYou can ask me about:\n• Registration process\n• Career guidance\n• Assessment details\n• Mentor matching\n• Or anything else!";
    }
    
    // Default response
    return "Thank you for your message! Our support team will review it shortly.\n\nIn the meantime, you can try asking about:\n• How to register\n• What PathWise does\n• The career guidance process\n• Assessment details\n\nOr click one of the quick reply options below!";
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      from: 'user',
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay before response
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        from: 'support',
        text: getAutoResponse(inputMessage),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickReply = (reply) => {
    setInputMessage(reply);
    setTimeout(() => {
      const userMessage = {
        id: Date.now(),
        from: 'user',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);

      setTimeout(() => {
        const botResponse = {
          id: Date.now() + 1,
          from: 'support',
          text: getAutoResponse(reply),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
      }, 1000 + Math.random() * 1000);
    }, 100);
    setInputMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button 
        className={`customer-chat-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with us"
      >
        {isOpen ? (
          <span className="chat-close-icon">✕</span>
        ) : (
          <>
            <span className="chat-icon">💬</span>
            <span className="chat-badge">1</span>
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="customer-chat-window">
          {/* Header */}
          <div className="chat-window-header">
            <div className="chat-header-info">
              <div className="chat-avatar">🎯</div>
              <div className="chat-header-text">
                <h4>PathWise Support</h4>
                <span className="online-status">
                  <span className="status-dot"></span>
                  Online
                </span>
              </div>
            </div>
            <button className="chat-minimize" onClick={() => setIsOpen(false)}>−</button>
          </div>

          {/* Messages */}
          <div className="chat-messages-container">
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`chat-message ${msg.from === 'user' ? 'user-message' : 'support-message'}`}
              >
                <div className="message-bubble">
                  <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                  <span className="message-time">{msg.time}</span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="chat-message support-message">
                <div className="message-bubble typing">
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

          {/* Quick Replies */}
          <div className="quick-replies">
            {quickReplies.map((reply, index) => (
              <button 
                key={index} 
                className="quick-reply-btn"
                onClick={() => handleQuickReply(reply)}
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="chat-input-container">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="chat-input"
            />
            <button 
              className="chat-send-btn"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      <style>{`
        .customer-chat-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4318FF 0%, #7B61FF 100%);
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(67, 24, 255, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          transition: all 0.3s ease;
        }

        .customer-chat-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(67, 24, 255, 0.5);
        }

        .customer-chat-btn.active {
          background: #dc3545;
        }

        .chat-icon {
          font-size: 28px;
        }

        .chat-close-icon {
          font-size: 24px;
          color: white;
          font-weight: bold;
        }

        .chat-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #dc3545;
          color: white;
          font-size: 12px;
          font-weight: bold;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        .customer-chat-window {
          position: fixed;
          bottom: 100px;
          right: 24px;
          width: 380px;
          max-width: calc(100vw - 48px);
          height: 520px;
          max-height: calc(100vh - 140px);
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          z-index: 9998;
          overflow: hidden;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chat-window-header {
          background: linear-gradient(135deg, #4318FF 0%, #7B61FF 100%);
          color: white;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .chat-header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chat-avatar {
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }

        .chat-header-text h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .online-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          opacity: 0.9;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #4ade80;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .chat-minimize {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .chat-minimize:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .chat-messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chat-message {
          display: flex;
          max-width: 85%;
        }

        .user-message {
          align-self: flex-end;
        }

        .support-message {
          align-self: flex-start;
        }

        .message-bubble {
          padding: 12px 16px;
          border-radius: 16px;
          position: relative;
        }

        .user-message .message-bubble {
          background: linear-gradient(135deg, #4318FF 0%, #7B61FF 100%);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .support-message .message-bubble {
          background: white;
          color: #1e293b;
          border-bottom-left-radius: 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .message-bubble p {
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
        }

        .message-time {
          font-size: 10px;
          opacity: 0.7;
          display: block;
          margin-top: 4px;
          text-align: right;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 4px 0;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: #94a3b8;
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }

        .quick-replies {
          padding: 8px 16px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          background: white;
          border-top: 1px solid #e2e8f0;
        }

        .quick-reply-btn {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 12px;
          color: #4318FF;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .quick-reply-btn:hover {
          background: #e0e7ff;
          border-color: #4318FF;
        }

        .chat-input-container {
          padding: 12px 16px;
          background: white;
          display: flex;
          gap: 8px;
          border-top: 1px solid #e2e8f0;
        }

        .chat-input {
          flex: 1;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 10px 16px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .chat-input:focus {
          border-color: #4318FF;
        }

        .chat-send-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4318FF 0%, #7B61FF 100%);
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-send-btn:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(67, 24, 255, 0.3);
        }

        .chat-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .customer-chat-window {
            width: calc(100vw - 32px);
            right: 16px;
            bottom: 90px;
            height: 450px;
          }

          .customer-chat-btn {
            bottom: 16px;
            right: 16px;
            width: 56px;
            height: 56px;
          }
        }
      `}</style>
    </>
  );
}

export default CustomerChat;
