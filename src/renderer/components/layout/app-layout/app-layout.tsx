import React from 'react';
import { Sidebar } from '../sidebar/sidebar';
import { TitleBar } from '../title-bar/title-bar';
import { ToastProvider } from '../../../lib/toast';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ToastProvider>
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
        <TitleBar title="MuseCraft Studio" />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 scrollable-content">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
