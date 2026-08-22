import React, { useState } from 'react';
import { Send, CheckCircle, Phone, MessageSquare } from 'lucide-react';
import { sanitizePayload, isSpamBot, isRateLimited } from '../utils/sanitize';

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    message: '',
    hp_trap: '' // Hidden honeypot field
  });
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'

  // GOOGLE APPS SCRIPT WEB APP URL
  const GOOGLE_SCRIPT_URL = 
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_APPS_SCRIPT_URL) ||
    "https://script.google.com/macros/s/AKfycbxUPhQTk-s9O6Qx0ad9iJxOC23l9lE86czYz_Uaoa0Bcli1x8-COBdZzkMV4mwkz5Kp/exec";

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Anti-Spam Honeypot Verification
    if (isSpamBot(formData.hp_trap)) {
      setStatus('success');
      return;
    }

    // 2. Client-Side Rate Limiting (3-Second Cooldown)
    if (isRateLimited('ContactForm', 3000)) {
      return;
    }

    setStatus('loading');

    // 3. Input Sanitization
    const sanitizedPayload = sanitizePayload({
      formType: "contact",
      name: formData.name,
      mobile: formData.mobile,
      email: formData.email,
      message: formData.message
    });

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // Bypasses CORS restrictions for Google Apps Script endpoints
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sanitizedPayload),
      });

      setStatus('success');
      setFormData({ name: '', mobile: '', email: '', message: '', hp_trap: '' });
    } catch (err) {
      console.error("Form Submission Error:", err);
      setStatus('error');
    }
  };

  return (
    <section className="connect-section py-12 px-4 sm:px-6 lg:px-8 section-clean-parchment" id="contact">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="connect-header text-center mb-10 space-y-2">
          <span className="text-xs uppercase tracking-widest font-serif font-bold text-[#8C3A27] block">
            GET IN TOUCH WITH US
          </span>
          <h2 className="font-serif-header text-3xl sm:text-4xl font-extrabold text-[#140C08]">
            CONNECT WITH US
          </h2>
          <p className="text-xs sm:text-sm text-[#2A1E18] font-sans font-medium max-w-xl mx-auto">
            Reach out to us for course inquiries, admissions, or mentorship guidance.
          </p>
        </div>

        {/* Connect Grid */}
        <div className="connect-grid grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-7 card-parchment-3d p-6 sm:p-8 space-y-6">
            <form onSubmit={handleSubmit} className="contact-form space-y-5">
              
              {/* Honeypot Trap Field */}
              <div className="hidden opacity-0 pointer-events-none absolute -left-[9999px]" aria-hidden="true">
                <label htmlFor="contact_hp_trap">Do not fill this field</label>
                <input 
                  type="text" 
                  id="contact_hp_trap" 
                  name="contact_hp_trap" 
                  tabIndex="-1" 
                  autoComplete="off"
                  value={formData.hp_trap}
                  onChange={(e) => setFormData({ ...formData, hp_trap: e.target.value })}
                />
              </div>

              <div className="form-group space-y-1">
                <label htmlFor="name" className="block text-xs font-serif font-bold uppercase tracking-wider text-[#8C3A27]">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Enter your full name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="manuscript-input w-full"
                />
              </div>

              <div className="form-group space-y-1">
                <label htmlFor="mobile" className="block text-xs font-serif font-bold uppercase tracking-wider text-[#8C3A27]">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  id="mobile"
                  placeholder="+91 XXXXX XXXXX"
                  pattern="[0-9+ ]{10,14}"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="manuscript-input w-full"
                />
              </div>

              <div className="form-group space-y-1">
                <label htmlFor="email" className="block text-xs font-serif font-bold uppercase tracking-wider text-[#8C3A27]">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email address"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="manuscript-input w-full"
                />
              </div>

              <div className="form-group space-y-1">
                <label htmlFor="message" className="block text-xs font-serif font-bold uppercase tracking-wider text-[#8C3A27]">
                  Message *
                </label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Write your message..."
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="manuscript-input w-full resize-none"
                ></textarea>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  className="submit-btn btn-terracotta-pill text-xs py-3 px-8 disabled:opacity-50 cursor-pointer"
                  disabled={status === 'loading'}
                >
                  <span className="btn-label">
                    {status === 'loading' ? 'SENDING...' : 'SEND MESSAGE →'}
                  </span>
                  {status !== 'loading' && <Send className="w-4 h-4 ml-1" />}
                </button>
              </div>

              {status === 'success' && (
                <div className="p-4 border-2 border-emerald-600 bg-emerald-50/80 rounded-xl space-y-1 text-left animate-fade-in mt-4">
                  <p className="status-msg success text-emerald-800 font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>✓ Thank you! Your response has been recorded.</span>
                  </p>
                  <p className="text-[11px] text-emerald-700 font-sans font-medium pl-6">
                    Our academic counseling desk has logged your inquiry into our system and will contact you shortly.
                  </p>
                </div>
              )}

              {status === 'error' && (
                <div className="p-4 border-2 border-red-600 bg-red-50/80 rounded-xl space-y-1 text-left animate-fade-in mt-4">
                  <p className="status-msg error text-red-800 font-bold text-xs">
                    ⚠️ Something went wrong. Please try again.
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Right Column: Map & Socials */}
          <div className="contact-info-col lg:col-span-5 space-y-6">
            
            {/* Map Container */}
            <div className="w-full h-full min-h-[280px] md:min-h-[340px] rounded-2xl overflow-hidden shadow-sm border border-[#EAE0D5] bg-[#F4EDE2]">
              <iframe
                src="https://maps.google.com/maps?q=8-97,+Road+No+4,+Vikas+Nagar,+Moosa+Ram+Bagh,+Dilshuknagar,+Hyderabad,+Telangana+500060&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '320px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="e-Gurukulam Hyderabad Location Map"
              />
            </div>

            {/* Social Links & Direct Contact Block */}
            <div className="social-links-block card-parchment-3d p-6 space-y-4 text-left">
              <h3 className="font-serif-header text-xl font-bold text-[#140C08] border-b border-[#C5A059]/40 pb-2">
                Social Media &amp; Direct Contact
              </h3>
              
              <p className="address-text text-xs sm:text-sm text-[#2A1E18] font-sans font-semibold leading-relaxed flex items-start gap-2">
                <span className="text-base shrink-0">📍</span>
                <span>8-97, Road No 4, Vikas Nagar, Moosa Ram Bagh, Dilsukhnagar, Hyderabad, Telangana 500060</span>
              </p>
              
              {/* 6 Hyperlinked Icon Buttons */}
              <div className="social-icons flex flex-wrap items-center gap-3 pt-2">
                
                {/* 1. Facebook */}
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Facebook" 
                  className="social-icon w-10 h-10 rounded-full bg-[#FFFDF8] border border-[#C5A059] flex items-center justify-center text-[#8C3A27] font-bold text-sm shadow-xs hover:bg-[#8C3A27] hover:text-white hover:border-[#8C3A27] transition-all duration-300"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* 2. LinkedIn */}
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="LinkedIn" 
                  className="social-icon w-10 h-10 rounded-full bg-[#FFFDF8] border border-[#C5A059] flex items-center justify-center text-[#8C3A27] font-bold text-sm shadow-xs hover:bg-[#8C3A27] hover:text-white hover:border-[#8C3A27] transition-all duration-300"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                </a>

                {/* 3. WhatsApp */}
                <a 
                  href="https://wa.me/919876543210" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="WhatsApp" 
                  className="social-icon w-10 h-10 rounded-full bg-[#FFFDF8] border border-[#C5A059] flex items-center justify-center text-[#8C3A27] font-bold text-sm shadow-xs hover:bg-[#8C3A27] hover:text-white hover:border-[#8C3A27] transition-all duration-300"
                >
                  <MessageSquare className="w-5 h-5" />
                </a>

                {/* 4. Instagram */}
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Instagram" 
                  className="social-icon w-10 h-10 rounded-full bg-[#FFFDF8] border border-[#C5A059] flex items-center justify-center text-[#8C3A27] font-bold text-sm shadow-xs hover:bg-[#8C3A27] hover:text-white hover:border-[#8C3A27] transition-all duration-300"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>

                {/* 5. YouTube */}
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="YouTube" 
                  className="social-icon w-10 h-10 rounded-full bg-[#FFFDF8] border border-[#C5A059] flex items-center justify-center text-[#8C3A27] font-bold text-sm shadow-xs hover:bg-[#8C3A27] hover:text-white hover:border-[#8C3A27] transition-all duration-300"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                {/* 6. Phone / Call */}
                <a 
                  href="tel:+919876543210" 
                  aria-label="Phone Call" 
                  className="social-icon w-10 h-10 rounded-full bg-[#FFFDF8] border border-[#C5A059] flex items-center justify-center text-[#8C3A27] font-bold text-sm shadow-xs hover:bg-[#8C3A27] hover:text-white hover:border-[#8C3A27] transition-all duration-300"
                >
                  <Phone className="w-5 h-5" />
                </a>

              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default ContactSection;
