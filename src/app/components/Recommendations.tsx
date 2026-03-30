import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useRiskCalculation } from '../hooks/useRiskCalculation';
import { getTypologyRecommendations, classifyUserTypology } from '../utils/typologyClassifier';
import { calculateLiteracyScore, type LiteracyResponse } from '../utils/literacyScorer';
import { literacyQuestions } from '../data/auditQuestions';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Target, 
  Sparkles, 
  Copy,
  Zap,
  Loader2
} from 'lucide-react';
import { copyRecommendationsToClipboard } from '../utils/pdfExporter';
import { toast } from 'sonner';

interface AuditState {
  completedAt: string | number | Date;
  responses: Record<string, any>;
  literacyResponses: Record<string, number>;
}

interface Recommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  category: 'Security' | 'Social' | 'Data' | 'Legal';
}

const PRIORITY_THEMES = {
  critical: { badge: 'bg-rose-600 text-white', border: 'border-rose-200' },
  high: { badge: 'bg-orange-600 text-white', border: 'border-orange-200' },
  medium: { badge: 'bg-amber-600 text-white', border: 'border-amber-200' },
  low: { badge: 'bg-blue-600 text-white', border: 'border-blue-200' }
};

export function Recommendations() {
  const navigate = useNavigate();
  const [auditState] = useLocalStorage<AuditState | null>('footprint_audit_state', null);
  const [completedRecs, setCompletedRecs] = useLocalStorage<string[]>('footprint_completed_recommendations', []);
  const [showCompleted, setShowCompleted] = useState(false);

  const formattedResponses = useMemo(() => {
    if (!auditState?.responses) return [];
    return Object.entries(auditState.responses).map(([id, value]) => ({ id, value: value as any }));
  }, [auditState?.responses]);

  const riskResult = useRiskCalculation(formattedResponses);

  useEffect(() => {
    if (!auditState?.completedAt) navigate('/audit');
  }, [auditState, navigate]);

  const { recommendations, typologyName } = useMemo(() => {
    if (!auditState || !riskResult) return { recommendations: [], typologyName: 'Unknown' };
    const recs: Recommendation[] = [];
    const literacyResponses: LiteracyResponse[] = Object.entries(auditState.literacyResponses || {}).map(([id, value]) => ({ id, value: Number(value) }));
    const literacyResult = calculateLiteracyScore(literacyResponses, literacyQuestions);
    const typologyResult = classifyUserTypology(riskResult?.overallRisk || 50, literacyResult.overallScore);
    const typologyRecs = getTypologyRecommendations(typologyResult.typology);

    if (riskResult?.vulnerabilities.some(v => v.toLowerCase().includes('password'))) {
      recs.push({
        id: 'sec-pwd',
        priority: 'critical',
        category: 'Security',
        title: 'Zero-Knowledge Vault Deployment',
        description: 'Vulnerability detected in credential management logic.',
        action: 'Migrate to a password manager (e.g., Bitwarden) and use a unique 15+ character passphrase.',
      });
    }

    typologyRecs.priority.forEach((text, i) => {
      recs.push({
        id: `typ-p-${i}`,
        priority: i === 0 ? 'high' : 'medium',
        category: 'Data',
        title: `Protocol: ${typologyResult.typology} Archetype`,
        description: 'Strategic behavioral adjustment identified by the Muhammad et al. Framework.',
        action: text,
      });
    });

    return { 
      recommendations: recs.sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return order[a.priority] - order[b.priority];
      }),
      typologyName: typologyResult.typology 
    };
  }, [auditState, riskResult]);

  const filteredRecs = showCompleted ? recommendations : recommendations.filter(r => !completedRecs.includes(r.id));
  const completionRate = recommendations.length > 0 ? Math.round((completedRecs.filter(id => recommendations.some(r => r.id === id)).length / recommendations.length) * 100) : 0;

  const handleToggleComplete = (id: string) => {
    setCompletedRecs(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    if (!completedRecs.includes(id)) toast.success('Objective Secured');
  };

  if (!auditState?.completedAt || !riskResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-white font-sans">
        <Loader2 className="h-10 w-10 animate-spin text-slate-900" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Synthesizing Strategy...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-24 px-4 pt-12 font-sans selection:bg-primary/20">
      
      {/* Header with White Text Correction */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-10 bg-slate-950 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <Badge className="bg-white/10 text-white border-none px-4 py-1.5 uppercase tracking-[0.25em] font-black text-[10px]">
            <Sparkles size={12} className="mr-2 text-primary" /> 2026 Resilience Protocol
          </Badge>
          <div className="space-y-1">
            <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none text-white">
              Strategy <span className="text-primary">Room</span>
            </h1>
            <p className="text-slate-300 max-w-md font-bold uppercase text-[11px] tracking-tight leading-relaxed">
              Targeted mitigation ledger for the <span className="text-white underline decoration-primary underline-offset-4 font-black">{typologyName}</span> profile.
            </p>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-[2rem] w-full md:w-[26rem] relative z-10 shadow-2xl">
          <div className="flex justify-between items-end mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Tactical Sanitization</span>
            <span className="text-5xl font-black text-slate-950 tabular-nums italic leading-none">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-4 bg-slate-100" />
          <Button 
            size="lg" 
            className="w-full mt-8 font-black uppercase tracking-[0.15em] text-[11px] h-14 rounded-2xl bg-slate-950 text-white hover:bg-slate-800 transition-all shadow-xl"
            onClick={() => copyRecommendationsToClipboard(recommendations.map(r => `${r.title}: ${r.action}`))}
          >
            <Copy size={16} className="mr-3" /> Export Action Ledger
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <aside className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-2xl bg-white p-4 rounded-[2.5rem]">
            <CardHeader><CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">System Controls</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <label className="text-[11px] font-black uppercase text-slate-600 tracking-tight">Show Archived</label>
                <Checkbox checked={showCompleted} onCheckedChange={v => setShowCompleted(!!v)} className="h-6 w-6 rounded-lg" />
              </div>
              <Link to="/audit" className="block w-full">
                <Button variant="outline" className="w-full border-slate-200 text-[10px] font-black uppercase tracking-widest h-14 rounded-2xl bg-white text-slate-950">
                  <Zap size={14} className="mr-2 text-primary" /> Recalibrate
                </Button>
              </Link>
            </CardContent>
          </Card>
        </aside>

        <div className="lg:col-span-3 space-y-8">
          <AnimatePresence mode="popLayout">
            {filteredRecs.map((rec) => (
              <motion.div key={rec.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                <Card className={`group border-none transition-all duration-500 rounded-[2.5rem] overflow-hidden ${completedRecs.includes(rec.id) ? 'bg-slate-50 opacity-40 grayscale' : 'bg-white shadow-2xl shadow-slate-200/60'}`}>
                  <CardContent className="p-10">
                    <div className="flex gap-8">
                      <Checkbox 
                        className="h-10 w-10 mt-2 rounded-2xl border-2 border-slate-200 transition-all data-[state=checked]:bg-primary data-[state=checked]:border-primary cursor-pointer shadow-md" 
                        checked={completedRecs.includes(rec.id)}
                        onCheckedChange={() => handleToggleComplete(rec.id)}
                      />
                      <div className="flex-1 space-y-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-4">
                            <Badge className={`${PRIORITY_THEMES[rec.priority].badge} border-none font-black text-[9px] px-3 py-1 uppercase tracking-widest`}>
                              {rec.priority}
                            </Badge>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{rec.category}</span>
                          </div>
                          <h3 className={`text-3xl font-black tracking-tighter uppercase italic leading-tight ${completedRecs.includes(rec.id) ? 'line-through text-slate-400' : 'text-slate-950'}`}>
                            {rec.title}
                          </h3>
                        </div>
                        <p className="text-slate-600 text-sm font-bold uppercase tracking-tight leading-relaxed">
                          {rec.description}
                        </p>
                        <div className="p-8 rounded-3xl border border-slate-100 bg-slate-50 group-hover:bg-primary/[0.03] transition-colors">
                          <p className="text-[10px] font-black text-primary uppercase mb-4 flex items-center tracking-[0.2em]">
                            <Target size={16} className="mr-3" /> Mandatory Protocol
                          </p>
                          <p className="text-lg font-black text-slate-900 leading-snug italic">
                            "{rec.action}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}