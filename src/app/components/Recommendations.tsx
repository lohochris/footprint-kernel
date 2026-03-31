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
  Loader2,
  ChevronRight
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
  critical: { badge: 'bg-rose-600 text-white', border: 'border-rose-200', text: 'text-rose-600' },
  high: { badge: 'bg-orange-600 text-white', border: 'border-orange-200', text: 'text-orange-600' },
  medium: { badge: 'bg-amber-500 text-white', border: 'border-amber-200', text: 'text-amber-600' },
  low: { badge: 'bg-blue-600 text-white', border: 'border-blue-200', text: 'text-blue-600' }
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
        description: 'Strategic behavioral adjustment identified by framework telemetry.',
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
    <div className="max-w-6xl mx-auto space-y-10 pb-24 px-4 pt-12 font-sans selection:bg-blue-500/20">
      
      {/* Dynamic Header */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-10 bg-slate-950 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden ring-1 ring-white/10">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] -mr-32 -mt-32" />
        
        <div className="relative z-10 space-y-6">
          <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-4 py-1.5 uppercase tracking-[0.25em] font-black text-[10px] rounded-lg">
            <Sparkles size={12} className="mr-2" /> 2026 Resilience Protocol
          </Badge>
          <div className="space-y-1">
            <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none text-white">
              Strategy <span className="text-blue-500">Room</span>
            </h1>
            <p className="text-slate-400 max-w-md font-bold uppercase text-[11px] tracking-widest leading-relaxed">
              Targeted mitigation ledger for the <span className="text-white underline decoration-blue-500 underline-offset-4 font-black">{typologyName}</span> profile.
            </p>
          </div>
        </div>
        
        <div className="bg-white p-10 rounded-[2.5rem] w-full md:w-[26rem] relative z-10 shadow-3xl border border-slate-100">
          <div className="flex justify-between items-end mb-5">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Sanitization Status</span>
            <span className="text-5xl font-black text-slate-950 tabular-nums italic leading-none">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-5 bg-slate-100 rounded-full" />
          <Button 
            size="lg" 
            className="w-full mt-10 font-black uppercase tracking-[0.2em] text-[11px] h-16 rounded-[1.5rem] bg-slate-950 text-white hover:bg-slate-800 transition-all shadow-2xl active:scale-95 cursor-pointer border-none"
            onClick={() => copyRecommendationsToClipboard(recommendations.map(r => `${r.title}: ${r.action}`))}
          >
            <Copy size={16} className="mr-3 stroke-[3]" /> Export Action Ledger
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar Controls */}
        <aside className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white p-6 rounded-[2.5rem] ring-1 ring-slate-100">
            <CardHeader className="px-2 pt-2"><CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">System Controls</CardTitle></CardHeader>
            <CardContent className="px-2 space-y-4">
              <div 
                className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => setShowCompleted(!showCompleted)}
              >
                <label className="text-[11px] font-black uppercase text-slate-600 tracking-tight cursor-pointer">Show Archived</label>
                <Checkbox checked={showCompleted} onCheckedChange={v => setShowCompleted(!!v)} className="h-6 w-6 rounded-lg cursor-pointer" />
              </div>
              <Link to="/audit" className="block w-full">
                <Button variant="outline" className="w-full border-slate-200 text-[10px] font-black uppercase tracking-widest h-14 rounded-2xl bg-white text-slate-950 hover:bg-slate-50 hover:border-blue-200 transition-all cursor-pointer">
                  <Zap size={14} className="mr-2 text-blue-500" /> Recalibrate
                </Button>
              </Link>
            </CardContent>
          </Card>
        </aside>

        {/* Recommendations List */}
        <div className="lg:col-span-3 space-y-8">
          <AnimatePresence mode="popLayout">
            {filteredRecs.map((rec) => (
              <motion.div 
                key={rec.id} 
                layout 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <Card className={`group border-none transition-all duration-500 rounded-[3rem] overflow-hidden ${completedRecs.includes(rec.id) ? 'bg-slate-50 opacity-40 grayscale' : 'bg-white shadow-2xl shadow-slate-200/40 hover:scale-[1.01] hover:shadow-slate-300/50'}`}>
                  <CardContent className="p-12">
                    <div className="flex items-start gap-10">
                      <div className="pt-2">
                        <Checkbox 
                          className="h-12 w-12 rounded-[1.25rem] border-[3px] border-slate-200 transition-all data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 cursor-pointer shadow-lg active:scale-90" 
                          checked={completedRecs.includes(rec.id)}
                          onCheckedChange={() => handleToggleComplete(rec.id)}
                        />
                      </div>
                      
                      <div className="flex-1 space-y-8">
                        <div className="space-y-4">
                          <div className="flex items-center gap-5">
                            <Badge className={`${PRIORITY_THEMES[rec.priority].badge} border-none font-black text-[9px] px-4 py-1.5 uppercase tracking-[0.2em] rounded-lg shadow-sm`}>
                              {rec.priority}
                            </Badge>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{rec.category}</span>
                          </div>
                          <h3 className={`text-4xl font-black tracking-tighter uppercase italic leading-none ${completedRecs.includes(rec.id) ? 'line-through text-slate-400' : 'text-slate-950'}`}>
                            {rec.title}
                          </h3>
                        </div>

                        <p className="text-slate-500 text-base font-bold uppercase tracking-tight leading-relaxed max-w-2xl">
                          {rec.description}
                        </p>

                        <div className="p-10 rounded-[2.5rem] border border-slate-100 bg-slate-50 group-hover:bg-blue-500/[0.02] group-hover:border-blue-500/10 transition-all duration-500 relative">
                          <p className="text-[10px] font-black text-blue-600 uppercase mb-5 flex items-center tracking-[0.4em]">
                            <Target size={18} className="mr-3 stroke-[3]" /> Deployment Action
                          </p>
                          <div className="flex items-start gap-4">
                            <p className="text-xl font-black text-slate-900 leading-snug italic flex-1">
                              "{rec.action}"
                            </p>
                            <ChevronRight className="h-6 w-6 text-slate-200 group-hover:text-blue-500 transition-colors mt-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredRecs.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
              <div className="p-6 bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Sparkles className="text-blue-500 h-8 w-8" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 italic">Perimeter Fully Secured</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}