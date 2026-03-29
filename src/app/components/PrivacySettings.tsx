import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalStorage, useClearAuditData, useStorageSize } from '../hooks/useLocalStorage';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Separator } from './ui/separator';
import { 
  Trash2, 
  Database,
  Shield,
  AlertTriangle,
  Download,
  Info,
  Lock,
  Cpu,
  ShieldCheck,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { exportAsJSON, type ExportData } from '../utils/pdfExporter'; // Imported ExportData type
import { toast } from 'sonner';
import { Badge } from './ui/badge';

// Unified Interface aligned with the PDF Exporter
interface AuditState {
  completedAt?: string | number | Date;
  riskScore?: number;
  riskLevel?: string;
  literacyScore?: number;
  literacyLevel?: string;
  typology?: string;
  categoryBreakdown?: Array<{ category: string; score: number }>;
  recommendations?: string[];
  vulnerabilities?: string[];
  strengths?: string[];
}

export function PrivacySettings() {
  const [auditState] = useLocalStorage<AuditState | null>('footprint_audit_state', null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const clearAuditData = useClearAuditData();
  const storageSize = useStorageSize();

  const handleClearAllData = () => {
    const cleared = clearAuditData();
    toast.success(`Protocol Wipe Complete: ${cleared} objects purged.`);
    setShowDeleteConfirm(false);
    // Smooth reload to reset application state
    setTimeout(() => window.location.reload(), 1200);
  };

  const handleExportBeforeDelete = () => {
    if (auditState?.completedAt) {
      // Create the payload strictly matching the ExportData interface
      const exportPayload: ExportData = {
        auditDate: new Date(auditState.completedAt).toLocaleDateString('en-GB'),
        riskScore: auditState.riskScore ?? 0,
        riskLevel: auditState.riskLevel ?? 'Medium',
        literacyScore: auditState.literacyScore ?? 0,
        literacyLevel: auditState.literacyLevel ?? 'Medium',
        typology: auditState.typology ?? 'Standard User',
        categoryBreakdown: auditState.categoryBreakdown ?? [],
        recommendations: auditState.recommendations ?? [],
        vulnerabilities: auditState.vulnerabilities ?? [],
        strengths: auditState.strengths ?? []
      };

      exportAsJSON(exportPayload);
      toast.success('Vault data exported to local filesystem.');
    } else {
      toast.error('No verified audit data found in local storage.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-24 px-4 selection:bg-blue-100">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Badge className="mb-3 bg-blue-500/10 text-blue-600 border-blue-200/50 px-3 py-1 font-bold">
            <Lock size={12} className="mr-2" /> System Kernel v2.6
          </Badge>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Vault Control</h1>
          <p className="text-slate-500 font-medium">Manage your local data residency and compliance protocols.</p>
        </motion.div>
        
        {auditState?.completedAt && (
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }} 
             animate={{ opacity: 1, scale: 1 }}
             className="bg-white border border-slate-200 p-1.5 rounded-2xl flex items-center shadow-sm"
           >
              <div className="bg-emerald-500 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-100">
                <ShieldCheck size={22} />
              </div>
              <div className="px-5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Audit Verification</p>
                <p className="text-slate-900 font-black text-lg">Identity Secured</p>
              </div>
           </motion.div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        <div className="lg:col-span-2 space-y-10">
          {/* Edge Architecture Card */}
          <Card className="border-none shadow-2xl bg-[#0F172A] text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
               <Cpu size={180} />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center text-blue-400 text-xl font-black tracking-tight">
                <Shield className="mr-3 h-6 w-6" />
                Edge-Only Data Architecture
              </CardTitle>
              <CardDescription className="text-slate-400">Calculations performed on-device via local JS binaries.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              {[
                { title: "Zero API Pulse", desc: "No data packets leave this browser." },
                { title: "Localized Vault", desc: "Encryption tied to this hardware." },
                { title: "Ghost Analytics", desc: "Behavioral tracking is physically impossible." },
                { title: "ICO 2026 Ready", desc: "UK GDPR & DUA Act 2025 compliant." }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                  <div>
                    <p className="font-bold text-slate-100">{item.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Storage Details Card */}
          <Card className="border-slate-200/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200">
                    <HardDrive size={18} className="text-blue-600" />
                  </div>
                  <CardTitle className="text-lg font-black tracking-tight text-slate-900">Data Residency</CardTitle>
                </div>
                <Badge variant="secondary" className="font-mono text-[10px] tracking-widest bg-slate-100 text-slate-600">
                  {storageSize.toFixed(2)} KB
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vault Status</p>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full animate-pulse ${auditState?.completedAt ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <p className="text-xl font-black text-slate-900 leading-none">
                      {auditState?.completedAt ? 'Validated' : 'Incomplete'}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Protocol Sync</p>
                  <p className="text-xl font-black text-slate-900 leading-none">
                    {auditState?.completedAt 
                      ? new Date(auditState.completedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) 
                      : 'Not Synced'}
                  </p>
                </div>
              </div>

              <div className="mt-10 p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex gap-4 items-start">
                <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 leading-relaxed font-medium">
                  <strong>Local Storage Persistence:</strong> Clearing your browser's "Site Data" or "Cache" will wipe this vault permanently. Backup your data before system maintenance.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-xl shadow-slate-100 rounded-[2.5rem] sticky top-28 overflow-hidden bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-black tracking-tight text-slate-900">Vault Actions</CardTitle>
              <CardDescription className="text-slate-500 font-medium">Export or Purge resident data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-between h-14 rounded-2xl border-slate-200 hover:bg-slate-50 group transition-all"
                onClick={handleExportBeforeDelete}
                disabled={!auditState?.completedAt}
              >
                <span className="flex items-center font-bold">
                  <Download className="mr-3 h-5 w-5 text-blue-600" />
                  Backup Vault (.JSON)
                </span>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-slate-300" />
              </Button>

              <div className="py-2">
                <Separator className="bg-slate-100" />
              </div>

              <AnimatePresence mode="wait">
                {!showDeleteConfirm ? (
                  <motion.div key="del" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Button 
                      variant="ghost"
                      className="w-full justify-start h-14 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 font-bold transition-colors"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 className="mr-3 h-5 w-5" />
                      Purge Local Data
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="confirm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 p-5 bg-red-50/50 border border-red-200 rounded-[2rem]"
                  >
                    <div className="flex gap-3 text-red-700">
                      <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-black uppercase tracking-tight">System Wipe</p>
                        <p className="text-[11px] font-bold leading-tight opacity-70">Action cannot be reversed. Results will be destroyed.</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="destructive"
                        className="w-full h-12 rounded-xl font-black shadow-lg shadow-red-200"
                        onClick={handleClearAllData}
                      >
                        CONFIRM WIPE
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full h-10 text-slate-500 font-bold hover:bg-white"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancel Action
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
            <CardFooter className="bg-slate-50/80 border-t border-slate-100 flex justify-center py-4">
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                <ShieldCheck size={12} className="text-emerald-500" /> 256-Bit Local Session
              </div>
            </CardFooter>
          </Card>

          <div className="px-6 py-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm group hover:border-blue-200 transition-colors">
            <div className="flex items-center gap-3">
              <RefreshCw size={16} className="text-slate-400 group-hover:rotate-180 transition-transform duration-700" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Hard Refresh</span>
            </div>
            <button onClick={() => window.location.reload()} className="text-[10px] font-black text-blue-600 hover:text-blue-800 transition-colors">EXECUTE</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ size, className }: { size: number, className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}