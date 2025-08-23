import React from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { BorderBeam } from '../../../magicui/border-beam';

interface ConnectionStatusProps {
  isConnected: boolean;
  isTestingConnection: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  isTestingConnection,
}) => {
  if (isTestingConnection) {
    return (
      <div className="relative px-3 py-1.5 border border-border rounded-md bg-background">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Testing...</span>
        </div>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="relative px-3 py-1.5 border border-emerald-200 text-emerald-700 bg-emerald-50 rounded-md dark:border-emerald-800 dark:text-emerald-400 dark:bg-emerald-950">
        <div className="flex items-center gap-2 text-sm">
          <Wifi className="h-4 w-4" />
          <span>Connected</span>
        </div>
        <BorderBeam
          size={100}
          duration={3}
          className="from-transparent via-emerald-400 to-transparent"
        />
      </div>
    );
  }

  return (
    <div className="relative px-3 py-1.5 bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-200 text-red-700 rounded-md dark:border-red-800 dark:text-red-400 dark:from-red-500/20 dark:to-red-600/20">
      <div className="flex items-center gap-2 text-sm">
        <WifiOff className="h-4 w-4" />
        <span>Unreachable</span>
      </div>
    </div>
  );
};
