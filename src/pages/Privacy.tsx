import { ShieldCheck, Lock, EyeOff } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
          <ShieldCheck size={12} /> Privacy First Protocol
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic text-slate-900">Privacy Policy</h1>
        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Last Updated: March 2026</p>
      </header>

      <section className="grid gap-8">
        <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200/50">
          <h2 className="text-lg font-black uppercase tracking-tight mb-4 flex items-center gap-2">
            <Lock className="text-blue-600" size={20} /> Zero-Data Guarantee
          </h2>
          <p className="text-slate-600 leading-relaxed italic font-medium">
            Footprint Manager operates on a "Local-Only" architecture. We do not own servers that store your personal digital footprint data. All analysis is performed within your browser's memory and cleared upon session termination.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-black uppercase text-sm tracking-widest text-slate-400">Data Collection</h3>
          <p className="text-slate-700 leading-relaxed">
            We collect <strong>zero</strong> personally identifiable information (PII). Any data you input during the "Self-Audit" phase stays on your device. We use local storage only to persist your session if you choose to save progress locally.
          </p>
        </div>
      </section>
    </div>
  );
}