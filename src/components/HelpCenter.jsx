import { useState } from 'react';

function HelpCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('faq');

  const faqs = [
    {
      question: "How do I get started?",
      answer: "Register as a student, wait for verification by our verification team, then complete the interest assessment to get matched with a career mentor."
    },
    {
      question: "How long does verification take?",
      answer: "Verification typically takes 24-48 hours. Our verification team reviews your registration details to ensure genuine students receive career guidance."
    },
    {
      question: "What is the interest assessment?",
      answer: "It's a 15-question assessment that helps us understand your career interests, personality traits, and preferred work style to match you with the right mentor."
    },
    {
      question: "How do I contact my mentor?",
      answer: "After being assigned a mentor, you can chat with them directly through your dashboard. You can also schedule meetings if the feature is available."
    },
    {
      question: "Can I change my assigned mentor?",
      answer: "If you feel you need a different mentor, please contact our career coordinator through chat to request a reassignment."
    },
    {
      question: "Is my information secure?",
      answer: "Yes, all your data is stored securely. We verify student identities to maintain platform integrity and provide genuine career guidance."
    }
  ];

  const contactInfo = {
    email: "support@pathwise.com",
    phone: "+91 1800-123-4567",
    hours: "Mon-Fri: 9:00 AM - 6:00 PM IST"
  };

  return (
    <>
      {/* Floating Help Button */}
      <button 
        className="help-center-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Help Center"
      >
        {isOpen ? '✕' : '?'}
      </button>

      {/* Help Center Panel */}
      {isOpen && (
        <div className="help-center-panel">
          <div className="help-center-header">
            <h3>Help Center</h3>
            <p>How can we help you today?</p>
          </div>

          {/* Navigation Tabs */}
          <div className="help-center-tabs">
            <button 
              className={activeSection === 'faq' ? 'active' : ''}
              onClick={() => setActiveSection('faq')}
            >
              📋 FAQ
            </button>
            <button 
              className={activeSection === 'contact' ? 'active' : ''}
              onClick={() => setActiveSection('contact')}
            >
              📞 Contact
            </button>
            <button 
              className={activeSection === 'guide' ? 'active' : ''}
              onClick={() => setActiveSection('guide')}
            >
              📖 Guide
            </button>
          </div>

          {/* Content Section */}
          <div className="help-center-content">
            {/* FAQ Section */}
            {activeSection === 'faq' && (
              <div className="help-faq-section">
                {faqs.map((faq, index) => (
                  <details key={index} className="faq-item">
                    <summary>{faq.question}</summary>
                    <p>{faq.answer}</p>
                  </details>
                ))}
              </div>
            )}

            {/* Contact Section */}
            {activeSection === 'contact' && (
              <div className="help-contact-section">
                <div className="contact-card">
                  <div className="contact-item">
                    <span className="contact-icon">📧</span>
                    <div>
                      <strong>Email</strong>
                      <p>{contactInfo.email}</p>
                    </div>
                  </div>
                  <div className="contact-item">
                    <span className="contact-icon">📞</span>
                    <div>
                      <strong>Phone</strong>
                      <p>{contactInfo.phone}</p>
                    </div>
                  </div>
                  <div className="contact-item">
                    <span className="contact-icon">🕐</span>
                    <div>
                      <strong>Working Hours</strong>
                      <p>{contactInfo.hours}</p>
                    </div>
                  </div>
                </div>
                <div className="contact-form">
                  <h4>Send us a message</h4>
                  <input type="text" placeholder="Your Name" />
                  <input type="email" placeholder="Your Email" />
                  <textarea placeholder="How can we help?" rows="3"></textarea>
                  <button className="send-message-btn">Send Message</button>
                </div>
              </div>
            )}

            {/* Guide Section */}
            {activeSection === 'guide' && (
              <div className="help-guide-section">
                <h4>Getting Started Guide</h4>
                
                <div className="guide-step">
                  <span className="step-number">1</span>
                  <div>
                    <strong>Register</strong>
                    <p>Create your account with your student details and ID proof information.</p>
                  </div>
                </div>

                <div className="guide-step">
                  <span className="step-number">2</span>
                  <div>
                    <strong>Verification</strong>
                    <p>Wait for our verification team to verify your student credentials (24-48 hours).</p>
                  </div>
                </div>

                <div className="guide-step">
                  <span className="step-number">3</span>
                  <div>
                    <strong>Assessment</strong>
                    <p>Complete the interest assessment to help us understand your career preferences.</p>
                  </div>
                </div>

                <div className="guide-step">
                  <span className="step-number">4</span>
                  <div>
                    <strong>Chat</strong>
                    <p>Chat with our career coordinator about your career goals and aspirations.</p>
                  </div>
                </div>

                <div className="guide-step">
                  <span className="step-number">5</span>
                  <div>
                    <strong>Guidance</strong>
                    <p>Get matched with a specialized career mentor and receive personalized career guidance.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="help-center-footer">
            <p>PathWise - Your Career Guidance Partner</p>
          </div>
        </div>
      )}
    </>
  );
}

export default HelpCenter;
