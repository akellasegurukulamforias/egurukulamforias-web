import React, { useState } from 'react';
import { 
  UserCheck, 
  Shield, 
  BookOpen, 
  Target, 
  Sparkles, 
  Flame, 
  Check, 
  Compass as CompassIcon
} from 'lucide-react';

export default function CorePillarsBento({ navigate }) {
  // Card 3 (Discipline): Interactive Streak State
  const [streakDays, setStreakDays] = useState([
    { day: 'S', active: true },
    { day: 'M', active: true },
    { day: 'T', active: true },
    { day: 'W', active: true },
    { day: 'T', active: true },
    { day: 'F', active: true },
    { day: 'S', active: true },
  ]);

  const toggleDay = (idx) => {
    setStreakDays(prev => prev.map((item, i) => i === idx ? { ...item, active: !item.active } : item));
  };

  const activeStreakCount = streakDays.filter(d => d.active).length;

  // Card 4 (Consistency): Interactive Schedule Matrix State
  const [scheduleTasks, setScheduleTasks] = useState([
    { id: 1, text: '06:00 AM • Editorial Analysis', done: true },
    { id: 2, text: '10:00 AM • GS II Polity Practice', done: true },
    { id: 3, text: '03:00 PM • Ethics Case Study', done: false },
    { id: 4, text: '08:00 PM • Mentor Feedback Review', done: true },
  ]);

  const toggleTask = (id) => {
    setScheduleTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const completedCount = scheduleTasks.filter(t => t.done).length;
  const progressPercent = Math.round((completedCount / scheduleTasks.length) * 100);

  // Card 5 (Wisdom): Interactive Flowchart Active Node
  const [activeNode, setActiveNode] = useState(1);

  const nodes = [
    { id: 1, title: 'Reflection', desc: 'Deep analytical questioning of static concepts' },
    { id: 2, title: 'Insight', desc: 'Synthesizing interdisciplinary GS perspectives' },
    { id: 3, title: 'Experience', desc: 'Transforming knowledge into exam precision' },
  ];

  // Card 6 (Clarity): Interactive Maze Hover Path State
  const [mazeHovered, setMazeHovered] = useState(false);

  return (
    <section className="bg-[#FAF5EE] py-14 md:py-20 px-4 sm:px-6 lg:px-8 border-y border-[#E8D3B8]">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* SECTION HEADER */}
        <div className="text-center space-y-3">
          <div>
            <span className="eyebrow-badge">
              OUR CORE FOUNDATION
            </span>
          </div>
          <h2 className="font-serif-header text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A1A1A]">
            Core Pillars of e-Gurukulam
          </h2>
          <p className="text-xs sm:text-sm text-[#2A1E18] font-sans max-w-xl mx-auto font-medium leading-relaxed">
            Six foundational principles guiding our mentorship model, daily preparation rhythm, and administrative transformation.
          </p>
        </div>

        {/* BENTO GRID CONTAINER */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* ========================================================================= */}
          {/* TOP ROW: CARD 1 - MENTORSHIP (Hero Card - 50% Width / 6 Cols) */}
          {/* ========================================================================= */}
          <div 
            className="lg:col-span-6 rounded-[20px] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-300 border border-[#E8D3B8]"
            style={{ background: 'linear-gradient(135deg, #FAF2E8 0%, #F5E5D3 100%)' }}
          >
            {/* Background Vector Art */}
            <div className="absolute right-0 bottom-0 w-64 h-64 opacity-25 group-hover:opacity-35 transition-opacity duration-300 pointer-events-none -mr-6 -mb-6">
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#8C3A27]">
                <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M70 140 C70 110, 90 90, 100 90 C110 90, 130 110, 130 140" fill="currentColor" opacity="0.8" />
                <circle cx="100" cy="70" r="16" fill="currentColor" opacity="0.9" />
                <path d="M120 150 C120 130, 135 115, 145 115 C155 115, 170 130, 170 150" fill="currentColor" opacity="0.6" />
                <circle cx="145" cy="100" r="12" fill="currentColor" opacity="0.7" />
                <path d="M90 70 L140 100" stroke="#C5A059" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>

            <div className="space-y-5 relative z-10">
              <div className="w-10 h-10 rounded-full bg-[#8C3A27]/10 border border-[#8C3A27]/20 flex items-center justify-center text-[#8C3A27]">
                <UserCheck className="w-5 h-5" />
              </div>

              <div className="space-y-2">
                <h3 className="font-serif-header text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
                  Mentorship
                </h3>
                <p className="text-xs sm:text-sm text-[#2A1E18] leading-relaxed font-sans font-medium max-w-md">
                  Learn through direct guidance, personal reflection, and line-by-line feedback from Akella Sir.
                </p>
              </div>

              <div className="pt-2">
                <blockquote className="font-serif italic text-xl sm:text-2xl font-bold text-[#8C3A27] tracking-wide border-l-4 border-[#8C3A27] pl-4 py-1">
                  “GUIDANCE LIGHTS THE PATH”
                </blockquote>
              </div>
            </div>
          </div>


          {/* ========================================================================= */}
          {/* TOP ROW: CARD 2 - PURPOSE (Hero Card - 50% Width / 6 Cols) */}
          {/* ========================================================================= */}
          <div 
            className="lg:col-span-6 rounded-[20px] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-300 border border-[#E8D3B8]"
            style={{ background: 'linear-gradient(135deg, #F9E5D0 0%, #E89C6C 50%, #9B4A28 100%)' }}
          >
            {/* Background Vector Art */}
            <div className="absolute right-0 bottom-0 w-72 h-72 opacity-30 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none -mr-8 -mb-8">
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#FFFDF8]">
                <circle cx="150" cy="50" r="35" fill="currentColor" opacity="0.4" />
                <path d="M0 160 Q 50 140, 100 155 T 200 150 L 200 200 L 0 200 Z" fill="currentColor" opacity="0.3" />
                <path d="M120 160 L140 80 L160 80 L180 160 Z" fill="currentColor" opacity="0.6" />
                <path d="M150 80 L100 40 L200 40 Z" fill="#FFFDF8" opacity="0.7" />
                <circle cx="150" cy="170" r="14" fill="#FFFDF8" opacity="0.9" />
              </svg>
            </div>

            <div className="space-y-5 relative z-10 text-[#FFFDF8]">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs border border-white/40 flex items-center justify-center text-white">
                <Shield className="w-5 h-5" />
              </div>

              <div className="space-y-2">
                <h3 className="font-serif-header text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Purpose
                </h3>
                <p className="text-xs sm:text-sm text-white/95 leading-relaxed font-sans font-medium max-w-md">
                  Prepare not only for an examination, but for administrative responsibility and constitutional duty.
                </p>
              </div>

              <div className="pt-2">
                <blockquote className="font-serif italic text-xl sm:text-2xl font-bold text-white tracking-wide border-l-4 border-white pl-4 py-1">
                  “FIND YOUR CALLING”
                </blockquote>
              </div>
            </div>
          </div>


          {/* ========================================================================= */}
          {/* BOTTOM ROW: CARD 3 - DISCIPLINE (Micro-Card - 25% Width / 3 Cols) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 rounded-[20px] p-6 bg-[#FFFDF8] border border-[#E8D3B8] shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              
              <div className="w-9 h-9 rounded-full bg-[#8C3A27]/10 border border-[#8C3A27]/20 flex items-center justify-center text-[#8C3A27]">
                <BookOpen className="w-4 h-4" />
              </div>

              <div>
                <h4 className="font-serif-header text-xl font-bold text-[#1A1A1A]">
                  Discipline
                </h4>
                <p className="text-[11px] text-[#2A1E18]/80 font-sans mt-0.5 font-medium">
                  Sustained Excellence
                </p>
              </div>

              <p className="text-xs text-[#2A1E18] leading-relaxed font-sans font-medium">
                Build habits that sustain long-term excellence. Structured timetables and daily routine.
              </p>

              {/* STYLIZED DAILY STREAK WIDGET */}
              <div className="p-3.5 rounded-xl bg-[#FAF5EE] border border-[#E8D3B8] space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-serif font-bold text-[#8C3A27]">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                    Daily Sadhana Streak
                  </span>
                  <span className="text-emerald-700 font-extrabold">{activeStreakCount}/7 Days</span>
                </div>

                <div className="flex items-center justify-between gap-1 pt-1">
                  {streakDays.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => toggleDay(idx)}
                      title={`Toggle ${item.day}`}
                      className={`w-7 h-8 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
                        item.active 
                          ? 'bg-gradient-to-b from-[#8C3A27] to-[#732D1B] text-white shadow-xs scale-105' 
                          : 'bg-[#EADCCF]/50 text-[#2A1E18]/50 hover:bg-[#EADCCF]'
                      }`}
                    >
                      <span className="text-[9px] font-bold font-serif">{item.day}</span>
                      <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${item.active ? 'bg-amber-400' : 'bg-transparent'}`} />
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>


          {/* ========================================================================= */}
          {/* BOTTOM ROW: CARD 4 - CONSISTENCY (Micro-Card - 25% Width / 3 Cols) */}
          {/* ========================================================================= */}
          <div 
            className="lg:col-span-3 rounded-[20px] p-6 text-[#1A1A1A] border border-[#E8D3B8] shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
            style={{ background: 'linear-gradient(135deg, #FFF9F2 0%, #F9ECE0 100%)' }}
          >
            <div className="space-y-4">
              
              <div className="w-9 h-9 rounded-full bg-[#8C3A27]/10 border border-[#8C3A27]/20 flex items-center justify-center text-[#8C3A27]">
                <Target className="w-4 h-4" />
              </div>

              <div>
                <h4 className="font-serif-header text-xl font-bold text-[#1A1A1A]">
                  Consistency
                </h4>
                <p className="text-[11px] text-[#2A1E18]/80 font-sans mt-0.5 font-medium">
                  Continuous Progress
                </p>
              </div>

              <p className="text-xs text-[#2A1E18] leading-relaxed font-sans font-medium">
                Turn daily effort into continuous progress. Daily answer evaluation and current affairs.
              </p>

              {/* SCHEDULE CHECK-OFF MATRIX UI CARD */}
              <div className="p-3.5 rounded-xl bg-[#FFFDF8] border border-[#E8D3B8] space-y-2">
                <div className="flex items-center justify-between text-[11px] font-serif font-bold text-[#8C3A27]">
                  <span>Daily Schedule Matrix</span>
                  <span className="text-xs font-extrabold text-[#8C3A27]">{progressPercent}%</span>
                </div>

                <div className="space-y-1.5 text-[11px] font-sans">
                  {scheduleTasks.map((t) => (
                    <div 
                      key={t.id} 
                      onClick={() => toggleTask(t.id)}
                      className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-colors ${
                        t.done ? 'bg-emerald-50 text-emerald-950 border border-emerald-200' : 'bg-[#FAF5EE] text-[#2A1E18]'
                      }`}
                    >
                      <span className="text-[10.5px] font-medium">{t.text}</span>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                        t.done ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-[#D5C3B0] bg-white'
                      }`}>
                        {t.done && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>


          {/* ========================================================================= */}
          {/* BOTTOM ROW: CARD 5 - WISDOM (Micro-Card - 25% Width / 3 Cols) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 rounded-[20px] p-6 bg-[#FFFDF8] border border-[#E8D3B8] shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              
              <div className="w-9 h-9 rounded-full bg-[#8C3A27]/10 border border-[#8C3A27]/20 flex items-center justify-center text-[#8C3A27]">
                <Sparkles className="w-4 h-4" />
              </div>

              <div>
                <h4 className="font-serif-header text-xl font-bold text-[#1A1A1A]">
                  Wisdom
                </h4>
                <p className="text-[11px] text-[#2A1E18]/80 font-sans mt-0.5 font-medium">
                  Analytical Mastery
                </p>
              </div>

              <p className="text-xs text-[#2A1E18] leading-relaxed font-sans font-medium">
                Master concepts beyond simple memorization. Interdisciplinary synthesis across governance.
              </p>

              {/* FLOWCHART NODE DIAGRAM */}
              <div className="p-3.5 rounded-xl bg-[#FAF5EE] border border-[#E8D3B8] space-y-2.5">
                <div className="text-[11px] font-serif font-bold text-[#8C3A27]">
                  Synthesis Flowchart
                </div>

                <div className="flex items-center justify-between gap-1 text-center">
                  {nodes.map((n, idx) => (
                    <React.Fragment key={n.id}>
                      <button
                        onClick={() => setActiveNode(n.id)}
                        className={`flex-1 p-1.5 rounded-lg text-[10px] font-serif font-bold transition-all cursor-pointer ${
                          activeNode === n.id 
                            ? 'bg-[#8C3A27] text-white shadow-xs scale-105' 
                            : 'bg-[#FFFDF8] text-[#1A1A1A] border border-[#E8D3B8] hover:border-[#8C3A27]'
                        }`}
                      >
                        {n.title}
                      </button>
                      {idx < nodes.length - 1 && (
                        <span className="text-[#C5A059] font-bold text-xs">➔</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="p-2 rounded bg-[#FFFDF8] border border-[#E8D3B8] text-[10.5px] text-[#2A1E18] font-sans italic text-center">
                  "{nodes.find(n => n.id === activeNode)?.desc}"
                </div>
              </div>

            </div>
          </div>


          {/* ========================================================================= */}
          {/* BOTTOM ROW: CARD 6 - CLARITY (Micro-Card - 25% Width / 3 Cols) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 rounded-[20px] p-6 bg-[#FFFFFF] border border-[#E8D3B8] shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              
              <div className="w-9 h-9 rounded-full bg-[#8C3A27]/10 border border-[#8C3A27]/20 flex items-center justify-center text-[#8C3A27]">
                <CompassIcon className="w-4 h-4" />
              </div>

              <div>
                <h4 className="font-serif-header text-xl font-bold text-[#1A1A1A]">
                  Clarity
                </h4>
                <p className="text-[11px] text-[#2A1E18]/80 font-sans mt-0.5 font-medium">
                  Conceptual Depth
                </p>
              </div>

              <p className="text-xs text-[#2A1E18] leading-relaxed font-sans font-medium">
                Understand what to learn, why it matters, and how to apply it cleanly across GS Papers I to IV.
              </p>

              {/* EMBOSSED MAZE / LABYRINTH VECTOR GRAPHIC */}
              <div 
                className="p-3.5 rounded-xl bg-[#FAF5EE] border border-[#E8D3B8] flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all"
                onMouseEnter={() => setMazeHovered(true)}
                onMouseLeave={() => setMazeHovered(false)}
              >
                <div className="w-full max-w-[140px] h-20 relative flex items-center justify-center">
                  <svg viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <rect x="5" y="5" width="150" height="70" rx="8" stroke="#D5C3B0" strokeWidth="2" fill="none" />
                    <rect x="20" y="18" width="120" height="44" rx="6" stroke="#D5C3B0" strokeWidth="1.5" fill="none" />
                    <rect x="35" y="30" width="90" height="20" rx="4" stroke="#D5C3B0" strokeWidth="1.5" fill="none" />
                    
                    <path 
                      d="M 10 40 L 35 40 L 35 30 L 80 30" 
                      stroke={mazeHovered ? "#8C3A27" : "#C5A059"} 
                      strokeWidth={mazeHovered ? "3.5" : "2.5"} 
                      strokeLinecap="round"
                      className="transition-all duration-300"
                    />
                    
                    <circle cx="80" cy="30" r="4" fill="#8C3A27" className={mazeHovered ? "animate-ping" : ""} />
                    <circle cx="80" cy="30" r="3" fill="#C5A059" />
                  </svg>
                </div>
                <span className="text-[10.5px] font-serif font-bold text-[#8C3A27]">
                  {mazeHovered ? "Path Illuminated ➔ Center Clarity" : "Hover to Illuminate Path"}
                </span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
