import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useRiskCalculation } from '../hooks/useRiskCalculation';
import { getTypologyRecommendations, classifyUserTypology } from '../utils/typologyClassifier';
import { calculateLiteracyScore } from '../utils/literacyScorer';
import { literacyQuestions } from '../data/auditQuestions';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Target, 
  Sparkles, 
  CheckCircle2,
  ExternalLink,
  Copy,
  ShieldCheck,
  ArrowRight,
  Zap,
  Lock,
  Globe
} from 'lucide-react';
import { copyRecommendationsToClipboard } from '../utils/pdfExporter';
import { toast } from 'sonner';

// --- Types & Constants ---
interface Recommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  category: 'Security' | 'Social' | 'Data' | 'Legal';
  resources?: Array<{ title: string; url: string }>;
}

const PRIORITY_THEMES = {
  critical: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-600' },
  high: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-600' },
  medium: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-600' },
  low: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-600' }
};

export function Recommendations() {
  const navigate = useNavigate();
  const [auditState] = useLocalStorage('footprint_audit_state', null);
  const [completedRecs, setCompletedRecs] = useLocalStorage<string[]>('footprint_completed_recommendations', []);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    if (!auditState?.completedAt) navigate('/audit');
  }, [auditState, navigate]);

  // --- Logic Memoization ---
  const recommendations = useMemo(() => {
    if (!auditState) return [];
    
    const recs: Recommendation[] = [];
    const responses = Object.entries(auditState.responses).map(([id, value]) => ({ id, value }));
    const riskResult = useRiskCalculation(responses);
    const literacyResponses = Object.entries(auditState.literacyResponses || {}).map(([id, value]) => ({ id, value }));
    const literacyResult = calculateLiteracyScore(literacyResponses, literacyQuestions);
    const typologyResult = classifyUserTypology(riskResult?.overallRisk || 50, literacyResult.overallScore);
    const typologyRecs = getTypologyRecommendations(typologyResult.typology);

    // 1. Risk-Based Logic (Premium Mapping)
    if (riskResult?.vulnerabilities.includes('Weak password management')) {
      recs.push({
        id: 'pwd-mgr',
        priority: 'critical',
        category: 'Security',
        title: 'Deploy Zero-Knowledge Vault',
        description: 'Your current credential strategy is vulnerable to 2026-standard brute force attacks.',
        action: 'Migrate to Bitwarden or 1Password using a 20-character master passphrase.',
        resources: [{ title: 'NCSC Password Collection', url: 'https://www.ncsc.gov.uk/collection/passwords' }]
      });
    }

    if (riskResult?.vulnerabilities.includes('Insufficient two-factor authentication')) {
      recs.push({
        id: 'mfa-sec',
        priority: 'critical',
        category: 'Security',
        title: 'Hardware-Backed MFA',
        description: 'Standard SMS 2FA is no longer sufficient against modern SIM-swapping.',
        action: 'Switch to TOTP (Authenticator App) or FIDO2 Security Keys for primary accounts.',
        resources: [{ title: '2FA Directory', url: 'https://2fa.directory/' }]
      });
    }

    // 2. Typology-Based Logic
    typologyRecs.priority.forEach((text, i) => {
      recs.push({
        id: `typ-p-${i}`,
        priority: 'medium',
        category: 'Data',
        title: text,
        description: `Strategic action for the ${typologyResult.typology} persona.`,
        action: text,
      });
    });

    return recs.sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.priority] - order[b.priority];
    });
  }, [auditState]);

  const filteredRecs = showCompleted 
    ? recommendations 
    : recommendations.filter(r => !completedRecs.includes(r.id));

  const completionRate = Math.round((completedRecs.length / recommendations.length) * 100) || 0;

  const handleToggleComplete = (id: string) => {
    setCompletedRecs(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    if (!completedRecs.includes(id)) toast.success('Action marked as resolved');
  };

  if (!auditState?.completedAt) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4">
      {/* Hero Section */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2rem] text-white shadow-2xl overflow-hidden relative">
        <div className="relative z-10">
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-4 px-3 py-1">
            <Sparkles size={14} className="mr-2" /> 2026 Privacy Protocol
          </Badge>
          <h1 className="text-4xl font-black tracking-tight mb-2">Strategy Room</h1>
          <p className="text-slate-400 max-w-md">
            We've generated {recommendations.length} clinical actions based on your <span className="text-white font-bold">{auditState.typology}</span> footprint.
          </p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 w-full md:w-80">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Resolution Rate</span>
            <span className="text-3xl font-black text-white">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-3 bg-white/10" />
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="secondary" className="w-full font-bold" onClick={() => copyRecommendationsToClipboard(recommendations.map(r => r.action))}>
              <Copy size={14} className="mr-2" /> Export
            </Button>
          </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" />
      </header>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Settings & Filters Sidebar */}
        <aside className="space-y-6">
          <Card className="border-none shadow-sm bg-slate-50">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-tighter text-slate-500">Dashboard Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                <label htmlFor="show-comp" className="text-sm font-bold text-slate-700">Include Resolved</label>
                <Checkbox id="show-comp" checked={showCompleted} onCheckedChange={v => setShowCompleted(!!v)} />
              </div>
              <Link to="/audit">
                <Button variant="outline" className="w-full border-slate-300 hover:bg-slate-100">
                  <Zap size={16} className="mr-2" /> Re-Scan Footprint
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-blue-600 text-white overflow-hidden">
            <CardContent className="p-6 relative">
              <Globe className="absolute -right-4 -bottom-4 opacity-20" size={100} />
              <h4 className="font-bold mb-2 flex items-center">
                <ShieldCheck size={18} className="mr-2" /> UK Legal Guard
              </h4>
              <p className="text-xs text-blue-100 leading-relaxed">
                Your recommendations align with the <strong>Data (Use and Access) Act 2025</strong>. 
                Completion of these tasks qualifies as "Reasonable Security Measures" under current ICO guidelines.
              </p>
            </CardContent>
          </Card>
        </aside>

        {/* Recommendations Feed */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredRecs.map((rec) => (
              <motion.div
                key={rec.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={`group border-2 transition-all hover:shadow-md ${rec.id && completedRecs.includes(rec.id) ? 'bg-slate-50 border-slate-100 opacity-60' : `bg-white ${PRIORITY_THEMES[rec.priority].border}`}`}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="pt-1">
                        <Checkbox 
                          className="h-6 w-6 rounded-full" 
                          checked={completedRecs.includes(rec.id)}
                          onCheckedChange={() => handleToggleComplete(rec.id)}
                        />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge className={`${PRIORITY_THEMES[rec.priority].badge} border-none font-black text-[10px]`}>
                                {rec.priority.toUpperCase()}
                              </Badge>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{rec.category}</span>
                            </div>
                            <h3 className={`text-xl font-black tracking-tight ${completedRecs.includes(rec.id) ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {rec.title}
                            </h3>
                          </div>
                        </div>

                        <p className="text-slate-600 text-sm leading-relaxed">
                          {rec.description}
                        </p>

                        <div className="bg-slate-50 group-hover:bg-white transition-colors p-4 rounded-xl border border-slate-100">
                          <p className="text-xs font-black text-slate-400 uppercase mb-2 flex items-center">
                            <Target size={12} className="mr-2 text-blue-500" /> Executive Action
                          </p>
                          <p className="text-sm font-semibold text-slate-800 italic">"{rec.action}"</p>
                        </div>

                        {rec.resources && rec.resources.length > 0 && (
                          <div className="flex gap-3 pt-2">
                            {rec.resources.map((res, i) => (
                              <a 
                                key={i} 
                                href={res.url} 
                                target="_blank" 
                                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                {res.title} <ExternalLink size={12} className="ml-1.5" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredRecs.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-sm mb-4">
                <ShieldCheck size={40} className="text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Perimeter Secured</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-2">
                All priority recommendations have been addressed. You are operating at peak privacy.
              </p>
              <Button variant="link" onClick={() => setShowCompleted(true)} className="mt-4 font-bold">
                Review Resolved Actions <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}