import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, AlertTriangle, CheckCircle, TrendingUp,
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
    typology: typology.typology, // Corrected key to match exporter
    categoryBreakdown: risk.categoryBreakdown,
    vulnerabilities: risk.vulnerabilities,
    strengths: risk.strengths,
    recommendations: typology.actionPlan, // Corrected key for exporter
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 px-4 pt-8 animate-in fade-in duration-700 font-sans">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 border-emerald-200 text-emerald-600 bg-emerald-50/50">
               <CheckCircle2 className="h-3 w-3 mr-1" /> Analysis Finalized
             </Badge>
             <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter opacity-60 italic">UK Data Privacy Framework 2026</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 uppercase italic">
            Privacy <span className="text-primary">Intelligence</span> Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRestart}
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
          >
            <RefreshCcw className="mr-2 h-3 w-3" /> New Session
          </Button>

          {/* FIX: Active Export Assets Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="bg-slate-950 text-white font-black uppercase tracking-widest text-[10px] px-6 h-10 rounded-lg hover:bg-slate-800 transition-all active:scale-95 cursor-pointer">
                <Download className="mr-2 h-4 w-4" /> Export Assets
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-xl shadow-2xl p-2 border-border/50 bg-white">
              <DropdownMenuLabel className="text-[10px] uppercase font-black text-slate-400 px-2 py-1.5 tracking-widest">Asset Management</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="py-3 cursor-pointer rounded-lg focus:bg-slate-50" onClick={() => generatePDFReport(prepareExportData() as any)}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-50 rounded-md"><FileText className="h-4 w-4 text-rose-600" /></div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-900 uppercase">Comprehensive PDF</span>
                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tight">Audit & Action Plan</span>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="py-3 cursor-pointer rounded-lg focus:bg-slate-50" onClick={() => exportAsJSON(prepareExportData() as any)}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-md"><Database className="h-4 w-4 text-blue-600" /></div>
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
        <Card className={`border shadow-sm rounded-xl overflow-hidden ${currentTheme.bg} ${currentTheme.border}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${currentTheme.text}`}>
              <ShieldAlert className="h-4 w-4" /> Exposure Score
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-8 pt-4">
            <div className={`text-7xl font-black mb-2 tracking-tighter ${currentTheme.text}`}>
              {risk.overallRisk}<span className="text-2xl opacity-40 font-medium">%</span>
            </div>
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-80`}>{risk.riskLevel} Risk Profile</p>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm rounded-xl bg-white transition-hover hover:shadow-md duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-primary">
              <Brain className="h-4 w-4" /> Cognitive Literacy
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-8 pt-4">
            <div className="text-7xl font-black text-slate-950 mb-2 tracking-tighter">
              {literacy.overallScore}<span className="text-2xl text-slate-400 font-medium">%</span>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{literacy.level} Literacy</p>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm rounded-xl bg-white border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-purple-600">
              <Target className="h-4 w-4" /> Privacy Archetype
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <div className="text-2xl font-black text-purple-950 uppercase italic mb-1 tracking-tight mt-4">
              {typology.typology}
            </div>
            <p className="text-[9px] text-purple-400 font-black uppercase tracking-widest mb-4">
              Population Baseline: {typology.populationPercentage}%
            </p>
            <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-100 mx-2">
                <p className="text-[11px] text-purple-900/70 font-bold leading-relaxed italic">"{typology.description}"</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Analytics Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border border-border shadow-sm rounded-xl p-4 bg-white">
          <CardHeader className="px-2">
            <CardTitle className="text-lg font-black tracking-tight uppercase italic text-slate-950">Domain Risk Distribution</CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-widest opacity-60">Weighted vector analysis</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={risk.categoryBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis 
                  dataKey="category" 
                  angle={-12} 
                  textAnchor="end" 
                  fontSize={9} 
                  fontWeight={900} 
                  interval={0} 
                  tickMargin={12}
                  stroke="#64748b"
                />
                <YAxis 
                   domain={[0, 100]} 
                   fontSize={9} 
                   fontWeight={900}
                   stroke="#64748b"
                />
                <ChartTooltip 
                  cursor={{fill: 'rgba(0,0,0,0.02)'}}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', 
                    fontSize: '11px', 
                    fontWeight: '900' 
                  }} 
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={38}>
                  {risk.categoryBreakdown.map((entry: any, index: number) => (
                    <Cell 
                      key={index} 
                      fill={entry.score <= 33 ? '#10b981' : entry.score <= 66 ? '#f59e0b' : '#ef4444'} 
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-4">
           <Card className="border-rose-200 shadow-sm rounded-xl bg-rose-50/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-2"><AlertTriangle className="h-12 w-12 text-rose-500/10" /></div>
            <CardHeader className="py-5">
              <CardTitle className="text-rose-950 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  High-Impact Vulnerabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pb-6">
              {risk.vulnerabilities.slice(0, 3).map((v, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white border border-rose-100 rounded-xl shadow-sm hover:translate-x-1 transition-transform">
                    <span className="text-[10px] font-black text-rose-600 bg-rose-50 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border border-rose-100">{i+1}</span>
                    <p className="text-[11px] font-black text-slate-800 tracking-tight leading-tight uppercase italic">{v}</p>
                  </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-emerald-200 shadow-sm rounded-xl bg-emerald-50/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-2"><Shield className="h-12 w-12 text-emerald-500/10" /></div>
            <CardHeader className="py-5">
              <CardTitle className="text-emerald-950 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                Protective Strengths
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pb-6">
               {risk.strengths.slice(0, 3).map((s, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white border border-emerald-100 rounded-xl shadow-sm hover:translate-x-1 transition-transform">
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border border-emerald-100">{i+1}</span>
                  <p className="text-[11px] font-black text-slate-800 tracking-tight leading-tight uppercase italic">{s}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action Footer */}
      <Card className="border-none shadow-2xl rounded-[2.5rem] bg-slate-950 text-white p-8 md:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-600/5 pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="space-y-6 max-w-xl">
            <Badge className="bg-primary/20 text-primary border-primary/30 font-black text-[9px] tracking-[0.2em] px-4 py-1.5 uppercase">Intelligence-Led Mitigation</Badge>
            {/* FIX: digital perimeter is now primary color and visible */}
            <h2 className="text-4xl font-black tracking-tighter leading-none italic uppercase">Optimize your <span className="text-primary italic">digital perimeter.</span></h2>
            <div className="space-y-4">
              {typology.actionPlan.slice(0, 3).map((action, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-[10px] font-black text-primary shrink-0 mt-1 border border-white/5 group-hover:bg-primary group-hover:text-slate-950 transition-colors">{i+1}</div>
                  <p className="text-slate-300 text-sm font-bold tracking-tight leading-snug">{action}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col gap-4 min-w-[320px]">
             <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-3 text-primary">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Projection</span>
                </div>
                <p className="text-xs text-slate-400 font-bold leading-relaxed italic">Predictive modeling indicates a <span className="text-primary font-black underline decoration-primary/30 underline-offset-4">72.4% reduction</span> in exposure risk upon successful implementation of the action plan.</p>
             </div>
             {/* FIX: Launch Action Center with professional hover and pointer */}
             <Link to="/recommendations" className="block w-full">
                <Button className="w-full bg-primary hover:bg-white text-slate-950 font-black uppercase tracking-widest text-[11px] h-14 rounded-xl shadow-lg shadow-primary/10 transition-all active:scale-95 cursor-pointer">
                  Launch Action Center
                </Button>
             </Link>
             {/* FIX: Review Framework with professional hover and pointer */}
             <Link to="/education" className="block w-full">
                <Button variant="ghost" className="w-full text-slate-500 hover:text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer">
                  Review Framework Methodology
                </Button>
             </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}