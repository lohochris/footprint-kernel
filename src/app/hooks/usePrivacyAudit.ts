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

// Memoize categories outside or use a constant to prevent unnecessary re-renders
export const categories = [
  { key: 'socialMedia', name: 'Social Media Presence', questions: auditQuestions.socialMedia },
  { key: 'personalInfo', name: 'Personal Information', questions: auditQuestions.personalInfo },
  { key: 'security', name: 'Security Practices', questions: auditQuestions.security },
  { key: 'dataSharing', name: 'Data Sharing', questions: auditQuestions.dataSharing },
  { key: 'professional', name: 'Professional Footprint', questions: auditQuestions.professional },
  { key: 'literacy', name: 'Privacy Literacy', questions: literacyQuestions }
];

export function usePrivacyAudit() {
  const [auditState, setAuditState, clearAuditState] = useLocalStorage<AuditState>(
    STORAGE_KEY,
    {
      currentStep: 0,
      currentCategory: categories[0].key,
      responses: {},
      literacyResponses: {},
      completedAt: null,
      lastSaved: new Date().toISOString()
    }
  );

  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setIsComplete(auditState.completedAt !== null);
  }, [auditState.completedAt]);

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

  const isCategoryComplete = useCallback(() => {
    const currentCat = currentCategoryData;
    if (currentCat.key === 'literacy') {
      return Object.keys(auditState.literacyResponses).length === literacyQuestions.length;
    }
    
    const categoryQuestions = currentCat.questions;
    const answeredQuestions = Object.keys(auditState.responses).filter(id =>
      categoryQuestions.some(q => q.id === id)
    );
    
    return answeredQuestions.length === categoryQuestions.length;
  }, [auditState, currentCategoryData]);

  const completeAudit = useCallback(() => {
    setAuditState(prev => ({
      ...prev,
      completedAt: new Date().toISOString(),
      lastSaved: new Date().toISOString()
    }));
    setIsComplete(true);
  }, [setAuditState]);

  const restartAudit = useCallback(() => {
    clearAuditState();
    setIsComplete(false);
  }, [clearAuditState]);

  // Formatters
  const formattedResponses = useMemo(() => {
    return Object.entries(auditState.responses).map(([id, value]) => ({ id, value }));
  }, [auditState.responses]);

  const formattedLiteracy = useMemo(() => {
    return Object.entries(auditState.literacyResponses).map(([id, value]) => ({ id, value }));
  }, [auditState.literacyResponses]);

  return {
    auditState,
    isComplete,
    categories,
    currentCategoryData,
    progress,
    isCategoryComplete,
    formattedResponses,
    formattedLiteracy,
    saveResponse,
    saveLiteracyResponse,
    nextStep,
    previousStep,
    goToStep,
    completeAudit,
    restartAudit
  };
}