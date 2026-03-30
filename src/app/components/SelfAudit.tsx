import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ArrowLeft, CheckCircle, 
  ShieldCheck, AlertCircle 
} from 'lucide-react';

import { usePrivacyAudit } from '../hooks/usePrivacyAudit';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
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

  // Sync index if category changes via the hook
  useEffect(() => {
    // This ensures that when audit.nextStep() is called, 
    // the local question index is reset to 0
  }, [audit.auditState.currentStep]);

  const metrics = useMemo(() => {
    if (!audit.categories || !currentCategory || !audit.auditState) {
      return { total: 0, current: 0, percentage: 0, isLast: false };
    }
    
    const totalQuestions = audit.categories.reduce((sum, cat) => sum + cat.questions.length, 0);
    
    let globalIndex = 0;
    for (let i = 0; i < audit.auditState.currentStep; i++) {
      globalIndex += audit.categories[i].questions.length;
    }
    globalIndex += currentQuestionIndex + 1;

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

  const handleUpdate = (value: any) => {
    if (!currentQuestion || !currentCategory) return;
    if (currentCategory.key === 'literacy') {
      audit.saveLiteracyResponse(currentQuestion.id, value);
    } else {
      audit.saveResponse(currentQuestion.id, value);
    }
  };

  const handleNext = async () => {
    if (!currentCategory) return;

    if (currentQuestionIndex < currentCategory.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (audit.auditState.currentStep < audit.categories.length - 1) {
      // Move to the next category
      audit.nextStep();
      setCurrentQuestionIndex(0);
    } else {
      // --- CRITICAL FIX: FINAL SUBMISSION LOGIC ---
      
      // 1. Mark as complete in LocalStorage
      const success = await audit.completeAudit(); 
      
      if (success) {
        // 2. Navigate to Results
        // Note: We DO NOT call resetAudit here. 
        // Wiping the state should only happen if the user clicks "Start New Audit" 
        // from the results dashboard.
        navigate('/risk-score');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (audit.auditState.currentStep > 0) {
      const prevStepIndex = audit.auditState.currentStep - 1;
      audit.previousStep();
      setCurrentQuestionIndex(audit.categories[prevStepIndex].questions.length - 1);
    }
  };

  if (!currentQuestion || !currentCategory) return <LoadingState />;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-500 px-4 pt-8">
      <header className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase italic">Privacy Self-Audit</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Domain:</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
              {currentCategory.name}
            </span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg border border-border">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Local Session</span>
        </div>
      </header>

      <section className="space-y-3">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Module Progress: {metrics.current} / {metrics.total}
          </span>
          <span className="text-sm font-bold text-foreground tabular-nums">{metrics.percentage}%</span>
        </div>
        <Progress value={metrics.percentage} className="h-1.5 bg-muted rounded-full overflow-hidden" />
      </section>

      <Card className="border border-border shadow-sm rounded-xl overflow-hidden bg-card">
        <CardHeader className="bg-muted/20 border-b border-border py-6 px-6">
          <CardTitle className="text-xl font-semibold tracking-tight leading-snug text-foreground">
            {currentQuestion.question}
          </CardTitle>
          {currentQuestion.description && (
            <div className="flex gap-3 mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
              <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-muted-foreground text-xs font-medium leading-relaxed">
                {currentQuestion.description}
              </p>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-6">
          <InputRenderer 
            question={currentQuestion} 
            value={currentResponse} 
            onUpdate={handleUpdate} 
          />
        </CardContent>
      </Card>

      <footer className="flex items-center justify-between pt-2">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={audit.auditState.currentStep === 0 && currentQuestionIndex === 0}
          className="text-muted-foreground font-bold uppercase tracking-wider text-[10px] hover:text-foreground hover:bg-transparent"
        >
          <ArrowLeft className="mr-2 h-3 w-3" />
          Previous
        </Button>

        <Button
          onClick={handleNext}
          disabled={isContinueDisabled}
          className={`px-10 h-12 text-[11px] uppercase tracking-widest font-bold rounded-lg transition-all shadow-md ${
            metrics.isLast 
              ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
              : 'bg-foreground text-background hover:bg-foreground/90'
          }`}
        >
          {metrics.isLast ? 'Analyze Results' : 'Next Question'}
          {metrics.isLast ? <CheckCircle className="ml-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </footer>
    </div>
  );
}

// Sub-components (InputRenderer, OptionWrapper, LoadingState) remain identical 
// to your previous file structure, but I've updated the typography for consistency.

function InputRenderer({ question, value, onUpdate }: any) {
  if (question.type === 'radio' || question.type === 'checkbox') {
    return (
      <div className="grid gap-2">
        {question.options.map((opt: any) => {
          const isSelected = Array.isArray(value) ? value.includes(opt.value) : value === opt.value;
          return (
            <OptionWrapper 
              key={opt.value} 
              selected={isSelected} 
              onClick={() => {
                if (question.type === 'checkbox') {
                  const next = isSelected 
                    ? value.filter((v: any) => v !== opt.value) 
                    : [...(value || []), opt.value];
                  onUpdate(next);
                } else {
                  onUpdate(opt.value);
                }
              }}
            >
              <div className={`h-4 w-4 rounded-full border flex items-center justify-center transition-colors ${
                isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30 bg-background'
              }`}>
                {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
              </div>
              <Label className="flex-1 text-sm font-medium cursor-pointer text-foreground leading-none">
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
      <div className="space-y-6 py-2">
        <div className="grid grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((num) => {
            const isSelected = value === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => onUpdate(num)}
                className={`flex flex-col items-center justify-center h-12 rounded-lg border-2 transition-all duration-200 ${
                  isSelected 
                    ? 'border-primary bg-primary/5 text-primary font-bold shadow-inner' 
                    : 'border-border bg-background text-muted-foreground hover:border-muted-foreground/50'
                }`}
              >
                <span className="text-lg tracking-tight">{num}</span>
              </button>
            );
          })}
        </div>
        <div className="flex justify-between items-center px-1">
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Strongly Disagree</span>
          <div className="h-px flex-1 mx-6 bg-border" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Strongly Agree</span>
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
      className={`flex items-center gap-3 p-4 rounded-lg border transition-all cursor-pointer ${
        selected 
          ? 'border-primary bg-primary/[0.03] ring-1 ring-primary/5 shadow-sm' 
          : 'border-border hover:bg-muted/30 bg-background'
      }`}
    >
      {children}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] space-y-6">
      <div className="relative">
        <div className="h-16 w-16 border-2 border-muted border-t-primary rounded-full animate-spin" />
        <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
      </div>
      <div className="text-center space-y-1">
        <h3 className="text-lg font-bold text-foreground uppercase tracking-tighter">Initializing Vault</h3>
        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest italic opacity-70">Synchronizing edge parameters...</p>
      </div>
    </div>
  );
}