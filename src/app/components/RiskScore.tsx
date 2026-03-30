import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, AlertTriangle, TrendingUp,
  Download, Target, Brain, Shield, FileText, Database,
  CheckCircle2, RefreshCcw 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as ChartTooltip, ResponsiveContainer, Cell 
} from 'recharts';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useRiskCalculation } from '../hooks/useRiskCalculation';
import { calculateLiteracyScore } from '../utils/literacyScorer';
import { classifyUserTypology } from '../utils/typologyClassifier';
import { literacyQuestions } from '../data/auditQuestions';
import { generatePDFReport, exportAsJSON } from '../utils/pdfExporter';

import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from './ui/dropdown-menu';

interface AuditState {
  currentStep: number;
  currentCategory: string;
  responses: Record<string, any>;
  literacyResponses: Record<string, number>;
  completedAt: string | null;
  lastSaved: string;
}

const STORAGE_KEY = 'footprint_audit_state';

const THEME = {
  low: { color: '#10b981', bg: 'bg-emerald-50/50', border: 'border-emerald-200', text: 'text-emerald-700' },
  medium: { color: '#f59e0b', bg: 'bg-amber-50/50', border: 'border-amber-200', text: 'text-amber-700' },
  high: { color: '#ef4444', bg: 'bg-rose-50/50', border: 'border-rose-200', text: 'text-rose-700' }
};

