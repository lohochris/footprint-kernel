import { Outlet, Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  Search, 
  ShieldAlert, 
  GraduationCap, 
  Brain, 
  Target,
  Settings,
  Footprints,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  Lock
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function MainLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // High-end scroll detection for the glassmorphism effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Self-Audit', href: '/audit', icon: Search },
    { name: 'Risk', href: '/risk-score', icon: ShieldAlert },
    { name: 'Education', href: '/education', icon: GraduationCap },
    { name: 'Quiz', href: '/quiz', icon: Brain },
    { name: 'Strategy', href: '/recommendations', icon: Target },
  ];

  const isActive = (path: string) => 
    path === '/' ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* --- PREMIUM TOP NAVIGATION --- */}
      <nav className={`sticky top-0 z-[100] transition-all duration-500 ${
        scrolled 
          ? 'py-3 bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)]' 
          : 'py-6 bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between">
            
            {/* Logo & Identity */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-slate-900 p-2 rounded-xl text-white shadow-xl">
                  <Footprints size={22} />
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="block font-black text-lg leading-none tracking-tighter text-slate-900">
                  FOOTPRINT<span className="text-blue-600">.</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Manager 2026
                </span>
              </div>
            </Link>

            {/* Desktop Navigation: Horizontal Pill Style */}
            <div className="hidden lg:flex items-center bg-slate-100/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/40">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`relative px-5 py-2 text-sm font-bold transition-all duration-300 ${
                      active ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {active && (
                      <motion.div 
                        layoutId="activeNav" 
                        className="absolute inset-0 bg-white rounded-[10px] shadow-sm border border-slate-200/20"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <item.icon size={14} className={active ? 'text-blue-600' : 'text-slate-400'} />
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              <Link to="/settings" className={`p-2.5 rounded-xl transition-all ${
                isActive('/settings') ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
                <Settings size={20} />
              </Link>
              
              {/* Mobile Toggle */}
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2.5 rounded-xl bg-slate-900 text-white shadow-lg"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MOBILE FULL-SCREEN MENU --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[200] bg-white lg:hidden flex flex-col"
          >
            <div className="p-6 flex justify-between items-center border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Footprints className="text-blue-600" size={24} />
                <span className="font-black tracking-tighter">NAVIGATOR</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-3 bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-grow p-6 space-y-4">
              {navigation.map((item, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={item.name}
                >
                  <Link
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-5 rounded-3xl text-lg font-black transition-all ${
                      isActive(item.href) ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-slate-50 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon size={22} />
                      {item.name}
                    </div>
                    <ChevronRight size={18} />
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="p-8 bg-slate-50 m-6 rounded-[2rem] border border-slate-200/50">
               <div className="flex items-center gap-3 mb-2">
                 <ShieldCheck className="text-emerald-500" size={18} />
                 <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Security Status</span>
               </div>
               <p className="text-sm font-bold text-slate-700">Encrypted Local Session Active</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN PAGE CONTENT --- */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 md:py-12">
          <Outlet />
        </div>
      </main>

      {/* --- EXCELLENT PREMIUM FOOTER --- */}
      <footer className="bg-[#0A0C10] text-slate-400 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24 mb-20">
            
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                  <Footprints size={20} />
                </div>
                <span className="text-2xl font-black text-white tracking-tighter">Footprint<span className="text-blue-500">.</span></span>
              </div>
              <p className="text-sm leading-relaxed font-medium">
                Pioneering privacy-by-design through academic rigor. Empowering UK citizens to reclaim their digital agency since 2024.
              </p>
            </div>

            <div className="space-y-6">
              <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">Frameworks</h4>
              <nav className="flex flex-col gap-4 text-xs font-bold uppercase tracking-widest">
                <span className="hover:text-blue-500 transition-colors cursor-default">Masur Literacy (2020)</span>
                <span className="hover:text-blue-500 transition-colors cursor-default">Muhammad Typology (2024)</span>
                <span className="hover:text-blue-500 transition-colors cursor-default">Sindermann PIVA (2021)</span>
              </nav>
            </div>

            <div className="space-y-6">
              <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">Integrity</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs font-black">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  ZERO SERVER TRANSMISSION
                </div>
                <div className="flex items-center gap-3 text-xs font-black">
                  <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  LOCAL VAULT ENCRYPTION
                </div>
                <div className="flex items-center gap-3 text-xs font-black text-slate-500">
                  <div className="h-2 w-2 rounded-full bg-slate-700" />
                  UK GDPR 2026 COMPLIANT
                </div>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                 <Lock size={60} />
               </div>
               <h4 className="text-white font-black text-sm mb-4">Privacy Paradox Solution</h4>
               <p className="text-xs leading-relaxed mb-6 opacity-60">
                 Designed to close the gap between your privacy concerns and your digital actions.
               </p>
               <Link to="/audit" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors">
                 Initiate Audit <ChevronRight size={12} />
               </Link>
            </div>
          </div>

          <div className="pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                © 2026 FOOTPRINT MANAGER
              </p>
              <div className="h-1 w-1 rounded-full bg-slate-700 hidden sm:block" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                Data (Use and Access) Act 2025
              </p>
            </div>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <button className="hover:text-white transition-colors">Open Source</button>
              <button className="hover:text-white transition-colors">Research Paper</button>
              <button className="hover:text-white transition-colors">ICO Sandbox</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}