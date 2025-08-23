import React from 'react';
import { Cpu, HardDrive, Zap, Monitor, MemoryStick } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { BorderBeam } from '../../../magicui/border-beam';
import { AISystemStatus, SystemInfo } from '../../../../../shared/types/ai-models';

interface SystemStatusCardProps {
  systemStatus: AISystemStatus;
  systemInfo?: SystemInfo | null;
  isConnected?: boolean;
}

export const SystemStatusCard: React.FC<SystemStatusCardProps> = ({ systemStatus, systemInfo, isConnected = false }) => {
  const getCudaStatusColor = () => {
    return systemStatus.cuda_available ? 'bg-green-500' : 'bg-orange-500';
  };

  const getCudaStatusText = () => {
    return systemStatus.cuda_available ? 'Enabled' : 'Disabled';
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* CUDA & AI Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">CUDA</div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getCudaStatusColor()}`}></div>
              <span className="font-medium">{getCudaStatusText()}</span>
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Loaded Models</div>
            <div className="font-medium">{systemStatus.loaded_count}/{systemStatus.max_models}</div>
          </div>
          <div>
            <div className="text-muted-foreground">AI Memory</div>
            <div className="font-medium">{systemStatus.estimated_memory_gb.toFixed(1)} GB</div>
          </div>
          <div>
            <div className="text-muted-foreground">Active Jobs</div>
            <div className="font-medium">{systemStatus.active_jobs}</div>
          </div>
        </div>

        {/* Hardware Info */}
        {systemInfo && (
          <div className="pt-4 border-t space-y-3">
            {/* CPU */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">CPU</span>
              </div>
              <div className="text-right text-sm">
                <div className="font-medium">{systemInfo.cpu_count} Cores</div>
                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {systemInfo.cpu_name.replace('Intel64 Family 6 Model 151 Stepping 2, ', '')}
                </div>
              </div>
            </div>

            {/* System RAM */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MemoryStick className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">System RAM</span>
              </div>
              <div className="text-right text-sm">
                <div className="font-medium">
                  {systemInfo.memory_used_gb.toFixed(1)} / {systemInfo.memory_total_gb.toFixed(1)} GB
                </div>
                <div className="text-xs text-muted-foreground">
                  {systemInfo.memory_available_gb.toFixed(1)} GB Available
                </div>
              </div>
            </div>

            {/* GPU Memory */}
            {systemInfo.gpu && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">GPU Memory</span>
                </div>
                <div className="text-right text-sm">
                  <div className="font-medium">
                    {systemInfo.gpu.memory_used_gb.toFixed(1)} / {systemInfo.gpu.memory_total_gb.toFixed(1)} GB
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(systemInfo.gpu.memory_total_gb - systemInfo.gpu.memory_used_gb).toFixed(1)} GB Available
                  </div>
                </div>
              </div>
            )}

            {/* GPU Name */}
            {(systemStatus.gpu_memory?.device_name || systemInfo?.gpu?.device_name) && (
              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                GPU: {systemStatus.gpu_memory?.device_name || systemInfo?.gpu?.device_name}
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {/* Border beam when connected */}
      {isConnected && (
        <BorderBeam
          size={250}
          duration={4}
          className="from-transparent via-emerald-400 to-transparent"
        />
      )}
    </Card>
  );
};
