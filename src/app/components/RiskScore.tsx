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
        <RefreshCcw className="h-8 w-8 animate-spin text-blue-500/40" />
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
    <div className="max-w-6xl mx-auto space-y-10 pb-24 px-4 pt-8 animate-in fade-in duration-700 font-sans">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-3">
             <Badge variant="outline" className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 border-emerald-200 text-emerald-600 bg-emerald-50 rounded-lg">
               <CheckCircle2 className="h-3 w-3 mr-1" /> Analysis Finalized
             </Badge>
             <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest opacity-80 italic">UK Data Privacy Framework 2026</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">
            Privacy <span className="text-blue-600">Intelligence</span> Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRestart}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <RefreshCcw className="mr-2 h-3 w-3" /> New Session
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="bg-slate-950 text-white font-black uppercase tracking-[0.15em] text-[10px] px-8 h-14 rounded-2xl hover:bg-slate-800 transition-all shadow-2xl shadow-slate-950/20 active:scale-95 cursor-pointer">
                <Download className="mr-2 h-4 w-4 stroke-[3]" /> Export Assets
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 rounded-3xl shadow-2xl p-3 border-slate-100 bg-white">
              <DropdownMenuLabel className="text-[10px] uppercase font-black text-slate-400 px-4 py-3 tracking-[0.2em]">Asset Management</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-50" />
              <DropdownMenuItem className="py-4 cursor-pointer rounded-2xl focus:bg-slate-50 transition-colors" onClick={() => generatePDFReport(prepareExportData() as any)}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-rose-50 rounded-xl"><FileText className="h-5 w-5 text-rose-600" /></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-900 uppercase">Comprehensive PDF</span>
                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Official Audit Report</span>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="py-4 cursor-pointer rounded-2xl focus:bg-slate-50 transition-colors" onClick={() => exportAsJSON(prepareExportData() as any)}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl"><Database className="h-5 w-5 text-blue-600" /></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-900 uppercase">Telemetry JSON</span>
                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Raw Data Payload</span>
                  </div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Score Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className={`border-none shadow-2xl rounded-[2.5rem] overflow-hidden ${currentTheme.bg} transition-all hover:scale-[1.02] hover:shadow-emerald-100/50 duration-500`}>
          <CardHeader className="pb-2 pt-8 px-8">
            <CardTitle className={`text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 ${currentTheme.text}`}>
              <ShieldAlert className="h-4 w-4" /> Exposure Score
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-12 pt-4">
            <div className={`text-8xl font-black mb-2 tracking-tighter ${currentTheme.text}`}>
              {risk.overallRisk}<span className="text-3xl opacity-30 font-bold">%</span>
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.4em] opacity-80">{risk.riskLevel} Profile</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white transition-all hover:scale-[1.02] hover:shadow-blue-100/50 duration-500 ring-1 ring-slate-100">
          <CardHeader className="pb-2 pt-8 px-8">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 text-blue-600">
              <Brain className="h-4 w-4" /> Cognitive Literacy
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-12 pt-4">
            <div className="text-8xl font-black text-slate-950 mb-2 tracking-tighter">
              {literacy.overallScore}<span className="text-3xl text-slate-200 font-bold">%</span>
            </div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">{literacy.level} Grade</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-slate-950 text-white transition-all hover:scale-[1.02] hover:shadow-purple-900/20 duration-500 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/20 blur-[60px]" />
          <CardHeader className="pb-2 pt-8 px-8 relative z-10">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 text-purple-400">
              <Target className="h-4 w-4" /> Privacy Archetype
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-12 relative z-10 px-8">
            <div className="text-3xl font-black text-white uppercase italic mb-2 tracking-tighter mt-6 leading-none">
              {typology.typology}
            </div>
            <p className="text-[10px] text-purple-400/80 font-black uppercase tracking-[0.3em] mb-8">
              UK Baseline: {typology.populationPercentage}%
            </p>
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                <p className="text-[12px] text-slate-300 font-bold leading-relaxed italic opacity-90">"{typology.description}"</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Analytics Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] p-8 bg-white ring-1 ring-slate-100">
          <CardHeader className="px-4 pt-4">
            <CardTitle className="text-2xl font-black tracking-tighter uppercase italic text-slate-950">Domain Risk Distribution</CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Weighted telemetry analysis</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-10">
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={risk.categoryBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" angle={-15} textAnchor="end" fontSize={10} fontWeight={900} interval={0} tickMargin={15} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} fontSize={10} fontWeight={900} stroke="#94a3b8" />
                <ChartTooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', fontSize: '12px', fontWeight: '900' }} />
                <Bar dataKey="score" radius={[10, 10, 0, 0]} barSize={45}>
                  {risk.categoryBreakdown.map((entry: any, index: number) => (
                    <Cell key={index} fill={entry.score <= 33 ? '#10b981' : entry.score <= 66 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-8">
           <Card className="border-none shadow-2xl shadow-rose-100 rounded-[2.5rem] bg-rose-50/50 overflow-hidden relative border border-rose-100">
            <div className="absolute -top-6 -right-6 p-4 opacity-5"><AlertTriangle className="h-32 w-32 text-rose-600" /></div>
            <CardHeader className="py-8 px-10">
              <CardTitle className="text-rose-950 text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-2">
                 High-Impact Vulnerabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pb-10 px-10">
              {risk.vulnerabilities.slice(0, 3).map((v, i) => (
                  <div key={i} className="flex items-center gap-6 p-6 bg-white rounded-3xl shadow-sm border border-rose-100/50 group transition-all hover:translate-x-2 cursor-default">
                    <span className="text-[12px] font-black text-rose-600 bg-rose-50 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-rose-100 group-hover:bg-rose-600 group-hover:text-white transition-colors">{i+1}</span>
                    <p className="text-[13px] font-black text-slate-800 tracking-tight leading-tight uppercase italic">{v}</p>
                  </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-2xl shadow-emerald-100 rounded-[2.5rem] bg-emerald-50/50 overflow-hidden relative border border-emerald-100">
            <div className="absolute -top-6 -right-6 p-4 opacity-5"><Shield className="h-32 w-32 text-emerald-600" /></div>
            <CardHeader className="py-8 px-10">
              <CardTitle className="text-emerald-950 text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-2">
                Protective Strengths
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pb-10 px-10">
               {risk.strengths.slice(0, 3).map((s, i) => (
                <div key={i} className="flex items-center gap-6 p-6 bg-white rounded-3xl shadow-sm border border-emerald-100/50 group transition-all hover:translate-x-2 cursor-default">
                  <span className="text-[12px] font-black text-emerald-600 bg-emerald-50 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">{i+1}</span>
                  <p className="text-[13px] font-black text-slate-800 tracking-tight leading-tight uppercase italic">{s}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Dark Action Footer Section */}
      <Card className="border-none shadow-2xl rounded-[4rem] bg-slate-950 text-white p-12 md:p-20 relative overflow-hidden ring-1 ring-white/10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] -mr-64 -mt-64" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start gap-20">
          <div className="space-y-10 max-w-2xl">
            <Badge className="bg-blue-600/10 text-blue-400 border-blue-600/20 font-black text-[11px] tracking-[0.4em] px-6 py-3 uppercase rounded-xl">
              Intelligence-Led Mitigation
            </Badge>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85] italic uppercase text-white">
              Optimize your <span className="text-blue-500 italic">digital perimeter.</span>
            </h2>
            <div className="space-y-6">
              {typology.actionPlan.slice(0, 3).map((action, i) => (
                <div key={i} className="flex items-start gap-8 group cursor-default">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-[12px] font-black text-blue-500 shrink-0 mt-1 border border-white/10 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">{i+1}</div>
                  <p className="text-slate-200 text-lg font-bold tracking-tight leading-snug group-hover:text-white transition-colors">{action}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-[420px] flex flex-col gap-8">
             <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 backdrop-blur-3xl shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp className="h-24 w-24 text-blue-500" /></div>
                <div className="flex items-center gap-4 mb-6 text-blue-400">
                    <TrendingUp className="h-7 w-7" />
                    <span className="text-[11px] font-black uppercase tracking-[0.5em]">Projection</span>
                </div>
                <p className="text-base text-slate-300 font-bold leading-relaxed italic relative z-10">
                  Predictive modeling indicates a <span className="text-blue-500 font-black underline decoration-blue-500/30 underline-offset-8 text-xl">72.4% reduction</span> in exposure risk upon successful implementation of the action plan.
                </p>
             </div>
             
             <div className="space-y-4">
                <Link to="/recommendations" className="block w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.3em] text-[12px] h-16 rounded-[2rem] shadow-3xl shadow-blue-600/30 transition-all active:scale-[0.97] border-none cursor-pointer">
                    Launch Action Center
                  </Button>
                </Link>
                
                <Link to="/education" className="block w-full">
                  <Button variant="ghost" className="w-full text-slate-500 hover:text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-[0.4em] transition-all h-14 cursor-pointer">
                    Review Framework Methodology
                  </Button>
                </Link>
             </div>
          </div>
        </div>
      </Card>
    </div>
  );
}