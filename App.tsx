// @ts-ignore
import MetroNexusLogo from './metro nexus logo.jpeg';
import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { 
  Search, Compass, Sparkles, Leaf, ArrowRight, X, Shield, 
  Cpu, Palette, Accessibility, Clock, Users, Zap, ArrowRightLeft,
  Map as MapIcon, Train, ChevronRight, Activity, Ticket, RefreshCw,
  Timer, Cloud, Menu, Bell
} from 'lucide-react';

// ==========================================
// DEPLOYMENT ASSET IMPORTS
// ==========================================
// TODO:// Replace placeholder with:// import MetroNexusLogo from "./assets/MetroNexusLogo.png";// once the logo file has been added to the project.

// Inline SVG Icon replacement that is clean, secure, responsive, and works identically inside existing containers
const MetroNexusPlaceholderLogo = () => (
  <img 
    src={MetroNexusLogo} 
    alt="Logo" 
    className="w-full h-full object-contain" 
  />
);

const MetroNexusFullPlaceholderLogo = () => (
  <div className="flex items-center gap-3">
    <div className="w-[34px] h-[34px]">
      <MetroNexusPlaceholderLogo />
    </div>
    <span className="font-display text-2xl font-extrabold tracking-tight text-gray-900">
      Metro<span className="text-blue-600">Nexus</span>
    </span>
  </div>
);

// ==========================================
// 1. TYPES & MOCK DATA
// ==========================================

type CursorState = 'default' | 'hover' | 'magnetic' | 'drag';

interface Station {
  id: string;
  name: string;
  districtId: string;
  cx: number;
  cy: number;
  isInterchange?: boolean;
  desc: string;
  labelPos?: 'top' | 'bottom' | 'left' | 'right' | 'bottom-right';
  traffic: number;
}

interface MetroLine {
  id: string;
  name: string;
  color: string;
  districtId: string;
  path: string;
  stations: string[];
}

const DISTRICT_DETAILS = {
  innovation: { 
    id: 'innovation', name: 'Innovation', color: '#2563EB', bg: '#EFF6FF', 
    icon: Cpu, desc: 'AI optimizes flow in real-time. Minimal geometric architecture and efficiency-focused transit.',
    stats: { energy: '18.6 MWh', crowd: 'Low', speed: '+14%' }
  },
  nature: { 
    id: 'nature', name: 'Nature', color: '#16A34A', bg: '#F0FDF4', 
    icon: Leaf, desc: 'Living walls and rainwater channels. AI optimizes sustainability and regulates ambient temperature.',
    stats: { energy: '24.2 MWh', crowd: 'Medium', speed: '+5%' }
  },
  culture: { 
    id: 'culture', name: 'Culture', color: '#D97706', bg: '#FFFBEB', 
    icon: Palette, desc: 'Warm amber lighting and public art. Transit rhythms adapt to community events and festivals.',
    stats: { energy: '12.4 MWh', crowd: 'High', speed: 'Steady' }
  },
  accessibility: { 
    id: 'accessibility', name: 'Accessibility', color: '#8B5CF6', bg: '#F5F3FF', 
    icon: Accessibility, desc: 'High-contrast navigation, guided pathways, and priority lift access for seamless mobility.',
    stats: { energy: '14.1 MWh', crowd: 'Low', speed: 'Regulated' }
  }
};

const MOCK_STATIONS: Station[] = [
  { id: 's1', name: 'Nexus Central', districtId: 'innovation', cx: 500, cy: 375, isInterchange: true, labelPos: 'bottom-right', traffic: 88, desc: 'The beating heart of the network. AI manages millions of connections here.' },
  { id: 's2', name: 'Tech Park', districtId: 'innovation', cx: 200, cy: 200, labelPos: 'top', traffic: 54, desc: 'Research hub featuring kinetic walkways and advanced robotics labs.' },
  { id: 's3', name: 'Quantum Core', districtId: 'innovation', cx: 800, cy: 550, labelPos: 'right', traffic: 42, desc: 'High-speed transit interchange powered entirely by renewable energy grids.' },
  { id: 's4', name: 'Botanical Gardens', districtId: 'nature', cx: 350, cy: 450, labelPos: 'left', traffic: 31, desc: 'Lush living walls filter air naturally, keeping the station carbon-negative.' },
  { id: 's5', name: 'Eco Hub', districtId: 'nature', cx: 200, cy: 550, labelPos: 'bottom', traffic: 25, desc: 'Solar canopies and rainwater harvesting systems support local ecosystems.' },
  { id: 's6', name: 'Heritage Square', districtId: 'culture', cx: 650, cy: 200, labelPos: 'top', traffic: 68, desc: 'Timeless architecture meets modern transit. Features rotating digital art.' },
  { id: 's7', name: 'Artisan Quarter', districtId: 'culture', cx: 850, cy: 250, labelPos: 'bottom', traffic: 72, desc: 'Warm ambient lighting adapts to the rhythm of local cultural festivals.' },
  { id: 's8', name: 'Mobility Hub', districtId: 'accessibility', cx: 500, cy: 150, labelPos: 'left', traffic: 20, desc: 'Zero-step boarding and real-time auditory guidance for visually impaired.' },
  { id: 's9', name: 'Care Center', districtId: 'accessibility', cx: 500, cy: 600, labelPos: 'right', traffic: 15, desc: 'Priority medical transit access and universal design principles throughout.' },
];

const MOCK_LINES: MetroLine[] = [
  { id: 'l1', name: 'Innovation Line', districtId: 'innovation', color: '#2563EB', path: 'M 200 200 Q 350 200 500 375 Q 650 550 800 550', stations: ['s2', 's1', 's3'] },
  { id: 'l2', name: 'Nature Line', districtId: 'nature', color: '#16A34A', path: 'M 200 550 Q 275 500 350 450 Q 425 412 500 375', stations: ['s5', 's4', 's1'] },
  { id: 'l3', name: 'Culture Line', districtId: 'culture', color: '#D97706', path: 'M 500 375 Q 575 287 650 200 Q 750 225 850 250', stations: ['s1', 's6', 's7'] },
  { id: 'l4', name: 'Access Line', districtId: 'accessibility', color: '#8B5CF6', path: 'M 500 150 L 500 600', stations: ['s8', 's1', 's9'] },
];

// ==========================================
// 2. CONTEXT & STATE MANAGEMENT (OPTIMIZED)
// ==========================================

const MetroStateContext = createContext<{
  cursorState: CursorState;
  activeDistrict: string | null;
  hoveredStation: string | null;
  originStation: string;
  destinationStation: string;
}>({
  cursorState: 'default',
  activeDistrict: null,
  hoveredStation: null,
  originStation: 's1',
  destinationStation: 's5',
});

const MetroActionsContext = createContext<{
  setCursorState: (state: CursorState) => void;
  setActiveDistrict: (id: string | null) => void;
  setHoveredStation: (id: string | null) => void;
  setOriginStation: (id: string) => void;
  setDestinationStation: (id: string) => void;
}>({
  setCursorState: () => {},
  setActiveDistrict: () => {},
  setHoveredStation: () => {},
  setOriginStation: () => {},
  setDestinationStation: () => {},
});

const useMetro = () => {
  const state = useContext(MetroStateContext);
  const actions = useContext(MetroActionsContext);
  return { ...state, ...actions };
};

const useMetroActions = () => useContext(MetroActionsContext);

// ==========================================
// 3. PRIMITIVES & HELPERS (HOISTED)
// ==========================================

function AnimatedNumber({ value, suffix = '' }: { value: number, suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const interval = 16;
    const step = (value / duration) * interval;
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); } 
      else { setDisplay(start); }
    }, interval);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display.toFixed(display % 1 === 0 ? 0 : 1)}{suffix}</span>;
}

// ==========================================
// 4. MOTION SYSTEM & CONFIG
// ==========================================

const springPhysical = { type: "spring", damping: 30, stiffness: 200, mass: 0.8 };
const easeComponent = [0.25, 1, 0.5, 1]; 
const easeMicro = [0.25, 1, 0.5, 1]as any; 

const animations = {
  hoverLift: { y: -2, scale: 1.02, transition: springPhysical },
  hoverCardLift: { y: -6, scale: 1.01, transition: springPhysical }, 
  tapCompress: { scale: 0.96, transition: springPhysical },
  fadeUpIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeComponent } }
  }
};

// ==========================================
// 4. GLOBAL STYLES & PRIMITIVES
// ==========================================

const GlobalStyles = () => (
  <style dangerouslySetInnerHTML={{__html: `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@400;500;600;700&family=Space+Grotesk:wght@700&display=swap');
    
    :root {
      --bg-warm-white: #FAFAF8;
      --text-primary: #111827;
      --text-secondary: #6B7280;
    }

    body {
      background-color: var(--bg-warm-white);
      color: var(--text-primary);
      font-family: 'Inter', sans-serif;
      overflow-x: hidden;
      cursor: none; 
      -webkit-font-smoothing: antialiased;
      scroll-behavior: smooth;
    }

    @media (pointer: coarse) { body { cursor: auto; } }

    h1, h2, h3, h4, h5, h6, .font-heading { font-family: 'Manrope', sans-serif; }
    .font-display { font-family: 'Space Grotesk', sans-serif; }

    .glass-panel, .liquid-glass {
      background: rgba(255, 255, 255, 0.55);
      backdrop-filter: blur(40px);
      -webkit-backdrop-filter: blur(40px);
      border: 1px solid rgba(255, 255, 255, 0.8);
      box-shadow: 
        0 24px 48px -12px rgba(0, 0, 0, 0.08),
        inset 0 0 0 1px rgba(255, 255, 255, 0.4),
        inset 0 24px 32px -12px rgba(255, 255, 255, 0.6);
      border-radius: 24px;
    }
    
    .vision-button-primary {
      background: linear-gradient(180deg, #3B82F6 0%, #2563EB 100%);
      box-shadow: 
        0 4px 12px rgba(37, 99, 235, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.3),
        inset 0 -2px 0 rgba(0, 0, 0, 0.1);
      color: white;
      border: none;
    }

    .vision-button-secondary {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.9);
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.04),
        inset 0 1px 0 rgba(255, 255, 255, 1);
      color: #111827;
    }
    
    ::-webkit-scrollbar { width: 0px; background: transparent; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; background: transparent; }
    .custom-scrollbar-track { background: transparent; }
    .custom-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

    .ticket-pass { perspective: 1200px; }
    .ticket-inner { transform-style: preserve-3d; transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1); }
    .ticket-flipped { transform: rotateY(180deg); }
    .ticket-face { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
    .ticket-back { transform: rotateY(180deg); }
  `}} />
);

const CustomCursor = () => {
  const { cursorState } = useContext(MetroStateContext);
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => { mouseX.set(e.clientX); mouseY.set(e.clientY); };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [mouseX, mouseY]);

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return null;

  let size = 14; let opacity = 0.9;
  if (cursorState === 'hover') { size = 20; opacity = 1; } 
  else if (cursorState === 'magnetic') { size = 24; opacity = 0.7; }

  return (
    <motion.div
      className="fixed top-0 left-0 rounded-full bg-blue-600 pointer-events-none z-[9999]"
      style={{ x: cursorX, y: cursorY, translateX: '-50%', translateY: '-50%', width: size, height: size, opacity }}
      animate={{ width: size, height: size, opacity }}
      transition={{ duration: 0.15, ease: easeMicro }}
    />
  );
};

