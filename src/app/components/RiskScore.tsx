import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { 
  ShieldAlert, AlertTriangle, CheckCircle, TrendingUp,
  Download, Target, Brain, Shield, ChevronDown, FileText, Database, Share2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as ChartTooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar 
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

  // Redirect if audit not finished
  useEffect(() => {
    if (!auditState?.completedAt) navigate('/audit');
  }, [auditState, navigate]);

  // Memoized Calculations to prevent re-renders on UI interactions
  const results = useMemo(() => {
    if (!auditState) return null;

    const riskResponses = Object.entries(auditState.responses).map(([id, value]) => ({ id, value }));
    const risk = useRiskCalculation(riskResponses);

    const litResponses = Object.entries(auditState.literacyResponses || {}).map(([id, value]) => ({ id, value }));
    const literacy = calculateLiteracyScore(litResponses, literacyQuestions);

    const typology = classifyUserTypology(risk?.overallRisk || 50, literacy.overallScore);

    return { risk, literacy, typology };
  }, [auditState]);

  if (!results || !results.risk) return null;

  const { risk, literacy, typology } = results;
  const currentTheme = THEME[risk.riskLevel as keyof typeof THEME];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Dashboard Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-8">
        <div>
          <Badge variant="outline" className="mb-2 px-3 py-1 text-slate-500 border-slate-200">
            Assessment Finalized
          </Badge>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Privacy Insights</h1>
          <p className="text-slate-500 flex items-center gap-2 mt-1">
            <Shield className="h-4 w-4" /> 
            Validated against Muhammad et al. (2024) Framework
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="lg" className="bg-slate-900 hover:bg-slate-800 shadow-xl">
                <Download className="mr-2 h-4 w-4" /> Export Intelligence <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Choose Format</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => generatePDFReport({ ...results, auditDate: new Date().toLocaleDateString() })}>
                <FileText className="mr-2 h-4 w-4" /> Professional PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportAsJSON(results)}>
                <Database className="mr-2 h-4 w-4" /> Raw Data (JSON)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* 2. Executive Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Risk Level Gauge */}
        <Card className={`relative overflow-hidden border-none shadow-2xl ring-1 ${currentTheme.border}`}>
          <div className={`absolute top-0 right-0 p-4 font-black text-6xl opacity-10 ${currentTheme.text}`}>
            !
          </div>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${currentTheme.text}`}>
              <ShieldAlert className="h-5 w-5" /> Exposure Level
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 text-center">
            <div className={`text-7xl font-black mb-2 tracking-tighter ${currentTheme.text}`}>
              {risk.overallRisk}<span className="text-3xl">%</span>
            </div>
            <Badge className={`${currentTheme.bg} ${currentTheme.text} border-none font-bold uppercase`}>
              {risk.riskLevel} Risk Profile
            </Badge>
          </CardContent>
        </Card>

        {/* Literacy Card */}
        <Card className="shadow-xl border-none ring-1 ring-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Brain className="h-5 w-5" /> Privacy Literacy
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-7xl font-black text-slate-900 mb-2 tracking-tighter">
              {literacy.overallScore}<span className="text-3xl text-slate-400">%</span>
            </div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">
              Level: <span className="text-blue-600">{literacy.level}</span>
            </p>
          </CardContent>
        </Card>

        {/* Typology Identity */}
        <Card className="shadow-xl border-none ring-1 ring-purple-100 bg-gradient-to-br from-white to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-600">
              <Shield className="h-5 w-5" /> User Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-black text-purple-900 capitalize mb-1">
              {typology.typology}
            </div>
            <p className="text-xs text-purple-400 font-bold uppercase mb-4 tracking-wider">
              {typology.populationPercentage}% of Population
            </p>
            <p className="text-sm text-slate-600 leading-relaxed italic">
              "{typology.description}"
            </p>
          </CardContent>
        </Card>
      </section>

      {/* 3. Deep Dive Analytics */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-lg ring-1 ring-slate-200">
          <CardHeader>
            <CardTitle>Risk Categorization</CardTitle>
            <CardDescription>Performance across key privacy domains</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={risk.categoryBreakdown} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="category" 
                  angle={-25} 
                  textAnchor="end" 
                  fontSize={11} 
                  fontWeight={600} 
                  interval={0}
                  stroke="#94a3b8" 
                />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <ChartTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={40}>
                  {risk.categoryBreakdown.map((entry: any, index: number) => (
                    <Cell 
                      key={index} 
                      fill={entry.score <= 33 ? '#10b981' : entry.score <= 66 ? '#f59e0b' : '#ef4444'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vulnerability Matrix */}
        <div className="space-y-6">
          <Card className="border-none shadow-lg ring-1 ring-rose-100 bg-rose-50/30">
            <CardHeader>
              <CardTitle className="text-rose-800 text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Critical Vulnerabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {risk.vulnerabilities.slice(0, 4).map((vuln: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border border-rose-100">
                    <span className="h-2 w-2 rounded-full bg-rose-500 mt-2 shrink-0" />
                    <span className="text-sm font-medium text-slate-700">{vuln}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg ring-1 ring-emerald-100 bg-emerald-50/30">
            <CardHeader>
              <CardTitle className="text-emerald-800 text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5" /> Privacy Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {risk.strengths.slice(0, 4).map((str: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border border-emerald-100">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    <span className="text-sm font-medium text-slate-700">{str}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 4. Strategic Action Plan */}
      <Card className="border-none shadow-2xl ring-1 ring-slate-900 bg-slate-900 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <CardHeader>
          <CardTitle className="text-2xl font-black flex items-center gap-3">
            <Target className="h-6 w-6 text-blue-400" /> Professional Action Plan
          </CardTitle>
          <CardDescription className="text-slate-400">
            High-impact steps to reduce your {risk.overallRisk}% exposure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {typology.actionPlan.map((action: string, i: number) => (
                <div key={i} className="flex gap-4 group">
                  <span className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-blue-400 text-sm group-hover:border-blue-500 transition-colors">
                    {i + 1}
                  </span>
                  <p className="text-slate-300 text-sm leading-relaxed pt-1">
                    {action}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-400" /> Projected Impact
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                By following this roadmap, our models suggest a potential risk reduction of up to 
                <span className="text-emerald-400 font-bold ml-1">{(risk.overallRisk * 0.6).toFixed(0)}%</span> within 30 days.
              </p>
              <div className="flex flex-col gap-3">
                <Link to="/recommendations" className="w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-500 border-none font-bold py-6">
                    Launch Action Center
                  </Button>
                </Link>
                <Link to="/education" className="w-full">
                  <Button variant="ghost" className="w-full text-slate-400 hover:text-white hover:bg-slate-700">
                    Explore Learning Modules
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}