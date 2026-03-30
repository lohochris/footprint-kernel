import { useMemo } from 'react';
import { calculateRiskScore, type RiskCalculationResult } from '../utils/riskCalculator';
import { auditQuestions } from '../data/auditQuestions';

export interface AuditResponse {
  id: string;
  value: number | string[];
}

export function useRiskCalculation(responses: AuditResponse[]): RiskCalculationResult | null {
  // 1. Flatten the questions object into a single array
  const flatQuestions = useMemo(() => {
    return Object.values(auditQuestions).flat();
  }, []);

  const result = useMemo(() => {
    if (!responses || responses.length === 0) {
      return null;
    }

    try {
      // 2. Pass the flat array instead of the nested object
      return calculateRiskScore(responses, flatQuestions);
    } catch (error) {
      console.error('Error calculating risk score:', error);
      return null;
    }
  }, [responses, flatQuestions]);

  return result;
}