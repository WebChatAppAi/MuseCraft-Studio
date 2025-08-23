import React from 'react';
import { Server, Settings, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { BackendSettings } from '../../../../../shared/types/ai-models';

interface BackendSettingsCardProps {
  backendSettings: BackendSettings;
  hasConnectionError: boolean;
  onSettingsClick?: () => void;
}

export const BackendSettingsCard: React.FC<BackendSettingsCardProps> = ({
  backendSettings,
  hasConnectionError,
  onSettingsClick,
}) => {
  return (
    <Card className="bg-card/50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Server className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium">Backend URL</div>
              <div className="text-sm text-muted-foreground">{backendSettings.url}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasConnectionError ? (
              <div className="flex items-center gap-1 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Disconnected</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">Connected</span>
              </div>
            )}
            <Button size="sm" variant="outline" onClick={onSettingsClick}>
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