const LiquidRipple = () => {
  const [ripples, setRipples] = useState<{ x: number, y: number, id: number }[]>([]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('button')) return;
      if ((e.target as HTMLElement).closest('select')) return;
      const newRipple = { x: e.clientX, y: e.clientY, id: Date.now() };
      setRipples(prev => [...prev, newRipple]);
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== newRipple.id)), 700);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            initial={{ width: 12, height: 12, opacity: 0.7, borderWidth: 3 }}
            animate={{ width: 320, height: 320, opacity: 0, borderWidth: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: easeMicro }}
            className="absolute rounded-full border-blue-500/40 bg-blue-500/15"
            style={{ left: ripple.x, top: ripple.y, translateX: '-50%', translateY: '-50%' }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// --- Core UI Components ---
const Button = ({ variant = 'primary', children, className = '', ...props }: any) => {
  const { setCursorState } = useMetroActions();
  const baseClasses = "px-6 py-3.5 rounded-[16px] font-heading font-semibold text-[16px] flex items-center justify-center transition-all duration-300 outline-none";
  const vClass = variant === 'primary' ? 'vision-button-primary' : 'vision-button-secondary hover:bg-white';

  return (
    <motion.button
      className={`${baseClasses} ${vClass} ${className}`}
      whileHover={animations.hoverLift}
      whileTap={animations.tapCompress}
      onMouseEnter={() => setCursorState('hover')}
      onMouseLeave={() => setCursorState('default')}
      {...props}
    >
      {children}
    </motion.button>
  );
};

const Card = ({ children, className = '' }: any) => {
  const { setCursorState } = useMetroActions();
  return (
    <motion.div 
      whileHover={animations.hoverCardLift}
      onMouseEnter={() => setCursorState('hover')}
      onMouseLeave={() => setCursorState('default')}
      className={`bg-white rounded-[20px] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 transition-colors hover:bg-gray-50/50 ${className}`}
    >
      {children}
    </motion.div>
  );
};

const Badge = ({ children, color = 'blue' }: any) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[color as keyof typeof colors]}`}>
      {children}
    </span>
  );
};

// ==========================================
// 5. NAVIGATION (MEMOIZED & DECOUPLED FROM SCROLL/STATE RERENDERS)
// ==========================================

interface NotificationItem {
  id: string;
  timeOffsetMin: number; // minutes ago
  type: 'green' | 'yellow' | 'purple';
  message: string;
}

const NavigationBar = React.memo(() => {
  const { setCursorState, setOriginStation } = useMetroActions();
  const { originStation } = useContext(MetroStateContext);
  const [activeItem, setActiveItem] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Coordinate styles target for the single mounted active underline
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const navContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Notification States
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isFocusDropdownOpen, setIsFocusDropdownOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const notifPanelRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'map', label: 'Map' },
    { id: 'districts', label: 'Districts' },
    { id: 'ai', label: 'AI Features' },
    { id: 'sustainability', label: 'Sustainability' }
  ];

  // Initialize notifications with backdated offsets relative to "now"
  useEffect(() => {
    const initialNotifs: NotificationItem[] = [
      { id: 'notif-1', timeOffsetMin: 12, type: 'green', message: "Innovation Line operating normally." },
      { id: 'notif-2', timeOffsetMin: 28, type: 'yellow', message: "Passenger flow increasing at Nexus Central." },
      { id: 'notif-3', timeOffsetMin: 45, type: 'green', message: "Solar generation meeting today's demand." },
      { id: 'notif-4', timeOffsetMin: 68, type: 'purple', message: "Accessibility assistance available at Care Center." },
      { id: 'notif-5', timeOffsetMin: 95, type: 'green', message: "Journey recommendations updated using live passenger data." }
    ];
    setNotifications(initialNotifs);
  }, []);

  // Set up random AI notification center updates (Simulated dynamic triggers spaced out by 10 - 30 minutes randomized)
  useEffect(() => {
    const aiEventTemplates = [
      { message: "AI optimized Innovation Line train frequency to reduce headway.", type: "green" },
      { message: "Solar generation in Nature District increased by 6%.", type: "green" },
      { message: "Dynamic crowd limits auto-adjusted at Nexus Central.", type: "yellow" },
      { message: "feeder micro-busses synchronized with Quantum Core schedules.", type: "green" },
      { message: "Priority lift maintenance completed at Mobility Hub.", type: "purple" }
    ];

    const generateRandomAlert = () => {
      const delay = Math.random() * (20000 - 10000) + 10000; // Fires real-time every 12s-22s
      return setTimeout(() => {
        const selectedAlert = aiEventTemplates[Math.floor(Math.random() * aiEventTemplates.length)];
        
        // Randomize the offset jumps between 10 minutes to half an hour
        const randomTimeJump = Math.floor(Math.random() * (30 - 10 + 1)) + 10;

        setNotifications(prev => {
          const updated = prev.map(notif => ({
            ...notif,
            timeOffsetMin: notif.timeOffsetMin + randomTimeJump
          }));
          return [
            {
              id: `notif-${Date.now()}`,
              timeOffsetMin: 0,
              type: selectedAlert.type as any,
              message: selectedAlert.message
            },
            ...updated
          ];
        });

        setHasUnread(true);
        generateRandomAlert();
      }, delay);
    };

    const timer = generateRandomAlert();
    return () => clearTimeout(timer);
  }, []);

  // Collapse Notification panel on clicking outside the container bounds
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifPanelRef.current && !notifPanelRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
        setIsFocusDropdownOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isNotifOpen]);

  // Scrollspy tracking bounds
  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => document.getElementById(item.id));
      const scrollPos = window.scrollY + window.innerHeight / 3;
      sections.forEach(section => {
        if (section && scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
          setActiveItem(section.id);
        }
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update physical coordinates only when active item changes
  useEffect(() => {
    const updateIndicatorStyle = () => {
      const activeEl = itemRefs.current[activeItem];
      const containerEl = navContainerRef.current;
      if (activeEl && containerEl) {
        const activeRect = activeEl.getBoundingClientRect();
        const containerRect = containerEl.getBoundingClientRect();
        
        setIndicatorStyle({
          left: activeRect.left - containerRect.left + 8, 
          width: activeRect.width - 16,
          opacity: 1
        });
      } else {
        setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
      }
    };

    updateIndicatorStyle();
    window.addEventListener('resize', updateIndicatorStyle);
    return () => window.removeEventListener('resize', updateIndicatorStyle);
  }, [activeItem]);

  const scrollTo = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleNotifCenterToggle = () => {
    setIsNotifOpen(!isNotifOpen);
    setHasUnread(false);
  };

  const focusStationName = MOCK_STATIONS.find(s => s.id === originStation)?.name || 'Nexus Central';

  return (
    <>
      <motion.nav 
        initial={{ y: -20, opacity: 0, x: "-50%" }} 
        animate={{ y: 0, opacity: 1, x: "-50%" }} 
        transition={{ duration: 0.8, ease: easeComponent, delay: 0.5 }}
        style={{ width: "min(1200px, calc(100vw - 48px))", left: "50%" }}
        className="fixed top-4 md:top-6 z-[100] glass-panel px-4 md:px-6 py-2.5 md:py-3.5 flex items-center justify-between shadow-sm transition-all duration-300"
      >
        {/* Brand logo integrating the Circular 'N' Icon only via localized clipping */}
        <div 
          className="flex items-center gap-3 font-display text-lg md:text-xl tracking-tight text-gray-900 cursor-none flex-shrink-0 font-bold"
          onMouseEnter={() => setCursorState('hover')} 
          onMouseLeave={() => setCursorState('default')}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-[28px] h-[28px] md:w-[34px] md:h-[34px] rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-gray-100">
             <MetroNexusPlaceholderLogo />
          </div>
          <span>Metro Nexus</span>
        </div>

        {/* Desktop Navigation Links */}
        <div 
          ref={navContainerRef}
          className="hidden md:flex items-center justify-center gap-2 lg:gap-4 xl:gap-8 relative flex-1 px-4 max-w-xl mx-auto"
        >
          {navItems.map((item) => (
            <div 
              key={item.id} 
              ref={el => { itemRefs.current[item.id] = el; }}
              className="relative cursor-none px-2 lg:px-3 py-1.5 flex-shrink-0"
              onMouseEnter={() => setCursorState('hover')} 
              onMouseLeave={() => setCursorState('default')}
              onClick={() => scrollTo(item.id)}
            >
              <span className={`font-heading font-semibold text-[14px] lg:text-[15px] transition-colors whitespace-nowrap ${activeItem === item.id ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
                {item.label}
              </span>
            </div>
          ))}
          {/* Permanently mounted blue underline - smoothly interpolates left and width */}
          <motion.div 
            animate={{ 
              left: indicatorStyle.left, 
              width: indicatorStyle.width, 
              opacity: indicatorStyle.opacity 
            }}
            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }} 
            className="absolute bottom-1 h-[2.5px] bg-blue-600 rounded-full" 
          />
        </div>

        {/* Desktop CTA & AI Operations Notification Center */}
        <div ref={notifPanelRef} className="hidden md:flex items-center gap-4 flex-shrink-0 relative">
          <div className="relative">
            <motion.button 
              onClick={handleNotifCenterToggle}
              onMouseEnter={() => setCursorState('hover')}
              onMouseLeave={() => setCursorState('default')}
              animate={hasUnread ? { scale: [1, 1.08, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2.0, ease: "easeInOut" }}
              className="p-2.5 rounded-full hover:bg-gray-100/50 transition-colors cursor-none relative"
            >
              <Bell size={20} className="text-gray-800" />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-600 rounded-full border border-white shadow-sm" />
              )}
            </motion.button>

            {/* Premium, High-Visibility Opaque Apple-Style Notification Panel */}
            <AnimatePresence>
              {isNotifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 8, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: easeComponent }}
                  className="absolute right-0 top-full w-80 p-5 rounded-[20px] bg-white/95 backdrop-blur-xl shadow-2xl z-[120] text-left border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                    <span className="font-heading font-bold text-xs uppercase tracking-wider text-gray-500">AI Control Center</span>
                    <button 
                      onClick={() => setIsNotifOpen(false)} 
                      className="p-1 rounded-full hover:bg-gray-200/50 transition-colors"
                    >
                      <X size={14} className="text-gray-500" />
                    </button>
                  </div>
                  
                  {/* Station Selector custom interactive option (Two-way synchronized with planner) */}
                  <div className="flex flex-col gap-1.5 mb-4 bg-gray-50/50 p-3 rounded-xl border border-gray-100 relative">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Station Focus</span>
                    
                    {/* Beautiful Apple-style Selector Trigger */}
                    <div 
                      onClick={() => setIsFocusDropdownOpen(!isFocusDropdownOpen)}
                      className="w-full text-xs font-heading font-semibold bg-white border border-gray-200 rounded-lg p-2.5 text-gray-800 flex justify-between items-center cursor-none hover:border-blue-300 transition-colors"
                      onMouseEnter={() => setCursorState('hover')}
                      onMouseLeave={() => setCursorState('default')}
                    >
                      <span>{focusStationName}</span>
                      <ChevronRight size={14} className={`text-gray-400 transform transition-transform duration-200 ${isFocusDropdownOpen ? 'rotate-90' : ''}`} />
                    </div>

                    {/* Pop-out Glass List dropdown */}
                    <AnimatePresence>
                      {isFocusDropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 4 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute left-0 right-0 top-full z-[130] bg-white/95 backdrop-blur-xl border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar p-1.5"
                        >
                          {MOCK_STATIONS.map(s => (
                            <div 
                              key={s.id}
                              onClick={() => {
                                setOriginStation(s.id);
                                setIsFocusDropdownOpen(false);
                              }}
                              className={`px-3 py-2 rounded-lg text-xs font-medium cursor-none transition-colors ${
                                originStation === s.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                              }`}
                              onMouseEnter={() => setCursorState('hover')}
                              onMouseLeave={() => setCursorState('default')}
                            >
                              {s.name}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-3 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                    {notifications.map(notif => (
                      <div key={notif.id} className="text-xs flex flex-col gap-1 border-b border-gray-100/40 pb-2 last:border-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            notif.type === 'green' ? 'bg-green-500' : notif.type === 'yellow' ? 'bg-amber-500' : 'bg-purple-500'
                          }`} />
                          <span className="text-[10px] font-semibold text-gray-400 font-mono">
                            {notif.timeOffsetMin === 0 ? "Just now" : `${notif.timeOffsetMin} min ago`}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-normal pl-3 font-medium">{notif.message}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button variant="primary" className="!py-2 !px-4 text-xs lg:text-sm whitespace-nowrap" onClick={() => { scrollTo('ai'); setTimeout(() => document.getElementById('origin-select-trigger')?.click(), 800); }}>
            Plan Journey
          </Button>
        </div>

        {/* Mobile / Tablet Hamburger Toggle */}
        <div className="flex md:hidden items-center flex-shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            onMouseEnter={() => setCursorState('hover')} onMouseLeave={() => setCursorState('default')}
            className="p-2 rounded-full hover:bg-gray-100/50 transition-colors cursor-none" aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={20} className="text-gray-800" /> : <Menu size={20} className="text-gray-800" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Glass Dropdown Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95, x: "-50%" }} animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }} exit={{ opacity: 0, y: -20, scale: 0.95, x: "-50%" }} transition={{ duration: 0.3, ease: easeComponent }}
            style={{ width: "min(400px, calc(100vw - 48px))", left: "50%" }}
            className="fixed top-20 md:top-24 z-[99] glass-panel p-6 shadow-xl flex flex-col gap-4 text-center md:hidden"
          >
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <div 
                  key={item.id} onClick={() => scrollTo(item.id)} onMouseEnter={() => setCursorState('hover')} onMouseLeave={() => setCursorState('default')}
                  className="cursor-none py-2 rounded-xl hover:bg-gray-100/30 transition-colors"
                >
                  <span className={`font-heading font-semibold text-[15px] ${activeItem === item.id ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="h-px bg-gray-200/50 my-2" />
            <Button variant="primary" className="w-full !py-2.5 text-sm" onClick={() => { scrollTo('ai'); setTimeout(() => document.getElementById('origin-select-trigger')?.click(), 800); }}>
              Plan Journey
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

NavigationBar.displayName = 'NavigationBar';

// --- SCENE 1: REDESIGNED CINEMATIC PERSPECTIVE HERO ---
const HeroScene = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const [introStep, setIntroStep] = useState(1);
  const smoothProgress = useSpring(scrollYProgress, { damping: 45, stiffness: 150, mass: 1.0 });

  useEffect(() => {
    const t1 = setTimeout(() => setIntroStep(1), 600);
    const t2 = setTimeout(() => setIntroStep(2), 2600);
    const t3 = setTimeout(() => setIntroStep(3), 4800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const textOpacity = useTransform(smoothProgress, [0, 0.3], [1, 0]);
  const textY = useTransform(smoothProgress, [0, 0.3], [0, -50]);
  const btnOpacity = useTransform(smoothProgress, [0, 0.25], [1, 0]);
  const btnY = useTransform(smoothProgress, [0, 0.25], [0, 40]);
  const platformY = useTransform(smoothProgress, [0, 0.6], [0, 100]);
  const platformOpacity = useTransform(smoothProgress, [0.4, 0.7], [1, 0]);
  const trainZ = useTransform(smoothProgress, [0, 0.7], [0, -1000]);
  const trainScale = useTransform(smoothProgress, [0, 0.7], [1, 0.15]);
  const trainY = useTransform(smoothProgress, [0, 0.7], [0, 80]);
  const trainOpacity = useTransform(smoothProgress, [0.5, 0.75], [1, 0]);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <motion.section 
      ref={heroRef} style={{ opacity: useTransform(smoothProgress, [0.72, 0.85], [1, 0]) }}
      className="relative h-[250vh] w-full bg-white select-none pointer-events-none overflow-visible z-10"
    >
      <AnimatePresence>
        {introStep > 0 && introStep < 3 && (
          <motion.div initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-white pointer-events-auto">
            <AnimatePresence mode="wait">
              {introStep === 1 && <motion.h2 key="intro1" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 1.2, ease: easeComponent }} className="font-display text-3xl md:text-5xl text-gray-900 tracking-tight text-center px-6">Every city has a heartbeat.</motion.h2>}
              {introStep === 2 && <motion.h2 key="intro2" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 1.2, ease: easeComponent }} className="font-display text-3xl md:text-5xl text-blue-600 tracking-tight text-center px-6">This one learns from yours.</motion.h2>}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="absolute inset-0 bg-white z-10 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#FAFAF8]/5 to-transparent z-10" />
          {[...Array(15)].map((_, i) => (
            <motion.div key={i} className="absolute w-1 h-1 bg-blue-500/20 rounded-full blur-[1px]" initial={{ x: Math.random() * 100 + "%", top: Math.random() * 100 + "%" }} animate={{ y: [0, -50, 0] }} transition={{ duration: 15 + Math.random() * 10, repeat: Infinity, ease: "linear" }} />
          ))}
        </div>

        <motion.div style={{ opacity: platformOpacity, translateY: platformY, transformStyle: 'preserve-3d', perspective: '1200px' }} className="absolute inset-0 w-full h-full flex items-end justify-center pb-32 md:pb-40 z-20 pointer-events-none">
          <svg className="absolute w-[200%] h-full opacity-20 pointer-events-none" style={{ transform: 'translateY(12%)' }}>
            <line x1="0%" y1="100%" x2="50%" y2="50%" stroke="#111827" strokeWidth="2" />
            <line x1="100%" y1="100%" x2="50%" y2="50%" stroke="#111827" strokeWidth="2" />
            {[...Array(12)].map((_, idx) => (
              <line key={idx} x1={`${50 - (50 * Math.pow(0.65, idx))}%`} y1={`${50 + (50 * Math.pow(0.65, idx))}%`} x2={`${50 + (50 * Math.pow(0.65, idx))}%`} y2={`${50 + (50 * Math.pow(0.65, idx))}%`} stroke="#111827" strokeWidth="1.5" />
            ))}
          </svg>
          <div className="absolute left-0 top-0 bottom-0 w-[20%] bg-gradient-to-r from-gray-100 to-transparent border-r border-gray-200" style={{ transform: 'rotateY(75deg) translateZ(50px) translateY(12%)', transformOrigin: 'left center' }} />
          <div className="absolute right-0 top-0 bottom-0 w-[20%] bg-gradient-to-l from-gray-100 to-transparent border-l border-gray-200" style={{ transform: 'rotateY(-75deg) translateZ(50px) translateY(12%)', transformOrigin: 'right center' }} />
        </motion.div>

        <motion.div style={{ z: trainZ, scale: trainScale, y: trainY, opacity: trainOpacity, x: "-50%", transformOrigin: 'center center' }} className="absolute bottom-[20%] left-1/2 w-[380px] md:w-[440px] aspect-[2.5/1] z-30 flex flex-col items-center justify-end pointer-events-none">
          <svg viewBox="0 0 400 160" className="w-full h-full drop-shadow-2xl" style={{ transform: 'translateY(15px)' }}>
            <defs>
              <linearGradient id="trainShell" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFFFFF" /><stop offset="40%" stopColor="#E5E7EB" /><stop offset="100%" stopColor="#9CA3AF" /></linearGradient>
              <linearGradient id="glassStreak" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#111827" />
                <stop offset="100%" stopColor="#1F2937" />
              </linearGradient>
            </defs>
            <path d="M 50,140 C 35,135 30,110 30,70 C 30,30 80,10 200,10 C 320,10 370,30 370,70 C 370,110 365,135 350,140 Z" fill="url(#trainShell)" stroke="#D1D5DB" strokeWidth="1.5" />
            <path d="M 60,65 C 50,65 45,55 45,45 C 45,30 90,20 200,20 C 310,20 355,30 355,45 C 355,55 350,65 340,65 Z" fill="url(#glassStreak)" />
            <path d="M 120,22 L 280,22 L 200,65 Z" fill="#FFFFFF" opacity="0.04" />
            <path d="M 38,105 C 100,115 200,118 200,118 C 200,118 300,115 362,105" fill="none" stroke="#2563EB" strokeWidth="3.5" strokeLinecap="round" />
            <rect x="140" y="78" width="120" height="12" rx="3" fill="#000000" />
            <text x="200" y="86" fill="#06B6D4" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="1">NEXUS CENTRAL</text>
            <path d="M 115,10 L 115,135" stroke="#9CA3AF" strokeWidth="0.5" strokeDasharray="3 3" />
            <path d="M 285,10 L 285,135" stroke="#9CA3AF" strokeWidth="0.5" strokeDasharray="3 3" />
          </svg>
          <motion.div animate={{ y: [0, -1.5, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }} className="absolute inset-0" />
        </motion.div>

        {/* Hero Headline & Complete Logo Integration */}
        <motion.div 
          style={{ opacity: textOpacity, y: textY, x: "-50%" }} 
          className="absolute top-[8%] lg:top-[12%] left-1/2 w-full max-w-4xl text-center px-6 z-40 pointer-events-auto flex flex-col items-center"
        >
          {/* Official Complete Logo Fade-In */}
          <motion.div
             initial={{ opacity: 0, y: 15 }}
             animate={{ opacity: introStep === 3 ? 1 : 0, y: introStep === 3 ? 0 : 15 }}
             transition={{ duration: 1.2, ease: easeComponent }}
             className="mb-8 w-[180px] md:w-[220px]"
          >
             <MetroNexusFullPlaceholderLogo />
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: introStep === 3 ? 1 : 0, y: introStep === 3 ? 0 : 20 }} transition={{ duration: 1, delay: 0.1, ease: easeComponent }} className="font-display text-[44px] md:text-[56px] font-bold leading-[1.1] text-gray-900 tracking-tight">The City That Learns From Every Journey</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: introStep === 3 ? 1 : 0, y: introStep === 3 ? 0 : 20 }} transition={{ duration: 1, delay: 0.2, ease: easeComponent }} className="mt-4 text-base md:text-[18px] text-gray-500 max-w-2xl font-body leading-relaxed mx-auto">Metro Nexus is the world's first living transit network. Every passenger improves the system. Technology disappears. The experience remains.</motion.p>
        </motion.div>

        <motion.div style={{ opacity: btnOpacity, y: btnY, x: "-50%" }} className="absolute bottom-[8%] md:bottom-[10%] left-1/2 z-50 flex flex-col items-center gap-4 px-6 pointer-events-auto">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button variant="primary" onClick={() => scrollTo('map')}>Explore the Network</Button>
            <Button variant="secondary" onClick={() => { scrollTo('ai'); setTimeout(() => document.getElementById('origin-select-trigger')?.click(), 800); }}>Start Journey</Button>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

// --- SCENE 2: INTERACTIVE MAP (FULLY RESTORED TO ORIGINAL WORKING STATE WITH DELHI WEATHER WIDGET) ---
const InteractiveMapScene = () => {
  const { setCursorState, hoveredStation, setHoveredStation, activeDistrict, setActiveDistrict } = useMetro();
  const { scrollYProgress } = useScroll();

  // Clean cross-fade transition mapping directly to scroll timeline
  const scale = useTransform(scrollYProgress, [0.12, 0.28], [0.85, 1]);
  const opacity = useTransform(scrollYProgress, [0.12, 0.24], [0, 1]);

  const hideTimeoutRef = useRef<number | null>(null);

  // Weather States
  const weatherStates = [
    { type: 'Clear', temp: '31°C', icon: '☀', note: 'Weather conditions normal. No service impact.' },
    { type: 'Cloudy', temp: '29°C', icon: '☁', note: 'Overcast skies. Stations operating fully.' },
    { type: 'Light Rain', temp: '26°C', icon: '🌧', note: 'Metro frequency increased by AI to reduce delays.' }
  ];
  const [currentWeatherIdx, setCurrentWeatherIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentWeatherIdx(prev => (prev + 1) % weatherStates.length);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const currentWeather = weatherStates[currentWeatherIdx];

  const getLineAverageTraffic = (districtId: string | null) => {
    if (!districtId) return 41; // System fallback default
    const line = MOCK_LINES.find(l => l.districtId === districtId);
    if (!line) return 41;
    const stationsOnLine = MOCK_STATIONS.filter(s => line.stations.includes(s.id));
    if (stationsOnLine.length === 0) return 41;
    const sum = stationsOnLine.reduce((acc, s) => acc + s.traffic, 0);
    return Math.round(sum / stationsOnLine.length);
  };

  const dynamicAverageTraffic = getLineAverageTraffic(activeDistrict);

  // Hover Intent logic to prevent popups from flickering
  const handleStationEnter = (stationId: string, districtId: string) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setCursorState('magnetic');
    setHoveredStation(stationId);
    setActiveDistrict(districtId);
  };

  const handleStationLeave = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = window.setTimeout(() => {
      setCursorState('default');
      setHoveredStation(null);
      setActiveDistrict(null);
    }, 200); 
  };

  const handleCardEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const currentHoveredStationData = MOCK_STATIONS.find(s => s.id === hoveredStation);

  return (
    <section id="map" className="relative min-h-screen w-full flex items-center justify-center py-32 overflow-hidden bg-white z-10">
      {/* Background City/Grid Hint */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="absolute top-32 left-8 md:left-24 z-20 max-w-sm pointer-events-none">
        <h2 className="font-heading text-4xl font-bold text-gray-900 mb-4">The Living Network</h2>
        <p className="font-body text-gray-600 text-lg leading-relaxed">
          Every line represents a district. Every station tells a story. Hover to explore the nervous system of the city.
        </p>
      </div>

      {/* Live Status Panel & Weather Widget (Corner Group) */}
      <div className="hidden lg:block absolute right-12 top-32 z-20 w-64">
         {/* Live Network Status */}
         <div className="liquid-glass p-5 border-t-4 transition-colors duration-300" 
              style={{ borderTopColor: activeDistrict ? DISTRICT_DETAILS[activeDistrict as keyof typeof DISTRICT_DETAILS].color : '#E5E7EB' }}>
            <div className="flex items-center gap-2 mb-4">
               <Activity size={18} className={activeDistrict ? 'text-gray-900' : 'text-gray-400'} />
               <h3 className="font-heading font-semibold text-gray-900 text-sm">Live Network Status</h3>
            </div>
            <div className="space-y-4">
               <div>
                 <span className="block text-xs text-gray-500 mb-1">Active Line / District</span>
                 <span className="font-heading font-bold text-gray-900 transition-colors">
                   {activeDistrict ? DISTRICT_DETAILS[activeDistrict as keyof typeof DISTRICT_DETAILS].name : 'System Wide'}
                 </span>
               </div>
               <div>
                 <span className="block text-xs text-gray-500 mb-1">Mean Traffic Load</span>
                 <div className="flex items-center justify-between mb-1">
                   <span className="text-xs font-semibold text-gray-700">{dynamicAverageTraffic}% Capacity</span>
                   <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Averaged</span>
                 </div>
                 <div className="w-full bg-gray-200/50 rounded-full h-1.5 overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full" 
                      style={{ backgroundColor: activeDistrict ? DISTRICT_DETAILS[activeDistrict as keyof typeof DISTRICT_DETAILS].color : '#9CA3AF' }}
                      animate={{ width: `${dynamicAverageTraffic}%` }} 
                      transition={{ duration: 0.35, ease: easeMicro }}
                    />
                 </div>
               </div>
               <div>
                 <span className="block text-xs text-gray-500 mb-1">System Health</span>
                 <span className="font-body font-semibold text-sm text-green-600">
                   Operational
                 </span>
               </div>
            </div>
         </div>

         {/* Delhi Weather Widget */}
         <div className="bg-white/95 backdrop-blur-xl p-4 mt-4 border border-gray-100/80 rounded-[24px] shadow-lg flex flex-col gap-2 relative">
           <div className="flex justify-between items-center">
             <div className="flex flex-col">
               <span className="font-heading font-semibold text-gray-900 text-sm">Delhi Weather</span>
               <span className="text-xs text-gray-400">Delhi Operations</span>
             </div>
             <div className="text-2xl">{currentWeather.icon}</div>
           </div>
           <div className="flex items-baseline gap-2">
             <span className="font-display font-bold text-gray-900 text-2xl">{currentWeather.temp}</span>
             <span className="text-xs text-gray-500 font-semibold">{currentWeather.type}</span>
           </div>
           <div className="h-px bg-gray-100/50 my-1" />
           <AnimatePresence mode="wait">
             <motion.p 
               key={currentWeather.type}
               initial={{ opacity: 0, y: 5 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -5 }}
               transition={{ duration: 0.3 }}
               className="text-[11px] leading-relaxed text-gray-600 font-medium"
             >
               <strong>AI Note:</strong> {currentWeather.note}
             </motion.p>
           </AnimatePresence>
         </div>
      </div>

      <motion.div style={{ scale, opacity }} className="relative w-full max-w-[1100px] aspect-[4/3] mt-16 md:mt-0">
        <svg viewBox="0 0 1000 750" className="w-full h-full drop-shadow-sm" style={{ overflow: 'visible' }}>
          
          {/* Energy Ring at Central */}
          <motion.circle 
            cx="500" cy="375" r="40" fill="none" stroke="#2563EB" strokeWidth="1"
            animate={{ scale: [1, 2], opacity: [0.5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
          />

          {MOCK_LINES.map(line => {
            const isHoveredLine = activeDistrict === line.districtId;
            const isFaded = activeDistrict && activeDistrict !== line.districtId;
            return (
              <g key={line.id}>
                {/* Main Path */}
                <motion.path
                  d={line.path} fill="none" stroke={line.color} strokeWidth={isHoveredLine ? 8 : 6} strokeLinecap="round" strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: isFaded ? 0.2 : 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 2.5, ease: easeComponent }}
                  onMouseEnter={() => { setCursorState('magnetic'); setActiveDistrict(line.districtId); }}
                  onMouseLeave={() => { setCursorState('default'); setActiveDistrict(null); }}
                  className="cursor-none transition-all duration-300"
                />
                {/* Data Pulse / Moving Train simulation */}
                <motion.path
                  d={line.path} fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round"
                  strokeDasharray="10 1000" animate={{ strokeDashoffset: [1000, 0] }} transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, ease: 'linear' }}
                  opacity={isFaded ? 0 : 0.8} className="pointer-events-none"
                />
              </g>
            );
          })}

          {MOCK_STATIONS.map(station => {
            const isHovered = hoveredStation === station.id;
            const districtColor = DISTRICT_DETAILS[station.districtId as keyof typeof DISTRICT_DETAILS].color;
            const isFaded = activeDistrict && activeDistrict !== station.districtId;
            
            // Positioning Logic for Labels
            let labelX = 0; let labelY = 0;
            switch(station.labelPos) {
              case 'top': labelY = -20; break;
              case 'bottom': labelY = 28; break;
              case 'left': labelX = -15; labelY = 4; break;
              case 'right': labelX = 15; labelY = 4; break;
              case 'bottom-right': labelX = 15; labelY = 20; break;
              default: labelY = 25;
            }

            return (
              <g 
                key={station.id} transform={`translate(${station.cx}, ${station.cy})`}
                onMouseEnter={() => handleStationEnter(station.id, station.districtId)}
                onMouseLeave={handleStationLeave}
                className="cursor-none"
              >
                {/* Large Invisible Hover Target Area */}
                <circle r={35} fill="transparent" className="cursor-none" />

                {/* Hover Scale Animation */}
                <motion.g animate={{ scale: isHovered ? 1.3 : 1 }} transition={{ duration: 0.4, ease: easeComponent }}>
                  <motion.circle r={24} fill={districtColor} opacity={isHovered ? 0.15 : 0} />
                  <motion.circle r={station.isInterchange ? 10 : 8} fill="#FFFFFF" stroke={districtColor} strokeWidth={3} opacity={isFaded ? 0.4 : 1} />
                  <circle r={3} fill={districtColor} opacity={isFaded ? 0.4 : 1} />
                </motion.g>

                {/* Label behind text halo */}
                <motion.text 
                  x={labelX} y={labelY} 
                  textAnchor={station.labelPos === 'left' ? 'end' : station.labelPos === 'right' || station.labelPos === 'bottom-right' ? 'start' : 'middle'} 
                  className="font-heading text-[13px] font-semibold pointer-events-none" 
                  stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="round"
                  animate={{ opacity: isHovered ? 1 : (isFaded ? 0.2 : 0.8) }}
                >
                  {station.name}
                </motion.text>

                {/* Main Label text */}
                <motion.text 
                  x={labelX} y={labelY} 
                  textAnchor={station.labelPos === 'left' ? 'end' : station.labelPos === 'right' || station.labelPos === 'bottom-right' ? 'start' : 'middle'} 
                  className="font-heading text-[13px] font-semibold fill-gray-800 pointer-events-none" 
                  animate={{ opacity: isHovered ? 1 : (isFaded ? 0.2 : 0.8) }}
                >
                  {station.name}
                </motion.text>
              </g>
            );
          })}
        </svg>

        <AnimatePresence>
          {hoveredStation && currentHoveredStationData && (
            <motion.div
              key={currentHoveredStationData.id}
              initial={{ opacity: 0, scale: 0.9, x: 16, y: -12 }} 
              animate={{ opacity: 1, scale: 1, x: 16, y: -24 }} 
              exit={{ opacity: 0, scale: 0.9, x: 16, y: -12 }} 
              transition={{ duration: 0.25, ease: easeComponent }}
              onMouseEnter={handleCardEnter}
              onMouseLeave={handleStationLeave}
              className="absolute z-30 bg-white/95 backdrop-blur-xl p-6 w-[320px] rounded-[24px] shadow-2xl border border-gray-100/80 pointer-events-auto"
              style={{ 
                left: `${(currentHoveredStationData.cx / 1000) * 100}%`, 
                top: `${(currentHoveredStationData.cy / 750) * 100}%`
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DISTRICT_DETAILS[currentHoveredStationData.districtId as keyof typeof DISTRICT_DETAILS].color }} />
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {DISTRICT_DETAILS[currentHoveredStationData.districtId as keyof typeof DISTRICT_DETAILS].name} District
                </span>
              </div>
              <h3 className="font-heading text-2xl font-bold text-gray-900 mb-2">{currentHoveredStationData.name}</h3>
              <p className="font-body text-sm text-gray-600 mb-4 leading-relaxed">
                {currentHoveredStationData.desc}
              </p>

              <div className="mt-4 pt-3 border-t border-gray-200/50 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Station Flow</span>
                  <span className="font-bold text-gray-800">
                    {currentHoveredStationData.traffic}% load
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Crowd Class</span>
                  <span className="font-bold" style={{ color: DISTRICT_DETAILS[currentHoveredStationData.districtId as keyof typeof DISTRICT_DETAILS].color }}>
                    {currentHoveredStationData.traffic > 75 ? 'Peak' : currentHoveredStationData.traffic > 40 ? 'Moderate' : 'Optimal'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
};

// --- SCENE 3: DISTRICT EXPLORER ---
const DistrictScene = () => {
  const { setCursorState } = useMetro();
  const [activeTab, setActiveTab] = useState('innovation');
  const activeData = DISTRICT_DETAILS[activeTab as keyof typeof DISTRICT_DETAILS];
  const Icon = activeData.icon;

  return (
    <section id="districts" className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-6 py-24 z-10 relative">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="font-display text-5xl font-bold text-gray-900 mb-6">Every District Has a Pulse.</h2>
          <p className="text-xl text-gray-600 mb-10 max-w-lg leading-relaxed">
            The city is not uniform. Metro Nexus adapts the environment, lighting, and AI recommendations based on the identity of the district you enter.
          </p>
          
          <div className="flex flex-col gap-2 relative">
            {Object.values(DISTRICT_DETAILS).map((district) => (
              <div
                key={district.id}
                onClick={() => setActiveTab(district.id)}
                onMouseEnter={() => setCursorState('hover')}
                onMouseLeave={() => setCursorState('default')}
                className={`relative px-6 py-4 rounded-[16px] cursor-none transition-colors duration-300 flex items-center justify-between ${
                  activeTab === district.id ? 'text-gray-900' : 'text-gray-500 hover:bg-gray-100/50'
                }`}
              >
                {activeTab === district.id && (
                  <motion.div layoutId="activeDistrictBg" className="absolute inset-0 bg-white shadow-sm border border-gray-200 rounded-[16px]" transition={springPhysical} />
                )}
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: district.color }} />
                  <span className="font-heading font-semibold text-lg">{district.name}</span>
                </div>
                {activeTab === district.id && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative z-10">
                    <ChevronRight size={20} className="text-gray-400" />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <motion.div 
          animate={{ backgroundColor: activeData.bg }}
          transition={{ duration: 0.8, ease: easeComponent }}
          className="aspect-square rounded-[32px] p-8 relative overflow-hidden flex flex-col justify-between border border-gray-100 shadow-inner"
        >
           <div className="absolute top-0 right-0 p-12 opacity-10 mix-blend-multiply">
              <Icon size={300} style={{ color: activeData.color }} />
           </div>

           <div className="relative z-10">
             <motion.div 
                key={activeData.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
             >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6" style={{ color: activeData.color }}>
                  <Icon size={24} />
                </div>
                <h3 className="font-heading text-3xl font-bold text-gray-900 mb-3">{activeData.name}</h3>
                <p className="font-body text-gray-700 text-lg max-w-sm leading-relaxed">{activeData.desc}</p>
             </motion.div>
           </div>

           <div className="relative z-10 grid grid-cols-2 gap-4">
              <Card className="!p-4 bg-white/60 backdrop-blur-md">
                <span className="block text-xs text-gray-500 mb-1">Energy Saved</span>
                <span className="font-heading font-bold text-gray-900 text-lg">{activeData.stats.energy}</span>
              </Card>
              <Card className="!p-4 bg-white/60 backdrop-blur-md">
                <span className="block text-xs text-gray-500 mb-1">Crowd Level</span>
                <span className="font-heading font-bold text-lg" style={{ color: activeData.color }}>{activeData.stats.crowd}</span>
              </Card>
           </div>
        </motion.div>
      </div>
    </section>
  )
}

// --- Custom Station Select Dropdown Component ---
const StationSelect = ({ id, value, onChange, options, colorClass, ringClass }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((o: any) => o.id === value);
  const selectRef = useRef<HTMLDivElement>(null);
  const { setCursorState } = useMetroActions();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={selectRef} className="relative w-full border-none">
      <div
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setCursorState('hover')}
        onMouseLeave={() => setCursorState('default')}
        className={`relative flex items-center gap-4 p-4 rounded-[16px] bg-gray-50 border transition-all cursor-none ${isOpen ? 'border-gray-300 bg-white shadow-sm' : 'border-gray-200 hover:border-gray-300'} ${ringClass}`}
      >
        <div className={`w-4 h-4 rounded-full border-[4px] bg-white flex-shrink-0 ${colorClass}`} />
        <div className="font-heading font-bold text-gray-900 flex-1 select-none">
          {selected?.name || "Select Station"}
        </div>
        <motion.div animate={{ rotate: isOpen ? -90 : 90 }} transition={{ duration: 0.2 }}>
          <ChevronRight className="w-5 h-5 text-gray-400 pointer-events-none" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.8 }}
            className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 glass-panel rounded-[16px] max-h-60 overflow-y-auto p-2 custom-scrollbar"
          >
            {options.map((opt: any) => (
              <div
                key={opt.id}
                onClick={() => { onChange(opt.id); setIsOpen(false); }}
                onMouseEnter={() => setCursorState('hover')}
                onMouseLeave={() => setCursorState('default')}
                className={`px-4 py-3 rounded-xl cursor-none font-heading text-sm font-medium transition-colors ${value === opt.id ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                {opt.name}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- SCENE 4: ADAPTIVE AI & JOURNEY (UNCLIPPED CONTENT AND DYNAMIC OVERFLOW CONTAINER WITH LIVE SYSTEM TIME) ---
const AiJourneyScene = () => {
  const { setCursorState, setOriginStation, setDestinationStation } = useMetroActions();
  const { originStation, destinationStation } = useContext(MetroStateContext);
  const [pref, setPref] = useState<'fastest'|'accessible'|'quiet'>('fastest');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [ticketPass, setTicketPass] = useState<any | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  // Selected last mile connectivity method & custom tickets
  const [selectedLastMile, setSelectedLastMile] = useState<string | null>(null);
  const [lastMileTicket, setLastMileTicket] = useState<any | null>(null);

  // Live system date tracker (updates instantly on changes)
  const [departureDate, setDepartureDate] = useState(() => new Date());

  // Real-Time delhi demo status stats
  const [networkWait, setNetworkWait] = useState(2);
  const [networkAccuracy, setNetworkWaitAccuracy] = useState(98.7);

  // AI Operations Toggles inside the Left Side Grid Panel
  const [isOverviewModalOpen, setIsOverviewModalOpen] = useState(false);
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);

  const overviewModalRef = useRef<HTMLDivElement>(null);
  const telemetryModalRef = useRef<HTMLDivElement>(null);

  // AI Operation status ticker state
  const aiTickerUpdates = [
    "AI adjusted Innovation Line train frequency to +14%",
    "Solar generation in Nature District increased by 6%",
    "Crowd predictions updated for Nexus Central",
    "Universal accessibility routes recalculated at Mobility Hub",
    "Feeder Smart Bus schedules synchronized in real-time"
  ];
  const [aiTickerIdx, setAiTickerIdx] = useState(0);

  useEffect(() => {
    const aiTickerTimer = setInterval(() => {
      setAiTickerIdx(prev => (prev + 1) % aiTickerUpdates.length);
    }, 8000);
    return () => clearInterval(aiTickerTimer);
  }, []);

  // Delhi-scale demo stats updates (Simulation-only)
  useEffect(() => {
    const delhiStatsTimer = setInterval(() => {
      setNetworkWait(prev => {
        const delta = (Math.random() - 0.5) * 0.4;
        const val = prev + delta;
        return parseFloat(Math.min(3, Math.max(1, val)).toFixed(1));
      });
      setNetworkWaitAccuracy(prev => {
        const delta = (Math.random() - 0.5) * 0.2;
        const val = prev + delta;
        return parseFloat(Math.min(99.8, Math.max(97.5, val)).toFixed(1));
      });
    }, 12000);
    return () => clearInterval(delhiStatsTimer);
  }, []);

  // Collapse Modals when clicking outside their bounding rects
  useEffect(() => {
    const handleModalClickOutside = (e: MouseEvent) => {
      if (isOverviewModalOpen && overviewModalRef.current && !overviewModalRef.current.contains(e.target as Node)) {
        setIsOverviewModalOpen(false);
      }
      if (isTelemetryModalOpen && telemetryModalRef.current && !telemetryModalRef.current.contains(e.target as Node)) {
        setIsTelemetryModalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleModalClickOutside);
    return () => document.removeEventListener('mousedown', handleModalClickOutside);
  }, [isOverviewModalOpen, isTelemetryModalOpen]);

  // Helper formatter using clean standard Intl.DateTimeFormat configuration
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat([], {
      hour: "numeric",
      minute: "2-digit"
    }).format(date);
  };

  // Generates real-feeling data including ETA, Carbon, and live system Departure times.
  const generateRouteData = () => {
    const origSt = MOCK_STATIONS.find(s => s.id === originStation);
    const destSt = MOCK_STATIONS.find(s => s.id === destinationStation);
    if (!origSt || !destSt) return null;

    const isSameDistrict = origSt.districtId === destSt.districtId;
    const isSameStation = originStation === destinationStation;
    
    let baseTime = isSameStation ? 0 : isSameDistrict ? 12 : 24;
    let baseTransfers = isSameStation ? 0 : isSameDistrict ? 0 : 1;
    if (origSt.districtId === 'nature' && destSt.districtId === 'culture') baseTransfers = 2;

    const routes = {
      fastest: { 
        time: `${baseTime} min`, transfers: baseTransfers, crowd: 'High', 
        departure: formatTime(departureDate), 
        eta: formatTime(new Date(departureDate.getTime() + baseTime * 60000)), 
        carbon: '1.2 kg', color: 'text-blue-600', iconColor: 'text-blue-500', bg: 'bg-blue-50/50', border: 'border-blue-100',
        recommendation: "Optimized route via fast bypass corridors.",
        bullets: [
          "Optimized high-speed corridor sequencing",
          "Calculated using real-time district density offsets",
          "Automated solar-grid load scheduling prioritised"
        ]
      },
      accessible: { 
        time: `${baseTime + 7} min`, transfers: Math.max(0, baseTransfers - 1), crowd: 'Low', 
        departure: formatTime(departureDate), 
        eta: formatTime(new Date(departureDate.getTime() + (baseTime + 7) * 60000)), 
        carbon: '0.8 kg', color: 'text-purple-600', iconColor: 'text-purple-500', bg: 'bg-purple-50/50', border: 'border-purple-100',
        recommendation: "Step-free corridor with reserved elevator sequencing.",
        bullets: [
          "Step-free transfer routes enabled",
          "Tactile path sequencing and auditory beacons active",
          "Priority lift booking automatically logged"
        ]
      },
      quiet: { 
        time: `${baseTime + 4} min`, transfers: baseTransfers, crowd: 'Low', 
        departure: formatTime(departureDate), 
        eta: formatTime(new Date(departureDate.getTime() + (baseTime + 4) * 60000)), 
        carbon: '1.0 kg', color: 'text-amber-600', iconColor: 'text-amber-500', bg: 'bg-amber-50/50', border: 'border-amber-100',
        recommendation: "Low-density path with optimized seating capacity.",
        bullets: [
          "Bypasses busy transit intersections",
          "Low-decibel ambient lighting environments aligned",
          "Provides 82% high probability seating indicators"
        ]
      }
    };
    return routes[pref];
  };

  const routeData = generateRouteData();

  const handleStartJourney = () => {
    const freshDate = new Date();
    setDepartureDate(freshDate);
    setIsProcessing(true);
    setTicketPass(null);
    setIsFlipped(false);
    setSelectedLastMile(null);
    setLastMileTicket(null);

    setTimeout(() => {
      const origSt = MOCK_STATIONS.find(s => s.id === originStation);
      const destSt = MOCK_STATIONS.find(s => s.id === destinationStation);
      const randomId = Math.floor(100000 + Math.random() * 900000);
      
      setTicketPass({
        ticketNo: `NX-2038-${randomId}`,
        originName: origSt?.name || 'N/A',
        destinationName: destSt?.name || 'N/A',
        time: routeData?.time || '20 min',
        transfers: routeData?.transfers || '0',
        districtColor: DISTRICT_DETAILS[origSt?.districtId as keyof typeof DISTRICT_DETAILS]?.color || '#2563EB',
        districtName: DISTRICT_DETAILS[origSt?.districtId as keyof typeof DISTRICT_DETAILS]?.name || 'System'
      });
      setIsProcessing(false);
    }, 1500); 
  };

  const handleLastMileSelect = (type: string) => {
    setSelectedLastMile(type);
    const passId = Math.floor(1000 + Math.random() * 9000);
    const destSt = MOCK_STATIONS.find(s => s.id === destinationStation);
    const destinationName = destSt?.name || 'Eco Hub';

    if (type === 'cab') {
      setLastMileTicket({
        title: "AI Autonomous Cab Pass",
        id: `CAB-${passId}`,
        eta: "Pickup in 3 mins",
        details: `Autonomous transit linked from ${destinationName} arrivals. Verified Zero-emission electric ride.`,
        fare: "₹170–₹190",
        color: "from-blue-600 to-blue-700"
      });
    } else if (type === 'bus') {
      setLastMileTicket({
        title: "Smart Feeder Bus Ticket",
        id: `BUS-${passId}`,
        eta: "Departs in 5 mins",
        details: `Boarding at ${destinationName} Bay 4. Priority synchronization with Metro arrival grid.`,
        fare: "₹15",
        color: "from-green-600 to-green-700"
      });
    } else if (type === 'bike') {
      setLastMileTicket({
        title: "Delhi micro-Bike Access",
        id: `BIK-${passId}`,
        eta: "Walk: 2 mins",
        details: `Unlock locker at ${destinationName} Gate A. Zero-carbon active travel enabled.`,
        fare: "₹20",
        color: "from-amber-500 to-amber-600"
      });
    } else {
      setLastMileTicket(null);
    }
  };

  return (
    <section id="ai" className="min-h-screen flex items-center justify-center bg-white px-6 py-24 z-10 relative">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-20 items-stretch">
        
        {/* Left Hand: Operations center status & metrics */}
        <div className="flex flex-col h-auto gap-8 pt-8 md:pt-0 justify-center">
          <div>
            <Sparkles className="w-12 h-12 text-blue-600 mb-6" />
            <h2 className="font-display text-5xl font-bold text-gray-900 mb-6">Invisible Intelligence.</h2>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              The Delhi Metro Nexus is managed by an autonomous AI Control Center, constantly balancing power grids, commuter load distributions, and seamless last-mile link connectivity.
            </p>
            
            <div className="space-y-6">
              <h3 className="font-heading text-lg font-semibold text-gray-900">Passenger Preferences</h3>
              <div className="flex flex-wrap gap-3">
                {(['fastest', 'accessible', 'quiet'] as const).map(p => (
                  <button
                    key={p} 
                    onClick={() => { 
                      setPref(p); 
                      if(ticketPass) setTicketPass(null); 
                      setSelectedLastMile(null);
                      setLastMileTicket(null);
                      setDepartureDate(new Date()); // Refresh system time on tab change
                    }}
                    onMouseEnter={() => setCursorState('hover')} onMouseLeave={() => setCursorState('default')}
                    className={`px-5 py-2.5 rounded-full font-heading text-sm font-medium transition-all duration-200 outline-none cursor-none border ${
                      pref === p ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)} Route
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI OPERATIONS CENTER BOARD & STUNNING GLASS INTERACTIVE CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {/* Dynamic, Clickable Glassmorphic Demo Overview Card */}
             <motion.div 
               onClick={() => setIsOverviewModalOpen(true)}
               whileHover={{ y: -6, scale: 1.01 }}
               onMouseEnter={() => setCursorState('hover')}
               onMouseLeave={() => setCursorState('default')}
               className="p-5 rounded-[24px] glass-panel flex flex-col justify-between gap-3 cursor-none hover:bg-white/60 transition-colors duration-300"
               style={{
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.05), inset 0 0 10px rgba(255, 255, 255, 0.45)',
                  backdropFilter: 'blur(30px)',
                  WebkitBackdropFilter: 'blur(30px)',
               }}
             >
               <div>
                 <div className="flex justify-between items-center mb-1">
                   <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Demo Overview</span>
                   <span className="text-[9px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">Click to Expand</span>
                 </div>
                 <div className="space-y-1.5 mt-2">
                   <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                     <span>Stations Active</span>
                     <span className="text-green-600 font-bold">🟢 9 Online</span>
                   </div>
                   <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                     <span>Wait Average</span>
                     <span className="text-gray-900 font-bold">🟢 {networkWait} min</span>
                   </div>
                   <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                     <span>On-Time Rate</span>
                     <span className="text-gray-900 font-bold">🟢 {networkAccuracy}%</span>
                   </div>
                 </div>
               </div>
               <div className="border-t border-gray-200/50 pt-2.5 flex justify-between items-center text-xs">
                 <span className="text-gray-500 font-medium">Daily Passengers</span>
                 <span className="font-bold text-gray-900 font-mono">2,436</span>
               </div>
             </motion.div>

             {/* Dynamic, Clickable Glassmorphic Network Health Card */}
             <motion.div 
               onClick={() => setIsTelemetryModalOpen(true)}
               whileHover={{ y: -6, scale: 1.01 }}
               onMouseEnter={() => setCursorState('hover')}
               onMouseLeave={() => setCursorState('default')}
               className="p-5 rounded-[24px] glass-panel flex flex-col justify-between gap-3 cursor-none hover:bg-white/60 transition-colors duration-300"
               style={{
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.05), inset 0 0 10px rgba(255, 255, 255, 0.45)',
                  backdropFilter: 'blur(30px)',
                  WebkitBackdropFilter: 'blur(30px)',
               }}
             >
               <div className="flex justify-between items-start">
                 <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Network Health</span>
                   <span className="text-[9px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1 mt-1 w-max">Telemetry</span>
                 </div>
                 
                 {/* Visual high impact health ring */}
                 <div className="relative w-11 h-11 flex items-center justify-center">
                   <svg className="absolute w-full h-full transform -rotate-90">
                     <circle cx="22" cy="22" r="18" stroke="#E5E7EB" strokeWidth="3" fill="transparent" />
                     <circle cx="22" cy="22" r="18" stroke="#16A34A" strokeWidth="3" fill="transparent" strokeDasharray="113" strokeDashoffset="0.3" />
                   </svg>
                   <span className="text-[9px] font-bold text-green-700 font-mono">99.7%</span>
                 </div>
               </div>

               {/* Live AI update updates ticker */}
               <div className="flex flex-col gap-1 border-t border-gray-200/50 pt-2">
                 <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                   <Activity size={10} className="animate-pulse" /> Live AI Dispatcher
                 </span>
                 <div className="h-10 overflow-hidden relative">
                   <AnimatePresence mode="wait">
                     <motion.p
                       key={aiTickerIdx}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -10 }}
                       transition={{ duration: 0.35, ease: "easeInOut" }}
                       className="text-[10px] font-semibold leading-snug text-gray-700"
                     >
                       {aiTickerUpdates[aiTickerIdx]}
                     </motion.p>
                   </AnimatePresence>
                 </div>
               </div>
             </motion.div>
          </div>
        </div>
        
        {/* Right Hand: Interactive Journey Planner & Results */}
        <div className="relative flex flex-col">
          <div className="glass-panel rounded-[32px] p-6 md:p-8 min-h-[450px] h-full flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {!ticketPass ? (
                <motion.div key="planner" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="flex flex-col w-full h-auto gap-4" >
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="font-heading text-2xl font-bold text-gray-900">Journey Planner</h3>
                      <Badge color="blue">Live Updates</Badge>
                    </div>
                    
                    <div className="space-y-4 mb-8">
                      <StationSelect 
                        id="origin-select-trigger" 
                        value={originStation} 
                        onChange={(val: any) => { 
                          setOriginStation(val); 
                          setTicketPass(null); 
                          setSelectedLastMile(null);
                          setLastMileTicket(null);
                          setDepartureDate(new Date()); 
                        }} 
                        options={MOCK_STATIONS} 
                        colorClass="border-blue-600" 
                        ringClass={originStation === destinationStation ? "" : "focus-within:border-blue-500 focus-within:shadow-[0_0_0_4px_rgba(37,99,235,0.1)]"} 
                      />
                      <div className="pl-6 border-l-2 border-dashed border-gray-200 ml-[7px] py-1"><ArrowRightLeft className="w-4 h-4 text-gray-400 rotate-90" /></div>
                      <StationSelect 
                        id="destination-select-trigger" 
                        value={destinationStation} 
                        onChange={(val: any) => { 
                          setDestinationStation(val); 
                          setTicketPass(null); 
                          setSelectedLastMile(null);
                          setLastMileTicket(null);
                          setDepartureDate(new Date()); 
                        }} 
                        options={MOCK_STATIONS} 
                        colorClass="border-amber-500" 
                        ringClass="" 
                      />
                    </div>

                    {originStation === destinationStation ? (
                       <div className="text-center py-8 text-gray-500 font-body">Origin and Destination must be distinct.</div>
                    ) : routeData && (
                      <div className="space-y-4">
                        <motion.div key={`${originStation}-${destinationStation}-${pref}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <div className="p-4 rounded-[16px] bg-white border border-gray-100 shadow-sm flex flex-col justify-center">
                            <Clock className={`w-5 h-5 mb-2 ${routeData.iconColor}`} />
                            <span className="block text-xl font-heading font-bold text-gray-900">{routeData.time}</span>
                            <span className="text-xs text-gray-400 font-medium">Duration</span>
                          </div>
                          <div className="p-4 rounded-[16px] bg-white border border-gray-100 shadow-sm flex flex-col justify-center">
                            <Timer className={`w-5 h-5 mb-2 ${routeData.iconColor}`} />
                            <span className="block text-xl font-heading font-bold text-gray-900">{routeData.eta}</span>
                            <span className="text-xs text-gray-400 font-medium">Est. Arrival (Dep: {routeData.departure})</span>
                          </div>
                          <div className="p-4 rounded-[16px] bg-white border border-gray-100 shadow-sm flex flex-col justify-center">
                            <Cloud className={`w-5 h-5 mb-2 ${routeData.iconColor}`} />
                            <span className="block text-xl font-heading font-bold text-gray-900">-{routeData.carbon}</span>
                            <span className="text-xs text-gray-400 font-medium">CO₂ vs Driving</span>
                          </div>
                        </motion.div>

                        <motion.div key={`rec-${originStation}-${destinationStation}-${pref}`} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.3 }} className={`p-5 rounded-[20px] ${routeData.bg} border ${routeData.border} flex items-start gap-4`}>
                          <div className="mt-1"><Shield className={`w-5 h-5 ${routeData.color}`} /></div>
                          <div>
                            <span className="block font-heading font-semibold text-gray-900 mb-1">AI Reasoning</span>
                            <span className="font-body text-sm text-gray-600 leading-relaxed mb-3">{routeData.recommendation}</span>
                            
                            {/* Premium, sequentially animated explanations bullet list - limited to 3 crisp points */}
                            <motion.ul 
                              initial="hidden"
                              animate="visible"
                              variants={{
                                visible: { transition: { staggerChildren: 0.1 } }
                              }}
                              className="space-y-1.5 text-xs text-gray-500 font-semibold list-disc list-inside"
                            >
                              {routeData.bullets.map((bullet, idx) => (
                                <motion.li 
                                  key={idx}
                                  variants={{
                                    hidden: { opacity: 0, x: -10 },
                                    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: easeComponent } }
                                  }}
                                >
                                  {bullet}
                                </motion.li>
                              ))}
                            </motion.ul>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </div>

                  <Button variant="primary" className="w-full mt-4 flex items-center justify-center gap-2" disabled={originStation === destinationStation || isProcessing} onClick={handleStartJourney}>
                    {isProcessing ? <><RefreshCw className="animate-spin w-5 h-5" /> Generating Travel Pass...</> : <><Ticket size={18} /> Start Journey</>}
                  </Button>
                </motion.div>
              ) : (
                /* Dynamic Interactive Digital Pass with Last Mile Connectivity Support */
                <motion.div key="ticket" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4, ease: easeComponent }} className="flex flex-col items-center gap-6 w-full h-auto">
                  <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: ticketPass.districtColor }} />
                      <span className="font-heading font-bold text-sm text-gray-900">Adaptive Boarding Pass</span>
                    </div>
                    <button onClick={() => { setTicketPass(null); setSelectedLastMile(null); setLastMileTicket(null); }} onMouseEnter={() => setCursorState('hover')} onMouseLeave={() => setCursorState('default')} className="p-2 rounded-full hover:bg-gray-100/50 transition-colors">
                      <X size={16} className="text-gray-500" />
                    </button>
                  </div>

                  {/* Flippable Ticket Area / Sub-Ticket pass layout (AnimatePresence switches between main metro pass and dynamic Last-mile voucher) */}
                  <div className="w-full relative h-[180px] md:h-[220px]">
                    <AnimatePresence mode="wait">
                      {!lastMileTicket ? (
                        <motion.div 
                          key="metro-pass"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.25 }}
                          className="ticket-pass w-full h-full relative"
                          onClick={() => setIsFlipped(!isFlipped)}
                          onMouseEnter={() => setCursorState('hover')}
                          onMouseLeave={() => setCursorState('default')}
                        >
                          <div className={`ticket-inner w-full h-full relative ${isFlipped ? 'ticket-flipped' : ''}`}>
                            {/* Ticket Front */}
                            <div className="ticket-face w-full h-full absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/80 shadow-lg flex flex-col justify-between p-6 overflow-hidden">
                              <div className="absolute top-0 bottom-0 left-0 w-2" style={{ backgroundColor: ticketPass.districtColor }} />
                              <div className="flex justify-between items-start pl-3 w-full">
                                <div>
                                  <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">{ticketPass.districtName} District</span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-display font-bold text-lg text-gray-900 truncate max-w-[120px] md:max-w-[150px]">{ticketPass.originName}</span>
                                    <ArrowRight size={14} className="text-gray-400" />
                                    <span className="font-display font-bold text-lg text-gray-900 truncate max-w-[120px] md:max-w-[150px]">{ticketPass.destinationName}</span>
                                  </div>
                                  <span className="block text-[10px] font-mono text-gray-500 mt-2">{ticketPass.ticketNo}</span>
                                </div>
                                <div className="bg-white p-1 rounded-lg border border-gray-100 shadow-sm flex-shrink-0">
                                  <svg viewBox="0 0 100 100" className="w-12 h-12 md:w-16 md:h-16 text-gray-900">
                                    <rect x="0" y="0" width="22" height="22" fill="currentColor" />
                                    <rect x="4" y="4" width="14" height="14" fill="white" />
                                    <rect x="8" y="8" width="6" height="6" fill="currentColor" />
                                    <rect x="78" y="0" width="22" height="22" fill="currentColor" />
                                    <rect x="82" y="4" width="14" height="14" fill="white" />
                                    <rect x="86" y="8" width="6" height="6" fill="currentColor" />
                                    <rect x="0" y="78" width="22" height="22" fill="currentColor" />
                                    <rect x="4" y="82" width="14" height="14" fill="white" />
                                    <rect x="30" y="4" width="8" height="8" fill="currentColor" />
                                    <rect x="42" y="12" width="12" height="6" fill="currentColor" />
                                    <rect x="30" y="24" width="16" height="8" fill="currentColor" />
                                    <rect x="52" y="32" width="8" height="12" fill="currentColor" />
                                    <rect x="24" y="48" width="14" height="14" fill="currentColor" />
                                    <rect x="44" y="52" width="22" height="8" fill="currentColor" />
                                  </svg>
                                </div>
                              </div>
                              <div className="flex justify-between items-center border-t border-dashed border-gray-200/80 pt-3 pl-3">
                                <div className="flex gap-4">
                                  <div><span className="block text-[10px] uppercase tracking-wider text-gray-400">Duration</span><span className="font-heading font-bold text-gray-800 text-xs">{ticketPass.time}</span></div>
                                  <div><span className="block text-[10px] uppercase tracking-wider text-gray-400">Transfers</span><span className="font-heading font-bold text-gray-800 text-xs">{ticketPass.transfers} stops</span></div>
                                </div>
                                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1"><Activity size={10} className="animate-pulse" /> Active Pass</span>
                              </div>
                            </div>
                            {/* Ticket Back */}
                            <div className="ticket-back ticket-face w-full h-full absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 shadow-lg flex flex-col justify-between p-6 text-white overflow-hidden">
                              <div className="absolute top-0 bottom-0 left-0 w-2" style={{ backgroundColor: ticketPass.districtColor }} />
                              <div className="pl-3">
                                <span className="block text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Pass terms</span>
                                <p className="text-[11px] text-gray-300 leading-relaxed max-w-md">Hold near smart barrier NFC terminal to validate entry. AI adjusts station pathways dynamically in real time.</p>
                              </div>
                              <div className="pl-3 flex justify-between items-center">
                                <div><span className="block text-[9px] text-gray-400 uppercase">System Integration</span><span className="font-heading font-semibold text-xs">2038 Smart Transit</span></div>
                                <span className="text-[10px] bg-white/10 px-2.5 py-1 rounded-full font-heading font-medium backdrop-blur-sm border border-white/5">Click to Flip</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        /* Beautiful dynamic Last-Mile Transit Voucher pass */
                        <motion.div 
                          key="lastmile-pass"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.25 }}
                          className="w-full h-full relative"
                        >
                          <div className={`p-6 rounded-2xl bg-gradient-to-br ${lastMileTicket.color} text-white shadow-xl flex flex-col justify-between h-full relative overflow-hidden border border-white/10`}>
                            {/* Decorative ambient grid overlay */}
                            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)]" style={{ backgroundSize: '16px 16px' }} />
                            
                            <div className="flex justify-between items-start z-10">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Last Mile connection voucher</span>
                                <h4 className="font-display font-bold text-lg md:text-xl mt-0.5">{lastMileTicket.title}</h4>
                                <span className="block text-[11px] font-mono text-white/70 mt-1">{lastMileTicket.id}</span>
                              </div>
                              <span className="px-2.5 py-1 text-[10px] font-bold bg-white/20 backdrop-blur rounded-full">
                                {lastMileTicket.eta}
                              </span>
                            </div>

                            <p className="text-xs text-white/80 leading-relaxed font-medium max-w-sm z-10">
                              {lastMileTicket.details}
                            </p>

                            <div className="flex justify-between items-center border-t border-white/10 pt-3 z-10">
                              <div>
                                <span className="text-[9px] uppercase tracking-wider text-white/50 block">Transit fare</span>
                                <span className="font-display font-bold text-sm">{lastMileTicket.fare} (concept only)</span>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => setLastMileTicket(null)}
                                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xs font-semibold font-heading"
                                >
                                  Back to Pass
                                </button>
                                <span className="px-2.5 py-1 text-[10px] font-bold bg-green-500 rounded-full flex items-center gap-1 shadow-sm">
                                  ✓ Prepared
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* LAST MILE CONNECTIVITY SECTION (Concept Only, fully integrated with premium animation design guidelines) */}
                  {!lastMileTicket && (
                    <div className="w-full flex flex-col gap-3">
                      <div className="flex justify-between items-center px-1">
                        <span className="font-heading font-bold text-xs uppercase text-gray-500 tracking-wider">Complete Your Journey</span>
                        {selectedLastMile && (
                          <span className="text-[11px] font-bold text-green-600 animate-pulse">✓ Last-mile journey prepared</span>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {/* Card 1: AI Cab */}
                        <div 
                          onClick={() => handleLastMileSelect('cab')}
                          className={`p-3 rounded-xl border transition-all duration-300 flex flex-col justify-between gap-1.5 cursor-none text-left ${
                            selectedLastMile === 'cab' ? 'bg-blue-50/50 border-blue-200' : 'bg-gray-50/60 border-gray-100 hover:-translate-y-0.5 shadow-sm'
                          }`}
                          onMouseEnter={() => setCursorState('hover')}
                          onMouseLeave={() => setCursorState('default')}
                        >
                          <span className="text-sm font-semibold text-gray-800">🚖 AI Cab</span>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-medium">Pickup: <strong className="text-gray-800">3m</strong></span>
                            <span className="text-[10px] text-gray-400 font-medium">Fare: <strong className="text-gray-800">₹170-190</strong></span>
                          </div>
                          <button className="w-full py-1 text-[9px] font-bold text-center text-blue-600 bg-blue-100/40 rounded-md">
                            Continue
                          </button>
                        </div>

                        {/* Card 2: Smart Bus */}
                        <div 
                          onClick={() => handleLastMileSelect('bus')}
                          className={`p-3 rounded-xl border transition-all duration-300 flex flex-col justify-between gap-1.5 cursor-none text-left ${
                            selectedLastMile === 'bus' ? 'bg-blue-50/50 border-blue-200' : 'bg-gray-50/60 border-gray-100 hover:-translate-y-0.5 shadow-sm'
                          }`}
                          onMouseEnter={() => setCursorState('hover')}
                          onMouseLeave={() => setCursorState('default')}
                        >
                          <span className="text-sm font-semibold text-gray-800">🚌 Smart Bus</span>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-medium">Next: <strong className="text-gray-800">5m</strong></span>
                            <span className="text-[10px] text-gray-400 font-medium">Fare: <strong className="text-gray-800">₹15</strong></span>
                          </div>
                          <button className="w-full py-1 text-[9px] font-bold text-center text-blue-600 bg-blue-100/40 rounded-md">
                            Continue
                          </button>
                        </div>

                        {/* Card 3: Bike Share */}
                        <div 
                          onClick={() => handleLastMileSelect('bike')}
                          className={`p-3 rounded-xl border transition-all duration-300 flex flex-col justify-between gap-1.5 cursor-none text-left ${
                            selectedLastMile === 'bike' ? 'bg-blue-50/50 border-blue-200' : 'bg-gray-50/60 border-gray-100 hover:-translate-y-0.5 shadow-sm'
                          }`}
                          onMouseEnter={() => setCursorState('hover')}
                          onMouseLeave={() => setCursorState('default')}
                        >
                          <span className="text-sm font-semibold text-gray-800">🚲 Bike Share</span>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-medium">Walk: <strong className="text-gray-800">2m</strong></span>
                            <span className="text-[10px] text-gray-400 font-medium">Fare: <strong className="text-gray-800">₹20</strong></span>
                          </div>
                          <button className="w-full py-1 text-[9px] font-bold text-center text-blue-600 bg-blue-100/40 rounded-md">
                            Continue
                          </button>
                        </div>
                      </div>

                      {/* Clean "No, I don't need last mile assistance" button option */}
                      <button 
                        onClick={() => setSelectedLastMile('declined')}
                        onMouseEnter={() => setCursorState('hover')}
                        onMouseLeave={() => setCursorState('default')}
                        className="mt-1 text-center text-[11px] font-semibold text-gray-400 hover:text-gray-600 cursor-none transition-colors border border-dashed border-gray-200 py-2 rounded-xl bg-gray-50/30"
                      >
                        No, I do not need last-mile transit
                      </button>
                    </div>
                  )}

                  {selectedLastMile === 'declined' && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full p-4 rounded-xl bg-green-50/40 border border-green-200/50 text-center font-heading text-xs font-semibold text-green-700 mt-2"
                    >
                      ✓ Metro-Only Journey Confirmed & Finalized.
                    </motion.div>
                  )}

                  {lastMileTicket && (
                    <div className="w-full text-center"><span className="text-[11px] text-gray-400 font-medium">Click "Back to Pass" to view main metro boarding QR.</span></div>
                  )}

                  <div className="w-full h-px bg-gray-100 my-1" />
                  <Button variant="secondary" className="w-full flex items-center justify-center gap-2" onClick={() => { setTicketPass(null); setSelectedLastMile(null); setLastMileTicket(null); }}><RefreshCw size={14} /> Plan Another Route</Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* DYNAMIC METRIC OVERLAY GLASS MODALS */}
      <AnimatePresence>
        {/* Modal 1: Demo Overview Details */}
        {isOverviewModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setIsOverviewModalOpen(false)}
            className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm cursor-none"
          >
            <motion.div 
              ref={overviewModalRef}
              initial={{ scale: 0.9, y: 20, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              exit={{ scale: 0.9, y: 20, opacity: 0 }} 
              transition={springPhysical}
              onClick={(e) => e.stopPropagation()}
              className="liquid-glass w-full max-w-xl p-8 rounded-[32px] text-left relative overflow-hidden bg-white/95"
            >
              <button 
                onClick={() => setIsOverviewModalOpen(false)}
                onMouseEnter={() => setCursorState('hover')}
                onMouseLeave={() => setCursorState('default')}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100/50 transition-colors cursor-none"
              >
                <X size={20} className="text-gray-600" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-blue-50 text-blue-600"><Users size={28} /></div>
                <div>
                  <h3 className="font-heading text-2xl font-bold text-gray-900">Prototype Operations Status</h3>
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Operational metrics summary</span>
                </div>
              </div>

              {/* Station List Breakdown */}
              <div className="space-y-4 mb-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">9 Demonstration Stations status</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                  {MOCK_STATIONS.map(s => (
                    <div key={s.id} className="p-3 rounded-xl border border-gray-200/50 bg-white/40 flex justify-between items-center text-xs">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-gray-800">{s.name}</span>
                        <span className="text-[10px] font-semibold text-gray-500 capitalize">{s.districtId} District</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-600 font-bold">{s.traffic}% load</span>
                        <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-200/50 pt-5">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">Daily Passengers</span>
                  <span className="font-display font-bold text-gray-900 text-lg"><AnimatedNumber value={2436} /> total</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">Network Load</span>
                  <span className="font-heading font-bold text-green-600 text-lg">Optimal</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal 2: Telemetry Overview Details */}
        {isTelemetryModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setIsTelemetryModalOpen(false)}
            className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm cursor-none"
          >
            <motion.div 
              ref={telemetryModalRef}
              initial={{ scale: 0.9, y: 20, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              exit={{ scale: 0.9, y: 20, opacity: 0 }} 
              transition={springPhysical}
              onClick={(e) => e.stopPropagation()}
              className="liquid-glass w-full max-w-xl p-8 rounded-[32px] text-left relative overflow-hidden bg-white/95"
            >
              <button 
                onClick={() => setIsTelemetryModalOpen(false)}
                onMouseEnter={() => setCursorState('hover')}
                onMouseLeave={() => setCursorState('default')}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100/50 transition-colors cursor-none"
              >
                <X size={20} className="text-gray-600" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-blue-50 text-blue-600"><Cpu size={28} /></div>
                <div>
                  <h3 className="font-heading text-2xl font-bold text-gray-900">AI Control Center telemetry</h3>
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Live algorithmic regulation logs</span>
                </div>
              </div>

              {/* Operations logs list */}
              <div className="space-y-4 mb-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Active AI System services</h4>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs border-b border-gray-200/50 pb-2">
                    <span className="font-semibold text-gray-700">Stations Monitored</span>
                    <span className="font-mono font-bold text-gray-900">9 / 9 Active</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-gray-200/50 pb-2">
                    <span className="font-semibold text-gray-700">Dynamic Headway Control</span>
                    <span className="font-mono font-bold text-green-600">Active (Optimal)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-gray-200/50 pb-2">
                    <span className="font-semibold text-gray-700">Renewable Energy share</span>
                    <span className="font-mono font-bold text-blue-600">72% Grid Capacity</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-gray-200/50 pb-2">
                    <span className="font-semibold text-gray-700">Automated Bus Synchronizer</span>
                    <span className="font-mono font-bold text-purple-600">Active</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-200/50 pt-5">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-gray-500/50 mb-0.5">Average Delay</span>
                  <span className="font-display font-bold text-gray-900 text-lg">&lt; 2 min</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-gray-500/50 mb-0.5">Diagnosed Health</span>
                  <span className="font-heading font-bold text-green-600 text-lg">99.7% Perfect</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

// --- SCENE 5: SUSTAINABILITY DASHBOARD ---
const SustainabilityScene = () => {
  const { setCursorState } = useMetroActions();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const modalContent: Record<string, any> = {
    power: { title: "Regenerated Power", value: 18.6, suffix: " MWh", icon: Zap, color: "text-blue-500", description: "Our kinetic recovery network captures braking energy from 4,000+ trains daily. This energy is routed directly back into the station grids, cutting reliance on external power grids." },
    co2: { title: "CO2 Prevented", value: 4.8, suffix: " Tons", icon: Leaf, color: "text-green-500", description: "Through aggressive integration of living walls, solar infrastructure, and carbon-negative architecture, Metro Nexus directly removes greenhouse gases from the atmosphere." },
    efficiency: { title: "System Efficiency", value: 98.4, suffix: "%", icon: Shield, color: "text-indigo-500", description: "Powered by advanced neural networks, our system optimizes train schedules, regulates station temperatures, and minimizes waste in real-time." }
  };

  const handleCardClick = (id: string) => { setActiveModal(id); setCursorState('default'); };

  // Premium Apple-style single trigger path animation configurations
  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 1.0, ease: [0.25, 1, 0.5, 1] } // Apple premium easeOutQuart 1.0s draw time
    }
  };

  const fillVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 0.1, // Matches original visual opacity perfectly
      transition: { duration: 1.0, ease: [0.25, 1, 0.5, 1] }
    }
  };

  const modalInfo = activeModal ? modalContent[activeModal] : null;
  const ModalIcon = modalInfo?.icon;

  return (
    <section id="sustainability" className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-6 py-24 overflow-x-clip relative z-10">
      <div className="max-w-6xl w-full text-center relative z-10">
        <Badge color="green">Living Ecosystem</Badge>
        <h2 className="font-display text-5xl font-bold text-gray-900 mt-6 mb-6">Designed for Tomorrow.</h2>
        <p className="text-xl text-gray-600 mb-16 max-w-2xl mx-auto leading-relaxed">
          Technology means nothing if it costs the earth. Metro Nexus integrates kinetic recovery, solar infrastructure, and passive cooling into every station.
        </p>

        <div className="grid md:grid-cols-3 gap-6 text-left">
          {/* Use framer motion directly for hover cards on this scene to satisfy the requested specific popup effect */}
          <motion.div whileHover={animations.hoverCardLift} onClick={() => handleCardClick('power')} onMouseEnter={() => setCursorState('hover')} onMouseLeave={() => setCursorState('default')} className="relative overflow-hidden group bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 cursor-none">
            <div className="absolute top-0 right-0 p-6 opacity-5 transition-opacity group-hover:opacity-10"><Zap size={100} /></div>
            <span className="block text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Regenerated Power</span>
            <div className="font-display text-4xl text-gray-900 mb-2"><AnimatedNumber value={18.6} suffix=" MWh" /></div>
            <span className="text-green-600 font-medium text-sm flex items-center gap-1">+2.4% vs yesterday</span>
          </motion.div>
          
          <motion.div whileHover={animations.hoverCardLift} onClick={() => handleCardClick('co2')} onMouseEnter={() => setCursorState('hover')} onMouseLeave={() => setCursorState('default')} className="relative overflow-hidden group bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 cursor-none">
            <div className="absolute top-0 right-0 p-6 opacity-5 transition-opacity group-hover:opacity-10"><Leaf size={100} /></div>
            <span className="block text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">CO2 Prevented</span>
            <div className="font-display text-4xl text-gray-900 mb-2"><AnimatedNumber value={4.8} suffix=" Tons" /></div>
            <span className="text-green-600 font-medium text-sm">Equivalent to 240 trees planted</span>
          </motion.div>

          <motion.div whileHover={animations.hoverCardLift} onClick={() => handleCardClick('efficiency')} onMouseEnter={() => setCursorState('hover')} onMouseLeave={() => setCursorState('default')} className="relative overflow-hidden group bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-[20px] p-6 shadow-lg border-none cursor-none">
            <div className="absolute top-0 right-0 p-6 opacity-10"><Shield size={100} /></div>
            <span className="block text-sm font-semibold text-blue-200 uppercase tracking-wider mb-2">System Efficiency</span>
            <div className="font-display text-4xl text-white mb-2">98.4%</div>
            <span className="text-blue-100 font-medium text-sm">AI optimization active</span>
          </motion.div>
        </div>

        {/* Animated Chart Representation - Programmed to trigger precisely once when 75% visible */}
        <div className="mt-12 w-full h-[200px] relative rounded-[24px] border border-gray-200 bg-white/50 overflow-hidden flex items-end shadow-sm">
           <svg viewBox="0 0 1000 200" className="w-full h-full absolute inset-0" preserveAspectRatio="none">
             <path d="M 0 50 L 1000 50 M 0 100 L 1000 100 M 0 150 L 1000 150" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" />
             <motion.path 
               d="M 0 180 Q 200 150 400 160 T 700 80 T 1000 40" 
               fill="none" 
               stroke="#16A34A" 
               strokeWidth="4" 
               strokeLinecap="round" 
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true, amount: 0.75 }}
               variants={lineVariants}
             />
             <motion.path 
               d="M 0 180 Q 200 150 400 160 T 700 80 T 1000 40 L 1000 200 L 0 200 Z" 
               fill="url(#greenGradient)" 
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true, amount: 0.75 }}
               variants={fillVariants}
             />
             <defs>
               <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="0%" stopColor="#16A34A" />
                 <stop offset="100%" stopColor="transparent" />
               </linearGradient>
             </defs>
           </svg>
           <div className="absolute top-6 left-6 font-heading font-semibold text-gray-900">24hr Network Energy Profile</div>
        </div>
      </div>

      <AnimatePresence>
        {activeModal && modalInfo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm cursor-none" onClick={() => setActiveModal(null)} onMouseEnter={() => setCursorState('default')}>
            <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} transition={springPhysical} className="liquid-glass w-full max-w-lg p-8 rounded-[32px] relative overflow-hidden text-left" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setActiveModal(null)} onMouseEnter={() => setCursorState('hover')} onMouseLeave={() => setCursorState('default')} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100/50 transition-colors">
                <X size={20} className="text-gray-600" />
              </button>
              {ModalIcon && <ModalIcon size={48} className={`mb-6 ${modalInfo?.color}`} />}
              <h3 className="font-heading text-2xl font-bold text-gray-900 mb-2">{modalInfo?.title}</h3>
              <div className="font-display text-4xl text-gray-900 mb-6"><AnimatedNumber value={modalInfo?.value || 0} suffix={modalInfo?.suffix} /></div>
              <p className="font-body text-gray-600 leading-relaxed">{modalInfo?.description}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

// --- SCENE 6: FOOTER / FUTURE ---
const FooterScene = () => {
  return (
    <footer className="relative bg-white py-32 overflow-x-clip border-t border-gray-100 flex flex-col items-center justify-center text-center z-10">
      <div className="mb-8 w-[160px] md:w-[200px] flex justify-center">
         <MetroNexusFullPlaceholderLogo />
      </div>
      <div className="text-xs font-semibold text-gray-400 tracking-widest uppercase leading-loose">
        Metro Nexus<br/>
        AI-Powered Transportation Ecosystem<br/>
        2038
      </div>
    </footer>
  )
}

// ==========================================
// 7. MAIN APPLICATION WRAPPER (SPLIT CONTEXTS FOR HIGH PERFORMANCE)
// ==========================================

export default function App() {
  const [cursorState, setCursorState] = useState<CursorState>('default');
  const [activeDistrict, setActiveDistrict] = useState<string | null>(null);
  const [hoveredStation, setHoveredStation] = useState<string | null>(null);

  // Sync state variables initialized to default s1 (Nexus Central) and s5 (Eco Hub)
  const [originStation, setOriginStation] = useState<string>('s1');
  const [destinationStation, setDestinationStation] = useState<string>('s5');

  // Load dynamically clipped circular N icon as document Favicon
  useEffect(() => {
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    
    // Create custom N-icon favicon dynamically 
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#2563EB';
      ctx.beginPath();
      ctx.arc(32, 32, 30, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw white custom "N" overlay
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(22, 44);
      ctx.lineTo(22, 20);
      ctx.lineTo(32, 34);
      ctx.lineTo(42, 20);
      ctx.lineTo(42, 44);
      ctx.stroke();
      link.href = canvas.toDataURL('image/png');
    }
  }, []);

  // Memoize state object to prevent ref recreation on unrelated renders
  const stateValue = React.useMemo(() => ({
    cursorState,
    activeDistrict,
    hoveredStation,
    originStation,
    destinationStation
  }), [cursorState, activeDistrict, hoveredStation, originStation, destinationStation]);

  // Memoize stable dispatch actions so consumers never re-trigger
  const actionsValue = React.useMemo(() => ({
    setCursorState,
    setActiveDistrict,
    setHoveredStation,
    setOriginStation,
    setDestinationStation
  }), []);

  return (
    <MetroStateContext.Provider value={stateValue}>
      <MetroActionsContext.Provider value={actionsValue}>
        <GlobalStyles />
        <CustomCursor />
        <LiquidRipple />
        
        <main className="relative w-full bg-[#FAFAF8] selection:bg-blue-200">
          <NavigationBar />
          <HeroScene />
          <InteractiveMapScene />
          <DistrictScene />
          <AiJourneyScene />
          <SustainabilityScene />
          <FooterScene />
        </main>
      </MetroActionsContext.Provider>
    </MetroStateContext.Provider>
  );
}
