import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CheckCircle, MapPin, Phone, Mail } from 'lucide-react';
import { sanitizePayload, isRateLimited, isValidEmail } from '../utils/sanitize';
import { useCMSData } from '../hooks/useCMSData';
import { getSocialIcon } from '../utils/socialIcons';

// Fallback platforms matching the CMS configuration
const FALLBACK_SOCIAL_PLATFORMS = [
  {
    platform: "WhatsApp",
    order: 1,
    isDirect: true,
    directUrl: "https://whatsapp.com/channel/0029VbB3qcSE50UaECuWi520",
    channels: [
      {
        name: "e-Gurukulam For IAS",
        url: "https://whatsapp.com/channel/0029VbB3qcSE50UaECuWi520"
      }
    ]
  },
  {
    platform: "YouTube",
    order: 2,
    isDirect: false,
    directUrl: "https://www.youtube.com/@e-GurukulamforIAS",
    channels: [
      {
        name: "e-Gurukulam for IAS",
        url: "https://www.youtube.com/@e-GurukulamforIAS"
      },
      {
        name: "IAS For ALL",
        url: "https://www.youtube.com/@IASForAll"
      },
      {
        name: "Akella Raghavendra Foundation",
        url: "https://www.youtube.com/@AkellaRaghavendraFoundation"
      }
    ]
  },
  {
    platform: "Telegram",
    order: 3,
    isDirect: true,
    directUrl: "https://t.me/egurukulamforias",
    channels: [
      {
        name: "e-Gurukulam For IAS",
        url: "https://t.me/egurukulamforias"
      }
    ]
  },
  {
    platform: "Instagram",
    order: 4,
    isDirect: false,
    directUrl: "https://www.instagram.com/egurukulamforias/",
    channels: [
      {
        name: "e-Gurukulam For IAS",
        url: "https://www.instagram.com/egurukulamforias/"
      },
      {
        name: "IAS Akella Raghavendra",
        url: "https://www.instagram.com/ias_akellaraghavendra/"
      },
      {
        name: "Akella Raghavendra Offical",
        url: "https://www.instagram.com/akellaraghavendra_official/"
      }
    ]
  },
  {
    platform: "Facebook",
    order: 5,
    isDirect: false,
    directUrl: "https://www.facebook.com/AkellaRaghavendraa/",
    channels: [
      {
        name: "Akella Raghavendra",
        url: "https://www.facebook.com/AkellaRaghavendraa/"
      },
      {
        name: "IAS Mentoring",
        url: "https://www.facebook.com/profile.php?id=61570902514505"
      },
      {
        name: "Akella Raghavendra Foundation",
        url: "https://www.facebook.com/AkellaRaghavendraFoundation/"
      },
      {
        name: "Akella Raghavendra Official",
        url: "https://www.facebook.com/akella.raghavendra.authorised/"
      }
    ]
  },
  {
    platform: "Twitter_X",
    order: 6,
    isDirect: true,
    directUrl: "https://x.com/egurukulamf1674",
    channels: [
      {
        name: "e-Gurukulam For IAS",
        url: "https://x.com/egurukulamf1674"
      }
    ]
  },
  {
    platform: "LinkedIn",
    order: 7,
    isDirect: false,
    directUrl: "https://www.linkedin.com/in/akella-raghavendra/",
    channels: [
      {
        name: "Akella Raghavendra",
        url: "https://www.linkedin.com/in/akella-raghavendra/"
      },
      {
        name: "e-Gurukulam For IAS",
        url: "https://www.linkedin.com/company/e-gurukulamforias/"
      }
    ]
  },
  {
    platform: "PlayStore_Apps",
    order: 8,
    isDirect: false,
    directUrl: "https://play.google.com/store/apps/details?id=co.shield.smpqz&hl=en_IN",
    channels: [
      {
        name: "Akella Raghavendra's e-Gurukulam For IAS",
        url: "https://play.google.com/store/apps/details?id=co.shield.smpqz&hl=en_IN"
      },
      {
        name: "Young India Program",
        url: "https://play.google.com/store/apps/details?id=co.arya.amita"
      },
      {
        name: "Andhra Telangana Enrich Exams",
        url: "https://play.google.com/store/apps/details?id=co.martin.hezjo"
      }
    ]
  }
];

const TIME_SLOTS = [
  "10:00 AM - 10:30 AM",
  "10:30 AM - 11:00 AM",
  "11:00 AM - 11:30 AM",
  "11:30 AM - 12:00 PM",
  "12:00 PM - 12:30 PM",
  "12:30 PM - 01:00 PM",
  "01:00 PM - 01:30 PM",
  "01:30 PM - 02:00 PM",
  "02:00 PM - 02:30 PM",
  "02:30 PM - 03:00 PM",
  "03:00 PM - 03:30 PM",
  "03:30 PM - 04:00 PM",
  "04:00 PM - 04:30 PM",
  "04:30 PM - 05:00 PM",
  "05:00 PM - 05:30 PM",
  "05:30 PM - 06:00 PM",
  "06:00 PM - 06:30 PM",
  "06:30 PM - 07:00 PM"
];

const INITIAL_FORM_STATE = {
  fullName: '',
  contactNumber: '',
  email: '',
  address: '',
  source: '',
  sourceOther: '',
  background: '',
  backgroundOther: '',
  lookingFor: '',
  lookingForOther: '',
  guidanceType: '',
  appointmentDate: '',
  timeSlot: '',
  appointmentMode: '',
  message: '',
  user_organization_code: ''
};

