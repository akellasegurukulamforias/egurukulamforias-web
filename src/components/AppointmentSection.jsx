import React, { useState } from 'react';
import { Send, CheckCircle, Phone, MessageSquare, MapPin, Mail, ExternalLink, Calendar, Clock } from 'lucide-react';
import { sanitizePayload, isSpamBot, isRateLimited } from '../utils/sanitize';

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
  const [appointmentStatus, setAppointmentStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'

  // DEPLOYED GOOGLE APPS SCRIPT WEB APP ENDPOINT
  const GOOGLE_SCRIPT_URL = 
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_APPS_SCRIPT_URL) ||
    (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_APPS_SCRIPT_URL) ||
    "https://script.google.com/macros/s/AKfycbxbjFRyxiRgeNtUoivxdhxRqxlTlZiES5hhrkgaXkWUz_JfOIwO6fxHj2zsP6jK_ic1/exec";
  const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/channel/UCvli1LsskbL3Y4a8S8r035Q";

  // 1. Admission / Program Enquiry Form Submission Handler
  const handleEnquirySubmit = async (e) => {
    e.preventDefault();

    // Anti-Spam Honeypot Verification
    if (isSpamBot(enquiryForm.hp_trap)) {
      setEnquiryStatus('success');
      return;
    }

    // Rate Limiting (3-Second Cooldown)
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
      message: enquiryForm.message
    });

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedPayload),
      });
      setEnquiryStatus('success');
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

    // Anti-Spam Honeypot Verification
    if (isSpamBot(appointmentForm.hp_trap)) {
      setAppointmentStatus('success');
      return;
    }

    // Rate Limiting (3-Second Cooldown)
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
      message: appointmentForm.message
    });

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedPayload),
      });
      setAppointmentStatus('success');
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

        {/* ================================================================= */}
        {/* BOTTOM SECTION: MAP + CONTACT DETAILS (FULL WIDTH) */}
        {/* ================================================================= */}
        <div className="w-full pt-6">
          <div className="card-parchment-3d p-6 sm:p-8 space-y-8 text-left border-2 border-[#8C3A27]/30">
            
            <div className="border-b border-[#C5A059]/40 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif-header text-2xl font-extrabold text-[#140C08]">
                  Visit Us &amp; Connect Directly
                </h3>
              </div>
              <a 
                href="https://maps.app.goo.gl/NhQYhywYBYX1ffkk9" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-terracotta-outline-pill text-xs py-2 px-4 self-start md:self-auto"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Full Width Google Map Embed Container */}
              <div className="lg:col-span-7 rounded-xl overflow-hidden border-2 border-[#D5C3B0] shadow-md">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d18126.807006177834!2d78.53201005!3d17.372420499999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb98fa75cb13b7%3A0x5097a35e82510f1d!2s9GCH%2BX66%20Akella's%20Residence%2C%208-97%2C%20Road%20No%204%2C%20Vikas%20Nagar%2C%20Moosa%20Ram%20Bagh%2C%20Dilsukhnagar%2C%20Hyderabad%2C%20Telangana%20500060!5e1!3m2!1sen!2sin!4v1786442564374!5m2!1sen!2sin"
                  width="100%"
                  height="320"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  title="e-Gurukulam Campus Map"
                ></iframe>
              </div>

              {/* Contact Details & Official Channels */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="space-y-4 text-xs font-sans text-[#2A1E18]">
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#8C3A27] shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-serif text-sm font-bold text-[#140C08] block">Address:</strong>
                      <a 
                        href="https://maps.app.goo.gl/NhQYhywYBYX1ffkk9" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-[#8C3A27] underline decoration-[#8C3A27]/40 underline-offset-4 font-bold leading-relaxed block pt-0.5 text-[#8C3A27]"
                      >
                        Akella's Residence
                      </a>
                      <span className="text-[#2A1E18] font-medium leading-relaxed block pt-0.5">
                        8-97, Road No 4, Vikas Nagar, Moosa Ram Bagh, Dilshuknagar, Hyderabad, Telangana 500060
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-[#8C3A27] shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-serif text-sm font-bold text-[#140C08] block">Institutional Lines:</strong>
                      <div className="space-y-0.5 pt-0.5 font-semibold">
                        <div><a href="tel:+918897826108" className="hover:text-[#8C3A27]">+91 8897826108</a></div>
                        <div><a href="tel:+919912211109" className="hover:text-[#8C3A27]">+91 9912211109</a></div>
                        <div><a href="tel:+918985894254" className="hover:text-[#8C3A27]">+91 8985894254</a></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-[#8C3A27] shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-serif text-sm font-bold text-[#140C08] block">Official Email Desk:</strong>
                      <a href="mailto:akellas.egurukulamforias@gmail.com" className="hover:text-[#8C3A27] font-semibold block pt-0.5">
                        akellas.egurukulamforias@gmail.com
                      </a>
                    </div>
                  </div>

                </div>

                {/* Social Media Icons */}
                <div className="space-y-2 pt-2 border-t border-[#C5A059]/30">
                  <span className="text-[11px] font-serif uppercase tracking-wider font-bold text-[#8C3A27] block">
                    Official Media &amp; Community Channels
                  </span>
                  
                  <div className="flex flex-wrap items-center gap-2.5">
                    
                    {/* YouTube */}
                    <a 
                      href={YOUTUBE_CHANNEL_URL}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label="YouTube Channel" 
                      title="e-Gurukulam Official YouTube Channel"
                      className="w-9 h-9 rounded-full bg-[#FFFDF8] border border-[#C5A059] flex items-center justify-center text-[#8C3A27] hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000] transition-all shadow-xs"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </a>

                    {/* Facebook */}
                    <a 
                      href="https://www.facebook.com/profile.php?id=61570902514505" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label="Facebook" 
                      title="Facebook Page"
                      className="w-9 h-9 rounded-full bg-[#FFFDF8] border border-[#C5A059] flex items-center justify-center text-[#8C3A27] hover:bg-[#8C3A27] hover:text-white transition-all shadow-xs"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>

                    {/* LinkedIn */}
                    <a 
                      href="https://www.linkedin.com/in/akella-raghavendra-b62158284/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label="LinkedIn" 
                      title="Akella Raghavendra | LinkedIn"
                      className="w-9 h-9 rounded-full bg-[#FFFDF8] border border-[#C5A059] flex items-center justify-center text-[#8C3A27] hover:bg-[#8C3A27] hover:text-white transition-all shadow-xs"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                      </svg>
                    </a>

                    {/* Instagram */}
                    <a 
                      href="https://www.instagram.com/egurukulamforias/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label="Instagram" 
                      title="Instagram Profile"
                      className="w-9 h-9 rounded-full bg-[#FFFDF8] border border-[#C5A059] flex items-center justify-center text-[#8C3A27] hover:bg-[#8C3A27] hover:text-white transition-all shadow-xs"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </a>

                    {/* Telegram */}
                    <a 
                      href="https://t.me/egurukulamforias" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label="Telegram" 
                      title="Telegram Channel"
                      className="w-9 h-9 rounded-full bg-[#FFFDF8] border border-[#C5A059] flex items-center justify-center text-[#8C3A27] hover:bg-[#8C3A27] hover:text-white transition-all shadow-xs"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-2.02 9.51c-.15.68-.55.85-1.12.53l-3.08-2.27-1.49 1.43c-.16.16-.3.3-.62.3l.22-3.14 5.73-5.18c.25-.22-.05-.34-.39-.12l-7.08 4.46-3.05-.95c-.66-.21-.67-.66.14-.98l11.91-4.59c.55-.2 1.04.13.85.91z"/>
                      </svg>
                    </a>

                    {/* WhatsApp Channel */}
                    <a 
                      href="https://whatsapp.com/channel/0029VbB3qcSE50UaECuWi52o" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label="WhatsApp Channel" 
                      title="WhatsApp Official Channel"
                      className="w-9 h-9 rounded-full bg-[#FFFDF8] border border-[#C5A059] flex items-center justify-center text-[#8C3A27] hover:bg-[#8C3A27] hover:text-white transition-all shadow-xs"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>

                    {/* Twitter / X */}
                    <a 
                      href="https://x.com/egurukulamf1674?s=20" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label="Twitter / X" 
                      title="Twitter / X"
                      className="w-9 h-9 rounded-full bg-[#FFFDF8] border border-[#C5A059] flex items-center justify-center text-[#8C3A27] hover:bg-[#8C3A27] hover:text-white transition-all shadow-xs"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>

                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

export default AppointmentSection;
