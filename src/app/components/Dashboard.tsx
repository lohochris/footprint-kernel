import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, ShieldAlert, GraduationCap, Brain, Target, 
  ArrowRight, CheckCircle, Globe, Zap, Activity, Fingerprint
} from 'lucide-react';
import { motion } from 'framer-motion';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useRiskCalculation, type AuditResponse } from '../hooks/useRiskCalculation';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ukStatistics as ukStats } from "../data/ukStatistics";

// --- Types ---
interface AuditState {
  completedAt: string | number | Date;
  responses: Record<string, any>;
  typology?: string;
}

const getRiskStyles = (level: string) => {
  const styles = {
    low: { text: 'text-emerald-500', bg: 'bg-emerald-500/10 text-emerald-600', border: 'bg-emerald-500', glow: 'shadow-emerald-500/20' },
    medium: { text: 'text-amber-500', bg: 'bg-amber-500/10 text-amber-600', border: 'bg-amber-500', glow: 'shadow-amber-500/20' },
    high: { text: 'text-rose-500', bg: 'bg-rose-500/10 text-rose-600', border: 'bg-rose-500', glow: 'shadow-rose-500/20' },
  };
  return styles[level as keyof typeof styles] || styles.medium;
};

export function Dashboard() {
  const [auditState] = useLocalStorage<AuditState | null>('footprint_audit_state', null);
  
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
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      
      {/* --- HERO SECTION: FIRST CONTACT --- */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-slate-950 rounded-[3rem] p-8 md:p-16 text-white shadow-2xl border border-white/5"
      >
        {/* Background Visual Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -ml-20 -mb-20" />
        
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
            <Zap size={12} className="fill-blue-400" /> System Live: 2026 UK Protocols
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[0.9] italic uppercase">
            Quantify Your <span className="text-blue-500">Digital</span> <br />
            Substance<span className="text-blue-500">.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed mb-10 font-medium max-w-2xl">
            The Privacy Paradox suggests we value privacy yet share freely. 
            <span className="text-white"> Footprint Manager </span> bridges this gap using edge-computed intelligence to map your invisible UK digital trail.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs h-14 px-10 rounded-2xl transition-all hover:scale-105 shadow-xl shadow-blue-600/20">
              <Link to="/audit">
                <Search className="mr-2 h-4 w-4 stroke-[3]" />
                {hasCompletedAudit ? 'Update Self-Audit' : 'Initiate Local Audit'}
              </Link>
            </Button>
            
            <Button asChild size="lg" variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white hover:text-slate-950 font-black uppercase tracking-widest text-xs h-14 px-10 rounded-2xl backdrop-blur-md transition-all">
              <Link to="/education">
                <GraduationCap className="mr-2 h-4 w-4 stroke-[3]" />
                Intelligence Base
              </Link>
            </Button>
          </div>
        </div>
      </motion.section>

      {/* --- ANALYTICS OVERLAY --- */}
      {hasCompletedAudit && riskResult && (
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <Card className="lg:col-span-2 border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6 px-10 flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Risk Intelligence Profile</CardTitle>
                <p className="text-sm font-black text-slate-900 uppercase italic">Composite Digital Substance Analysis</p>
              </div>
              <Activity className="text-blue-600" size={20} />
            </CardHeader>
            <CardContent className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Score</p>
                  <div className={`text-7xl font-black tracking-tighter ${riskTheme.text}`}>
                    {riskResult.overallRisk}%
                  </div>
                  <div className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${riskTheme.bg}`}>
                    {riskResult.riskLevel} IMPACT
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vulnerabilities</p>
                    <p className="text-3xl font-black text-slate-900 leading-none">{riskResult.vulnerabilities.length}</p>
                  </div>
                  <Button variant="link" asChild className="p-0 h-auto text-blue-600 font-black text-[10px] uppercase tracking-widest hover:no-underline group">
                    <Link to="/recommendations" className="flex items-center gap-2">
                      Deploy Remediation <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Security Assets</p>
                    <p className="text-3xl font-black text-slate-900 leading-none">{riskResult.strengths.length}</p>
                  </div>
                  <Button variant="link" asChild className="p-0 h-auto text-slate-400 font-black text-[10px] uppercase tracking-widest hover:no-underline">
                    <Link to="/risk-score">View Protected Domains</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Typology Card */}
          <Card className="bg-blue-600 border-none rounded-[2.5rem] p-10 text-white flex flex-col justify-between shadow-xl shadow-blue-600/20">
            <div className="space-y-6">
              <Fingerprint size={40} className="text-blue-200" />
              <div>
                <h3 className="text-3xl font-black tracking-tighter uppercase italic leading-none mb-2">
                  The {auditState?.typology || 'Explorer'}
                </h3>
                <p className="text-blue-100/80 text-xs font-bold uppercase tracking-widest">Digital Personality Type</p>
              </div>
            </div>
            <p className="text-sm font-medium leading-relaxed opacity-90">
              Based on your UK usage patterns, you maintain a balanced digital footprint with high awareness but moderate technical exposure.
            </p>
          </Card>
        </motion.section>
      )}

      {/* --- MODULES GRID --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ModuleCard 
          title="Digital Self-Audit"
          desc="Assessment of your surface-level data footprint across UK providers."
          icon={<Search size={24} />}
          link="/audit"
          completed={hasCompletedAudit}
          btnText={hasCompletedAudit ? 'Update Records' : 'Start Audit'}
        />
        <ModuleCard 
          title="Impact Analysis"
          desc="Technical breakdown of PIVA scores and personal user typology."
          icon={<Activity size={24} />}
          link="/risk-score"
          disabled={!hasCompletedAudit}
          completed={hasCompletedAudit}
          btnText="Run Analytics"
        />
        <ModuleCard 
          title="Strategy Roadmap"
          desc="Priority-ranked actions for footprint minimization and sovereignty."
          icon={<Target size={24} />}
          link="/recommendations"
          disabled={!hasCompletedAudit}
          completed={hasCompletedAudit}
          btnText="View Roadmap"
        />
      </section>

      {/* --- FOOTER STATS --- */}
      <Card className="bg-slate-50 border-slate-200 rounded-[2.5rem] p-6 md:p-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div className="space-y-2">
            <h4 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">UK Landscape <span className="text-blue-600">2026</span></h4>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Encapsulated ONS & ICO Benchmarks</p>
          </div>
          <Globe className="text-slate-300 animate-spin-slow" size={40} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
          <StatItem label="Digital Citizens" value={`${ukStats.ukDigitalLandscape.internetUsers.percentage}%`} sub="Total UK Reach" />
          <StatItem label="Breach Incidents" value={ukStats.ukDigitalLandscape.dataBreaches.reported2025.toLocaleString()} sub="ICO 2025 Cycle" color="text-rose-600" />
          <StatItem label="Privacy Concern" value={`${ukStats.ukDigitalLandscape.privacyConcerns.highConcern}%`} sub="Active Anxiety" color="text-amber-600" />
          <StatItem label="MFA Adoption" value={`${ukStats.ukDigitalLandscape.passwordSecurity.use2FA}%`} sub="Security Hygiene" color="text-indigo-600" />
        </div>
      </Card>
    </div>
  );
}

function ModuleCard({ title, desc, icon, link, completed, disabled, btnText }: any) {
  return (
    <Card className={`group relative transition-all duration-500 rounded-[2.5rem] border-slate-100 hover:shadow-2xl hover:-translate-y-2 bg-white p-2 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <CardHeader className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="p-4 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
            {icon}
          </div>
          {completed && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100">
              <CheckCircle size={10} /> Sync Complete
            </div>
          )}
        </div>
        <CardTitle className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">{title}</CardTitle>
        <CardDescription className="font-bold text-slate-400 text-xs uppercase leading-relaxed tracking-tight">{desc}</CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <Button asChild disabled={disabled} className="w-full font-black uppercase tracking-widest text-[10px] h-14 rounded-2xl group-hover:bg-blue-700 transition-all shadow-lg border-none">
          <Link to={link}>
            {btnText} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function StatItem({ label, value, sub, color = "text-blue-600" }: any) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
      <p className={`text-4xl font-black tracking-tighter ${color}`}>{value}</p>
      <p className="text-[10px] text-slate-500 font-bold uppercase">{sub}</p>
    </div>
  );
}