/**
 * Typology Classifier - Classifies users into privacy typologies
 * Based on Muhammad et al. (2024) validated model
 */

export type UserTypology = 'cautious' | 'conscious' | 'carefree' | 'careless';

export interface TypologyResult {
  typology: UserTypology;
  description: string;
  characteristics: string[];
  actionPlan: string[];
  populationPercentage: number;
}

const TYPOLOGIES: Record<UserTypology, Omit<TypologyResult, 'typology'>> = {
  cautious: {
    description: 'Low Risk + High Literacy: You demonstrate exemplary privacy practices with strong knowledge and consistent protective behaviors.',
    characteristics: [
      'Comprehensive understanding of privacy risks',
      'Consistent use of privacy-enhancing technologies',
      'Proactive information control',
      'Regular privacy audits and adjustments',
      'Critical evaluation of data requests'
    ],
    actionPlan: [
      'Maintain current excellent practices',
      'Stay updated on emerging privacy threats',
      'Help educate friends and family about privacy',
      'Advocate for stronger privacy protections',
      'Consider privacy-focused career opportunities or volunteering'
    ],
    populationPercentage: 15
  },
  conscious: {
    description: 'Medium Risk + High Literacy: You understand privacy issues but don\'t always follow through with protective actions. This is often due to convenience trade-offs.',
    characteristics: [
      'Strong privacy awareness and knowledge',
      'Inconsistent application of protective behaviors',
      'Awareness of risks but accept some for convenience',
      'Selective privacy protection (high-stakes scenarios only)',
      'Intention-behavior gap (Privacy Paradox manifestation)'
    ],
    actionPlan: [
      'Identify specific barriers preventing protective actions',
      'Use automation tools (password managers, browser extensions)',
      'Create privacy routines to make protection habitual',
      'Prioritize high-impact changes (2FA, password manager)',
      'Address cognitive biases (optimism bias, present bias)'
    ],
    populationPercentage: 28
  },
  carefree: {
    description: 'Medium Risk + Low Literacy: You prioritize convenience over privacy, often unaware of the extent of data collection and potential consequences.',
    characteristics: [
      'Limited understanding of privacy risks',
      'Convenience-first decision making',
      'Trust in platforms and default settings',
      'Minimal use of privacy tools',
      'Reactive rather than proactive approach'
    ],
    actionPlan: [
      'Complete the Privacy Education modules to build awareness',
      'Take the Privacy Quiz to identify knowledge gaps',
      'Implement 3-5 high-impact quick wins from recommendations',
      'Set quarterly reminders to review privacy settings',
      'Start with easiest protective measures (2FA, ad blocker)'
    ],
    populationPercentage: 35
  },
  careless: {
    description: 'High Risk + Low Literacy: You are highly vulnerable due to limited privacy knowledge and risky behaviors. Urgent action is needed.',
    characteristics: [
      'Minimal privacy awareness',
      'High-risk behaviors (password reuse, public profiles)',
      'No use of privacy-enhancing tools',
      'Extensive personal information sharing',
      'Vulnerable to phishing and social engineering'
    ],
    actionPlan: [
      'URGENT: Enable two-factor authentication on all major accounts immediately',
      'URGENT: Change reused passwords using a password manager',
      'Review and restrict social media privacy settings today',
      'Study the Education Centre fundamentals',
      'Schedule monthly privacy check-ins',
      'Consider professional help if you\'ve experienced data breaches'
    ],
    populationPercentage: 22
  }
};

/**
 * Classify user into typology based on risk and literacy scores
 */
export function classifyUserTypology(
  riskScore: number,
  literacyScore: number
): TypologyResult {
  // Define thresholds
  const riskThresholds = { low: 33, medium: 66 };
  const literacyThresholds = { low: 40, medium: 70 };

  let typology: UserTypology;

  // Classification logic based on Muhammad et al. (2024)
  if (riskScore <= riskThresholds.low && literacyScore > literacyThresholds.medium) {
    typology = 'cautious';
  } else if (riskScore > riskThresholds.low && riskScore <= riskThresholds.medium && literacyScore > literacyThresholds.medium) {
    typology = 'conscious';
  } else if (riskScore > riskThresholds.low && riskScore <= riskThresholds.medium && literacyScore <= literacyThresholds.medium) {
    typology = 'carefree';
  } else if (riskScore > riskThresholds.medium && literacyScore <= literacyThresholds.medium) {
    typology = 'careless';
  } else {
    // Edge cases - default to conscious if high literacy, carefree if low literacy
    typology = literacyScore > literacyThresholds.medium ? 'conscious' : 'carefree';
  }

  return {
    typology,
    ...TYPOLOGIES[typology]
  };
}

