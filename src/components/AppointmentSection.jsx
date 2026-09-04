import React, { useState } from 'react';
import { Send, CheckCircle, Phone, MessageSquare, MapPin, Mail, ExternalLink, Calendar, Clock } from 'lucide-react';
import { sanitizePayload, isSpamBot, isRateLimited, isValidPhone, isValidEmail } from '../utils/sanitize';

export function AppointmentSection() {
  // LEFT FORM: Program Enquiry / Personal Details / Admissions
  const [enquiryForm, setEnquiryForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    program: 'Mentorship programs',
    prepStage: 'Not Started',
    message: '',
    hp_trap: '' // Honeypot trap
  });
  const [enquiryHoneypot, setEnquiryHoneypot] = useState('');
  const [enquiryValidationError, setEnquiryValidationError] = useState('');
  const [enquiryStatus, setEnquiryStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'

  // RIGHT FORM: Book an Appointment
  const [appointmentForm, setAppointmentForm] = useState({
    name: '',
    mobile: '',
    email: '',
    currentAddress: '',
    prepStage: 'Not Started',
    education: 'Graduation Complete (B.Tech / B.A / B.Sc / B.Com)',
    message: '',
    appointmentDate: '',
    appointmentTime: '10:00 AM - 11:00 AM',
    appointmentMode: 'Online Video Session (Whatsapp/Google Meet)',
    hp_trap: '' // Honeypot trap
  });
  const [appointmentHoneypot, setAppointmentHoneypot] = useState('');
  const [appointmentValidationError, setAppointmentValidationError] = useState('');
  const [appointmentStatus, setAppointmentStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'

  // DEPLOYED GOOGLE APPS SCRIPT WEB APP ENDPOINT
  const GOOGLE_SCRIPT_URL = 
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_APPS_SCRIPT_URL) ||
    (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_APPS_SCRIPT_URL) ||
    "https://script.google.com/macros/s/AKfycbxbjFRyxiRgeNtUoivxdhxRqxlTlZiES5hhrkgaXkWUz_JfOIwO6fxHj2zsP6jK_ic1/exec";
  const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@e-GurukulamforIAS";

  // 1. Admission / Program Enquiry Form Submission Handler
  const handleEnquirySubmit = async (e) => {
    e.preventDefault();

    // 1. Strict Validation Rules (Mobile Number & Email Address)
    if (!isValidPhone(enquiryForm.phone)) {
      setEnquiryValidationError("⚠️ Please enter a valid 10-digit mobile number (must start with 6, 7, 8, or 9).");
      return;
    }
    if (!isValidEmail(enquiryForm.email)) {
      setEnquiryValidationError("⚠️ Please enter a valid email address.");
      return;
    }
    setEnquiryValidationError('');

    // 2. Anti-Spam Honeypot Verification (Silently simulate success for the bot without writing to backend)
    if ((enquiryHoneypot && enquiryHoneypot.trim() !== '') || isSpamBot(enquiryForm.hp_trap)) {
      setEnquiryStatus('success');
      return;
    }

    // 3. Rate Limiting (3-Second Cooldown)
    if (isRateLimited('EnquiryForm', 3000)) {
      return;
    }

    setEnquiryStatus('loading');

    const sanitizedPayload = sanitizePayload({
      formType: "admissions",
      fullName: enquiryForm.fullName,
      email: enquiryForm.email,
      contactNumber: enquiryForm.phone,
      address: enquiryForm.address,
      program: enquiryForm.program,
      prepStage: enquiryForm.prepStage,
      message: enquiryForm.message,
      hp_website_check: enquiryHoneypot
    });

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedPayload),
      });
      setEnquiryStatus('success');
      setEnquiryHoneypot('');
      setEnquiryForm({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        program: 'Mentorship programs',
        prepStage: 'Not Started',
        message: '',
        hp_trap: ''
      });
    } catch (err) {
      console.error("Admissions Form Submission Error:", err);
      setEnquiryStatus('error');
    }
  };

  // 2. Book An Appointment Form Submission Handler
  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();

    // 1. Strict Validation Rules (Mobile Number & Email Address)
    if (!isValidPhone(appointmentForm.mobile)) {
      setAppointmentValidationError("⚠️ Please enter a valid 10-digit mobile number (must start with 6, 7, 8, or 9).");
      return;
    }
    if (!isValidEmail(appointmentForm.email)) {
      setAppointmentValidationError("⚠️ Please enter a valid email address.");
      return;
    }
    setAppointmentValidationError('');

    // 2. Anti-Spam Honeypot Verification (Silently simulate success for the bot without writing to backend)
    if ((appointmentHoneypot && appointmentHoneypot.trim() !== '') || isSpamBot(appointmentForm.hp_trap)) {
      setAppointmentStatus('success');
      return;
    }

    // 3. Rate Limiting (3-Second Cooldown)
    if (isRateLimited('AppointmentForm', 3000)) {
      return;
    }

    setAppointmentStatus('loading');

    const sanitizedPayload = sanitizePayload({
      formType: "appointment",
      fullName: appointmentForm.name,
      contactNumber: appointmentForm.mobile,
      email: appointmentForm.email,
      address: appointmentForm.currentAddress,
      prepStage: appointmentForm.prepStage,
      education: appointmentForm.education,
      appointmentDate: appointmentForm.appointmentDate,
      timeSlot: appointmentForm.appointmentTime,
      mode: appointmentForm.appointmentMode,
      message: appointmentForm.message,
      hp_website_check: appointmentHoneypot
    });

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedPayload),
      });
      setAppointmentStatus('success');
      setAppointmentHoneypot('');
      setAppointmentForm({
        name: '',
        mobile: '',
        email: '',
        currentAddress: '',
        prepStage: 'Not Started',
        education: 'Graduation Complete (B.Tech / B.A / B.Sc / B.Com)',
        message: '',
        appointmentDate: '',
        appointmentTime: '10:00 AM - 11:00 AM',
        appointmentMode: 'Online Video Session (Whatsapp/Google Meet)',
        hp_trap: ''
      });
    } catch (err) {
      console.error("Appointment Form Submission Error:", err);
      setAppointmentStatus('error');
    }
  };

  return (
    <section className="appointment-section py-12 px-4 sm:px-6 lg:px-8 section-clean-parchment" id="book-appointment">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* 2-COLUMN FORMS GRID — MATCHED HEIGHT USING ITEMS-STRETCH & FLEX-1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* ================================================================= */}
          {/* LEFT COLUMN: PROGRAM ENQUIRY / PERSONAL DETAILS / ADMISSIONS */}
          {/* ================================================================= */}
          <div className="lg:col-span-6 card-parchment-3d p-6 sm:p-8 flex flex-col justify-between h-full space-y-6">
            
            <div className="space-y-2 border-b-2 border-[#C5A059]/40 pb-4 text-center">
              <span className="text-xs uppercase tracking-widest font-serif font-bold text-[#8C3A27] bg-[#8C3A27]/10 px-3.5 py-1 rounded-full inline-block border border-[#8C3A27]/20">
                Program Enquiry / Personal Details / Admissions
              </span>
              <h3 className="font-serif-header text-3xl sm:text-4xl font-extrabold text-[#140C08]">
                Connect With Us
              </h3>
              <p className="font-serif italic text-base font-semibold text-[#8C3A27]">
                Tell us a little about yourself
              </p>
            </div>

            <form className="space-y-4 text-left flex-1 flex flex-col justify-between" onSubmit={handleEnquirySubmit}>
              
              {/* Honeypot field - hidden from humans, traps automated bots */}
              <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
                <input
                  type="text"
                  name="hp_website_check"
                  tabIndex="-1"
                  autoComplete="off"
                  value={enquiryHoneypot}
                  onChange={(e) => setEnquiryHoneypot(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div className="form-group space-y-1">
                  <label htmlFor="enquiryFullName" className="block text-xs font-serif font-bold uppercase tracking-wider text-[#8C3A27]">
                    Full Name *
                  </label>
                  <input 
                    type="text" 
                    id="enquiryFullName" 
                    value={enquiryForm.fullName}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, fullName: e.target.value })}
                    placeholder="Enter your name" 
                    required 
                    className="manuscript-input w-full"
                  />
                </div>

                {/* Email & Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group space-y-1">
                    <label htmlFor="enquiryEmail" className="block text-xs font-serif font-bold uppercase tracking-wider text-[#8C3A27]">
                      Email Address *
                    </label>
                    <input 
                      type="email" 
                      id="enquiryEmail" 
                      value={enquiryForm.email}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                      placeholder="Enter your email address" 
                      required 
                      className="manuscript-input w-full"
                    />
                  </div>

                  <div className="form-group space-y-1">
                    <label htmlFor="enquiryPhone" className="block text-xs font-serif font-bold uppercase tracking-wider text-[#8C3A27]">
                      Contact Number *
                    </label>
                    <input 
                      type="tel" 
                      id="enquiryPhone" 
                      value={enquiryForm.phone}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                      placeholder="Enter your phone number" 
                      pattern="[0-9+ ]{10,14}" 
                      required 
                      className="manuscript-input w-full"
                    />
                  </div>
                </div>

                {/* Current Residential Address */}
                <div className="form-group space-y-1">
                  <label htmlFor="enquiryAddress" className="block text-xs font-serif font-bold uppercase tracking-wider text-[#8C3A27]">
                    Current Residential Address
                  </label>
                  <input 
                    type="text" 
                    id="enquiryAddress" 
                    value={enquiryForm.address}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, address: e.target.value })}
                    placeholder="Enter your current city / residential address" 
                    className="manuscript-input w-full"
                  />
                </div>

                {/* Program Interested In */}
                <div className="form-group space-y-1">
                  <label htmlFor="enquiryProgram" className="block text-xs font-serif font-bold uppercase tracking-wider text-[#8C3A27]">
                    Program Interested In *
                  </label>
                  <select 
                    id="enquiryProgram" 
                    value={enquiryForm.program}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, program: e.target.value })}
                    required
                    className="manuscript-input w-full cursor-pointer font-sans font-semibold text-xs"
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

                {/* Current Preparation Stage */}
                <div className="form-group space-y-1">
                  <label htmlFor="enquiryPrepStage" className="block text-xs font-serif font-bold uppercase tracking-wider text-[#8C3A27]">
                    Current Preparation Stage *
                  </label>
                  <select 
                    id="enquiryPrepStage" 
                    value={enquiryForm.prepStage}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, prepStage: e.target.value })}
                    required
                    className="manuscript-input w-full cursor-pointer font-sans font-semibold text-xs"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="Beginner (Starting Fresh)">Beginner (Starting Fresh)</option>
                    <option value="Attempted Prelims Previously">Attempted Prelims Previously</option>
                    <option value="Attempted Mains Previously">Attempted Mains Previously</option>
                    <option value="Interview Appeared Candidate">Interview Appeared Candidate</option>
                  </select>
                </div>

                {/* Message / Query */}
                <div className="form-group space-y-1">
                  <label htmlFor="enquiryMessage" className="block text-xs font-serif font-bold uppercase tracking-wider text-[#8C3A27]">
                    Message / Query *
                  </label>
                  <textarea 
                    id="enquiryMessage" 
                    rows={3} 
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                    placeholder="Tell us about your preparation, requirements, or any questions you would like to discuss." 
                    required
                    className="manuscript-input w-full resize-none text-xs"
                  ></textarea>
                </div>
              </div>

              {/* On-Screen Validation Alert Popup / Banner */}
              {enquiryValidationError && (
                <div 
                  role="alert" 
                  className="p-4 border-2 border-amber-600 bg-amber-50 rounded-xl text-amber-950 font-bold text-xs flex items-center justify-between shadow-md animate-fade-in my-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base shrink-0">⚠️</span>
                    <span>{enquiryValidationError.replace('⚠️ ', '')}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setEnquiryValidationError('')} 
                    className="text-amber-900 hover:text-black font-extrabold px-2 py-1 cursor-pointer text-sm shrink-0"
                    aria-label="Dismiss error"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="pt-4">
                <button 
                  type="submit" 
                  className="btn-terracotta-pill text-xs py-3.5 px-8 disabled:opacity-50 cursor-pointer w-full"
                  disabled={enquiryStatus === 'loading'}
                >
                  <span className="btn-label">
                    {enquiryStatus === 'loading' ? 'SUBMITTING ENQUIRY...' : 'SUBMIT ENQUIRY →'}
                  </span>
                </button>
              </div>

              {enquiryStatus === 'success' && (
                <div className="p-4 border-2 border-emerald-600 bg-emerald-50/90 rounded-xl space-y-1 text-left animate-fade-in mt-4">
                  <p className="text-emerald-800 font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>✓ Enquiry submitted successfully! Our team will get back to you shortly.</span>
                  </p>
                </div>
              )}

              {enquiryStatus === 'error' && (
                <div className="p-4 border-2 border-red-600 bg-red-50/90 rounded-xl text-left animate-fade-in mt-4">
                  <p className="text-red-800 font-bold text-xs">
                    ⚠️ Submission failed. Please try again.
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* ================================================================= */}
          {/* RIGHT COLUMN: BOOK AN APPOINTMENT */}
          {/* ================================================================= */}
          <div className="lg:col-span-6 card-parchment-3d p-6 sm:p-8 flex flex-col justify-between h-full space-y-6">
            
            <div className="space-y-2 border-b-2 border-[#C5A059]/40 pb-4 text-center">
              <span className="text-xs uppercase tracking-widest font-serif font-bold text-[#8C3A27] bg-[#8C3A27]/10 px-3.5 py-1 rounded-full inline-block border border-[#8C3A27]/20">
                1-ON-1 PERSONAL MENTORSHIP
              </span>
              <h3 className="font-serif-header text-3xl sm:text-4xl font-extrabold text-[#140C08]">
                Book an Appointment
              </h3>
              <p className="font-serif italic text-base font-semibold text-[#8C3A27]">
                Schedule a direct 1-on-1 counseling session with Akella Raghavendra Sir.
              </p>
            </div>

            <form className="space-y-4 text-left flex-1 flex flex-col justify-between" onSubmit={handleAppointmentSubmit}>
              
              {/* Honeypot field - hidden from humans, traps automated bots */}
              <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
                <input
                  type="text"
                  name="hp_website_check"
                  tabIndex="-1"
                  autoComplete="off"
                  value={appointmentHoneypot}
                  onChange={(e) => setAppointmentHoneypot(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div className="form-group space-y-1">
                  <label htmlFor="apptName" className="block text-xs font-serif font-bold uppercase tracking-wider text-[#8C3A27]">
                    Full Name *
                  </label>
                  <input 
                    type="text" 
                    id="apptName" 
                    value={appointmentForm.name}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, name: e.target.value })}
                    placeholder="Enter your name" 
                    required 
                    className="manuscript-input w-full"
                  />
                </div>

                {/* Contact Number & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group space-y-1">
                    <label htmlFor="apptMobile" className="block text-xs font-serif font-bold uppercase tracking-wider text-[#8C3A27]">
                      Contact Number *
                    </label>
                    <input 
                      type="tel" 
                      id="apptMobile" 
                      value={appointmentForm.mobile}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, mobile: e.target.value })}
                      placeholder="Enter your phone number" 
                      pattern="[0-9+ ]{10,14}" 
                      required 
                      className="manuscript-input w-full"
                    />
                  </div>

                  <div className="form-group space-y-1">
                    <label htmlFor="apptEmail" className="block text-xs font-serif font-bold uppercase tracking-wider text-[#8C3A27]">
                      Email Address *
                    </label>
                    <input 
                      type="email" 
                      id="apptEmail" 
                      value={appointmentForm.email}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, email: e.target.value })}
                      placeholder="Enter your email address" 
                      required 
                      className="manuscript-input w-full"
                    />
                  </div>
                </div>

                {/* Current Residential Address */}
                <div className="form-group space-y-1">
                  <label htmlFor="apptCurrentAddress" className="block text-xs font-serif font-bold uppercase tracking-wider text-[#8C3A27]">
                    Current Residential Address
                  </label>
                  <input 
                    type="text" 
                    id="apptCurrentAddress" 
                    value={appointmentForm.currentAddress}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, currentAddress: e.target.value })}
                    placeholder="Enter your current city / residential address" 
                    className="manuscript-input w-full"
                  />
                </div>

                {/* Current Preparation Stage & Educational Background */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group space-y-1">
                    <label htmlFor="apptPrepStage" className="block text-xs font-serif font-bold uppercase tracking-wider text-[#8C3A27]">
                      Current Preparation Stage *
                    </label>
                    <select
                      id="apptPrepStage"
                      value={appointmentForm.prepStage}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, prepStage: e.target.value })}
                      required
                      className="manuscript-input w-full cursor-pointer font-sans font-semibold text-xs"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="Beginner (Starting Fresh)">Beginner (Starting Fresh)</option>
                      <option value="Attempted Prelims Previously">Attempted Prelims Previously</option>
                      <option value="Attempted Mains Previously">Attempted Mains Previously</option>
                      <option value="Interview Appeared Candidate">Interview Appeared Candidate</option>
                    </select>
                  </div>

                  <div className="form-group space-y-1">
                    <label htmlFor="apptEducation" className="block text-xs font-serif font-bold uppercase tracking-wider text-[#8C3A27]">
                      Educational Background *
                    </label>
                    <select
                      id="apptEducation"
                      value={appointmentForm.education}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, education: e.target.value })}
                      required
                      className="manuscript-input w-full cursor-pointer font-sans font-semibold text-xs"
                    >
                      <option value="Graduation Complete (B.Tech / B.A / B.Sc / B.Com)">Graduation Complete (B.Tech / B.A / B.Sc / B.Com)</option>
                      <option value="Post Graduation Complete (M.A / M.Tech / M.Sc)">Post Graduation Complete (M.A / M.Tech / M.Sc)</option>
                      <option value="Final Year Undergraduate Student">Final Year Undergraduate Student</option>
                      <option value="Professional Degree (MBBS / Law / CA)">Professional Degree (MBBS / Law / CA)</option>
                    </select>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group space-y-1">
                    <label htmlFor="appointmentDate" className="block text-xs font-serif font-bold uppercase tracking-wider text-[#8C3A27]">
                      Appointment Date *
                    </label>
                    <input 
                      type="date" 
                      id="appointmentDate" 
                      value={appointmentForm.appointmentDate}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, appointmentDate: e.target.value })}
                      required 
                      className="manuscript-input w-full cursor-pointer font-sans font-semibold text-xs"
                    />
                  </div>

                  <div className="form-group space-y-1">
                    <label htmlFor="appointmentTime" className="block text-xs font-serif font-bold uppercase tracking-wider text-[#8C3A27]">
                      Preferred Time Slot *
                    </label>
                    <select 
                      id="appointmentTime" 
                      value={appointmentForm.appointmentTime}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, appointmentTime: e.target.value })}
                      required
                      className="manuscript-input w-full cursor-pointer font-sans font-semibold text-xs"
                    >
                      <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                      <option value="11:30 AM - 12:30 PM">11:30 AM - 12:30 PM</option>
                      <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                      <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                      <option value="06:00 PM - 07:00 PM">06:00 PM - 07:00 PM</option>
                    </select>
                  </div>
                </div>

                {/* Mode of Appointment */}
                <div className="form-group space-y-1">
                  <label htmlFor="appointmentMode" className="block text-xs font-serif font-bold uppercase tracking-wider text-[#8C3A27]">
                    Mode of Appointment *
                  </label>
                  <select 
                    id="appointmentMode" 
                    value={appointmentForm.appointmentMode}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, appointmentMode: e.target.value })}
                    required
                    className="manuscript-input w-full cursor-pointer font-sans font-semibold text-xs"
                  >
                    <option value="Online Video Session (Whatsapp/Google Meet)">Online Video Session (Whatsapp/Google Meet)</option>
                    <option value="One-to-One In-Person Session">One-to-One In-Person Session</option>
                    <option value="Telephonic Guidance Call">Telephonic Guidance Call</option>
                  </select>
                </div>

                {/* Message */}
                <div className="form-group space-y-1">
                  <label htmlFor="apptMessage" className="block text-xs font-serif font-bold uppercase tracking-wider text-[#8C3A27]">
                    Message / Queries *
                  </label>
                  <textarea 
                    id="apptMessage" 
                    rows={3} 
                    value={appointmentForm.message}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, message: e.target.value })}
                    placeholder="What topic or course do you wish to discuss?" 
                    required
                    className="manuscript-input w-full resize-none text-xs"
                  ></textarea>
                </div>
              </div>

              {/* On-Screen Validation Alert Popup / Banner */}
              {appointmentValidationError && (
                <div 
                  role="alert" 
                  className="p-4 border-2 border-amber-600 bg-amber-50 rounded-xl text-amber-950 font-bold text-xs flex items-center justify-between shadow-md animate-fade-in my-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base shrink-0">⚠️</span>
                    <span>{appointmentValidationError.replace('⚠️ ', '')}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setAppointmentValidationError('')} 
                    className="text-amber-900 hover:text-black font-extrabold px-2 py-1 cursor-pointer text-sm shrink-0"
                    aria-label="Dismiss error"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="pt-4">
                <button 
                  type="submit" 
                  className="btn-terracotta-pill text-xs py-3.5 px-8 disabled:opacity-50 cursor-pointer w-full"
                  disabled={appointmentStatus === 'loading'}
                >
                  <span className="btn-label">
                    {appointmentStatus === 'loading' ? 'BOOKING APPOINTMENT...' : 'CONFIRM APPOINTMENT →'}
                  </span>
                </button>
              </div>

              {appointmentStatus === 'success' && (
                <div className="p-4 border-2 border-emerald-600 bg-emerald-50/90 rounded-xl space-y-1 text-left animate-fade-in mt-4">
                  <p className="text-emerald-800 font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>✓ Appointment request submitted! You will receive a confirmation call shortly.</span>
                  </p>
                </div>
              )}

              {appointmentStatus === 'error' && (
                <div className="p-4 border-2 border-red-600 bg-red-50/90 rounded-xl text-left animate-fade-in mt-4">
                  <p className="text-red-800 font-bold text-xs">
                    ⚠️ Submission failed. Please try again.
                  </p>
                </div>
              )}
            </form>
          </div>

        </div>

      </div>
    </section>
  );
}

export default AppointmentSection;
