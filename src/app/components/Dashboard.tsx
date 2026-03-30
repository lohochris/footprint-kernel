import { useMemo } from 'react';
// FIX: Changed import from 'react-router' to 'react-router-dom'
import { Link } from 'react-router-dom';
import {
  Search, ShieldAlert, GraduationCap, Brain, Target, 
  ArrowRight, CheckCircle, AlertTriangle, 
  Globe
} from 'lucide-react';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useRiskCalculation, type AuditResponse } from '../hooks/useRiskCalculation';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import ukStats from '../data/ukStatistics.json';

// --- Types ---
interface AuditState {
  completedAt: string | number | Date;
  responses: Record<string, any>;
  typology?: string;
}

const getRiskStyles = (level: string) => {
  const styles = {
    low: { text: 'text-green-600', bg: 'bg-green-100 text-green-800', border: 'bg-green-500' },
    medium: { text: 'text-orange-600', bg: 'bg-orange-100 text-orange-800', border: 'bg-orange-500' },
    high: { text: 'text-red-600', bg: 'bg-red-100 text-red-800', border: 'bg-red-500' },
  };
  return styles[level as keyof typeof styles] || styles.medium;
};

export function Dashboard() {
  const [auditState] = useLocalStorage<AuditState | null>('footprint_audit_state', null);
  const [quizResults] = useLocalStorage<any>('footprint_quiz_results', null);

  // Safely map responses for the risk hook
  const auditEntries = useMemo((): AuditResponse[] => 
    auditState?.responses 
      ? Object.entries(auditState.responses).map(([id, value]) => ({ 
          id, 
          value: value as number | string[] 
        })) 
      : [],
    [auditState?.responses]
  );

  const riskResult = useRiskCalculation(auditEntries);

  const hasCompletedAudit = !!auditState?.completedAt;
  const riskTheme = useMemo(() => getRiskStyles(riskResult?.riskLevel || 'medium'), [riskResult?.riskLevel]);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12 px-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-blue-600 to-blue-700 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-[1.1]">
            Master Your Digital Presence
          </h1>
          <p className="text-lg md:text-xl text-blue-50/90 leading-relaxed mb-8 font-medium">
            Professional-grade, privacy-first audit system. Quantify your digital risk and bridge the "Privacy Paradox" using 2026 local-only computation standards.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 transition-all hover:scale-105 border-none shadow-lg">
              <Link to="/audit">
                <Search className="mr-2 h-5 w-5" />
                {hasCompletedAudit ? 'Update Self-Audit' : 'Begin Local Audit'}
              </Link>
            </Button>
            
            <Button asChild size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white hover:text-blue-700 bg-white/10 backdrop-blur-md font-bold transition-all shadow-lg">
              <Link to="/education">
                <GraduationCap className="mr-2 h-5 w-5" />
                Knowledge Base
              </Link>
            </Button>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-[100px]" />
      </section>

      {/* Risk Intelligence Report */}
      {hasCompletedAudit && riskResult && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Card className="border-none shadow-sm bg-white ring-1 ring-slate-200 overflow-hidden rounded-[2rem]">
            <div className={`h-2 w-full ${riskTheme.border}`} />
            <CardHeader className="pb-2 pt-6 px-8">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-blue-600" />
                Risk Intelligence Report
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                <div className="py-6 md:py-4 flex flex-col items-center justify-center">
                  <span className={`text-7xl font-black tracking-tighter ${riskTheme.text}`}>
                    {riskResult.overallRisk}%
                  </span>
                  <p className="text-xs font-bold text-slate-400 mt-2 uppercase">Composite Score</p>
                  <span className={`mt-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${riskTheme.bg}`}>
                    {riskResult.riskLevel} Profile
                  </span>
                </div>

                <div className="py-6 md:py-4 flex flex-col items-center justify-center text-center px-4">
                  <span className="text-5xl font-black text-slate-900">{riskResult.vulnerabilities.length}</span>
                  <p className="text-xs font-bold text-slate-400 mt-2 uppercase">Vulnerabilities</p>
                  <Button variant="ghost" size="sm" asChild className="mt-4 text-blue-600 hover:text-blue-700 font-black text-xs uppercase tracking-wider">
                    <Link to="/recommendations">Remediate <ArrowRight className="ml-1 h-3 w-3" /></Link>
                  </Button>
                </div>

                <div className="py-6 md:py-4 flex flex-col items-center justify-center text-center px-4">
                  <span className="text-5xl font-black text-slate-900">{riskResult.strengths.length}</span>
                  <p className="text-xs font-bold text-slate-400 mt-2 uppercase">Security Assets</p>
                  <Button variant="ghost" size="sm" asChild className="mt-4 text-blue-600 hover:text-blue-700 font-black text-xs uppercase tracking-wider">
                    <Link to="/risk-score">View Assets <ArrowRight className="ml-1 h-3 w-3" /></Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Modules Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ModuleCard 
          title="Digital Self-Audit"
          desc="Multi-domain assessment of your surface-level data footprint."
          icon={<Search className="h-6 w-6 text-blue-600" />}
          link="/audit"
          completed={hasCompletedAudit}
          btnText={hasCompletedAudit ? 'Re-Audit' : 'Start Audit'}
        />
        <ModuleCard 
          title="Impact Analysis"
          desc="Detailed breakdown of PIVA scores and personal user typology."
          icon={<ShieldAlert className="h-6 w-6 text-orange-600" />}
          link="/risk-score"
          disabled={!hasCompletedAudit}
          completed={hasCompletedAudit}
          btnText="View Analytics"
        />
        <ModuleCard 
          title="Strategic Actions"
          desc="Priority-ranked roadmap for footprint minimization."
          icon={<Target className="h-6 w-6 text-red-600" />}
          link="/recommendations"
          disabled={!hasCompletedAudit}
          completed={hasCompletedAudit}
          btnText="View Roadmap"
        />
      </section>

      {/* Landscape Stats */}
      <Card className="bg-slate-50 border-slate-200 rounded-[2rem] p-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 font-black">
            <Globe className="h-5 w-5 text-indigo-600" />
            2026 UK Digital Landscape
          </CardTitle>
          <CardDescription className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Official ICO & ONS Proxy Data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <StatItem label="Internet Usage" value={`${ukStats.ukDigitalLandscape.internetUsers.percentage}%`} sub={`${(ukStats.ukDigitalLandscape.internetUsers.total / 1000000).toFixed(1)}M citizens`} />
            <StatItem label="Reported Breaches" value={ukStats.ukDigitalLandscape.dataBreaches.reported2025.toLocaleString()} sub="ICO 2025 Cycle" color="text-red-600" />
            <StatItem label="Concern Gap" value={`${ukStats.ukDigitalLandscape.privacyConcerns.highConcern}%`} sub={`Action rate: ${ukStats.ukDigitalLandscape.privacyConcerns.takingAction}%`} color="text-orange-600" />
            <StatItem label="Security Hygiene" value={`${ukStats.ukDigitalLandscape.passwordSecurity.use2FA}%`} sub="Utilise 2FA/MFA" color="text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ModuleCard({ title, desc, icon, link, completed, disabled, btnText }: any) {
  return (
    <Card className={`group transition-all duration-300 rounded-[2rem] border-slate-200 hover:shadow-xl hover:-translate-y-1 ${disabled ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="p-3 rounded-2xl bg-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
            {icon}
          </div>
          {completed && <CheckCircle className="h-6 w-6 text-emerald-500 fill-emerald-50" />}
        </div>
        <CardTitle className="text-xl font-black mt-4 text-slate-900">{title}</CardTitle>
        <CardDescription className="font-medium text-slate-500">{desc}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild disabled={disabled} className="w-full font-black uppercase tracking-widest text-xs h-12 group-hover:bg-blue-700 transition-colors rounded-xl shadow-md">
          <Link to={link}>
            {btnText} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function StatItem({ label, value, sub, color = "text-blue-600" }: any) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className={`text-3xl font-black tracking-tighter ${color}`}>{value}</p>
      <p className="text-[11px] text-slate-500 font-bold">{sub}</p>
    </div>
  );
}