export function AppointmentSection() {
  // CRITICAL BUG FIX: Track component mount lifecycle to prevent post-unmount state updates & ReferenceError
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Store form mounted timestamp on component load for 3-second fill timer bot defense
  const formMountedAt = useRef(Date.now());

  const { data: cmsData } = useCMSData();

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [honeypot, setHoneypot] = useState('');
  const [validationError, setValidationError] = useState('');
  const [invalidField, setInvalidField] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'

  const focusField = (fieldId) => {
    setInvalidField(fieldId);
    setTimeout(() => {
      const el = document.getElementById(fieldId);
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  const getInputClass = (fieldId) => {
    const isErr = invalidField === fieldId;
    return `w-full bg-[#FFFDF9] border ${
      isErr ? 'border-red-600 ring-2 ring-red-500/25' : 'border-[#D5C3B0]'
    } rounded-lg px-3.5 py-2.5 text-[#140C08] text-[15px] font-sans font-medium focus:outline-none focus:border-[#8C3A27] focus:ring-1 focus:ring-[#8C3A27]/30 transition-all shadow-xs`;
  };

  // Follow Us Platform Downward Web State & Handlers
  const [expandedPlatform, setExpandedPlatform] = useState(null);
  const socialCloseTimerRef = useRef(null);
  const socialSectionRef = useRef(null);

  const handlePlatformMouseEnter = (platformName) => {
    if (socialCloseTimerRef.current) clearTimeout(socialCloseTimerRef.current);
    setExpandedPlatform(platformName);
  };

  const handlePlatformMouseLeave = () => {
    if (socialCloseTimerRef.current) clearTimeout(socialCloseTimerRef.current);
    socialCloseTimerRef.current = setTimeout(() => {
      setExpandedPlatform(null);
    }, 280);
  };

  const handleWebMouseEnter = () => {
    if (socialCloseTimerRef.current) clearTimeout(socialCloseTimerRef.current);
  };

  const handlePlatformClick = (platformName) => {
    setExpandedPlatform(prev => prev === platformName ? null : platformName);
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (socialSectionRef.current && !socialSectionRef.current.contains(e.target)) {
        setExpandedPlatform(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Helper to check active status of items/channels
  const isItemActive = (obj) => {
    if (!obj || typeof obj !== 'object') return false;
    if (obj.Active === false || obj.active === false || obj.Is_Active === false || obj.is_active === false) return false;
    if (obj.Status && obj.Status.toString().toLowerCase() === 'inactive') return false;
    if (obj.status && obj.status.toString().toLowerCase() === 'inactive') return false;
    return true;
  };

  // Processed social platforms with multi-channel support from CMS source of truth
  const processedSocialPlatforms = useMemo(() => {
    const rawPlatforms = Array.isArray(cmsData?.socialPlatforms) && cmsData.socialPlatforms.length > 0
      ? cmsData.socialPlatforms
      : FALLBACK_SOCIAL_PLATFORMS;

    return rawPlatforms
      .filter(isItemActive)
      .map(rawItem => {
        const platformName = rawItem.platform || rawItem.Platform || rawItem.id || rawItem.type || rawItem.name || 'Platform';
        const title = rawItem.title || rawItem.Title || rawItem.name || rawItem.Name || platformName;
        const directUrl = rawItem.directUrl || rawItem.direct_url || rawItem.url || rawItem.Link || rawItem.link || rawItem.href;

        const rawChannels = Array.isArray(rawItem.channels) 
          ? rawItem.channels 
          : Array.isArray(rawItem.branches) 
            ? rawItem.branches 
            : Array.isArray(rawItem.links) 
              ? rawItem.links 
              : [];

        const activeChannels = rawChannels.filter(isItemActive).map(ch => ({
          name: ch.name || ch.Name || ch.title || ch.Title || 'Official Link',
          url: ch.url || ch.Url || ch.link || ch.Link || ch.href || '#'
        }));

        const isDirect = rawItem.isDirect !== undefined 
          ? Boolean(rawItem.isDirect) 
          : rawItem.is_direct !== undefined 
            ? Boolean(rawItem.is_direct) 
            : (activeChannels.length <= 1);

        if (isDirect || activeChannels.length <= 1) {
          const targetUrl = directUrl || (activeChannels.length === 1 ? activeChannels[0].url : null);
          if (!targetUrl) return null;
          return {
            platform: platformName,
            title: (activeChannels.length === 1 && activeChannels[0].name) ? activeChannels[0].name : title,
            isMulti: false,
            directUrl: targetUrl,
            channels: []
          };
        }

        return {
          platform: platformName,
          title,
          isMulti: true,
          directUrl: directUrl || activeChannels[0]?.url,
          channels: activeChannels
        };
      })
      .filter(Boolean);
  }, [cmsData?.socialPlatforms]);

  const activeMultiPlatform = processedSocialPlatforms.find(
    p => p.isMulti && p.platform === expandedPlatform
  );

  // DEPLOYED GOOGLE APPS SCRIPT WEB APP ENDPOINT
  const GOOGLE_SCRIPT_URL = 
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_APPS_SCRIPT_URL) ||
    (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_APPS_SCRIPT_URL) ||
    "https://script.google.com/macros/s/AKfycbyguM0mckOxzopums1PpqqBJ1m7IebaaQuVmw88XbtxKmFa7S3ET55fTJyCsolha7xo/exec";

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Full Name
    if (!formData.fullName || !formData.fullName.trim()) {
      setValidationError("⚠️ Please enter your full name.");
      focusField('fullName');
      return;
    }

    // 2. Mobile / WhatsApp Number (Strict Indian 10-Digit Validation: ^[6-9]\d{9}$)
    const rawPhone = (formData.contactNumber || '').trim();
    if (!rawPhone) {
      setValidationError("⚠️ Please enter your mobile / WhatsApp number.");
      focusField('contactNumber');
      return;
    }
    let cleanPhone = rawPhone.replace(/\D/g, '');
    if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      cleanPhone = cleanPhone.slice(2);
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
      cleanPhone = cleanPhone.slice(1);
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setValidationError("⚠️ Please enter a valid 10-digit Indian mobile number.");
      focusField('contactNumber');
      return;
    }

    // 3. Email Address (Strict Validation)
    const cleanEmail = (formData.email || '').trim();
    if (!cleanEmail) {
      setValidationError("⚠️ Please enter your email address.");
      focusField('email');
      return;
    }
    if (!isValidEmail(cleanEmail)) {
      setValidationError("⚠️ Please enter a valid email address.");
      focusField('email');
      return;
    }

    // 4. Current Location
    if (!formData.address || !formData.address.trim()) {
      setValidationError("⚠️ Please enter your current location / city.");
      focusField('address');
      return;
    }

    // 5. How Did You Hear About Us?
    if (!formData.source || formData.source === '') {
      setValidationError("⚠️ Please select how you heard about us.");
      focusField('source');
      return;
    }
    if (formData.source === 'Other' && (!formData.sourceOther || !formData.sourceOther.trim())) {
      setValidationError("⚠️ Please specify how you heard about us.");
      focusField('sourceOther');
      return;
    }

    // 6. Current Status / Background
    if (!formData.background || formData.background === '') {
      setValidationError("⚠️ Please select your current status / background.");
      focusField('background');
      return;
    }
    if (formData.background === 'Others' && (!formData.backgroundOther || !formData.backgroundOther.trim())) {
      setValidationError("⚠️ Please specify your current status / background.");
      focusField('backgroundOther');
      return;
    }

    // 7. I’m Looking For
    if (!formData.lookingFor || formData.lookingFor === '') {
      setValidationError("⚠️ Please select what you are looking for.");
      focusField('lookingFor');
      return;
    }
    if (formData.lookingFor === 'Admission & Mentorship' && !formData.guidanceType) {
      setValidationError("⚠️ Please select what kind of guidance you are looking for.");
      focusField('guidanceType');
      return;
    }
    if (formData.lookingFor === 'Others' && (!formData.lookingForOther || !formData.lookingForOther.trim())) {
      setValidationError("⚠️ Please specify what you are looking for.");
      focusField('lookingForOther');
      return;
    }

    // 8. Preferred Appointment Date
    if (!formData.appointmentDate || !formData.appointmentDate.trim()) {
      setValidationError("⚠️ Please select your preferred appointment date.");
      focusField('appointmentDate');
      return;
    }

    // 9. Preferred Time Slot
    if (!formData.timeSlot || formData.timeSlot === '') {
      setValidationError("⚠️ Please select your preferred time slot.");
      focusField('timeSlot');
      return;
    }

    // 10. Preferred Mode
    if (!formData.appointmentMode || formData.appointmentMode === '') {
      setValidationError("⚠️ Please select your preferred mode of appointment.");
      focusField('appointmentMode');
      return;
    }

    // 11. Message / Query
    if (!formData.message || !formData.message.trim()) {
      setValidationError("⚠️ Please enter your message / query.");
      focusField('message');
      return;
    }

    setValidationError('');
    setInvalidField('');

    // Anti-Spam Honeypot Verification (Silently simulate success for bots without writing to backend)
    if (
      (formData.user_organization_code && formData.user_organization_code.trim() !== '') ||
      (honeypot && honeypot.trim() !== '')
    ) {
      if (isMountedRef.current) {
        setStatus('success');
      }
      return;
    }

    // 3-Second Fill Timer Defense
    const elapsed_ms = Date.now() - formMountedAt.current;
    if (elapsed_ms < 3000) {
      setValidationError("⚠️ Please take a moment to review your details before submitting.");
      return;
    }

    // Client-Side Rate Limiting (3-Second Cooldown)
    if (isRateLimited('UnifiedAppointmentForm', 3000)) {
      setValidationError("⚠️ Please wait a few seconds before submitting again.");
      return;
    }

    setStatus('loading');

    // Combine conditional inputs if applicable
    const finalSource = formData.source === 'Other' && formData.sourceOther?.trim()
      ? `Other: ${formData.sourceOther.trim()}`
      : formData.source;

    const finalBackground = formData.background === 'Others' && formData.backgroundOther?.trim()
      ? `Others: ${formData.backgroundOther.trim()}`
      : formData.background;

    const finalLookingFor = formData.lookingFor === 'Others' && formData.lookingForOther?.trim()
      ? `Others: ${formData.lookingForOther.trim()}`
      : (formData.lookingFor === 'Admission & Mentorship' && formData.guidanceType
          ? `${formData.lookingFor} - ${formData.guidanceType}`
          : formData.lookingFor);

    // Construct sanitized JSON payload mapped to backend keys
    const sanitizedPayload = sanitizePayload({
      formType: "appointment",
      fullName: formData.fullName.trim(),
      contactNumber: cleanPhone,
      email: cleanEmail,
      address: formData.address.trim(),
      source: finalSource,
      background: finalBackground,
      lookingFor: finalLookingFor,
      appointmentDate: formData.appointmentDate,
      timeSlot: formData.timeSlot,
      appointmentMode: formData.appointmentMode,
      message: formData.message.trim(),
      user_organization_code: formData.user_organization_code || '',
      elapsed_ms: elapsed_ms,
      hp_website_check: honeypot
    });

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedPayload),
      });

      if (isMountedRef.current) {
        setStatus('success');
        setHoneypot('');
        setFormData(INITIAL_FORM_STATE);
      }
    } catch (err) {
      console.error("Unified Appointment Form Submission Error:", err);
      if (isMountedRef.current) {
        setStatus('error');
      }
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <section className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8" id="book-appointment">
      
      {/* HEADER PLACEMENT: Centered at top */}
      <div className="space-y-2 border-b-2 border-[#C5A059]/40 pb-6 mb-8 lg:mb-10 text-center max-w-4xl lg:max-w-5xl mx-auto">
        <span className="text-xs uppercase tracking-widest font-serif font-bold text-[#8C3A27] bg-[#8C3A27]/10 px-3.5 py-1 rounded-full inline-block border border-[#8C3A27]/20">
          IAS PREPARATION • CLARITY • GUIDANCE • MENTORSHIP
        </span>
        <h2 className="font-serif-header text-3xl sm:text-4xl font-extrabold text-[#140C08]">
          Start your Journey with<br />
          Akella Raghavendra’s e-Gurukulam for IAS
        </h2>
        <p className="font-serif italic text-base sm:text-lg font-semibold text-[#8C3A27]">
          Whether you seek clarity on your preparation, guidance on courses and mentorship, or support in taking the next step.
        </p>
      </div>

      {/* INNER TWO-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        
        {/* LEFT COLUMN (Form - lg:col-span-7): Resting directly on the page canvas */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <form className="space-y-5 text-left flex-1 flex flex-col justify-between" onSubmit={handleSubmit} noValidate>
              
              {/* Invisible Bot Defense Honeypot Field */}
              <input
                type="text"
                name="user_organization_code"
                value={formData.user_organization_code || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, user_organization_code: e.target.value }))}
                tabIndex={-1}
                autoComplete="off"
                style={{ position: 'absolute', opacity: 0, zIndex: -1, pointerEvents: 'none', left: '-9999px' }}
              />

              {/* Secondary Honeypot Field */}
              <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
                <input
                  type="text"
                  name="hp_website_check"
                  tabIndex="-1"
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {/* 3-STEP APPOINTMENT JOURNEY */}
              <div className="space-y-6">
                
                {/* 01 — ABOUT YOU */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-[#C5A059]/40">
                    <span className="text-sm font-serif font-bold text-[#8C3A27] bg-[#8C3A27]/10 px-2.5 py-0.5 rounded border border-[#8C3A27]/25">
                      01
                    </span>
                    <h3 className="font-serif font-semibold text-lg sm:text-[19px] text-[#140C08]">
                      About You
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* 1. Full Name */}
                    <div className="form-group space-y-1">
                      <label htmlFor="fullName" className="block text-[13.5px] font-sans font-semibold text-[#61291B] mb-1">
                        Full Name *
                      </label>
                      <input 
                        type="text" 
                        id="fullName" 
                        name="fullName"
                        autoComplete="name"
                        value={formData.fullName}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, fullName: e.target.value }));
                          if (invalidField === 'fullName') setInvalidField('');
                          if (validationError) setValidationError('');
                        }}
                        placeholder="Enter your full name" 
                        maxLength={100}
                        className={getInputClass('fullName')}
                      />
                    </div>

                    {/* 2. Mobile / WhatsApp Number */}
                    <div className="form-group space-y-1">
                      <label htmlFor="contactNumber" className="block text-[13.5px] font-sans font-semibold text-[#61291B] mb-1">
                        Mobile / WhatsApp Number *
                      </label>
                      <input 
                        type="tel" 
                        id="contactNumber" 
                        name="contactNumber"
                        autoComplete="tel"
                        value={formData.contactNumber}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, contactNumber: e.target.value }));
                          if (invalidField === 'contactNumber') setInvalidField('');
                          if (validationError) setValidationError('');
                        }}
                        placeholder="10-digit Indian mobile number" 
                        maxLength={10}
                        className={getInputClass('contactNumber')}
                      />
                    </div>

                    {/* 3. Email Address */}
                    <div className="form-group space-y-1">
                      <label htmlFor="email" className="block text-[13.5px] font-sans font-semibold text-[#61291B] mb-1">
                        Email Address *
                      </label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, email: e.target.value }));
                          if (invalidField === 'email') setInvalidField('');
                          if (validationError) setValidationError('');
                        }}
                        placeholder="Enter your email address" 
                        maxLength={100}
                        className={getInputClass('email')}
                      />
                    </div>

                    {/* 4. Current Location */}
                    <div className="form-group space-y-1">
                      <label htmlFor="address" className="block text-[13.5px] font-sans font-semibold text-[#61291B] mb-1">
                        Current Location *
                      </label>
                      <input 
                        type="text" 
                        id="address" 
                        name="address"
                        autoComplete="address-level2"
                        value={formData.address}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, address: e.target.value }));
                          if (invalidField === 'address') setInvalidField('');
                          if (validationError) setValidationError('');
                        }}
                        placeholder="Enter your current city / residential address" 
                        maxLength={150}
                        className={getInputClass('address')}
                      />
                    </div>

                    {/* 5. How Did You Hear About Us? */}
                    <div className={`form-group space-y-1 ${
                      formData.source === 'Other' 
                        ? 'sm:col-span-1' 
                        : (formData.background === 'Others' ? 'sm:col-span-2' : 'sm:col-span-1')
                    }`}>
                      <label htmlFor="source" className="block text-[13.5px] font-sans font-semibold text-[#61291B] mb-1">
                        How Did You Hear About Us? *
                      </label>
                      <select
                        id="source"
                        name="source"
                        value={formData.source}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            source: val,
                            sourceOther: val === 'Other' ? prev.sourceOther : ''
                          }));
                          if (invalidField === 'source' || invalidField === 'sourceOther') setInvalidField('');
                          if (validationError) setValidationError('');
                        }}
                        className={getInputClass('source')}
                      >
                        <option value="" disabled>Select Source</option>
                        <option value="Google Search">Google Search</option>
                        <option value="YouTube">YouTube</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Facebook">Facebook</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Friend / Student Reference">Friend / Student Reference</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* 5b. CONDITIONAL: How Did You Hear -> Please specify */}
                    {formData.source === 'Other' && (
                      <div className="form-group space-y-1 sm:col-span-1 animate-fade-in">
                        <label htmlFor="sourceOther" className="block text-[13.5px] font-sans font-semibold text-[#61291B] mb-1">
                          Please specify *
                        </label>
                        <input 
                          type="text" 
                          id="sourceOther" 
                          name="sourceOther"
                          value={formData.sourceOther}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, sourceOther: e.target.value }));
                            if (invalidField === 'sourceOther') setInvalidField('');
                            if (validationError) setValidationError('');
                          }}
                          placeholder="How did you hear about us?" 
                          maxLength={100}
                          className={getInputClass('sourceOther')}
                        />
                      </div>
                    )}

                    {/* 6. Current Status / Background */}
                    <div className={`form-group space-y-1 ${
                      formData.background === 'Others'
                        ? 'sm:col-span-1'
                        : (formData.source === 'Other' ? 'sm:col-span-2' : 'sm:col-span-1')
                    }`}>
                      <label htmlFor="background" className="block text-[13.5px] font-sans font-semibold text-[#61291B] mb-1">
                        Current Status / Background *
                      </label>
                      <select
                        id="background"
                        name="background"
                        value={formData.background}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            background: val,
                            backgroundOther: val === 'Others' ? prev.backgroundOther : ''
                          }));
                          if (invalidField === 'background' || invalidField === 'backgroundOther') setInvalidField('');
                          if (validationError) setValidationError('');
                        }}
                        className={getInputClass('background')}
                      >
                        <option value="" disabled>Select Background</option>
                        <option value="School Student">School Student</option>
                        <option value="College / University Student">College / University Student</option>
                        <option value="Working Professional">Working Professional</option>
                        <option value="Homemaker">Homemaker</option>
                        <option value="Unemployed">Unemployed</option>
                        <option value="Self-Employed / Business">Self-Employed / Business</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>

                    {/* 6b. CONDITIONAL: Current Status -> Please specify */}
                    {formData.background === 'Others' && (
                      <div className="form-group space-y-1 sm:col-span-1 animate-fade-in">
                        <label htmlFor="backgroundOther" className="block text-[13.5px] font-sans font-semibold text-[#61291B] mb-1">
                          Please specify *
                        </label>
                        <input 
                          type="text" 
                          id="backgroundOther" 
                          name="backgroundOther"
                          value={formData.backgroundOther}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, backgroundOther: e.target.value }));
                            if (invalidField === 'backgroundOther') setInvalidField('');
                            if (validationError) setValidationError('');
                          }}
                          placeholder="Please specify your status / background" 
                          maxLength={100}
                          className={getInputClass('backgroundOther')}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 02 — YOUR REQUIREMENT */}
                <div className="space-y-3.5 pt-2">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-[#C5A059]/40">
                    <span className="text-sm font-serif font-bold text-[#8C3A27] bg-[#8C3A27]/10 px-2.5 py-0.5 rounded border border-[#8C3A27]/25">
                      02
                    </span>
                    <h3 className="font-serif font-semibold text-lg sm:text-[19px] text-[#140C08]">
                      Your Requirement
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* 7. I’m Looking For */}
                    <div className={`form-group space-y-1 ${
                      (formData.lookingFor === 'Admission & Mentorship' || formData.lookingFor === 'Others')
                        ? 'sm:col-span-1'
                        : 'sm:col-span-2'
                    }`}>
                      <label htmlFor="lookingFor" className="block text-[13.5px] font-sans font-semibold text-[#61291B] mb-1">
                        I’m Looking For *
                      </label>
                      <select
                        id="lookingFor"
                        name="lookingFor"
                        value={formData.lookingFor}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            lookingFor: val,
                            guidanceType: val === 'Admission & Mentorship' ? prev.guidanceType : '',
                            lookingForOther: val === 'Others' ? prev.lookingForOther : ''
                          }));
                          if (invalidField === 'lookingFor' || invalidField === 'guidanceType' || invalidField === 'lookingForOther') {
                            setInvalidField('');
                          }
                          if (validationError) setValidationError('');
                        }}
                        className={getInputClass('lookingFor')}
                      >
                        <option value="" disabled>Select What You Are Looking For</option>
                        <option value="Course Information">Course Information</option>
                        <option value="Admission & Mentorship">Admission &amp; Mentorship</option>
                        <option value="Study Material">Study Material</option>
                        <option value="Test Series">Test Series</option>
                        <option value="Exam Related Doubts">Exam Related Doubts</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>

                    {/* 8a. CONDITIONAL FIELD: What kind of guidance are you looking for? */}
                    {formData.lookingFor === 'Admission & Mentorship' && (
                      <div className="form-group space-y-1 sm:col-span-1 animate-fade-in">
                        <label htmlFor="guidanceType" className="block text-[13.5px] font-sans font-semibold text-[#61291B] mb-1">
                          What kind of guidance are you looking for? *
                        </label>
                        <select
                          id="guidanceType"
                          name="guidanceType"
                          value={formData.guidanceType}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, guidanceType: e.target.value }));
                            if (invalidField === 'guidanceType') setInvalidField('');
                            if (validationError) setValidationError('');
                          }}
                          className={getInputClass('guidanceType')}
                        >
                          <option value="" disabled>Select Guidance Type</option>
                          <option value="Mentorship">Mentorship</option>
                          <option value="Coaching">Coaching</option>
                          <option value="Mentoring + Coaching">Mentoring + Coaching</option>
                          <option value="IAS With Life">IAS With Life</option>
                        </select>
                      </div>
                    )}

                    {/* 8b. CONDITIONAL FIELD: Please specify what you are looking for */}
                    {formData.lookingFor === 'Others' && (
                      <div className="form-group space-y-1 sm:col-span-1 animate-fade-in">
                        <label htmlFor="lookingForOther" className="block text-[13.5px] font-sans font-semibold text-[#61291B] mb-1">
                          Please specify what you are looking for *
                        </label>
                        <input 
                          type="text" 
                          id="lookingForOther" 
                          name="lookingForOther"
                          value={formData.lookingForOther}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, lookingForOther: e.target.value }));
                            if (invalidField === 'lookingForOther') setInvalidField('');
                            if (validationError) setValidationError('');
                          }}
                          placeholder="Please specify what you are looking for" 
                          maxLength={150}
                          className={getInputClass('lookingForOther')}
                        />
                      </div>
                    )}

                    {/* 9. Preferred Appointment Date */}
                    <div className="form-group space-y-1 sm:col-span-1">
                      <label htmlFor="appointmentDate" className="block text-[13.5px] font-sans font-semibold text-[#61291B] mb-1">
                        Preferred Appointment Date *
                      </label>
                      <input 
                        type="date" 
                        id="appointmentDate" 
                        name="appointmentDate"
                        value={formData.appointmentDate}
                        min={todayStr}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, appointmentDate: e.target.value }));
                          if (invalidField === 'appointmentDate') setInvalidField('');
                          if (validationError) setValidationError('');
                        }}
                        className={getInputClass('appointmentDate')}
                      />
                    </div>

                    {/* 10. Preferred Time Slot */}
                    <div className="form-group space-y-1 sm:col-span-1">
                      <label htmlFor="timeSlot" className="block text-[13.5px] font-sans font-semibold text-[#61291B] mb-1">
                        Preferred Time Slot *
                      </label>
                      <select 
                        id="timeSlot" 
                        name="timeSlot"
                        value={formData.timeSlot}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, timeSlot: e.target.value }));
                          if (invalidField === 'timeSlot') setInvalidField('');
                          if (validationError) setValidationError('');
                        }}
                        className={getInputClass('timeSlot')}
                      >
                        <option value="" disabled>Select Time Slot</option>
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>

                    {/* 11. Preferred Mode */}
                    <div className="form-group space-y-1 sm:col-span-2">
                      <label htmlFor="appointmentMode" className="block text-[13.5px] font-sans font-semibold text-[#61291B] mb-1">
                        Preferred Mode *
                      </label>
                      <select 
                        id="appointmentMode" 
                        name="appointmentMode"
                        value={formData.appointmentMode}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, appointmentMode: e.target.value }));
                          if (invalidField === 'appointmentMode') setInvalidField('');
                          if (validationError) setValidationError('');
                        }}
                        className={getInputClass('appointmentMode')}
                      >
                        <option value="" disabled>Select Mode of Appointment</option>
                        <option value="One-to-One In Person">One-to-One In Person</option>
                        <option value="Online Video Session WhatsApp / Google Meet">Online Video Session WhatsApp / Google Meet</option>
                        <option value="Telephonic Guidance Call">Telephonic Guidance Call</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 03 — YOUR MESSAGE */}
                <div className="space-y-3.5 pt-2">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-[#C5A059]/40">
                    <span className="text-sm font-serif font-bold text-[#8C3A27] bg-[#8C3A27]/10 px-2.5 py-0.5 rounded border border-[#8C3A27]/25">
                      03
                    </span>
                    <h3 className="font-serif font-semibold text-lg sm:text-[19px] text-[#140C08]">
                      Your Message
                    </h3>
                  </div>

                  {/* 12. Message / Query */}
                  <div className="form-group space-y-1">
                    <label htmlFor="message" className="block text-[13.5px] font-sans font-semibold text-[#61291B] mb-1">
                      Message / Query *
                    </label>
                    <textarea 
                      id="message" 
                      name="message"
                      rows={3} 
                      value={formData.message}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, message: e.target.value }));
                        if (invalidField === 'message') setInvalidField('');
                        if (validationError) setValidationError('');
                      }}
                      placeholder="Tell us about your preparation background, career aspirations, or specific questions you wish to discuss." 
                      maxLength={1000}
                      className={`${getInputClass('message')} resize-none placeholder:text-[#8C7E72] placeholder:text-[14px] placeholder:font-normal`}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* On-Screen Validation Alert Banner */}
              {validationError && (
                <div 
                  role="alert" 
                  className="p-3.5 border-2 border-amber-600 bg-amber-50 rounded-xl text-amber-950 font-bold text-xs flex items-center justify-between shadow-md animate-fade-in my-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base shrink-0">⚠️</span>
                    <span>{validationError.replace('⚠️ ', '')}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setValidationError('')} 
                    className="text-amber-900 hover:text-black font-extrabold px-2 py-1 cursor-pointer text-sm shrink-0"
                    aria-label="Dismiss error"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button 
                  type="submit" 
                  className="btn-terracotta-pill text-sm py-3.5 px-8 disabled:opacity-50 cursor-pointer w-full font-bold"
                  disabled={status === 'loading'}
                >
                  <span className="btn-label">
                    {status === 'loading' ? 'Submitting Appointment Request...' : 'Submit Appointment Request →'}
                  </span>
                </button>
              </div>

              {/* Success Notification */}
              {status === 'success' && (
                <div className="p-4 border-2 border-emerald-600 bg-emerald-50/90 rounded-xl space-y-1 text-left animate-fade-in mt-3">
                  <p className="text-emerald-800 font-bold text-xs sm:text-sm flex items-center gap-1.5">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>✓ Appointment request submitted successfully!</span>
                  </p>
                  <p className="text-[11px] sm:text-xs text-emerald-700 font-sans font-medium pl-6.5">
                    Our academic counseling desk has received your request. We will review your selected schedule and contact you shortly to confirm your session.
                  </p>
                </div>
              )}

              {/* Error Notification */}
              {status === 'error' && (
                <div className="p-4 border-2 border-red-600 bg-red-50/90 rounded-xl text-left animate-fade-in mt-3">
                  <p className="text-red-800 font-bold text-xs">
                    ⚠️ Submission failed. Please verify your details or try again.
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* RIGHT COLUMN (Location & Contact - lg:col-span-5): Vertically centered on desktop */}
          <div className="lg:col-span-5 flex flex-col justify-center lg:self-center gap-6">
            
            {/* Find Us Section */}
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-xl text-[#140C08] border-b border-[#C5A059]/40 pb-2">
                Find Us
              </h3>

              {/* Prominent Google Map Embed */}
              <div className="w-full h-[300px] sm:h-[320px] lg:h-[340px] rounded-xl overflow-hidden shadow-xs border border-[#D5C3B0]">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7615.636604996945!2d78.5266186!3d17.372474!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb98fa75cb13b7%3A0x5097a35e82510f1d!2s9GCH%2BX66%20Akella's%20Residence%2C%208-97%2C%20Road%20No%204%2C%20Vikas%20Nagar%2C%20Moosa%20Ram%20Bagh%2C%20Dilsukhnagar%2C%20Hyderabad%2C%20Telangana%20500060!5e0!3m2!1sen!2sin!4v1790344487460!5m2!1sen!2sin" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="strict-origin-when-cross-origin"
                  title="e-Gurukulam Hyderabad Campus Location"
                ></iframe>
              </div>
            </div>

            {/* Follow Us & Contact Details */}
            <div className="space-y-4">
              {/* Follow Us Section with Individual Platform Downward Web Expansion */}
              <div ref={socialSectionRef} className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#C5A059]/40 pb-1.5">
                  <h4 className="font-serif font-bold text-lg text-[#140C08]">
                    Follow Us
                  </h4>
                  <span className="text-[11px] font-sans font-medium text-[#703020]/75 hidden sm:inline-block">
                    Hover icons to explore channels
                  </span>
                </div>

                {/* 1. All Social Media Platform Icons ALWAYS Visible in a Static Row */}
                <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
                  {processedSocialPlatforms.map((item) => {
                    const isExpanded = expandedPlatform === item.platform;
                    const hasMulti = item.isMulti && item.channels.length > 1;

                    if (!hasMulti) {
                      // Platform with only ONE link -> click directly opens destination
                      return (
                        <a
                          key={item.platform}
                          href={item.directUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={item.title || item.platform}
                          title={item.title || item.platform}
                          className="w-10 h-10 rounded-full bg-[#FAF6EE] border border-[#C5A059]/50 flex items-center justify-center hover:bg-white hover:border-[#8C3A27] hover:scale-110 transition-all duration-200 shadow-xs cursor-pointer"
                        >
                          {getSocialIcon(item.platform, "w-4.5 h-4.5 shrink-0")}
                        </a>
                      );
                    }

                    // Platform with MULTIPLE links -> hover/tap expands downward web
                    return (
                      <div
                        key={item.platform}
                        className="relative"
                        onMouseEnter={() => handlePlatformMouseEnter(item.platform)}
                        onMouseLeave={handlePlatformMouseLeave}
                      >
                        <button
                          type="button"
                          onClick={() => handlePlatformClick(item.platform)}
                          aria-label={`${item.title || item.platform} (${item.channels.length} channels)`}
                          aria-expanded={isExpanded}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs relative ${
                            isExpanded
                              ? 'bg-white border-2 border-[#8C3A27] ring-2 ring-[#D4AF37]/70 scale-110 shadow-md'
                              : 'bg-[#FAF6EE] border border-[#C5A059]/50 hover:bg-white hover:border-[#8C3A27] hover:scale-110'
                          }`}
                        >
                          {getSocialIcon(item.platform, "w-4.5 h-4.5 shrink-0")}
                          {/* Channel count indicator pill */}
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#8C3A27] text-white text-[9px] font-bold flex items-center justify-center border border-white">
                            {item.channels.length}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* 2. Downward Web Expansion Area (In-Flow Layout: naturally pushes contact details DOWN) */}
                <div
                  className={`transition-all duration-300 ease-out overflow-hidden ${
                    activeMultiPlatform
                      ? 'max-h-[260px] opacity-100 mt-2 pt-2 border-t border-[#C5A059]/30'
                      : 'max-h-0 opacity-0 mt-0 pt-0'
                  }`}
                  onMouseEnter={handleWebMouseEnter}
                  onMouseLeave={handlePlatformMouseLeave}
                >
                  {activeMultiPlatform && (
                    <div className="flex flex-col items-center animate-fade-in w-full pb-1">
                      {/* Web Header / Channel Counter */}
                      <div className="flex items-center gap-1.5 pb-1 text-[11px] font-sans font-semibold text-[#8C3A27]">
                        <span>{activeMultiPlatform.title} Channels ({activeMultiPlatform.channels.length})</span>
                        <span className="text-[10px] text-[#8C7E72]">• Select to open</span>
                      </div>

                      {/* SVG Spider-Web Connecting Branches / Fan Spokes */}
                      <div className="w-full max-w-[320px] h-5 relative flex items-center justify-center">
                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 20">
                          {activeMultiPlatform.channels.map((_, cIdx) => {
                            const total = activeMultiPlatform.channels.length;
                            const targetX = total === 1 ? 50 : 16 + (cIdx * (68 / (total - 1)));
                            return (
                              <path
                                key={cIdx}
                                d={`M 50 0 C 50 10, ${targetX} 10, ${targetX} 20`}
                                fill="none"
                                stroke="#C5A059"
                                strokeWidth="1.2"
                                strokeDasharray="2 2"
                                opacity="0.65"
                              />
                            );
                          })}
                          <circle cx="50" cy="1" r="2" fill="#8C3A27" />
                        </svg>
                      </div>

                      {/* Child Links Spreading Downward */}
                      <div className="flex flex-wrap items-start justify-center gap-2.5 sm:gap-3.5 pt-1 w-full">
                        {activeMultiPlatform.channels.map((channel, cIdx) => (
                          <a
                            key={cIdx}
                            href={channel.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/child flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-[#FAF6EE] border border-transparent hover:border-[#D4AF37]/50 transition-all duration-200 cursor-pointer max-w-[100px] text-center"
                            title={channel.name}
                          >
                            <div className="w-9 h-9 rounded-full bg-white shadow-xs border border-[#EAE0D5] group-hover/child:border-[#8C3A27] group-hover/child:ring-2 group-hover/child:ring-[#D4AF37]/40 group-hover/child:scale-110 flex items-center justify-center transition-all duration-200">
                              {getSocialIcon(activeMultiPlatform.platform, "w-4 h-4 shrink-0")}
                            </div>
                            <span className="text-[11px] font-sans font-medium text-[#140C08] group-hover/child:text-[#8C3A27] leading-tight line-clamp-2 transition-colors">
                              {channel.name}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Institutional Contact Details */}
              <div className="pt-3 border-t border-[#C5A059]/30 space-y-3 font-sans text-xs sm:text-[13px] text-[#2A1E18]">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#703020] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    Akella's Residence, 8-97, Road No 4, Vikas Nagar, Dilsukhnagar, Hyderabad, Telangana 500060
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#703020] shrink-0" />
                  <span className="space-x-2">
                    <a href="tel:+918897826108" className="hover:text-[#703020] font-semibold transition-colors">+91 8897826108</a>
                    <span>/</span>
                    <a href="tel:+919912211109" className="hover:text-[#703020] font-semibold transition-colors">+91 9912211109</a>
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#703020] shrink-0" />
                  <a href="mailto:akellas.egurukulamforias@gmail.com" className="hover:text-[#703020] font-semibold transition-colors">
                    akellas.egurukulamforias@gmail.com
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>
    );
  }

  export default AppointmentSection;
