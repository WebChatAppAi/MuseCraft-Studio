import React, { useState } from 'react';
import { Settings, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { BackendSettings } from '../../../../../shared/types/ai-models';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  backendSettings: BackendSettings;
  onSave: (settings: Partial<BackendSettings>) => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  backendSettings,
  onSave,
}) => {
  const [formData, setFormData] = useState<BackendSettings>(backendSettings);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleReset = () => {
    setFormData(backendSettings);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Backend Settings
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="backend-url">Backend URL</Label>
            <Input
              id="backend-url"
              placeholder="http://localhost:8899"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              URL where MuseCraftEngine is running
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="websocket-url">WebSocket URL</Label>
            <Input
              id="websocket-url"
              placeholder="ws://localhost:8899/ws"
              value={formData.websocket_url}
              onChange={(e) => setFormData(prev => ({ ...prev, websocket_url: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              WebSocket URL for real-time updates
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeout">Connection Timeout (ms)</Label>
            <Input
              id="timeout"
              type="number"
              placeholder="10000"
              value={formData.connection_timeout}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                connection_timeout: parseInt(e.target.value) || 10000 
              }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="retry-attempts">Retry Attempts</Label>
            <Input
              id="retry-attempts"
              type="number"
              placeholder="3"
              value={formData.retry_attempts}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                retry_attempts: parseInt(e.target.value) || 3 
              }))}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
