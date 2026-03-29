import { useMemo } from 'react';
import { calculateRiskScore, RiskCalculationResult } from '../utils/riskCalculator';
import { auditQuestions } from '../data/auditQuestions';

interface AuditResponse {
  id: string;
  value: number | string[];
}

/**
 * Hook for calculating risk scores with memoization
 * Prevents unnecessary recalculations on re-renders
 */
export function useRiskCalculation(responses: AuditResponse[]): RiskCalculationResult | null {
  const result = useMemo(() => {
    if (!responses || responses.length === 0) {
      return null;
    }

    try {
      return calculateRiskScore(responses, auditQuestions);
    } catch (error) {
      console.error('Error calculating risk score:', error);
      return null;
    }
  }, [responses]);

  return result;
}

/**
 * Hook for risk level styling
 */
export function useRiskStyling(riskLevel: 'low' | 'medium' | 'high') {
  return useMemo(() => {
    const styles = {
      low: {
        color: 'text-green-700',
        bg: 'bg-green-100',
        border: 'border-green-300',
        icon: 'text-green-600',
        badge: 'bg-green-500'
      },
      medium: {
        color: 'text-orange-700',
        bg: 'bg-orange-100',
        border: 'border-orange-300',
        icon: 'text-orange-600',
        badge: 'bg-orange-500'
      },
      high: {
        color: 'text-red-700',
        bg: 'bg-red-100',
        border: 'border-red-300',
        icon: 'text-red-600',
        badge: 'bg-red-500'
      }
    };

    return styles[riskLevel];
  }, [riskLevel]);
}
