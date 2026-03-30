/**
 * Privacy Literacy Scorer - Calculates literacy scores across four dimensions
 * Based on Masur (2020) Privacy Literacy Framework
 */

export interface LiteracyResponse {
  id: string | number; 
  value: number; // 1 (Correct/Strongly Disagree) to 5 (Strongly Agree)
}

export interface DimensionScore {
  dimension: string;
  score: number;
  description: string;
}

export interface LiteracyResult {
  overallScore: number;
  level: 'low' | 'medium' | 'high';
  dimensionScores: DimensionScore[];
  gaps: string[];
  recommendations: string[];
}

const DIMENSIONS = {
  factual: {
    name: 'Factual Knowledge',
    description: 'Understanding of technical privacy concepts and legal frameworks (UK GDPR).'
  },
  reflection: {
    name: 'Reflection Abilities',
    description: 'Critical evaluation of privacy situations and personal sharing practices.'
  },
  skills: {
    name: 'Data Protection Skills',
    description: 'Practical ability to use privacy-enhancing tools and technical settings.'
  },
  critical: {
    name: 'Critical Literacy',
    description: 'Understanding of the data economy, tracking, and power structures.'
  }
};

/**
 * Calculate score for each literacy dimension with normalization logic
 */
function calculateDimensionScores(
  responses: LiteracyResponse[],
  questions: any[]
): DimensionScore[] {
  const dimensions = Object.keys(DIMENSIONS);

  return dimensions.map(dimKey => {
    const dimData = DIMENSIONS[dimKey as keyof typeof DIMENSIONS];
    
    // Support filtering by both category name and dimension key string
    const dimQuestions = questions.filter(q => 
      q.category === dimData.name || q.dimension === dimKey
    );
    
    const dimQuestionIds = dimQuestions.map(q => q.id.toString());
    const dimResponses = responses.filter(r => dimQuestionIds.includes(r.id.toString()));

    if (dimQuestions.length === 0 || dimResponses.length === 0) {
      return {
        dimension: dimData.name,
        score: 0,
        description: dimData.description
      };
    }

    const totalWeightedScore = dimResponses.reduce((sum, response) => {
      const question = dimQuestions.find(q => q.id.toString() === response.id.toString());
      const weight = question?.weight || 1;
      
      let normalized: number;
      
      /**
       * SCORING LOGIC:
       * 1. If Binary (0 or 1): 1 is 100%, 0 is 0%.
       * 2. If Likert (1-5): Scale 1-5 to 0-100%.
       */
      if (response.value <= 1 && (question?.type === 'radio' || !question?.type)) {
        normalized = response.value * 100;
      } else {
        // Linear normalization: (Value - Min) / (Max - Min) * 100
        normalized = ((response.value - 1) / 4) * 100;
      }
      
      return sum + (normalized * weight);
    }, 0);

    const totalPossibleWeight = dimQuestions.reduce((sum, q) => sum + (q.weight || 1), 0);
    const dimensionScore = Math.min(100, Math.round(totalWeightedScore / totalPossibleWeight));

    return {
      dimension: dimData.name,
      score: dimensionScore,
      description: dimData.description
    };
  });
}

/**
 * Identify specific gaps in the user's privacy knowledge
 */
function identifyLiteracyGaps(dimensionScores: DimensionScore[]): string[] {
  return dimensionScores
    .filter(dim => dim.score < 65)
    .map(dim => dim.score < 40 
      ? `Critical deficiency in ${dim.dimension}` 
      : `Moderate gap in ${dim.dimension}`
    );
}

/**
 * Generate actionable recommendations based on dimension performance
 */
function generateLiteracyRecommendations(dimensionScores: DimensionScore[]): string[] {
  const recommendations: string[] = [];
  
  const recMap: Record<string, string> = {
    'Factual Knowledge': 'Review the UK GDPR rights and technical encryption modules in the Education Centre.',
    'Reflection Abilities': 'Adopt a "Privacy-First" mindset by evaluating data necessity before every digital interaction.',
    'Data Protection Skills': 'Utilize the Privacy Action Center to configure 2FA, VPNs, and advanced browser hardening.',
    'Critical Literacy': 'Explore our modules on the Data Economy to understand how tracking impacts institutional power.'
  };

  dimensionScores.forEach(dim => {
    if (dim.score < 75 && recMap[dim.dimension]) {
      recommendations.push(recMap[dim.dimension]);
    }
  });

  // Global recommendation for lower overall performance
  const avg = dimensionScores.reduce((s, d) => s + d.score, 0) / dimensionScores.length;
  if (avg < 50) {
    recommendations.push('Complete the foundational "Privacy 101" interactive quiz to establish baseline literacy.');
  }

  return recommendations;
}

/**
 * Main Export: Calculates the full literacy profile
 */
export function calculateLiteracyScore(
  responses: LiteracyResponse[],
  questions: any[]
): LiteracyResult {
  const dimensionScores = calculateDimensionScores(responses, questions);

  // Weights reflect the practical impact on digital safety
  const weights: Record<string, number> = {
    'Factual Knowledge': 1.0,
    'Reflection Abilities': 1.2,
    'Data Protection Skills': 1.5, // Skills are weighted highest for practical protection
    'Critical Literacy': 0.8
  };

  let weightedSum = 0;
  let weightTotal = 0;

  dimensionScores.forEach(dim => {
    const w = weights[dim.dimension] || 1.0;
    weightedSum += (dim.score * w);
    weightTotal += w;
  });

  const overallScore = weightTotal > 0 ? Math.round(weightedSum / weightTotal) : 0;

  let level: 'low' | 'medium' | 'high';
  if (overallScore <= 45) level = 'low';
  else if (overallScore <= 75) level = 'medium';
  else level = 'high';

  return {
    overallScore,
    level,
    dimensionScores,
    gaps: identifyLiteracyGaps(dimensionScores),
    recommendations: generateLiteracyRecommendations(dimensionScores)
  };
}

/**
 * Standard Quiz Grading Logic
 */
export function calculateQuizScore(
  correctAnswers: number,
  totalQuestions: number
): {
  percentage: number;
  grade: string;
  feedback: string;
} {
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  const thresholds = [
    { limit: 90, grade: 'A', feedback: "Elite Proficiency. You demonstrate advanced understanding of the UK privacy landscape." },
    { limit: 75, grade: 'B', feedback: 'High Proficiency. Solid knowledge base with minor technical gaps.' },
    { limit: 60, grade: 'C', feedback: 'Standard Proficiency. You have the basics down but should focus on technical skill-building.' },
    { limit: 45, grade: 'D', feedback: 'Basic Literacy. Significant gaps exist in your technical privacy knowledge.' },
    { limit: 0,  grade: 'F', feedback: 'Insufficient Literacy. Foundational education in data protection is highly recommended.' }
  ];

  const result = thresholds.find(t => percentage >= t.limit) || thresholds[4];

  return { 
    percentage, 
    grade: result.grade, 
    feedback: result.feedback 
  };
}