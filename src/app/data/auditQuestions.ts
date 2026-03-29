// Audit questions for the self-assessment
export const auditQuestions = {
  socialMedia: [
    {
      id: 'sm1',
      question: 'How many social media platforms do you actively use?',
      type: 'radio',
      options: [
        { value: 0, label: 'None', risk: 0 },
        { value: 1, label: '1-2 platforms', risk: 15 },
        { value: 2, label: '3-4 platforms', risk: 35 },
        { value: 3, label: '5+ platforms', risk: 60 }
      ],
      weight: 1.2
    },
    {
      id: 'sm2',
      question: 'What is the privacy setting on your primary social media account?',
      type: 'radio',
      options: [
        { value: 0, label: 'Private (only approved followers/friends)', risk: 10 },
        { value: 1, label: 'Friends of friends can see some content', risk: 40 },
        { value: 2, label: 'Public (anyone can see)', risk: 80 },
        { value: 3, label: 'I have never checked my privacy settings', risk: 100 }
      ],
      weight: 1.5
    },
    {
      id: 'sm3',
      question: 'How often do you share your real-time location on social media?',
      type: 'radio',
      options: [
        { value: 0, label: 'Never', risk: 0 },
        { value: 1, label: 'Rarely (special occasions only)', risk: 25 },
        { value: 2, label: 'Often (weekly)', risk: 60 },
        { value: 3, label: 'Very frequently (daily check-ins)', risk: 90 }
      ],
      weight: 1.3
    },
    {
      id: 'sm4',
      question: 'Do you accept friend/follow requests from people you don\'t know personally?',
      type: 'radio',
      options: [
        { value: 0, label: 'Never', risk: 0 },
        { value: 1, label: 'Only if we have mutual connections', risk: 30 },
        { value: 2, label: 'Sometimes, if their profile looks genuine', risk: 60 },
        { value: 3, label: 'Yes, I accept most requests', risk: 85 }
      ],
      weight: 1.1
    },
    {
      id: 'sm5',
      question: 'Have you reviewed third-party apps connected to your social media accounts in the past 6 months?',
      type: 'radio',
      options: [
        { value: 0, label: 'Yes, and removed unused apps', risk: 5 },
        { value: 1, label: 'Yes, but didn\'t make changes', risk: 40 },
        { value: 2, label: 'No', risk: 75 },
        { value: 3, label: 'I didn\'t know this was possible', risk: 95 }
      ],
      weight: 1.4
    }
  ],
  personalInfo: [
    {
      id: 'pi1',
      question: 'How much personal information is visible on your main social media profile?',
      type: 'checkbox',
      options: [
        { value: 'fullName', label: 'Full name', risk: 10 },
        { value: 'birthdate', label: 'Full birthdate (day/month/year)', risk: 20 },
        { value: 'phone', label: 'Phone number', risk: 25 },
        { value: 'email', label: 'Email address', risk: 15 },
        { value: 'address', label: 'Home address or city', risk: 30 },
        { value: 'employer', label: 'Current employer', risk: 15 },
        { value: 'education', label: 'Education history', risk: 10 },
        { value: 'relationship', label: 'Relationship status', risk: 5 }
      ],
      weight: 1.5
    },
    {
      id: 'pi2',
      question: 'Have you ever shared any of the following online (posts, comments, or profiles)?',
      type: 'checkbox',
      options: [
        { value: 'passport', label: 'Passport or ID documents', risk: 35 },
        { value: 'boarding', label: 'Boarding passes', risk: 25 },
        { value: 'payment', label: 'Payment card images', risk: 40 },
        { value: 'kids', label: 'Photos of children with full names/schools', risk: 30 },
        { value: 'vacation', label: 'Vacation plans before leaving', risk: 20 },
        { value: 'financial', label: 'Financial information', risk: 35 }
      ],
      weight: 1.8
    },
    {
      id: 'pi3',
      question: 'How do you typically respond when websites request personal information?',
      type: 'radio',
      options: [
        { value: 0, label: 'I only provide the minimum required information', risk: 10 },
        { value: 1, label: 'I provide accurate information if the site seems trustworthy', risk: 40 },
        { value: 2, label: 'I usually provide what\'s requested without much thought', risk: 70 },
        { value: 3, label: 'I provide comprehensive information for convenience', risk: 90 }
      ],
      weight: 1.2
    },
    {
      id: 'pi4',
      question: 'Do you use your real name for online shopping and non-essential services?',
      type: 'radio',
      options: [
        { value: 0, label: 'No, I use pseudonyms where possible', risk: 5 },
        { value: 1, label: 'Only for legitimate purchases requiring delivery', risk: 25 },
        { value: 2, label: 'Yes, I use my real name for most services', risk: 55 },
        { value: 3, label: 'Always use real name and full details', risk: 80 }
      ],
      weight: 1.0
    }
  ],
  security: [
    {
      id: 'sec1',
      question: 'How do you manage your passwords?',
      type: 'radio',
      options: [
        { value: 0, label: 'Unique, complex passwords for each account using a password manager', risk: 5 },
        { value: 1, label: 'Different passwords but some patterns/reuse', risk: 35 },
        { value: 2, label: 'Same password for multiple accounts with variations', risk: 70 },
        { value: 3, label: 'Same simple password across most/all accounts', risk: 95 }
      ],
      weight: 1.8
    },
    {
      id: 'sec2',
      question: 'Do you use two-factor authentication (2FA)?',
      type: 'radio',
      options: [
        { value: 0, label: 'Yes, on all important accounts (email, banking, social media)', risk: 5 },
        { value: 1, label: 'On some accounts (banking only)', risk: 35 },
        { value: 2, label: 'On very few accounts', risk: 65 },
        { value: 3, label: 'No, I find it inconvenient', risk: 90 }
      ],
      weight: 1.7
    },
    {
      id: 'sec3',
      question: 'How often do you update your devices and apps?',
      type: 'radio',
      options: [
        { value: 0, label: 'Automatically as soon as updates are available', risk: 5 },
        { value: 1, label: 'Manually within a few days of notification', risk: 25 },
        { value: 2, label: 'When I remember or when forced', risk: 60 },
        { value: 3, label: 'Rarely or never', risk: 95 }
      ],
      weight: 1.4
    },
    {
      id: 'sec4',
      question: 'Do you use public Wi-Fi networks?',
      type: 'radio',
      options: [
        { value: 0, label: 'Never, or only with VPN', risk: 5 },
        { value: 1, label: 'Occasionally, but avoid sensitive activities', risk: 30 },
        { value: 2, label: 'Regularly for general browsing', risk: 60 },
        { value: 3, label: 'Yes, including for banking and sensitive logins', risk: 95 }
      ],
      weight: 1.5
    },
    {
      id: 'sec5',
      question: 'Is full-disk encryption enabled on your primary devices?',
      type: 'radio',
      options: [
        { value: 0, label: 'Yes, on all devices (BitLocker/FileVault/device encryption)', risk: 5 },
        { value: 1, label: 'On my phone but not computer', risk: 40 },
        { value: 2, label: 'Not sure', risk: 70 },
        { value: 3, label: 'No', risk: 85 }
      ],
      weight: 1.3
    }
  ],
  dataSharing: [
    {
      id: 'ds1',
      question: 'How do you handle cookie consent banners?',
      type: 'radio',
      options: [
        { value: 0, label: 'I reject all or accept only essential cookies', risk: 5 },
        { value: 1, label: 'I customize settings to limit tracking', risk: 25 },
        { value: 2, label: 'I usually click "Accept All" to proceed quickly', risk: 70 },
        { value: 3, label: 'I don\'t understand what cookies do', risk: 90 }
      ],
      weight: 1.3
    },
    {
      id: 'ds2',
      question: 'Have you ever submitted a Subject Access Request (SAR) to see what data a company holds about you?',
      type: 'radio',
      options: [
        { value: 0, label: 'Yes, multiple times', risk: 5 },
        { value: 1, label: 'Once or twice', risk: 25 },
        { value: 2, label: 'No, but I know how', risk: 50 },
        { value: 3, label: 'No, I don\'t know what that is', risk: 85 }
      ],
      weight: 1.1
    },
    {
      id: 'ds3',
      question: 'Do you read privacy policies before accepting terms and conditions?',
      type: 'radio',
      options: [
        { value: 0, label: 'Yes, I always review key sections', risk: 10 },
        { value: 1, label: 'Sometimes, for important services', risk: 40 },
        { value: 2, label: 'Rarely', risk: 70 },
        { value: 3, label: 'Never, I just click agree', risk: 90 }
      ],
      weight: 1.0
    },
    {
      id: 'ds4',
      question: 'How many apps on your phone have access to your location?',
      type: 'radio',
      options: [
        { value: 0, label: 'Only essential apps (maps) and only when in use', risk: 10 },
        { value: 1, label: 'A few apps, limited to "while using"', risk: 30 },
        { value: 2, label: 'Many apps, some with "always" access', risk: 65 },
        { value: 3, label: 'I\'ve never checked app permissions', risk: 90 }
      ],
      weight: 1.4
    },
    {
      id: 'ds5',
      question: 'Do you use ad blockers or tracking protection in your browser?',
      type: 'radio',
      options: [
        { value: 0, label: 'Yes, ad blocker + privacy-focused browser/extensions', risk: 5 },
        { value: 1, label: 'Basic ad blocker only', risk: 30 },
        { value: 2, label: 'No, but I\'ve considered it', risk: 60 },
        { value: 3, label: 'No, I didn\'t know this was important', risk: 85 }
      ],
      weight: 1.2
    }
  ],
  professional: [
    {
      id: 'prof1',
      question: 'What information is publicly visible on your professional networking profiles (LinkedIn, etc.)?',
      type: 'checkbox',
      options: [
        { value: 'current', label: 'Current employer and role', risk: 10 },
        { value: 'history', label: 'Full employment history', risk: 5 },
        { value: 'education', label: 'Education details', risk: 5 },
        { value: 'contact', label: 'Personal email or phone', risk: 25 },
        { value: 'address', label: 'Home address', risk: 35 },
        { value: 'projects', label: 'Detailed project information', risk: 10 }
      ],
      weight: 1.0
    },
    {
      id: 'prof2',
      question: 'Do you Google yourself to check your online professional reputation?',
      type: 'radio',
      options: [
        { value: 0, label: 'Yes, quarterly and take action to remove unwanted content', risk: 5 },
        { value: 1, label: 'Yes, occasionally', risk: 30 },
        { value: 2, label: 'Once or twice ever', risk: 60 },
        { value: 3, label: 'Never', risk: 80 }
      ],
      weight: 1.1
    },
    {
      id: 'prof3',
      question: 'How do you handle personal and professional boundaries on social media?',
      type: 'radio',
      options: [
        { value: 0, label: 'Separate accounts/strict boundaries', risk: 5 },
        { value: 1, label: 'Same account but curated audience lists', risk: 25 },
        { value: 2, label: 'Mix personal and professional content', risk: 55 },
        { value: 3, label: 'No distinction, post everything publicly', risk: 85 }
      ],
      weight: 1.2
    },
    {
      id: 'prof4',
      question: 'Have you ever experienced or been concerned about online harassment or doxxing?',
      type: 'radio',
      options: [
        { value: 0, label: 'I\'ve taken proactive steps to minimize risk (privacy settings, limited info)', risk: 5 },
        { value: 1, label: 'I\'m somewhat concerned but haven\'t taken specific action', risk: 50 },
        { value: 2, label: 'Never thought about it', risk: 75 },
        { value: 3, label: 'I\'ve experienced issues but didn\'t know how to respond', risk: 60 }
      ],
      weight: 1.3
    }
  ]
};

