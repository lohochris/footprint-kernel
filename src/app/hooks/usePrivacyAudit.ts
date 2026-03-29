import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { auditQuestions, literacyQuestions } from '../data/auditQuestions';

export interface AuditState {
  currentStep: number;
  currentCategory: string;
  responses: Record<string, any>;
  literacyResponses: Record<string, number>;
  completedAt: string | null;
  lastSaved: string;
}

const STORAGE_KEY = 'footprint_audit_state';

const categories = [
  { key: 'socialMedia', name: 'Social Media Presence', questions: auditQuestions.socialMedia },
  { key: 'personalInfo', name: 'Personal Information', questions: auditQuestions.personalInfo },
  { key: 'security', name: 'Security Practices', questions: auditQuestions.security },
  { key: 'dataSharing', name: 'Data Sharing', questions: auditQuestions.dataSharing },
  { key: 'professional', name: 'Professional Footprint', questions: auditQuestions.professional },
  { key: 'literacy', name: 'Privacy Literacy', questions: literacyQuestions }
];

/**
 * Custom hook for managing the privacy audit workflow
 * Handles progress tracking, response storage, and navigation
 */
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

  // Get current category data
  const getCurrentCategory = useCallback(() => {
    return categories[auditState.currentStep] || categories[0];
  }, [auditState.currentStep]);

  // Calculate progress percentage
  const getProgress = useCallback(() => {
    const totalSteps = categories.length;
    return Math.round((auditState.currentStep / totalSteps) * 100);
  }, [auditState.currentStep]);

  // Save response for a question
  const saveResponse = useCallback((questionId: string, value: any) => {
    setAuditState(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [questionId]: value
      },
      lastSaved: new Date().toISOString()
    }));
  }, [setAuditState]);

  // Save literacy response
  const saveLiteracyResponse = useCallback((questionId: string, value: number) => {
    setAuditState(prev => ({
      ...prev,
      literacyResponses: {
        ...prev.literacyResponses,
        [questionId]: value
      },
      lastSaved: new Date().toISOString()
    }));
  }, [setAuditState]);

  // Navigate to next step
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

  // Navigate to previous step
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

  // Jump to specific step
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

  // Check if current category is complete
  const isCategoryComplete = useCallback(() => {
    const currentCat = getCurrentCategory();
    if (currentCat.key === 'literacy') {
      return Object.keys(auditState.literacyResponses).length === literacyQuestions.length;
    }
    
    const categoryQuestions = currentCat.questions;
    const answeredQuestions = Object.keys(auditState.responses).filter(id =>
      categoryQuestions.some(q => q.id === id)
    );
    
    return answeredQuestions.length === categoryQuestions.length;
  }, [auditState, getCurrentCategory]);

  // Complete the audit
  const completeAudit = useCallback(() => {
    setAuditState(prev => ({
      ...prev,
      completedAt: new Date().toISOString(),
      lastSaved: new Date().toISOString()
    }));
    setIsComplete(true);
  }, [setAuditState]);

  // Restart audit
  const restartAudit = useCallback(() => {
    clearAuditState();
    setIsComplete(false);
  }, [clearAuditState]);

  // Get all responses formatted for calculations
  const getAllResponses = useCallback(() => {
    return Object.entries(auditState.responses).map(([id, value]) => ({
      id,
      value
    }));
  }, [auditState.responses]);

  // Get literacy responses formatted
  const getLiteracyResponses = useCallback(() => {
    return Object.entries(auditState.literacyResponses).map(([id, value]) => ({
      id,
      value
    }));
  }, [auditState.literacyResponses]);

  return {
    // State
    auditState,
    isComplete,
    categories,
    
    // Getters
    getCurrentCategory,
    getProgress,
    isCategoryComplete,
    getAllResponses,
    getLiteracyResponses,
    
    // Actions
    saveResponse,
    saveLiteracyResponse,
    nextStep,
    previousStep,
    goToStep,
    completeAudit,
    restartAudit
  };
}
