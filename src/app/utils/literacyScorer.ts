/**
 * Privacy Literacy Scorer - Calculates literacy scores across four dimensions
 * Based on Masur (2020) Privacy Literacy Framework
 */

// Added EXPORT here so Recommendations.tsx can see this type
export interface LiteracyResponse {
  id: string;
  value: number; // Likert scale 1-5
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
    description: 'Understanding of technical privacy concepts and legal frameworks'
  },
  reflection: {
    name: 'Reflection Abilities',
    description: 'Critical evaluation of privacy situations and personal practices'
  },
  skills: {
    name: 'Data Protection Skills',
    description: 'Practical ability to use privacy-enhancing tools and settings'
  },
  critical: {
    name: 'Critical Literacy',
    description: 'Understanding of data economy and power structures'
  }
};

/**
 * Calculate score for each literacy dimension
 */
function calculateDimensionScores(
  responses: LiteracyResponse[],
  questions: any[]
): DimensionScore[] {
  const dimensions = Object.keys(DIMENSIONS);

  return dimensions.map(dim => {
    const dimQuestions = questions.filter(q => q.dimension === dim);
    const dimResponses = responses.filter(r => {
      const question = questions.find(q => q.id === r.id);
      return question?.dimension === dim;
    });

    const dimData = DIMENSIONS[dim as keyof typeof DIMENSIONS];

    if (dimQuestions.length === 0 || dimResponses.length === 0) {
      return {
        dimension: dimData.name,
        score: 0,
        description: dimData.description
      };
    }

    // Calculate weighted average
    const totalWeightedScore = dimResponses.reduce((sum, response) => {
      const question = dimQuestions.find(q => q.id === response.id);
      const weight = question?.weight || 1;
      // Likert scale 1-5 converted to 0-100
      const normalizedScore = ((response.value - 1) / 4) * 100;
      return sum + (normalizedScore * weight);
    }, 0);

    const totalWeight = dimResponses.reduce((sum, r) => {
      const q = dimQuestions.find(quest => quest.id === r.id);
      return sum + (q?.weight || 1);
    }, 0);

    const dimensionScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    return {
      dimension: dimData.name,
      score: Math.round(dimensionScore),
      description: dimData.description
    };
  });
}

/**
 * Identify literacy gaps
 */
function identifyLiteracyGaps(dimensionScores: DimensionScore[]): string[] {
  const gaps: string[] = [];

  dimensionScores.forEach(dim => {
    if (dim.score < 40) {
      gaps.push(`Critical gap in ${dim.dimension}`);
    } else if (dim.score < 60) {
      gaps.push(`Room for improvement in ${dim.dimension}`);
    }
  });

  return gaps;
}

/**
 * Generate personalized literacy recommendations
 */
function generateLiteracyRecommendations(dimensionScores: DimensionScore[]): string[] {
  const recommendations: string[] = [];

  dimensionScores.forEach(dim => {
    if (dim.dimension === 'Factual Knowledge' && dim.score < 70) {
      recommendations.push('Study UK GDPR rights and technical privacy concepts in our Education Centre');
    }
    if (dim.dimension === 'Reflection Abilities' && dim.score < 70) {
      recommendations.push('Practice the "Privacy Impact Assessment" mindset before sharing information online');
    }
    if (dim.dimension === 'Data Protection Skills' && dim.score < 70) {
      recommendations.push('Complete hands-on tutorials for password managers, VPNs, and privacy settings');
    }
    if (dim.dimension === 'Critical Literacy' && dim.score < 70) {
      recommendations.push('Read about surveillance capitalism and data economy power dynamics');
    }
  });

  const validScores = dimensionScores.filter(d => d.score > 0);
  const avgScore = validScores.length > 0 
    ? validScores.reduce((sum, dim) => sum + dim.score, 0) / validScores.length 
    : 0;
  
  if (avgScore > 0 && avgScore < 50) {
    recommendations.push('Take our interactive Privacy Quiz to build foundational knowledge');
    recommendations.push('Subscribe to privacy news sources (Privacy International, EFF, ICO updates)');
  }

  return recommendations;
}

/**
 * Main literacy scoring function
 */
export function calculateLiteracyScore(
  responses: LiteracyResponse[],
  questions: any[]
): LiteracyResult {
  const dimensionScores = calculateDimensionScores(responses, questions);

  const weights = {
    'Factual Knowledge': 1.2,
    'Reflection Abilities': 1.3,
    'Data Protection Skills': 1.5,
    'Critical Literacy': 1.0
  };

  const totalWeightedScore = dimensionScores.reduce((sum, dim) => {
    const weight = weights[dim.dimension as keyof typeof weights] || 1;
    return sum + (dim.score * weight);
  }, 0);

  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  const overallScore = Math.round(totalWeightedScore / totalWeight);

  let level: 'low' | 'medium' | 'high';
  if (overallScore <= 40) level = 'low';
  else if (overallScore <= 70) level = 'medium';
  else level = 'high';

  const gaps = identifyLiteracyGaps(dimensionScores);
  const recommendations = generateLiteracyRecommendations(dimensionScores);

  return {
    overallScore,
    level,
    dimensionScores,
    gaps,
    recommendations
  };
}

/**
 * Calculate quiz performance score
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

  let grade: string;
  let feedback: string;

  if (percentage >= 90) {
    grade = 'A';
    feedback = "Excellent! You have advanced privacy literacy. You're in the top 15% of UK citizens.";
  } else if (percentage >= 75) {
    grade = 'B';
    feedback = 'Good work! You have solid privacy knowledge with room to become an expert.';
  } else if (percentage >= 60) {
    grade = 'C';
    feedback = 'Decent foundation. Focus on areas where you missed questions to improve.';
  } else if (percentage >= 50) {
    grade = 'D';
    feedback = 'Some knowledge but significant gaps. Review the Education Centre materials.';
  } else {
    grade = 'F';
    feedback = 'Critical literacy gaps. Start with our foundational privacy modules.';
  }

  return { percentage, grade, feedback };
}