/**
 * Get typology-specific recommendations
 */
export function getTypologyRecommendations(typology: UserTypology): {
  priority: string[];
  shortTerm: string[];
  longTerm: string[];
} {
  const recommendations = {
    cautious: {
      priority: [
        'Continue quarterly privacy audits',
        'Stay informed about emerging threats'
      ],
      shortTerm: [
        'Review new platform privacy policies',
        'Test new privacy tools (e.g., privacy-focused browsers)'
      ],
      longTerm: [
        'Become a privacy advocate in your community',
        'Mentor others on privacy best practices'
      ]
    },
    conscious: {
      priority: [
        'Enable 2FA on remaining accounts',
        'Install a password manager and migrate passwords'
      ],
      shortTerm: [
        'Audit social media privacy settings',
        'Install browser privacy extensions'
      ],
      longTerm: [
        'Develop consistent privacy habits',
        'Align actions with privacy values'
      ]
    },
    carefree: {
      priority: [
        'Enable 2FA on email and banking',
        'Set social media to private'
      ],
      shortTerm: [
        'Complete Privacy Education fundamentals',
        'Review app permissions on phone'
      ],
      longTerm: [
        'Build comprehensive privacy literacy',
        'Adopt privacy-by-default mindset'
      ]
    },
    careless: {
      priority: [
        'URGENT: Enable 2FA everywhere possible',
        'URGENT: Stop password reuse (use password manager)'
      ],
      shortTerm: [
        'Lock down social media profiles',
        'Delete unused accounts with personal data'
      ],
      longTerm: [
        'Complete all Privacy Education modules',
        'Rebuild digital footprint with privacy-first approach'
      ]
    }
  };

  return recommendations[typology];
}

/**
 * Calculate typology change probability
 * Helps users understand what it would take to improve their typology
 */
export function getTypologyImprovementPath(
  currentTypology: UserTypology,
  currentRisk: number,
  currentLiteracy: number
): {
  targetTypology: UserTypology;
  requiredRiskReduction: number;
  requiredLiteracyIncrease: number;
  estimatedEffort: 'low' | 'medium' | 'high';
  keyActions: string[];
} {
  const improvementPaths: Record<UserTypology, any> = {
    careless: {
      targetTypology: 'carefree',
      requiredRiskReduction: Math.max(0, currentRisk - 60),
      requiredLiteracyIncrease: Math.max(0, 45 - currentLiteracy),
      estimatedEffort: 'high',
      keyActions: [
        'Enable 2FA (reduces risk ~15 points)',
        'Use password manager (reduces risk ~20 points)',
        'Complete education modules (increases literacy ~20 points)'
      ]
    },
    carefree: {
      targetTypology: 'conscious',
      requiredRiskReduction: Math.max(0, currentRisk - 50),
      requiredLiteracyIncrease: Math.max(0, 71 - currentLiteracy),
      estimatedEffort: 'medium',
      keyActions: [
        'Study UK GDPR rights (increases literacy ~10 points)',
        'Install privacy browser extensions (reduces risk ~10 points)',
        'Audit social media settings (reduces risk ~8 points)'
      ]
    },
    conscious: {
      targetTypology: 'cautious',
      requiredRiskReduction: Math.max(0, currentRisk - 30),
      requiredLiteracyIncrease: Math.max(0, 75 - currentLiteracy),
      estimatedEffort: 'low',
      keyActions: [
        'Align behaviors with knowledge',
        'Automate privacy protections',
        'Eliminate high-risk exceptions'
      ]
    },
    cautious: {
      targetTypology: 'cautious',
      requiredRiskReduction: 0,
      requiredLiteracyIncrease: 0,
      estimatedEffort: 'low',
      keyActions: ['Maintain excellence', 'Stay updated', 'Help others']
    }
  };

  return improvementPaths[currentTypology];
}
