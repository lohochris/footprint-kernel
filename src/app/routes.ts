// FIX: Change this from 'react-router' to 'react-router-dom'
import { createBrowserRouter } from 'react-router-dom';

// Layout & Core Components
import { MainLayout } from './components/MainLayout';
import { Dashboard } from './components/Dashboard';
import { SelfAudit } from './components/SelfAudit';
import { RiskScore } from './components/RiskScore';
import { PrivacyEducation } from './components/PrivacyEducation';
import { FootprintQuiz } from './components/FootprintQuiz';
import { Recommendations } from './components/Recommendations';
import { PrivacySettings } from './components/PrivacySettings';
import { NotFound } from './components/NotFound';

// New Information & Legal Pages (from your src/pages directory)
// UPDATED: Step out of /app to find /pages
import About from '../pages/About';
import Mission from '../pages/Mission';
import Privacy from '../pages/Privacy';
import Terms from '../pages/Terms';

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
      
      // New Routes for the refined footer
      { path: 'about', Component: About },
      { path: 'mission', Component: Mission },
      { path: 'privacy', Component: Privacy },
      { path: 'terms', Component: Terms },

      { path: '*', Component: NotFound }
    ]
  }
]);