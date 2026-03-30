import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { auditQuestions, literacyQuestions } from '../data/auditQuestions';

// --- Types ---
export interface AuditState {
  currentStep: number;
  currentCategory: string;
  responses: Record<string, any>;
  literacyResponses: Record<string, number>;
  completedAt: string | null;
  lastSaved: string;
}

const STORAGE_KEY = 'footprint_audit_state';

export const categories = [
  { key: 'socialMedia', name: 'Social Media Presence', questions: auditQuestions.socialMedia },
  { key: 'personalInfo', name: 'Personal Information', questions: auditQuestions.personalInfo },
  { key: 'security', name: 'Security Practices', questions: auditQuestions.security },
  { key: 'dataSharing', name: 'Data Sharing', questions: auditQuestions.dataSharing },
  { key: 'professional', name: 'Professional Footprint', questions: auditQuestions.professional },
  { key: 'literacy', name: 'Privacy Literacy', questions: literacyQuestions }
];

const initialState: AuditState = {
  currentStep: 0,
  currentCategory: categories[0].key,
  responses: {},
  literacyResponses: {},
  completedAt: null,
  lastSaved: new Date().toISOString()
};

export function usePrivacyAudit() {
  // Destructuring the tuple from useLocalStorage with the 'as const' fix applied
  const [auditState, setAuditState, clearAuditState] = useLocalStorage<AuditState>(
    STORAGE_KEY,
    initialState
  );

  const [isComplete, setIsComplete] = useState(false);

  // Sync completion status with the auditState safely
  useEffect(() => {
    if (auditState?.completedAt) {
      setIsComplete(true);
    } else {
      setIsComplete(false);
    }
  }, [auditState?.completedAt]);

  // --- Getters ---
  const currentCategoryData = useMemo(() => {
    return categories[auditState.currentStep] || categories[0];
  }, [auditState.currentStep]);

  const progress = useMemo(() => {
    const totalSteps = categories.length;
    return Math.round((auditState.currentStep / totalSteps) * 100);
  }, [auditState.currentStep]);

  // --- Actions ---
  const saveResponse = useCallback((questionId: string, value: any) => {
    setAuditState(prev => ({
      ...prev,
      responses: { ...prev.responses, [questionId]: value },
      lastSaved: new Date().toISOString()
    }));
  }, [setAuditState]);

  const saveLiteracyResponse = useCallback((questionId: string, value: number) => {
    setAuditState(prev => ({
      ...prev,
      literacyResponses: { ...prev.literacyResponses, [questionId]: value },
      lastSaved: new Date().toISOString()
    }));
  }, [setAuditState]);

  const nextStep = useCallback(() => {
    setAuditState(prev => {
      const newStep = Math.min(prev.currentStep + 1, categories.length - 1);
      return {
        ...prev,
        currentStep: newStep,
        currentCategory: categories[newStep].key,
        lastSaved: new Date().toISOString()
      };
    });
  }, [setAuditState]);

  const previousStep = useCallback(() => {
    setAuditState(prev => {
      const newStep = Math.max(prev.currentStep - 1, 0);
      return {
        ...prev,
        currentStep: newStep,
        currentCategory: categories[newStep].key,
        lastSaved: new Date().toISOString()
      };
    });
  }, [setAuditState]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < categories.length) {
      setAuditState(prev => ({
        ...prev,
        currentStep: step,
        currentCategory: categories[step].key,
        lastSaved: new Date().toISOString()
      }));
    }
  }, [setAuditState]);

  /**
   * completeAudit: Finalizes the session and marks it for the RiskScore page.
   * This is the "Analyse" button's core logic.
   */
  const completeAudit = useCallback(() => {
    const timestamp = new Date().toISOString();
    setAuditState(prev => ({
      ...prev,
      completedAt: timestamp,
      lastSaved: timestamp
    }));
    setIsComplete(true);
    return true; 
  }, [setAuditState]);

  /**
   * resetAudit: Soft reset for UI state without wiping results.
   * Use this sparingly; usually only when explicitly starting a "New Audit".
   */
  const resetAudit = useCallback(() => {
    setAuditState({
      ...initialState,
      lastSaved: new Date().toISOString()
    });
    setIsComplete(false);
  }, [setAuditState]);

  /**
   * restartAudit: Hard wipe of the vault.
   */
  const restartAudit = useCallback(() => {
    clearAuditState();
    setIsComplete(false);
  }, [clearAuditState]);

  // --- Formatters (Optimized for literacyScorer and riskCalculator) ---
  const formattedResponses = useMemo(() => {
    return Object.entries(auditState.responses).map(([id, value]) => ({ 
      id, 
      value: typeof value === 'object' ? value : Number(value) 
    }));
  }, [auditState.responses]);

  const formattedLiteracy = useMemo(() => {
    return Object.entries(auditState.literacyResponses).map(([id, value]) => ({ 
      id, 
      value: Number(value) 
    }));
  }, [auditState.literacyResponses]);

  return {
    auditState,
    isComplete,
    categories,
    currentCategoryData,
    progress,
    formattedResponses,
    formattedLiteracy,
    saveResponse,
    saveLiteracyResponse,
    nextStep,
    previousStep,
    goToStep,
    completeAudit,
    resetAudit, 
    restartAudit
  };
}