/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SplashScreen } from './components/screens/SplashScreen';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { AppLayout } from './components/layout/AppLayout';

const MainAppContent: React.FC = () => {
  const { settings } = useApp();

  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleSplashComplete = () => {
    setShowSplash(false);
    if (!settings.onboardingCompleted) {
      setShowOnboarding(true);
    }
  };

  const handleOnboardingFinish = () => {
    setShowOnboarding(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (showOnboarding) {
    return <OnboardingScreen onFinish={handleOnboardingFinish} />;
  }

  return <AppLayout />;
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
