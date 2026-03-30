import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ArrowLeft, CheckCircle, 
  ShieldCheck, AlertCircle 
} from 'lucide-react';

import { usePrivacyAudit } from '../hooks/usePrivacyAudit';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

interface Question {
  id: string;
  question: string;
  type: string;
  description?: string;
  options: any[];
  weight?: number;
}

export function SelfAudit() {
  const navigate = useNavigate();
  const audit = usePrivacyAudit();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentCategory = audit.currentCategoryData;
  const currentQuestion = currentCategory?.questions[currentQuestionIndex] as Question | undefined;

  // --- STAGE 1: DYNAMIC METRICS CALCULATION ---
  const metrics = useMemo(() => {
    if (!audit.categories || !currentCategory) {
      return { total: 0, current: 0, percentage: 0, isLast: false };
    }
    
    const totalQuestions = audit.categories.reduce((sum, cat) => sum + cat.questions.length, 0);
    
    // Calculate global position based on steps and current index
    let globalIndex = 0;
    for (let i = 0; i < audit.auditState.currentStep; i++) {
      globalIndex += audit.categories[i].questions.length;
    }
    globalIndex += currentQuestionIndex + 1;

    // Fixed: Progress is now based on position in the total flow, not just response count
    const progressPercentage = Math.round((globalIndex / totalQuestions) * 100);
    
    return {
      total: totalQuestions,
      current: globalIndex,
      percentage: progressPercentage,
      isLast: audit.auditState.currentStep === audit.categories.length - 1 && 
              currentQuestionIndex === (currentCategory?.questions.length || 0) - 1
    };
  }, [audit.categories, audit.auditState.currentStep, currentQuestionIndex, currentCategory]);

  const currentResponse = useMemo(() => {
    if (!currentQuestion || !currentCategory) return null;
    const response = currentCategory.key === 'literacy' 
      ? audit.auditState.literacyResponses[currentQuestion.id] 
      : audit.auditState.responses[currentQuestion.id];
    
    return (response === undefined || response === null) ? null : response;
  }, [audit.auditState, currentQuestion, currentCategory]);

  const isContinueDisabled = useMemo(() => {
    if (currentResponse === null || currentResponse === undefined) return true;
    if (Array.isArray(currentResponse)) return currentResponse.length === 0;
    return false; 
  }, [currentResponse]);

  // --- STAGE 2: NAVIGATION & LOGIC HANDLERS ---
  const handleUpdate = (value: any) => {
    if (!currentQuestion || !currentCategory) return;
    if (currentCategory.key === 'literacy') {
      audit.saveLiteracyResponse(currentQuestion.id, value);
    } else {
      audit.saveResponse(currentQuestion.id, value);
    }
  };

  const handleNext = () => {
    if (!currentCategory) return;
    if (currentQuestionIndex < currentCategory.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (audit.auditState.currentStep < audit.categories.length - 1) {
      audit.nextStep();
      setCurrentQuestionIndex(0);
    } else {
      audit.completeAudit();
      navigate('/risk-score');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (audit.auditState.currentStep > 0) {
      const prevStepIndex = audit.auditState.currentStep - 1;
      audit.previousStep();
      // Logic Fix: Target the last question of the previous category
      setCurrentQuestionIndex(audit.categories[prevStepIndex].questions.length - 1);
    }
  };

  if (!currentQuestion || !currentCategory) return <LoadingState />;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 px-4">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Privacy Self-Audit</h1>
          <p className="text-slate-500 mt-2 font-medium">
            Category: <span className="text-emerald-600 font-black uppercase text-xs ml-1 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">{currentCategory.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span className="text-[10px] font-black uppercase tracking-widest">Secure Instance Active</span>
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Vector Point {metrics.current} / {metrics.total}</span>
            <div className="text-3xl font-black text-slate-900 tracking-tighter">{metrics.percentage}% Evaluated</div>
          </div>
        </div>
        <Progress value={metrics.percentage} className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-100 shadow-inner" />
      </section>

      <Card className="border-none shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] rounded-[2.5rem] ring-1 ring-slate-200 overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-12 px-10">
          <CardTitle className="text-2xl md:text-3xl font-black tracking-tight leading-tight text-slate-800">
            {currentQuestion.question}
          </CardTitle>
          {currentQuestion.description && (
            <div className="flex gap-3 mt-6 p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <AlertCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                {currentQuestion.description}
              </p>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-10">
          <InputRenderer 
            question={currentQuestion} 
            value={currentResponse} 
            onUpdate={handleUpdate} 
          />
        </CardContent>
      </Card>

      <footer className="flex flex-col gap-6 pt-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="lg"
            onClick={handleBack}
            disabled={audit.auditState.currentStep === 0 && currentQuestionIndex === 0}
            className="text-slate-400 font-black uppercase tracking-widest text-xs hover:text-slate-900 hover:bg-slate-100 rounded-xl px-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <Button
            size="lg"
            onClick={handleNext}
            disabled={isContinueDisabled}
            className={`px-12 h-16 text-xs uppercase tracking-[0.2em] shadow-2xl transition-all font-black rounded-2xl ${
              metrics.isLast 
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
            }`}
          >
            {metrics.isLast ? 'Analyze Footprint' : 'Next Question'}
            {metrics.isLast ? <CheckCircle className="ml-3 h-5 w-5" /> : <ArrowRight className="ml-3 h-5 w-5" />}
          </Button>
        </div>
      </footer>
    </div>
  );
}

function InputRenderer({ question, value, onUpdate }: any) {
  if (question.type === 'radio') {
    return (
      <RadioGroup value={value?.toString()} onValueChange={(v) => onUpdate(parseInt(v))} className="grid gap-5">
        {question.options.map((opt: any) => (
          <OptionWrapper 
            key={opt.value} 
            selected={value === opt.value} 
            onClick={() => onUpdate(opt.value)}
          >
            <RadioGroupItem value={opt.value.toString()} id={`v-${opt.value}`} className="mt-1 sr-only" />
            <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${value === opt.value ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 bg-white'}`}>
                {value === opt.value && <div className="h-2 w-2 rounded-full bg-white" />}
            </div>
            <Label htmlFor={`v-${opt.value}`} className="flex-1 text-lg font-bold cursor-pointer text-slate-700">
              {opt.label}
            </Label>
          </OptionWrapper>
        ))}
      </RadioGroup>
    );
  }

  if (question.type === 'checkbox') {
    const currentValues = Array.isArray(value) ? value : [];
    return (
      <div className="grid gap-5">
        {question.options.map((opt: any) => {
          const isChecked = currentValues.includes(opt.value);
          return (
            <OptionWrapper 
              key={opt.value} 
              selected={isChecked}
              onClick={() => {
                const next = isChecked ? currentValues.filter(v => v !== opt.value) : [...currentValues, opt.value];
                onUpdate(next);
              }}
            >
              <Checkbox checked={isChecked} id={`c-${opt.value}`} className="h-6 w-6 rounded-lg border-2 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600" />
              <Label htmlFor={`c-${opt.value}`} className="flex-1 text-lg font-bold cursor-pointer text-slate-700">
                {opt.label}
              </Label>
            </OptionWrapper>
          );
        })}
      </div>
    );
  }

  if (question.type === 'likert') {
    return (
      <div className="flex flex-col gap-12 py-8">
        <div className="grid grid-cols-5 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5].map((num) => {
            const isSelected = value === num;
            const colors = [
              '', 
              'border-rose-500 bg-rose-50 text-rose-600 ring-rose-100',
              'border-orange-400 bg-orange-50 text-orange-600 ring-orange-100',
              'border-cyan-500 bg-cyan-50 text-cyan-600 ring-cyan-100',
              'border-emerald-400 bg-emerald-50 text-emerald-600 ring-emerald-100',
              'border-emerald-600 bg-emerald-100 text-emerald-700 ring-emerald-200'
            ];

            return (
              <button
                key={num}
                type="button"
                onClick={() => onUpdate(num)}
                className={`flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 transition-all duration-500 shadow-sm ${
                  isSelected 
                    ? `${colors[num]} ring-8 scale-110 z-10 shadow-2xl` 
                    : 'border-slate-100 bg-white hover:border-slate-300 text-slate-300 hover:text-slate-500'
                }`}
              >
                <span className="text-4xl font-black tracking-tighter">{num}</span>
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400 mb-1">Strongly Disagree</span>
            <span className="text-xs font-bold text-slate-500">Vector Rank 1</span>
          </div>
          <div className="h-1 flex-1 mx-12 bg-slate-800 rounded-full overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-cyan-500 to-emerald-500 opacity-50" />
          </div>
          <div className="flex flex-col items-end text-right">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1">Strongly Agree</span>
            <span className="text-xs font-bold text-slate-500">Vector Rank 5</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

function OptionWrapper({ children, selected, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-6 p-8 rounded-[2rem] border-2 transition-all cursor-pointer shadow-sm group ${
        selected 
          ? 'border-emerald-600 bg-emerald-50/50 ring-8 ring-emerald-50 shadow-emerald-100' 
          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 bg-white'
      }`}
    >
      {children}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] space-y-8">
      <div className="relative">
        <div className="h-24 w-24 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin" />
        <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-emerald-600" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Encrypting Environment</h3>
        <p className="text-slate-500 font-medium italic">Building Muhammad et al. framework instance...</p>
      </div>
    </div>
  );
}