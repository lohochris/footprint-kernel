import { useMemo } from 'react';
import { Link } from 'react-router';
import {
  Search, ShieldAlert, GraduationCap, Brain, Target, 
  ArrowRight, CheckCircle, AlertTriangle, TrendingUp, 
  Globe, Users
} from 'lucide-react';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useRiskCalculation } from '../hooks/useRiskCalculation';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import ukStats from '../data/ukStatistics.json';

// Utility for risk-based styling to keep JSX clean
const getRiskStyles = (level: string) => {
  const styles = {
    low: { text: 'text-green-600', bg: 'bg-green-100 text-green-800', hex: '#22c55e' },
    medium: { text: 'text-orange-600', bg: 'bg-orange-100 text-orange-800', hex: '#f97316' },
    high: { text: 'text-red-600', bg: 'bg-red-100 text-red-800', hex: '#ef4444' },
  };
  return styles[level as keyof typeof styles] || styles.medium;
};

export function Dashboard() {
  const [auditState] = useLocalStorage('footprint_audit_state', null);
  const [quizResults] = useLocalStorage('footprint_quiz_results', null);

  // 1. Memoize input for risk calculation to prevent infinite loops or lag
  const auditEntries = useMemo(() => 
    auditState?.responses ? Object.entries(auditState.responses).map(([id, value]) => ({ id, value })) : [],
    [auditState?.responses]
  );

  const riskResult = useRiskCalculation(auditEntries);

  // 2. Derive state cleanly
  const hasCompletedAudit = !!auditState?.completedAt;
  const hasCompletedQuiz = quizResults !== null;
  const riskTheme = useMemo(() => getRiskStyles(riskResult?.riskLevel || 'medium'), [riskResult?.riskLevel]);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12">
      {/* Hero Section - Refined with Glassmorphism subtle touches */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-blue-600 to-blue-700 rounded-3xl p-8 md:p-12 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Master Your Digital Presence
          </h1>
          <p className="text-lg md:text-xl text-blue-50/90 leading-relaxed mb-8">
            A professional-grade, privacy-first audit system. Quantify your digital risk and bridge the "Privacy Paradox" using local-only computation.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 transition-all hover:scale-105">
              <Link to="/audit">
                <Search className="mr-2 h-5 w-5" />
                {hasCompletedAudit ? 'Update Self-Audit' : 'Begin Local Audit'}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 backdrop-blur-sm">
              <Link to="/education">
                <GraduationCap className="mr-2 h-5 w-5" />
                Explore Knowledge Base
              </Link>
            </Button>
          </div>
        </div>
        {/* Background Decorative Element */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      </section>

      {/* Primary Intelligence Overview */}
      {hasCompletedAudit && riskResult && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Card className="border-none shadow-md bg-white ring-1 ring-blue-100 overflow-hidden">
            <div className={`h-1.5 w-full ${riskTheme.bg.split(' ')[0]}`} />
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-blue-600" />
                Risk Intelligence Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                <div className="py-6 md:py-4 flex flex-col items-center justify-center">
                  <span className={`text-6xl font-black tracking-tighter ${riskTheme.text}`}>
                    {riskResult.overallRisk}%
                  </span>
                  <p className="text-sm font-medium text-gray-500 mt-2 italic">Composite Risk Score</p>
                  <span className={`mt-3 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${riskTheme.bg}`}>
                    {riskResult.riskLevel} Risk Profile
                  </span>
                </div>

                <div className="py-6 md:py-4 flex flex-col items-center justify-center text-center px-4">
                  <span className="text-5xl font-bold text-red-500">{riskResult.vulnerabilities.length}</span>
                  <p className="text-sm font-semibold text-gray-600 mt-2">Active Vulnerabilities</p>
                  <Button variant="ghost" size="sm" asChild className="mt-2 text-blue-600 hover:text-blue-700">
                    <Link to="/risk-score">Remediate Issues <ArrowRight className="ml-1 h-3 w-3" /></Link>
                  </Button>
                </div>

                <div className="py-6 md:py-4 flex flex-col items-center justify-center text-center px-4">
                  <span className="text-5xl font-bold text-green-500">{riskResult.strengths.length}</span>
                  <p className="text-sm font-semibold text-gray-600 mt-2">Security Strengths</p>
                  <Button variant="ghost" size="sm" asChild className="mt-2 text-blue-600 hover:text-blue-700">
                    <Link to="/risk-score">View Assets <ArrowRight className="ml-1 h-3 w-3" /></Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Action Modules Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Control Modules</h2>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">v2.1 Stable</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            title="Education Hub"
            desc="Academic-backed modules on UK GDPR and protective strategies."
            icon={<GraduationCap className="h-6 w-6 text-purple-600" />}
            link="/education"
            btnText="Open Library"
          />
          <ModuleCard 
            title="Literacy Quiz"
            desc="Validated 15-point scale to measure your privacy awareness."
            icon={<Brain className="h-6 w-6 text-emerald-600" />}
            link="/quiz"
            completed={hasCompletedQuiz}
            btnText={hasCompletedQuiz ? 'Retake Quiz' : 'Test Knowledge'}
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
        </div>
      </section>

      {/* Landscape Stats - Redesigned for Data Density */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-indigo-600" />
                2026 UK Digital Landscape
              </CardTitle>
              <CardDescription>Official ICO & ONS Proxy Data</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <StatItem label="Internet Usage" value={`${ukStats.ukDigitalLandscape.internetUsers.percentage}%`} sub={`${(ukStats.ukDigitalLandscape.internetUsers.total / 1000000).toFixed(1)}M citizens`} />
            <StatItem label="Reported Breaches" value={ukStats.ukDigitalLandscape.dataBreaches.reported2025.toLocaleString()} sub="ICO 2025 Cycle" color="text-red-600" />
            <StatItem label="Concern Gap" value={`${ukStats.ukDigitalLandscape.privacyConcerns.highConcern}%`} sub={`Action rate: ${ukStats.ukDigitalLandscape.privacyConcerns.takingAction}%`} color="text-orange-600" />
            <StatItem label="Security Hygiene" value={`${ukStats.ukDigitalLandscape.passwordSecurity.use2FA}%`} sub="Utilise 2FA/MFA" color="text-purple-600" />
          </div>
          
          <div className="mt-8 p-5 bg-white border border-indigo-100 rounded-xl shadow-sm">
            <div className="flex gap-4">
              <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">The "Privacy Paradox" Context</h4>
                <p className="text-sm text-slate-600 leading-relaxed mt-1">
                  While {ukStats.ukDigitalLandscape.privacyConcerns.highConcern}% of UK citizens report high privacy concerns, only {ukStats.ukDigitalLandscape.privacyConcerns.takingAction}% adopt technical safeguards. Footprint Manager is designed as a behavioral intervention to close this gap.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Sub-components for cleaner structure
function ModuleCard({ title, desc, icon, link, completed, disabled, btnText }: any) {
  return (
    <Card className={`group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${disabled ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-white group-hover:shadow-sm transition-all">
            {icon}
          </div>
          {completed && <CheckCircle className="h-5 w-5 text-green-500 animate-in zoom-in" />}
        </div>
        <CardTitle className="text-lg mt-4">{title}</CardTitle>
        <CardDescription className="line-clamp-2">{desc}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild disabled={disabled} className="w-full group-hover:bg-blue-700 transition-colors">
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
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
      <p className="text-[11px] text-slate-500 font-medium">{sub}</p>
    </div>
  );
}