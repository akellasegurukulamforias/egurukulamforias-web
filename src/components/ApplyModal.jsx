import React, { useState } from 'react';
import { Send, CheckCircle, X } from 'lucide-react';
import { sanitizePayload, isSpamBot, isRateLimited } from '../utils/sanitize';

export function ApplyModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    program: 'Mentorship programs',
    prepStage: 'Beginner (Starting Fresh)',
    education: 'Graduation Complete (B.Tech / B.A / B.Sc / B.Com)',
    statement: '',
    hp_trap: '' // Hidden honeypot trap field
  });
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'

  // GOOGLE APPS SCRIPT WEB APP URL (Using VITE env var with fallback)
  const GOOGLE_SCRIPT_URL = 
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_APPLY_SCRIPT_URL) ||
    "https://script.google.com/macros/s/AKfycbzCzYSOuJNf83JN__A1JeG8FXgZW-j3izLZNi3Eb32DilTqrscdyawKaLyLfB3edVtD/exec";

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Anti-Spam Honeypot Verification (Silently reject bot submissions)
    if (isSpamBot(formData.hp_trap)) {
      setStatus('success');
      return;
    }

    // 2. Client-Side Rate Limiting (3-Second Cooldown between submits)
    if (isRateLimited('ApplyModalForm', 3000)) {
      return;
    }

    setStatus('loading');

    // 3. Input Sanitization
    const sanitizedPayload = sanitizePayload({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      city: formData.city,
      program: formData.program,
      prepStage: formData.prepStage,
      education: formData.education,
      statement: formData.statement
    });

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sanitizedPayload),
      });

      setStatus('success');
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        city: '',
        program: 'Mentorship programs',
        prepStage: 'Beginner (Starting Fresh)',
        education: 'Graduation Complete (B.Tech / B.A / B.Sc / B.Com)',
        statement: '',
        hp_trap: ''
      });
    } catch (err) {
      console.error("Application Submission Error:", err);
      setStatus('error');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="modal-content application-modal relative w-full max-w-2xl bg-gradient-to-b from-[#FFFDF8] to-[#F7F0E3] border-2 border-[#8C3A27] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 text-left max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          className="modal-close absolute top-4 right-4 text-[#8C3A27] hover:text-[#140C08] text-xl font-bold p-2 transition-colors cursor-pointer" 
          onClick={onClose} 
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="modal-header text-center border-b border-[#C5A059]/40 pb-4 pr-6">
          <span className="text-xs uppercase tracking-widest font-serif font-bold text-[#8C3A27] block">
            CANDIDATE REGISTRATION
          </span>
          <h2 className="font-serif-header text-2xl sm:text-3xl font-extrabold text-[#140C08] mt-1">
            e-GURUKULAM APPLICATION
          </h2>
          <p className="text-xs sm:text-sm text-[#2A1E18] font-sans font-medium mt-1">
            Complete your candidate details to apply for mentorship and structured online tracks.
          </p>
        </div>

        <form className="apply-form space-y-6" onSubmit={handleSubmit}>
          
          {/* Honeypot Trap Field for Bot Prevention */}
          <div className="hidden opacity-0 pointer-events-none absolute -left-[9999px]" aria-hidden="true">
            <label htmlFor="hp_trap">Do not fill this field</label>
            <input 
              type="text" 
              id="hp_trap" 
              name="hp_trap" 
              tabIndex="-1" 
              autoComplete="off"
              value={formData.hp_trap}
              onChange={(e) => setFormData({ ...formData, hp_trap: e.target.value })}
            />
          </div>

          {/* SECTION 1: Personal Details */}
          <div className="form-section space-y-4">
            <h3 className="font-serif-header text-lg font-bold text-[#8C3A27] border-b border-[#D5C3B0] pb-1">
              1. Personal Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group space-y-1">
                <label htmlFor="fullName" className="block text-xs font-serif font-bold uppercase tracking-wider text-[#8C3A27]">
                  Full Candidate Name *
                </label>
                <input 
                  type="text" 
                  id="fullName" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter your full name" 
                  required 
                  className="manuscript-input w-full"
                />
              </div>

              <div className="form-group space-y-1">
                <label htmlFor="email" className="block text-xs font-serif font-bold uppercase tracking-wider text-[#8C3A27]">
                  Email Address *
                </label>
                <input 
                  type="email" 
                  id="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email address" 
                  required 
                  className="manuscript-input w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group space-y-1">
                <label htmlFor="phone" className="block text-xs font-serif font-bold uppercase tracking-wider text-[#8C3A27]">
                  Phone Number *
                </label>
                <input 
                  type="tel" 
                  id="phone" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX" 
                  pattern="[0-9+ ]{10,14}" 
                  required 
                  className="manuscript-input w-full"
                />
              </div>

              <div className="form-group space-y-1">
                <label htmlFor="city" className="block text-xs font-serif font-bold uppercase tracking-wider text-[#8C3A27]">
                  Current City / Residence *
                </label>
                <input 
                  type="text" 
                  id="city" 
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Hyderabad, Delhi, Bangalore" 
                  required 
                  className="manuscript-input w-full"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Program & Background */}
          <div className="form-section space-y-4">
            <h3 className="font-serif-header text-lg font-bold text-[#8C3A27] border-b border-[#D5C3B0] pb-1">
              2. Program &amp; Background
            </h3>

            <div className="form-group space-y-1">
              <label htmlFor="program" className="block text-xs font-serif font-bold uppercase tracking-wider text-[#8C3A27]">
                Program Interested In *
              </label>
              <select 
                id="program" 
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                required
                className="manuscript-input w-full cursor-pointer font-semibold"
              >
                <option value="Mentorship programs">Mentorship programs</option>
                <option value="APPSC / TGPSC Orientation">APPSC / TGPSC Orientation</option>
                <option value="IAS Workshops">IAS Workshops</option>
                <option value="Specialist & Perspective Programs">Specialist &amp; Perspective Programs</option>
                <option value="Subject-specific courses">Subject-specific courses</option>
                <option value="Other recorded courses">Other recorded courses</option>
                <option value="Books/Materials">Books/Materials</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group space-y-1">
                <label htmlFor="prepStage" className="block text-xs font-serif font-bold uppercase tracking-wider text-[#8C3A27]">
                  Current Preparation Stage *
                </label>
                <select 
                  id="prepStage" 
                  value={formData.prepStage}
                  onChange={(e) => setFormData({ ...formData, prepStage: e.target.value })}
                  required
                  className="manuscript-input w-full cursor-pointer font-semibold"
                >
                  <option value="Beginner (Starting Fresh)">Beginner (Starting Fresh)</option>
                  <option value="Attempted Prelims Previously">Attempted Prelims Previously</option>
                  <option value="Attempted Mains Previously">Attempted Mains Previously</option>
                  <option value="Interview Appeared Candidate">Interview Appeared Candidate</option>
                </select>
              </div>

              <div className="form-group space-y-1">
                <label htmlFor="education" className="block text-xs font-serif font-bold uppercase tracking-wider text-[#8C3A27]">
                  Educational Background *
                </label>
                <select 
                  id="education" 
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  required
                  className="manuscript-input w-full cursor-pointer font-semibold"
                >
                  <option value="Graduation Complete (B.Tech / B.A / B.Sc / B.Com)">Graduation Complete (B.Tech / B.A / B.Sc / B.Com)</option>
                  <option value="Post Graduation Complete (M.A / M.Tech / M.Sc)">Post Graduation Complete (M.A / M.Tech / M.Sc)</option>
                  <option value="Final Year Undergraduate Student">Final Year Undergraduate Student</option>
                  <option value="Professional Degree (MBBS / Law / CA)">Professional Degree (MBBS / Law / CA)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: Personal Statement */}
          <div className="form-section space-y-4">
            <h3 className="font-serif-header text-lg font-bold text-[#8C3A27] border-b border-[#D5C3B0] pb-1">
              3. Personal Statement
            </h3>

            <div className="form-group space-y-1">
              <label htmlFor="statement" className="block text-xs font-serif font-bold uppercase tracking-wider text-[#8C3A27]">
                Why Do You Wish To Join e-Gurukulam *
              </label>
              <textarea 
                id="statement" 
                rows={4} 
                value={formData.statement}
                onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
                placeholder="Share your goals, expectations, or specific mentorship needs..." 
                required
                className="manuscript-input w-full resize-none"
              ></textarea>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2 text-center">
            <button 
              type="submit" 
              className="submit-btn btn-terracotta-pill text-xs py-3.5 px-10 disabled:opacity-50 cursor-pointer w-full sm:w-auto"
              disabled={status === 'loading'}
            >
              <span className="btn-label">
                {status === 'loading' ? 'SUBMITTING APPLICATION...' : 'SUBMIT APPLICATION →'}
              </span>
              {status !== 'loading' && <Send className="w-4 h-4 ml-1" />}
            </button>
          </div>

          {status === 'success' && (
            <div className="status-box success p-5 border-2 border-emerald-600 bg-emerald-50/90 rounded-xl text-left space-y-1 animate-fade-in mt-4">
              <p className="text-emerald-800 font-bold text-sm flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>✓ Application Submitted Successfully!</span>
              </p>
              <span className="text-xs text-emerald-700 font-sans font-medium block pl-7">
                Our academic team will review your profile and reach out via phone/email shortly.
              </span>
            </div>
          )}

          {status === 'error' && (
            <div className="status-box error p-4 border-2 border-red-600 bg-red-50/90 rounded-xl text-left animate-fade-in mt-4">
              <p className="text-red-800 font-bold text-xs">
                ⚠️ Submission failed. Please check your network and try again.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default ApplyModal;