// Privacy literacy questions for assessment
export const literacyQuestions = [
  {
    id: 'lit1',
    dimension: 'factual',
    question: 'I understand what cookies are and how they track my online behavior.',
    type: 'likert',
    weight: 1.0
  },
  {
    id: 'lit2',
    dimension: 'factual',
    question: 'I know what UK GDPR is and what rights it grants me.',
    type: 'likert',
    weight: 1.2
  },
  {
    id: 'lit3',
    dimension: 'factual',
    question: 'I understand the difference between HTTP and HTTPS websites.',
    type: 'likert',
    weight: 1.0
  },
  {
    id: 'lit4',
    dimension: 'reflection',
    question: 'I regularly think about what information I share online and who can see it.',
    type: 'likert',
    weight: 1.3
  },
  {
    id: 'lit5',
    dimension: 'reflection',
    question: 'Before using a new app or service, I consider the privacy implications.',
    type: 'likert',
    weight: 1.4
  },
  {
    id: 'lit6',
    dimension: 'reflection',
    question: 'I understand how "free" services make money from my data.',
    type: 'likert',
    weight: 1.2
  },
  {
    id: 'lit7',
    dimension: 'skills',
    question: 'I know how to adjust privacy settings on social media platforms.',
    type: 'likert',
    weight: 1.3
  },
  {
    id: 'lit8',
    dimension: 'skills',
    question: 'I can identify phishing emails and suspicious links.',
    type: 'likert',
    weight: 1.5
  },
  {
    id: 'lit9',
    dimension: 'skills',
    question: 'I use privacy-enhancing tools (VPN, ad blockers, password managers).',
    type: 'likert',
    weight: 1.4
  },
  {
    id: 'lit10',
    dimension: 'critical',
    question: 'I understand how companies use algorithms to profile and target me.',
    type: 'likert',
    weight: 1.3
  },
  {
    id: 'lit11',
    dimension: 'critical',
    question: 'I am aware of how data brokers collect and sell personal information.',
    type: 'likert',
    weight: 1.2
  },
  {
    id: 'lit12',
    dimension: 'critical',
    question: 'I recognize that online privacy is about power and control, not just individual choice.',
    type: 'likert',
    weight: 1.1
  }
];
