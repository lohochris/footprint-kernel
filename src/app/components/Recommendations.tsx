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
  CheckCircle2,
  Copy,
  ShieldCheck,
  ArrowRight,
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
  resource?: { title: string; url: string };
}

const PRIORITY_THEMES = {
  critical: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-600' },
  high: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-600' },
  medium: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-600' },
  low: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-600' }
};

export function Recommendations() {
  const navigate = useNavigate();
  const [auditState] = useLocalStorage<AuditState | null>('footprint_audit_state', null);
  const [completedRecs, setCompletedRecs] = useLocalStorage<string[]>('footprint_completed_recommendations', []);
  const [showCompleted, setShowCompleted] = useState(false);

  const formattedResponses = useMemo(() => {
    if (!auditState?.responses) return [];
    return Object.entries(auditState.responses).map(([id, value]) => ({ 
      id, 
      value: value as any 
    }));
  }, [auditState?.responses]);

  const riskResult = useRiskCalculation(formattedResponses);

  useEffect(() => {
    if (!auditState?.completedAt) navigate('/audit');
  }, [auditState, navigate]);

  const { recommendations, typologyName } = useMemo(() => {
    if (!auditState || !riskResult) return { recommendations: [], typologyName: 'Unknown' };
    
    const recs: Recommendation[] = [];
    const literacyResponses: LiteracyResponse[] = Object.entries(auditState.literacyResponses || {}).map(([id, value]) => ({
      id,
      value: Number(value) 
    }));

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
        resource: { title: 'NCSC Password Guidance', url: 'https://www.ncsc.gov.uk/collection/passwords' }
      });
    }

    typologyRecs.priority.forEach((text, i) => {
      recs.push({
        id: `typ-p-${i}`,
        priority: i === 0 ? 'high' : 'medium',
        category: 'Data',
        title: `Protocol for ${typologyResult.typology} Archetype`,
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

  const filteredRecs = showCompleted 
    ? recommendations 
    : recommendations.filter(r => !completedRecs.includes(r.id));

  const completionRate = recommendations.length > 0 
    ? Math.round((completedRecs.filter(id => recommendations.some(r => r.id === id)).length / recommendations.length) * 100)
    : 0;

  const handleExport = () => {
    const success = copyRecommendationsToClipboard(recommendations.map(r => `${r.title}: ${r.action}`));
    if (success) toast.success('Action Ledger Copied');
  };

  const handleToggleComplete = (id: string) => {
    setCompletedRecs(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    if (!completedRecs.includes(id)) toast.success('Objective Secured');
  };

  if (!auditState?.completedAt || !riskResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 font-sans">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-black uppercase tracking-widest text-slate-500">Synthesizing Strategy...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4 pt-8 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-950 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="relative z-10 space-y-4">
          <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-1 uppercase tracking-[0.2em] font-black text-[10px]">
            <Sparkles size={12} className="mr-2" /> 2026 Resilience Protocol
          </Badge>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic">Strategy <span className="text-primary">Room</span></h1>
          <p className="text-slate-400 max-w-md font-medium leading-relaxed">
            Personalized mitigation plan for the <span className="text-white underline decoration-primary underline-offset-4 font-bold">{typologyName}</span> profile.
          </p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 w-full md:w-96 relative z-10 shadow-inner">
          <div className="flex justify-between items-end mb-3">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Sanitization Progress</span>
            <span className="text-4xl font-black text-white tabular-nums">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-3 bg-white/20" />
          <div className="mt-6">
            <Button 
              size="sm" 
              variant="secondary" 
              className="w-full font-black uppercase tracking-widest text-[10px] h-12 rounded-xl bg-white text-slate-950 hover:bg-slate-200 transition-all active:scale-95"
              onClick={handleExport}
            >
              <Copy size={14} className="mr-2" /> Export Action Ledger
            </Button>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <aside className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-xl bg-slate-50/50 p-2 rounded-3xl">
            <CardHeader>
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200">
                <label htmlFor="show-comp" className="text-xs font-bold text-slate-700">Archived Actions</label>
                <Checkbox id="show-comp" checked={showCompleted} onCheckedChange={v => setShowCompleted(!!v)} />
              </div>
              <Link to="/audit" className="block w-full">
                <Button variant="outline" className="w-full border-slate-200 hover:bg-white text-[10px] font-black uppercase tracking-widest h-12 rounded-2xl shadow-sm bg-white">
                  <Zap size={14} className="mr-2 text-primary" /> Recalibrate
                </Button>
              </Link>
            </CardContent>
          </Card>
        </aside>

        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredRecs.map((rec) => (
              <motion.div key={rec.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
                <Card className={`group border-2 transition-all duration-300 rounded-[2rem] overflow-hidden ${completedRecs.includes(rec.id) ? 'bg-slate-50 border-slate-100 opacity-50 grayscale' : `bg-white ${PRIORITY_THEMES[rec.priority].border} shadow-lg hover:shadow-2xl`}`}>
                  <CardContent className="p-8">
                    <div className="flex gap-6">
                      <div className="pt-1">
                        <Checkbox 
                          className="h-8 w-8 rounded-xl border-2 transition-all data-[state=checked]:bg-primary" 
                          checked={completedRecs.includes(rec.id)}
                          onCheckedChange={() => handleToggleComplete(rec.id)}
                        />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Badge className={`${PRIORITY_THEMES[rec.priority].badge} border-none font-black text-[9px] px-3 text-white uppercase tracking-widest`}>
                              {rec.priority}
                            </Badge>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{rec.category}</span>
                          </div>
                          <h3 className={`text-2xl font-black tracking-tighter uppercase italic ${completedRecs.includes(rec.id) ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {rec.title}
                          </h3>
                        </div>
                        <p className="text-slate-600 text-sm font-medium leading-relaxed max-w-2xl">{rec.description}</p>
                        <div className="bg-slate-50 group-hover:bg-primary/5 transition-colors p-6 rounded-2xl border border-slate-100">
                          <p className="text-[10px] font-black text-primary uppercase mb-3 flex items-center tracking-widest">
                            <Target size={14} className="mr-2" /> Required Action
                          </p>
                          <p className="text-[13px] font-bold text-slate-800 leading-snug italic">"{rec.action}"</p>
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