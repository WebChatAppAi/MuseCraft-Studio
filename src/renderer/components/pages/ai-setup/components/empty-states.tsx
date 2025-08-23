import React from 'react';
import { Bot, WifiOff } from 'lucide-react';
import { Card, CardContent } from '../../../ui/card';
import { AISystemStatus, BackendSettings } from '../../../../../shared/types/ai-models';

interface NoModelsStateProps {
  systemStatus: AISystemStatus | null;
}

export const NoModelsState: React.FC<NoModelsStateProps> = ({ systemStatus }) => {
  return (
    <Card className="border-dashed">
      <CardContent className="py-12">
        <div className="text-center">
          <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Models Available</h3>
          <p className="text-muted-foreground mb-4">
            Please add AI models to your MuseCraftEngine installation.
          </p>
          <div className="text-sm text-muted-foreground">
            <p>Models should be placed in:</p>
            <code className="bg-muted px-2 py-1 rounded text-xs">
              {systemStatus?.models_directory || './data/models/'}
            </code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ConnectionErrorStateProps {
  backendSettings: BackendSettings;
}

export const ConnectionErrorState: React.FC<ConnectionErrorStateProps> = ({
  backendSettings,
}) => {
  return (
    <Card className="border-dashed">
      <CardContent className="py-12">
        <div className="text-center">
          <WifiOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Unable to Connect</h3>
          <p className="text-muted-foreground mb-4">
            Cannot connect to MuseCraftEngine backend.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Make sure MuseCraftEngine is running on:
            </p>
            <code className="bg-muted px-2 py-1 rounded text-xs">
              {backendSettings.url}
            </code>
            <div className="pt-2 text-xs text-muted-foreground">
              Use the Settings button to configure the backend URL or click Refresh to retry.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
