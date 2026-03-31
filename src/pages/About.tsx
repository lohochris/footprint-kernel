import { GraduationCap, MapPin, Mail } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-16 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-black tracking-tighter uppercase italic text-slate-900">About Us</h1>
        <p className="text-blue-600 font-black uppercase text-sm tracking-[0.3em]">The Intersection of Tech & Academia</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
  <h2 className="text-2xl font-black uppercase tracking-tight">The Vision</h2>
  <p className="text-slate-600 leading-relaxed">
    Footprint Manager was born out of a necessity to solve the <strong>Privacy Paradox</strong>: 
    the gap between people's stated privacy concerns and their actual online behavior.
  </p>
  <p className="text-slate-600 leading-relaxed font-medium italic border-l-2 border-blue-600 pl-4">
    By aligning cutting-edge privacy research with <strong>UK data protection standards</strong>, 
    we have built a critical bridge for citizens to visualize and manage their invisible digital trails.
  </p>
</div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6 shadow-2xl">
          <h3 className="font-black uppercase text-xs tracking-[0.3em] text-blue-400">Lead Researcher</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <GraduationCap className="text-slate-400" size={24} />
              <div>
                <p className="font-black uppercase text-sm">Buhari Getso</p>
                <p className="text-xs text-slate-400 uppercase tracking-widest">School of Science & Technology</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin className="text-slate-400" size={20} />
              <p className="text-xs text-slate-400 uppercase tracking-widest leading-relaxed">Nottingham Trent University, UK</p>
            </div>
            <div className="flex items-start gap-4">
              <Mail className="text-slate-400" size={20} />
              <a href="mailto:buhari4420@gmail.com" className="text-xs font-black text-blue-400 uppercase tracking-widest border-b border-blue-400/30 pb-1">buhari4420@gmail.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}