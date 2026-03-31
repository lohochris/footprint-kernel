import { Target, Compass, Zap } from 'lucide-react';

export default function Mission() {
  const points = [
    { icon: Zap, title: "Literacy", desc: "Turning complex privacy jargon into actionable scores." },
    { icon: Target, title: "Agency", desc: "Giving UK citizens the tools to delete what isn't needed." },
    { icon: Compass, title: "Guidance", desc: "Navigating the 2026 digital landscape safely." }
  ];

  return (
    <div className="max-w-5xl mx-auto py-12 space-y-20">
      <div className="max-w-2xl">
        <h1 className="text-7xl font-black tracking-tighter uppercase italic leading-[0.9]">Our <span className="text-blue-600">Mission</span></h1>
        <p className="mt-8 text-xl font-medium text-slate-600 italic">
          "To democratize digital self-defense by making data privacy a tangible, measurable, and manageable human right."
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {points.map((p, i) => (
          <div key={i} className="p-10 border border-slate-200 rounded-[3rem] hover:shadow-xl transition-all group">
            <p.icon size={40} className="text-blue-600 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="font-black uppercase tracking-widest mb-4">{p.title}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}