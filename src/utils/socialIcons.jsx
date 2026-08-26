// src/utils/socialIcons.jsx
// Dynamic Smart Icon Resolver for Social Platforms with Authentic Brand Colors & Class Merging
import React from 'react';
import { 
  FaWhatsapp, 
  FaYoutube, 
  FaTelegramPlane, 
  FaInstagram, 
  FaFacebookF, 
  FaLinkedinIn, 
  FaPhoneAlt, 
  FaGooglePlay 
} from "react-icons/fa";
import { RiTwitterXFill } from "react-icons/ri";
import { FiGlobe } from "react-icons/fi";

const mergeClasses = (brandColorClass, defaultSizeClass, customClass) => {
  if (!customClass) return `${defaultSizeClass} ${brandColorClass} transition-colors`;
  return `${defaultSizeClass} ${brandColorClass} ${customClass} transition-colors`.trim();
};

export const getSocialIcon = (platformName, customClass = "") => {
  if (!platformName) return <FiGlobe className={mergeClasses("text-[#D4AF37]", "w-4 h-4", customClass)} />;
  
  const key = platformName.toString().toLowerCase().replace(/[^a-z0-9]/g, "");

  // 1. WhatsApp -> Vivid Official Green (#25D366)
  if (key.includes("whatsapp")) {
    return <FaWhatsapp className={mergeClasses("text-[#25D366]", "w-4 h-4", customClass)} />;
  }

  // 2. Telegram -> Official Sky Blue (#229ED9)
  if (key.includes("telegram") || key.includes("tme")) {
    return <FaTelegramPlane className={mergeClasses("text-[#229ED9]", "w-4 h-4", customClass)} />;
  }

  // 3. YouTube -> Vivid Official Red (#FF0000)
  if (key.includes("youtube") || key.includes("yt")) {
    return <FaYoutube className={mergeClasses("text-[#FF0000]", "w-4 h-4", customClass)} />;
  }

  // 4. Instagram -> Official Pinkish-Red (#E1306C)
  if (key.includes("instagram") || key.includes("insta")) {
    return <FaInstagram className={mergeClasses("text-[#E1306C]", "w-4 h-4", customClass)} />;
  }

  // 5. Facebook -> Official Blue (#1877F2)
  if (key.includes("facebook") || key.includes("fb")) {
    return <FaFacebookF className={mergeClasses("text-[#1877F2]", "w-3.5 h-3.5", customClass)} />;
  }

  // 6. X (Twitter) -> Official Charcoal/Black (#111111)
  if (key.includes("twitter") || key === "x" || key.includes("twitterx")) {
    return <RiTwitterXFill className={mergeClasses("text-[#111111]", "w-3.5 h-3.5", customClass)} />;
  }

  // 7. LinkedIn -> Official Blue (#0A66C2)
  if (key.includes("linkedin")) {
    return <FaLinkedinIn className={mergeClasses("text-[#0A66C2]", "w-3.5 h-3.5", customClass)} />;
  }

  // 8. Google Play / Apps -> Official Play Blue (#0086F4)
  if (key.includes("playstore") || key.includes("googleplay") || key.includes("app") || key.includes("store")) {
    return <FaGooglePlay className={mergeClasses("text-[#0086F4]", "w-3.5 h-3.5", customClass)} />;
  }

  // 9. Direct Call / Phone -> Heritage Maroon (#6C1D18)
  if (key.includes("phone") || key.includes("call") || key.includes("directcall") || key === "tel" || key === "telephone") {
    return <FaPhoneAlt className={mergeClasses("text-[#6C1D18]", "w-3.5 h-3.5", customClass)} />;
  }

  return <FiGlobe className={mergeClasses("text-[#D4AF37]", "w-4 h-4", customClass)} />;
};
