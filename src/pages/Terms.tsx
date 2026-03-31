export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <h1 className="text-5xl font-black tracking-tighter uppercase italic text-slate-900">Terms of Use</h1>
      
      <div className="prose prose-slate max-w-none">
        <div className="p-8 border-l-4 border-blue-600 bg-blue-50/30 rounded-r-3xl">
          <p className="font-black uppercase text-xs tracking-widest text-blue-700 mb-2">Academic Disclaimer</p>
          <p className="text-slate-700 font-medium italic">
            This tool is a research-driven artifact designed for educational purposes. It provides risk estimations based on established privacy frameworks (Masur, Muhammad, Sindermann) but does not constitute legal or professional security advice.
          </p>
        </div>

        <section className="mt-12 space-y-8">
          <div>
            <h4 className="font-black uppercase text-sm tracking-widest text-slate-900">1. Acceptable Use</h4>
            <p className="text-slate-600">Users are encouraged to use the Footprint Manager for personal digital literacy improvement. Reverse engineering for commercial gain is prohibited.</p>
          </div>
          <div>
            <h4 className="font-black uppercase text-sm tracking-widest text-slate-900">2. Accuracy of Scores</h4>
            <p className="text-slate-600">The "Risk Score" is a mathematical heuristic. While derived from peer-reviewed literature, digital environments evolve rapidly; 100% accuracy is not guaranteed.</p>
          </div>
        </section>
      </div>
    </div>
  );
}