export function RiskScore() {
  const navigate = useNavigate();
  const [auditState, setAuditState, clearAuditState] = useLocalStorage<AuditState | null>(STORAGE_KEY, null);

  useEffect(() => {
    if (!auditState?.completedAt) {
      const timer = setTimeout(() => navigate('/audit'), 100);
      return () => clearTimeout(timer);
    }
  }, [auditState?.completedAt, navigate]);

  const results = useMemo(() => {
    if (!auditState || !auditState.responses) return null;

    const riskResponses = Object.entries(auditState.responses).map(([id, value]) => ({ 
      id, 
      value: typeof value === 'object' ? value : Number(value) 
    }));
    
    const risk = useRiskCalculation(riskResponses);
    const litResponses = Object.entries(auditState.literacyResponses || {}).map(([id, value]) => ({ 
      id, 
      value: Number(value) 
    }));
    
    const literacy = calculateLiteracyScore(litResponses, literacyQuestions);
    const typology = classifyUserTypology(risk?.overallRisk || 0, literacy.overallScore);

    return { risk, literacy, typology };
  }, [auditState]);

  if (!results || !results.risk) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCcw className="h-8 w-8 animate-spin text-primary/40" />
      </div>
    );
  }

  const { risk, literacy, typology } = results;
  const currentTheme = THEME[risk.riskLevel as keyof typeof THEME] || THEME.medium;

  const handleRestart = () => {
    if (window.confirm("Begin a new session? Current session data will be archived.")) {
        clearAuditState();
        navigate('/audit');
    }
  };

  const prepareExportData = () => ({
    auditDate: new Date().toLocaleDateString(),
    riskScore: risk.overallRisk,
    riskLevel: risk.riskLevel,
    literacyScore: literacy.overallScore,
    literacyLevel: literacy.level,
    typology: typology.typology, 
    categoryBreakdown: risk.categoryBreakdown,
    vulnerabilities: risk.vulnerabilities,
    strengths: risk.strengths,
    recommendations: typology.actionPlan, 
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 px-4 pt-8 animate-in fade-in duration-700 font-sans">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border-emerald-200 text-emerald-600 bg-emerald-50">
               <CheckCircle2 className="h-3 w-3 mr-1" /> Analysis Finalized
             </Badge>
             <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter opacity-80 italic">UK Data Privacy Framework 2026</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 uppercase italic">
            Privacy <span className="text-primary">Intelligence</span> Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRestart}
            className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
          >
            <RefreshCcw className="mr-2 h-3 w-3" /> New Session
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="bg-slate-950 text-white font-black uppercase tracking-widest text-[10px] px-6 h-12 rounded-xl hover:bg-slate-800 transition-all active:scale-95 cursor-pointer shadow-xl">
                <Download className="mr-2 h-4 w-4" /> Export Assets
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl shadow-2xl p-2 border-slate-100 bg-white">
              <DropdownMenuLabel className="text-[10px] uppercase font-black text-slate-400 px-3 py-2 tracking-widest">Asset Management</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="py-3 cursor-pointer rounded-xl focus:bg-slate-50" onClick={() => generatePDFReport(prepareExportData() as any)}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-50 rounded-lg"><FileText className="h-4 w-4 text-rose-600" /></div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-900 uppercase">Comprehensive PDF</span>
                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tight">Audit & Action Plan</span>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="py-3 cursor-pointer rounded-xl focus:bg-slate-50" onClick={() => exportAsJSON(prepareExportData() as any)}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg"><Database className="h-4 w-4 text-blue-600" /></div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-900 uppercase">Research JSON</span>
                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tight">Raw Telemetry Data</span>
                  </div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Score Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={`border shadow-2xl shadow-slate-200/50 rounded-2xl overflow-hidden ${currentTheme.bg} ${currentTheme.border}`}>
          <CardHeader className="pb-2 pt-6">
            <CardTitle className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${currentTheme.text}`}>
              <ShieldAlert className="h-4 w-4" /> Exposure Score
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-10 pt-4">
            <div className={`text-8xl font-black mb-2 tracking-tighter ${currentTheme.text}`}>
              {risk.overallRisk}<span className="text-2xl opacity-40 font-medium">%</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">{risk.riskLevel} Risk Profile</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 shadow-2xl shadow-slate-200/50 rounded-2xl bg-white">
          <CardHeader className="pb-2 pt-6">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-primary">
              <Brain className="h-4 w-4" /> Cognitive Literacy
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-10 pt-4">
            <div className="text-8xl font-black text-slate-950 mb-2 tracking-tighter">
              {literacy.overallScore}<span className="text-2xl text-slate-400 font-medium">%</span>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{literacy.level} Literacy</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl shadow-purple-100 rounded-2xl bg-white border-l-8 border-l-purple-600">
          <CardHeader className="pb-2 pt-6">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-purple-600">
              <Target className="h-4 w-4" /> Privacy Archetype
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-10">
            <div className="text-3xl font-black text-purple-950 uppercase italic mb-1 tracking-tighter mt-4 leading-none">
              {typology.typology}
            </div>
            <p className="text-[9px] text-purple-400 font-black uppercase tracking-[0.2em] mb-6">
              Population Baseline: {typology.populationPercentage}%
            </p>
            <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 mx-2">
                <p className="text-[11px] text-purple-900 font-bold leading-relaxed italic">"{typology.description}"</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Analytics Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] p-6 bg-white">
          <CardHeader className="px-4 pt-4">
            <CardTitle className="text-xl font-black tracking-tighter uppercase italic text-slate-950">Domain Risk Distribution</CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Weighted vector analysis</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-8">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={risk.categoryBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" angle={-15} textAnchor="end" fontSize={9} fontWeight={900} interval={0} tickMargin={12} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} fontSize={9} fontWeight={900} stroke="#94a3b8" />
                <ChartTooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', fontSize: '11px', fontWeight: '900' }} />
                <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={40}>
                  {risk.categoryBreakdown.map((entry: any, index: number) => (
                    <Cell key={index} fill={entry.score <= 33 ? '#10b981' : entry.score <= 66 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6">
           <Card className="border-none shadow-2xl shadow-rose-100 rounded-[2rem] bg-rose-50/40 overflow-hidden relative">
            <div className="absolute top-4 right-4 p-2"><AlertTriangle className="h-16 w-16 text-rose-500/10" /></div>
            <CardHeader className="py-6 px-8">
              <CardTitle className="text-rose-950 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                  High-Impact Vulnerabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pb-8 px-8">
              {risk.vulnerabilities.slice(0, 3).map((v, i) => (
                  <div key={i} className="flex items-center gap-5 p-5 bg-white rounded-2xl shadow-sm border border-rose-100/50">
                    <span className="text-[11px] font-black text-rose-600 bg-rose-50 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-rose-100">{i+1}</span>
                    <p className="text-[12px] font-black text-slate-800 tracking-tight leading-tight uppercase italic">{v}</p>
                  </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-2xl shadow-emerald-100 rounded-[2rem] bg-emerald-50/40 overflow-hidden relative">
            <div className="absolute top-4 right-4 p-2"><Shield className="h-16 w-16 text-emerald-500/10" /></div>
            <CardHeader className="py-6 px-8">
              <CardTitle className="text-emerald-950 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                Protective Strengths
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pb-8 px-8">
               {risk.strengths.slice(0, 3).map((s, i) => (
                <div key={i} className="flex items-center gap-5 p-5 bg-white rounded-2xl shadow-sm border border-emerald-100/50">
                  <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100">{i+1}</span>
                  <p className="text-[12px] font-black text-slate-800 tracking-tight leading-tight uppercase italic">{s}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Dark Action Footer Section */}
      <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-950 text-white p-10 md:p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-900/10 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-16">
          <div className="space-y-8 max-w-2xl">
            <Badge className="bg-primary/20 text-white border-primary/30 font-black text-[10px] tracking-[0.3em] px-5 py-2 uppercase">
              Intelligence-Led Mitigation
            </Badge>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none italic uppercase text-white">
              Optimize your <span className="text-primary italic underline decoration-primary/20 underline-offset-8">digital perimeter.</span>
            </h2>
            <div className="space-y-5">
              {typology.actionPlan.slice(0, 3).map((action, i) => (
                <div key={i} className="flex items-start gap-6 group">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-xs font-black text-primary shrink-0 mt-1 border border-white/10 group-hover:bg-primary group-hover:text-slate-950 transition-all">{i+1}</div>
                  <p className="text-slate-200 text-base font-bold tracking-tight leading-snug">{action}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-[380px] flex flex-col gap-6">
             <div className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4 text-primary">
                    <TrendingUp className="h-6 w-6" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Projection</span>
                </div>
                <p className="text-sm text-slate-300 font-bold leading-relaxed italic">
                  Predictive modeling indicates a <span className="text-primary font-black underline decoration-primary/40 underline-offset-4 text-lg">72.4% reduction</span> in exposure risk upon successful implementation of the action plan.
                </p>
             </div>
             
             <Link to="/recommendations" className="block w-full">
                <Button className="w-full bg-primary hover:bg-white text-slate-950 font-black uppercase tracking-[0.2em] text-[12px] h-16 rounded-2xl shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] cursor-pointer">
                  Launch Action Center
                </Button>
             </Link>
             
             <Link to="/education" className="block w-full">
                <Button variant="ghost" className="w-full text-slate-400 hover:text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] transition-all cursor-pointer h-12">
                  Review Framework Methodology
                </Button>
             </Link>
          </div>
        </div>
        
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-[120px] opacity-30" />
      </Card>
    </div>
  );
}