/**
 * Typology Classifier - Classifies users into privacy typologies
 * Based on Muhammad et al. (2024) validated multi-stage framework
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
    description: 'High Literacy + Low Risk: You demonstrate exemplary privacy intelligence, combining deep technical knowledge with consistent protective behaviors.',
    characteristics: [
      'Comprehensive understanding of UK GDPR and tracking vectors',
      'Consistent use of privacy-enhancing technologies (VPN, MFA, Hardened Browsers)',
      'Minimal digital footprint via proactive information control',
      'Critical evaluation of third-party data requests'
    ],
    actionPlan: [
      'Maintain current baseline via quarterly privacy audits',
      'Explore advanced anonymity tools (e.g., decentralized identity)',
      'Advocate for privacy-by-design in your professional circles',
      'Stay updated on emerging AI-driven de-anonymization threats'
    ],
    populationPercentage: 15
  },
  conscious: {
    description: 'High Literacy + Medium/High Risk: The "Privacy Paradox" profile. You understand the risks perfectly but often trade privacy for digital convenience.',
    characteristics: [
      'Strong theoretical privacy awareness',
      'Inconsistent application of security controls',
      'Awareness of risks but high "convenience-friction" sensitivity',
      'Selective protection (only securing high-stakes financial accounts)'
    ],
    actionPlan: [
      'Identify specific friction points preventing tool adoption',
      'Deploy automation tools to bridge the intention-behavior gap',
      'Prioritize high-impact technical wins: Password Managers & 2FA',
      'Set automated reminders for account footprint "housecleaning"'
    ],
    populationPercentage: 28
  },
  carefree: {
    description: 'Low Literacy + Medium Risk: You prioritize convenience and trust platforms by default, often unaware of the depth of passive data collection.',
    characteristics: [
      'Limited understanding of technical privacy risks',
      'Default-heavy configuration (accepting all cookies/permissions)',
      'Convenience-first digital decision making',
      'Reactive approach to security (only acting after a breach notification)'
    ],
    actionPlan: [
      'Complete the "Privacy 101" modules in the Education Centre',
      'Use the Privacy Action Center to harden social media defaults',
      'Implement 3 key "Quick Wins" to reduce immediate exposure',
      'Transition to privacy-respecting alternative services'
    ],
    populationPercentage: 35
  },
  careless: {
    description: 'Low Literacy + High Risk: High vulnerability profile. Limited privacy knowledge combined with high-exposure behaviors creates significant risk.',
    characteristics: [
      'Minimal awareness of tracking and data brokerage',
      'High-risk behaviors: Password reuse and public profile defaults',
      'No active use of privacy-enhancing tools',
      'Highly vulnerable to social engineering and credential stuffing'
    ],
    actionPlan: [
      'URGENT: Enable Multi-Factor Authentication (MFA) on all primary accounts',
      'URGENT: Cease password reuse immediately via a secure manager',
      'Systematically restrict social media visibility settings',
      'Complete the foundational research modules to build risk awareness'
    ],
    populationPercentage: 22
  }
};

/**
 * Classifies the user based on the intersection of their 
 * behavioral risk and cognitive literacy scores.
 */
export function classifyUserTypology(
  riskScore: number,
  literacyScore: number
): TypologyResult {
  const riskHigh = 66;
  const riskLow = 33;
  const literacyHigh = 70;

  let typology: UserTypology;

  if (literacyScore >= literacyHigh) {
    typology = riskScore <= riskLow ? 'cautious' : 'conscious';
  } else {
    typology = riskScore > riskHigh ? 'careless' : 'carefree';
  }

  return {
    typology,
    ...TYPOLOGIES[typology]
  };
}

/**
 * ADDED: Missing export for Recommendations.tsx
 * Get typology-specific recommendations categorized by timeline
 */
export function getTypologyRecommendations(typology: UserTypology) {
  const recommendations = {
    cautious: {
      priority: ['Conduct deep-dive audit of IoT device permissions', 'Review financial data sharing via Open Banking'],
      shortTerm: ['Switch to a privacy-first DNS provider', 'Test decentralized social media alternatives'],
      longTerm: ['Transition to hardware-based security keys (e.g., Yubikey)', 'Audit legacy digital accounts for deletion']
    },
    conscious: {
      priority: ['Install a cross-platform password manager', 'Enable 2FA on email and primary social accounts'],
      shortTerm: ['Replace browser with a privacy-hardened alternative', 'Audit "Sign-in with Google/Facebook" permissions'],
      longTerm: ['Establish a monthly "Privacy Clean-up" routine', 'Reduce reliance on high-tracking ecosystem apps']
    },
    carefree: {
      priority: ['Disable "Precise Location" permissions on non-map apps', 'Enable basic 2FA (SMS or Authenticator)'],
      shortTerm: ['Read the "Privacy 101" guide in the Education Centre', 'Switch to a privacy-focused search engine'],
      longTerm: ['Systematically review and delete unused social accounts', 'Implement an ad-blocker on all primary devices']
    },
    careless: {
      priority: ['URGENT: Enable 2FA on every account that supports it', 'URGENT: Create unique passwords for all bank/email accounts'],
      shortTerm: ['Set all social media profiles to "Private"', 'Review and revoke intrusive app permissions'],
      longTerm: ['Complete the full Literacy Curriculum', 'Rebuild digital presence using privacy-by-design principles']
    }
  };

  return recommendations[typology] || recommendations.carefree;
}

/**
 * Generates a roadmap for "Ascending" the typology ladder
 */
export function getTypologyImprovementPath(
  currentTypology: UserTypology,
  currentRisk: number,
  currentLiteracy: number
) {
  const paths: Record<UserTypology, any> = {
    careless: {
      targetTypology: 'carefree',
      requiredRiskReduction: Math.max(0, currentRisk - 65),
      requiredLiteracyIncrease: Math.max(0, 45 - currentLiteracy),
      estimatedEffort: 'high'
    },
    carefree: {
      targetTypology: 'conscious',
      requiredRiskReduction: Math.max(0, currentRisk - 50),
      requiredLiteracyIncrease: Math.max(0, 71 - currentLiteracy),
      estimatedEffort: 'medium'
    },
    conscious: {
      targetTypology: 'cautious',
      requiredRiskReduction: Math.max(0, currentRisk - 30),
      requiredLiteracyIncrease: Math.max(0, 75 - currentLiteracy),
      estimatedEffort: 'medium'
    },
    cautious: {
      targetTypology: 'cautious',
      requiredRiskReduction: 0,
      requiredLiteracyIncrease: 0,
      estimatedEffort: 'low'
    }
  };

  return paths[currentTypology];
}