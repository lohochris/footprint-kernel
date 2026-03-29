import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { 
  ArrowRight, ArrowLeft, CheckCircle, AlertCircle, 
  Clock, ShieldCheck, Info 
} from 'lucide-react';

import { usePrivacyAudit } from '../hooks/usePrivacyAudit';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export function SelfAudit() {
  const navigate = useNavigate();
  const audit = usePrivacyAudit();
  
  // 1. Structural State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentCategory = audit.getCurrentCategory();
  const currentQuestion = currentCategory?.questions[currentQuestionIndex];

  // 2. Computed Progress Metrics
  const metrics = useMemo(() => {
    const totalQuestions = audit.categories.reduce((sum, cat) => sum + cat.questions.length, 0);
    
    // Calculate current global position
    let globalIndex = 0;
    for (let i = 0; i < audit.auditState.currentStep; i++) {
      globalIndex += audit.categories[i].questions.length;
    }
    globalIndex += currentQuestionIndex + 1;

    const answeredCount = Object.keys(audit.auditState.responses).length + 
                         Object.keys(audit.auditState.literacyResponses).length;
    
    return {
      total: totalQuestions,
      current: globalIndex,
      percentage: Math.round((answeredCount / totalQuestions) * 100),
      isLast: audit.auditState.currentStep === audit.categories.length - 1 && 
              currentQuestionIndex === currentCategory?.questions.length - 1
    };
  }, [audit, currentQuestionIndex, currentCategory]);

  // 3. Response Logic
  const currentResponse = useMemo(() => {
    if (!currentQuestion) return null;
    return currentCategory.key === 'literacy' 
      ? audit.auditState.literacyResponses[currentQuestion.id] 
      : audit.auditState.responses[currentQuestion.id];
  }, [audit.auditState, currentQuestion, currentCategory]);

  const handleUpdate = (value: any) => {
    if (currentCategory.key === 'literacy') {
      audit.saveLiteracyResponse(currentQuestion.id, value);
    } else {
      audit.saveResponse(currentQuestion.id, value);
    }
  };

  // 4. Navigation
  const handleNext = () => {
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
      const prevStep = audit.auditState.currentStep - 1;
      audit.previousStep();
      setCurrentQuestionIndex(audit.categories[prevStep].questions.length - 1);
    }
  };

  if (!currentQuestion) return <LoadingState />;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header & Local Security Badge */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Privacy Self-Audit</h1>
          <p className="text-slate-500 mt-1">Domain: <span className="text-blue-600 font-semibold">{currentCategory.name}</span></p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 shadow-sm">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Local Processing Active</span>
        </div>
      </header>

      {/* Progress Architecture */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Question {metrics.current} of {metrics.total}</span>
            <div className="text-2xl font-bold text-slate-900">{metrics.percentage}% Complete</div>
          </div>
          <div className="flex -space-x-1">
             {audit.categories.map((_, i) => (
               <div key={i} className={`h-2 w-8 rounded-full border-2 border-white ${i <= audit.auditState.currentStep ? 'bg-blue-600' : 'bg-slate-200'}`} />
             ))}
          </div>
        </div>
        <Progress value={metrics.percentage} className="h-3 bg-slate-100" />
      </section>

      {/* Question Interaction Area */}
      <Card className="border-none shadow-xl ring-1 ring-slate-200 overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-8">
          <CardTitle className="text-2xl leading-snug text-slate-800">
            {currentQuestion.question}
          </CardTitle>
          {currentQuestion.description && (
            <CardDescription className="text-slate-500 text-base mt-2">
              {currentQuestion.description}
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="space-y-4">
            <InputRenderer 
              question={currentQuestion} 
              value={currentResponse} 
              onUpdate={handleUpdate} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation Ecosystem */}
      <footer className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="lg"
            onClick={handleBack}
            disabled={audit.auditState.currentStep === 0 && currentQuestionIndex === 0}
            className="text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </Button>

          <Button
            size="lg"
            onClick={handleNext}
            disabled={!currentResponse || (Array.isArray(currentResponse) && currentResponse.length === 0)}
            className={`px-10 shadow-lg transition-all ${metrics.isLast ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {metrics.isLast ? 'Finalize Audit' : 'Continue'}
            {metrics.isLast ? <CheckCircle className="ml-2 h-5 w-5" /> : <ArrowRight className="ml-2 h-5 w-5" />}
          </Button>
        </div>

        <div className="flex items-center justify-center gap-6 text-[11px] font-medium text-slate-400 uppercase tracking-widest">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            Last Saved: {audit.auditState.lastSaved ? new Date(audit.auditState.lastSaved).toLocaleTimeString() : 'Just now'}
          </span>
          <span className="h-1 w-1 bg-slate-300 rounded-full" />
          <span className="flex items-center gap-1.5">
             <Info className="h-3 w-3" />
             Encrypted Storage
          </span>
        </div>
      </footer>
    </div>
  );
}

// Sub-component: Strategy Pattern for Input Rendering
function InputRenderer({ question, value, onUpdate }: any) {
  if (question.type === 'radio') {
    return (
      <RadioGroup value={value?.toString()} onValueChange={(v) => onUpdate(parseInt(v))} className="grid gap-3">
        {question.options.map((opt: any) => (
          <OptionWrapper 
            key={opt.value} 
            selected={value === opt.value} 
            onClick={() => onUpdate(opt.value)}
          >
            <RadioGroupItem value={opt.value.toString()} id={`v-${opt.value}`} className="mt-1" />
            <Label htmlFor={`v-${opt.value}`} className="flex-1 text-base font-medium cursor-pointer py-1">
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
      <div className="grid gap-3">
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
              <Checkbox checked={isChecked} id={`c-${opt.value}`} />
              <Label htmlFor={`c-${opt.value}`} className="flex-1 text-base font-medium cursor-pointer">
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
      <div className="flex flex-col gap-6">
         <div className="grid grid-cols-5 gap-2 md:gap-4">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => onUpdate(num)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  value === num ? 'border-blue-600 bg-blue-50/50 shadow-inner' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className={`text-xl font-bold ${value === num ? 'text-blue-600' : 'text-slate-400'}`}>{num}</span>
              </button>
            ))}
         </div>
         <div className="flex justify-between px-2 text-[10px] font-bold uppercase tracking-tighter text-slate-400">
            <span>Strongly Disagree</span>
            <span>Strongly Agree</span>
         </div>
      </div>
    );
  }

  return null;
}

// Reusable Option Wrapper for consistent UI
function OptionWrapper({ children, selected, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-start gap-4 p-5 rounded-xl border-2 transition-all cursor-pointer ${
        selected ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
      }`}
    >
      {children}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-medium animate-pulse">Initializing Security Modules...</p>
    </div>
  );
}