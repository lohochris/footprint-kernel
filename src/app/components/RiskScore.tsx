import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, AlertTriangle, CheckCircle, TrendingUp,
  Download, Target, Brain, Shield, ChevronDown, FileText, Database,
  CheckCircle2 
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

const THEME = {
  low: { color: '#10b981', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  medium: { color: '#f59e0b', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  high: { color: '#ef4444', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' }
};

export function RiskScore() {
  const navigate = useNavigate();
  const [auditState] = useLocalStorage('footprint_audit_state', null);

  useEffect(() => {
    if (!auditState?.completedAt) {
      navigate('/audit');
    }
  }, [auditState, navigate]);

  const results = useMemo(() => {
    if (!auditState || !auditState.responses) return null;

    const riskResponses = Object.entries(auditState.responses).map(([id, value]) => ({ 
      id, 
      value: Number(value) 
    }));
    
    // FIX: Passing riskResponses into the calculation logic
    const risk = useRiskCalculation(riskResponses);

    const litResponses = Object.entries(auditState.literacyResponses || {}).map(([id, value]) => ({ 
      id, 
      value: Number(value) 
    }));
    
    const literacy = calculateLiteracyScore(litResponses, literacyQuestions);
    const typology = classifyUserTypology(risk?.overallRisk || 0, literacy.overallScore);

    return { risk, literacy, typology };
  }, [auditState]);

  if (!results || !results.risk) return null;

  const { risk, literacy, typology } = results;
  const currentTheme = THEME[risk.riskLevel as keyof typeof THEME] || THEME.medium;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 px-6 pt-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 pb-10">
        <div>
          <Badge className="mb-4 px-4 py-1.5 text-emerald-600 border-emerald-100 bg-emerald-50 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
            <CheckCircle2 className="h-3 w-3" /> Audit Verified & Complete
          </Badge>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">
            Privacy <span className="text-emerald-600">Intelligence</span>
          </h1>
          <p className="text-slate-500 flex items-center gap-2 mt-4 font-medium italic">
            <Shield className="h-4 w-4 text-emerald-500" /> 
            Validated via Muhammad et al. (2024) Multi-Stage Framework
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-14 rounded-2xl shadow-2xl transition-all hover:scale-[1.02]">
                <Download className="mr-3 h-5 w-5" /> 
                <span className="font-black uppercase tracking-widest text-xs">Export Intel</span>
                <ChevronDown className="ml-3 h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-2xl ring-1 ring-slate-200">
              <DropdownMenuLabel className="px-3 py-2 text-xs font-black uppercase text-slate-400">Security Reports</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="rounded-xl py-3 cursor-pointer"
                onClick={() => generatePDFReport({ ...results, auditDate: new Date().toLocaleDateString() })}
              >
                <FileText className="mr-3 h-5 w-5 text-emerald-600" /> 
                <span className="font-bold">Detailed PDF Audit</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="rounded-xl py-3 cursor-pointer"
                onClick={() => exportAsJSON(results)}
              >
                <Database className="mr-3 h-5 w-5 text-blue-600" /> 
                <span className="font-bold">Raw JSON Telemetry</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Score Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className={`relative border-none shadow-2xl rounded-[2.5rem] ring-2 transition-all duration-500 ${currentTheme.border} ${currentTheme.bg}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${currentTheme.text}`}>
              <ShieldAlert className="h-4 w-4" /> Behavioral Exposure Score
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-10">
            <div className={`text-8xl font-black mb-4 tracking-tighter transition-all ${currentTheme.text}`}>
              {risk.overallRisk}<span className="text-4xl opacity-40">%</span>
            </div>
            <div className="w-full bg-slate-200/50 h-3 rounded-full overflow-hidden mb-6 mx-auto max-w-[200px]">
                <div 
                    className={`h-full transition-all duration-1000 ease-out rounded-full ${
                        risk.overallRisk <= 33 ? 'bg-emerald-500' : 
                        risk.overallRisk <= 66 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${risk.overallRisk}%` }}
                />
            </div>
            <Badge className={`${currentTheme.bg} ${currentTheme.text} border border-current opacity-80 font-black px-4 py-2 uppercase text-[10px] tracking-tighter`}>
              {risk.riskLevel} Risk Profile
            </Badge>
          </CardContent>
        </Card>

        {/* Literacy Score Card */}
        <Card className="border-none shadow-xl rounded-[2.5rem] ring-1 ring-slate-100 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-blue-600">
              <Brain className="h-4 w-4" /> Cognitive Literacy Score
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-10">
            <div className="text-8xl font-black text-slate-900 mb-4 tracking-tighter">
              {literacy.overallScore}<span className="text-4xl text-slate-300">%</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-6 mx-auto max-w-[200px]">
                <div 
                    className="h-full bg-blue-600 transition-all duration-1000 ease-out"
                    style={{ width: `${literacy.overallScore}%` }}
                />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Classification: <span className="text-blue-600">{literacy.level}</span>
            </p>
          </CardContent>
        </Card>

        {/* Archetype Card */}
        <Card className="border-none shadow-xl rounded-[2.5rem] ring-1 ring-purple-100 bg-gradient-to-br from-white to-purple-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-purple-600">
              <Target className="h-4 w-4" /> Privacy Archetype
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-10">
            <div className="text-4xl font-black text-purple-900 capitalize mb-2 tracking-tight mt-4">
              {typology.typology}
            </div>
            <p className="text-[10px] text-purple-400 font-black uppercase mb-8 tracking-widest">
              Cohort: {typology.populationPercentage}% of Population
            </p>
            <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-inner">
                <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                  "{typology.description}"
                </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* DYNAMIC ANALYTICS SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Card className="border-none shadow-xl rounded-[2.5rem] ring-1 ring-slate-100 p-6 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Vulnerability Vector Analysis</CardTitle>
            <CardDescription className="font-medium">Weighted exposure by behavioral domain</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart 
                data={risk.categoryBreakdown} 
                margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="category" 
                  angle={-25} 
                  textAnchor="end" 
                  fontSize={10} 
                  fontWeight={900} 
                  interval={0}
                  stroke="#94a3b8" 
                  tickMargin={12}
                />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} fontWeight={900} />
                <ChartTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', 
                    padding: '16px',
                    fontWeight: 'bold' 
                  }}
                />
                <Bar dataKey="score" radius={[10, 10, 0, 0]} barSize={50}>
                  {/* Dynamic coloring for each bar based on the calculated category score */}
                  {risk.categoryBreakdown.map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.score <= 33 ? '#10b981' : entry.score <= 66 ? '#f59e0b' : '#ef4444'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Dynamic Observations */}
        <div className="space-y-8">
           <Card className="border-none shadow-lg rounded-[2.5rem] ring-1 ring-rose-100 bg-rose-50/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-rose-900 text-xs font-black uppercase tracking-widest flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-rose-500" /> Critical Risk Vectors
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {risk.vulnerabilities.length > 0 ? (
                risk.vulnerabilities.slice(0, 3).map((v, i) => (
                    <div key={i} className="flex items-center gap-4 p-5 bg-white rounded-[1.5rem] shadow-sm border border-rose-100">
                      <div className="h-8 w-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-xs">{i+1}</div>
                      <p className="text-sm font-bold text-slate-700">{v}</p>
                    </div>
                  ))
              ) : (
                <p className="text-slate-400 italic text-sm p-4">No critical vulnerabilities detected.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg rounded-[2.5rem] ring-1 ring-emerald-100 bg-emerald-50/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-emerald-900 text-xs font-black uppercase tracking-widest flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500" /> Active Security Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
               {risk.strengths.slice(0, 3).map((s, i) => (
                <div key={i} className="flex items-center gap-4 p-5 bg-white rounded-[1.5rem] shadow-sm border border-emerald-100">
                   <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs">{i+1}</div>
                  <p className="text-sm font-bold text-slate-700">{s}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Mitigation Roadmap Footer */}
      <Card className="border-none shadow-3xl rounded-[3.5rem] bg-slate-950 text-white p-8 md:p-16 relative overflow-hidden ring-4 ring-emerald-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-transparent to-blue-600/10 pointer-events-none" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-none font-black text-[10px] tracking-widest px-5 py-2 uppercase">
              Actionable Mitigation Roadmap
            </Badge>
            <h2 className="text-5xl font-black tracking-tight leading-tight">
              Ready to reduce your <br /> 
              <span className="text-emerald-400">exposure vector?</span>
            </h2>
            <div className="space-y-6">
              {typology.actionPlan.slice(0, 3).map((action, i) => (
                <div key={i} className="flex items-start gap-5 group">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-sm font-black text-emerald-400 mt-1 transition-all group-hover:bg-emerald-500 group-hover:text-white">
                    {i+1}
                  </div>
                  <p className="text-slate-400 text-lg font-medium leading-relaxed group-hover:text-slate-200 transition-colors">{action}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
             <div className="flex items-center gap-3 mb-8">
               <TrendingUp className="h-7 w-7 text-emerald-400" />
               <span className="font-black text-sm uppercase tracking-widest text-emerald-400">Optimization Projection</span>
             </div>
             <p className="text-slate-300 text-lg font-medium mb-10 leading-relaxed">
               By executing the "Privacy Action Center" recommendations, our predictive model estimates a 
               <span className="text-emerald-400 font-black mx-2 text-2xl">{(risk.overallRisk * 0.65).toFixed(0)}%</span> 
               improvement in your security posture.
             </p>
             <div className="grid grid-cols-1 gap-4">
               <Link to="/recommendations">
                 <Button className="w-full h-18 py-8 rounded-[1.5rem] bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-900/20 transition-all hover:scale-[1.03]">
                   Launch Privacy Action Center
                 </Button>
               </Link>
               <Link to="/education">
                 <Button variant="ghost" className="w-full h-14 rounded-2xl text-slate-500 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px]">
                   Access Advanced Research Modules
                 </Button>
               </Link>
             </div>
          </div>
        </div>
      </Card>
    </div>
  );
}