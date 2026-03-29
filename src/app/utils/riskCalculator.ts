/**
 * Risk Calculator - Calculates privacy risk scores based on audit responses
 * Based on Personal Information Vulnerability Assessment (PIVA) methodology
 */

interface AuditResponse {
  id: string;
  value: number | string[];
  risk?: number;
}

interface CategoryScore {
  category: string;
  score: number;
  weight: number;
}

export interface RiskCalculationResult {
  overallRisk: number;
  riskLevel: 'low' | 'medium' | 'high';
  categoryBreakdown: CategoryScore[];
  vulnerabilities: string[];
  strengths: string[];
}

/**
 * Calculate risk for individual questions
 */
function calculateQuestionRisk(question: any, response: AuditResponse): number {
  if (question.type === 'radio') {
    const selectedOption = question.options.find((opt: any) => opt.value === response.value);
    return selectedOption ? selectedOption.risk : 0;
  }

  if (question.type === 'checkbox' && Array.isArray(response.value)) {
    const selectedRisks = question.options
      .filter((opt: any) => response.value.includes(opt.value))
      .map((opt: any) => opt.risk);
    
    if (selectedRisks.length === 0) return 0;
    
    // Average risk for multiple selections
    return selectedRisks.reduce((sum: number, risk: number) => sum + risk, 0) / selectedRisks.length;
  }

  return 0;
}

/**
 * Calculate category-level risk scores
 */
function calculateCategoryScores(
  categoryQuestions: any[],
  responses: AuditResponse[]
): CategoryScore[] {
  const categories = [
    { key: 'socialMedia', name: 'Social Media', weight: 1.3 },
    { key: 'personalInfo', name: 'Personal Information', weight: 1.5 },
    { key: 'security', name: 'Security Practices', weight: 1.8 },
    { key: 'dataSharing', name: 'Data Sharing', weight: 1.2 },
    { key: 'professional', name: 'Professional Footprint', weight: 1.0 }
  ];

  return categories.map(cat => {
    const catQuestions = categoryQuestions.filter(q => q.id.startsWith(cat.key.slice(0, 3)));
    const catResponses = responses.filter(r => r.id.startsWith(cat.key.slice(0, 3)));

    if (catQuestions.length === 0) {
      return { category: cat.name, score: 0, weight: cat.weight };
    }

    const totalRisk = catQuestions.reduce((sum, question) => {
      const response = catResponses.find(r => r.id === question.id);
      if (!response) return sum;
      
      const questionRisk = calculateQuestionRisk(question, response);
      return sum + (questionRisk * (question.weight || 1));
    }, 0);

    const totalWeight = catQuestions.reduce((sum, q) => sum + (q.weight || 1), 0);
    const categoryScore = totalWeight > 0 ? (totalRisk / totalWeight) : 0;

    return {
      category: cat.name,
      score: Math.min(100, Math.round(categoryScore)),
      weight: cat.weight
    };
  });
}

/**
 * Identify specific vulnerabilities based on responses
 */
function identifyVulnerabilities(responses: AuditResponse[], questions: any[]): string[] {
  const vulnerabilities: string[] = [];

  responses.forEach(response => {
    const question = questions.find(q => q.id === response.id);
    if (!question) return;

    const risk = calculateQuestionRisk(question, response);

    if (risk >= 70) {
      // High-risk behaviors
      if (response.id === 'sec1') vulnerabilities.push('Weak password management');
      if (response.id === 'sec2') vulnerabilities.push('Insufficient two-factor authentication');
      if (response.id === 'sm2') vulnerabilities.push('Overly public social media profiles');
      if (response.id === 'sec4') vulnerabilities.push('Unsafe public Wi-Fi usage');
      if (response.id === 'pi2') vulnerabilities.push('Sharing sensitive documents online');
      if (response.id === 'ds4') vulnerabilities.push('Excessive location tracking');
    }
  });

  return [...new Set(vulnerabilities)]; // Remove duplicates
}

/**
 * Identify privacy strengths
 */
function identifyStrengths(responses: AuditResponse[], questions: any[]): string[] {
  const strengths: string[] = [];

  responses.forEach(response => {
    const question = questions.find(q => q.id === response.id);
    if (!question) return;

    const risk = calculateQuestionRisk(question, response);

    if (risk <= 20) {
      if (response.id === 'sec1') strengths.push('Strong password management');
      if (response.id === 'sec2') strengths.push('Two-factor authentication enabled');
      if (response.id === 'sm2') strengths.push('Private social media settings');
      if (response.id === 'sec3') strengths.push('Regular software updates');
      if (response.id === 'ds5') strengths.push('Using ad blockers/tracking protection');
    }
  });

  return [...new Set(strengths)];
}

/**
 * Main risk calculation function
 */
export function calculateRiskScore(
  responses: AuditResponse[],
  allQuestions: any[]
): RiskCalculationResult {
  // Flatten all questions from all categories
  const flatQuestions = Object.values(allQuestions).flat();

  // Calculate category scores
  const categoryBreakdown = calculateCategoryScores(flatQuestions, responses);

  // Calculate weighted overall risk
  const totalWeightedRisk = categoryBreakdown.reduce(
    (sum, cat) => sum + (cat.score * cat.weight),
    0
  );
  const totalWeight = categoryBreakdown.reduce((sum, cat) => sum + cat.weight, 0);
  const overallRisk = totalWeight > 0 ? Math.round(totalWeightedRisk / totalWeight) : 0;

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high';
  if (overallRisk <= 33) riskLevel = 'low';
  else if (overallRisk <= 66) riskLevel = 'medium';
  else riskLevel = 'high';

  // Identify vulnerabilities and strengths
  const vulnerabilities = identifyVulnerabilities(responses, flatQuestions);
  const strengths = identifyStrengths(responses, flatQuestions);

  return {
    overallRisk,
    riskLevel,
    categoryBreakdown,
    vulnerabilities,
    strengths
  };
}

/**
 * Calculate historical risk trend
 */
export function calculateRiskTrend(historicalScores: number[]): {
  trend: 'improving' | 'stable' | 'worsening';
  change: number;
} {
  if (historicalScores.length < 2) {
    return { trend: 'stable', change: 0 };
  }

  const latest = historicalScores[historicalScores.length - 1];
  const previous = historicalScores[historicalScores.length - 2];
  const change = previous - latest; // Positive means improvement (risk decreased)

  let trend: 'improving' | 'stable' | 'worsening';
  if (change > 5) trend = 'improving';
  else if (change < -5) trend = 'worsening';
  else trend = 'stable';

  return { trend, change: Math.abs(change) };
}
