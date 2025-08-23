import { Route } from 'react-router-dom'

import { Router } from 'lib/electron-router-dom'

import { AppLayout } from './components/layout/app-layout/app-layout';
import { MainDashboard } from './components/pages/main-dashboard/main-dashboard';
import { QuantumLanding } from './components/pages/quantum-landing/quantum-landing';
import { AISetupPage } from './components/pages/ai-setup/page';
import { PianoRollPage } from './components/pages/piano-roll/page';
import { ToastListener } from './components/shared/toast-listener/toast-listener';

export function AppRoutes() {
  return (
    <>
      <ToastListener />
      <Router 
        main={
          <>
            <Route path="/" element={<QuantumLanding />} />
            <Route path="/dashboard" element={
              <AppLayout>
                <MainDashboard />
              </AppLayout>
            } />
            <Route path="/ai-setup" element={
              <AppLayout>
                <AISetupPage />
              </AppLayout>
            } />
            <Route path="/piano-roll" element={
              <AppLayout>
                <PianoRollPage />
              </AppLayout>
            } />
            {/* Add more routes here as you build new features */}
          </>
        } 
      />
    </>
  )
}