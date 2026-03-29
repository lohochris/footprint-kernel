/**
 * Privacy Literacy Scorer - Calculates literacy scores across four dimensions
 * Based on Masur (2020) Privacy Literacy Framework
 */

interface LiteracyResponse {
  id: string;
  value: number; // Likert scale 1-5
}

interface DimensionScore {
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

    if (dimQuestions.length === 0) {
      return {
        dimension: DIMENSIONS[dim as keyof typeof DIMENSIONS].name,
        score: 0,
        description: DIMENSIONS[dim as keyof typeof DIMENSIONS].description
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

    const totalWeight = dimQuestions.reduce((sum, q) => sum + (q.weight || 1), 0);
    const dimensionScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    return {
      dimension: DIMENSIONS[dim as keyof typeof DIMENSIONS].name,
      score: Math.round(dimensionScore),
      description: DIMENSIONS[dim as keyof typeof DIMENSIONS].description
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

  // Add general recommendations if overall literacy is low
  const avgScore = dimensionScores.reduce((sum, dim) => sum + dim.score, 0) / dimensionScores.length;
  
  if (avgScore < 50) {
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
  // Calculate dimension scores
  const dimensionScores = calculateDimensionScores(responses, questions);

  // Calculate overall literacy score (weighted average)
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

  // Determine literacy level
  let level: 'low' | 'medium' | 'high';
  if (overallScore <= 40) level = 'low';
  else if (overallScore <= 70) level = 'medium';
  else level = 'high';

  // Identify gaps and generate recommendations
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
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  let grade: string;
  let feedback: string;

  if (percentage >= 90) {
    grade = 'A';
    feedback = 'Excellent! You have advanced privacy literacy. You\'re in the top 15% of UK citizens.';
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
