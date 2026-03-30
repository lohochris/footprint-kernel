// FIX: Change this from 'react-router' to 'react-router-dom'
import { createBrowserRouter } from 'react-router-dom';

import { MainLayout } from './components/MainLayout';
import { Dashboard } from './components/Dashboard';
import { SelfAudit } from './components/SelfAudit';
import { RiskScore } from './components/RiskScore';
import { PrivacyEducation } from './components/PrivacyEducation';
import { FootprintQuiz } from './components/FootprintQuiz';
import { Recommendations } from './components/Recommendations';
import { PrivacySettings } from './components/PrivacySettings';
import { NotFound } from './components/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: MainLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'audit', Component: SelfAudit },
      { path: 'risk-score', Component: RiskScore },
      { path: 'education', Component: PrivacyEducation },
      { path: 'quiz', Component: FootprintQuiz },
      { path: 'recommendations', Component: Recommendations },
      { path: 'settings', Component: PrivacySettings },
      { path: '*', Component: NotFound }
    ]
  }
]);