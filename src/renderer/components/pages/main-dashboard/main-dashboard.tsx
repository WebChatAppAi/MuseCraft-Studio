import React, { useEffect, useState } from 'react';
import {
  Activity,
  Users,
  Zap,
  CheckCircle,
  Clock,
  Sparkles,
  Brain,
  Music,
  Play,
  FileAudio
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { BorderBeam } from '../../magicui/border-beam';
import { useAISetupStore } from '../ai-setup/logic/ai-setup-state';
import { useDashboardStore } from './logic/shared-dashboard-store';

interface MainDashboardProps {
  licenseInfo?: {
    expiresAt: string;
    hoursRemaining: number;
  };
}

export function MainDashboard({ licenseInfo }: MainDashboardProps) {
  const { systemStatus, models, fetchSystemStatus, fetchModels } = useAISetupStore();
  const { activities, addActivity } = useDashboardStore();
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalGenerations: 0,
    activeSessions: 0,
    compositions: 0
  });

  // Fetch data on component mount
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        await Promise.all([
          fetchSystemStatus(),
          fetchModels()
        ]);
        addActivity('Dashboard initialized successfully', 'success');
      } catch (error) {
        addActivity('Failed to initialize dashboard', 'error');
      }
    };
    
    initializeDashboard();
  }, [fetchSystemStatus, fetchModels, addActivity]);

  // Mock data for now - in real app, these would come from backend
  useEffect(() => {
    // Simulate some metrics updates
    setDashboardMetrics({
      totalGenerations: Math.floor(Math.random() * 200) + 100,
      activeSessions: Math.floor(Math.random() * 5) + 1,
      compositions: Math.floor(Math.random() * 50) + 20
    });
  }, [systemStatus]);

  const moduleCards = [
    {
      id: 'models',
      title: 'AI Models',
      description: 'Available AI models for generation',
      icon: Brain,
      status: 'active',
      count: models?.length?.toString() || '0',
      color: 'bg-purple-500/10 text-purple-400',
      beamColor: 'via-purple-400',
    },
    {
      id: 'generations',
      title: 'Generations',
      description: 'Total MIDI compositions generated',
      icon: Music,
      status: 'running',
      count: dashboardMetrics.totalGenerations.toString(),
      color: 'bg-green-500/10 text-green-400',
      beamColor: 'via-green-400',
    },
    {
      id: 'active_sessions',
      title: 'Active Sessions',
      description: 'Current piano roll sessions',
      icon: Play,
      status: 'active',
      count: dashboardMetrics.activeSessions.toString(),
      color: 'bg-blue-500/10 text-blue-400',
      beamColor: 'via-blue-400',
    },
    {
      id: 'compositions',
      title: 'Compositions',
      description: 'Total MIDI compositions created',
      icon: FileAudio,
      status: 'running',
      count: dashboardMetrics.compositions.toString(),
      color: 'bg-emerald-500/10 text-emerald-400',
      beamColor: 'via-emerald-400',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'running':
        return 'bg-green-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'idle':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimeRemaining = (hours: number) => {
    if (hours < 24) {
      return `${Math.floor(hours)} hours remaining`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    return `${days} days and ${remainingHours} hours remaining`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-cyan-500/20 to-lime-500/20 rounded-lg border border-cyan-500/30">
              <Sparkles className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">MuseCraft Studio Dashboard</h1>
              <p className="text-muted-foreground">Welcome to your AI music creation control center</p>
            </div>
          </div>
          {licenseInfo && (
            <Card className="p-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <div className="text-right">
                  <div>License expires: {new Date(licenseInfo.expiresAt).toLocaleDateString()}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatTimeRemaining(licenseInfo.hoursRemaining)}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* System Status Bar */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-foreground">MuseCraft System Status</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${
                  systemStatus ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                }`}></div>
                <span className="text-xs text-muted-foreground">
                  {systemStatus ? 'Backend Online' : 'Backend Offline'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${
                  systemStatus?.loaded_models?.length ? 'bg-green-400' : 'bg-yellow-400'
                }`}></div>
                <span className="text-xs text-muted-foreground">
                  {systemStatus?.loaded_models?.length || 0} Models Loaded
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${
                  (window as any).wsService?.isConnected() ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <span className="text-xs text-muted-foreground">
                  WebSocket {(window as any).wsService?.isConnected() ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">System Overview</h2>
          <p className="text-sm text-muted-foreground">Real-time system metrics and status</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {moduleCards.map((module, index) => {
            const Icon = module.icon;
            return (
              <Card key={module.id} className="relative hover:shadow-md transition-shadow overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${module.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(module.status)}`}></div>
                      <Badge variant="secondary" className="capitalize text-xs">
                        {module.status}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <CardDescription className="text-sm">{module.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{module.count}</span>
                  </div>
                </CardContent>
                {/* Show animated border for active/running modules */}
                {(module.status === 'active' || module.status === 'running') && (
                  <BorderBeam
                    size={200}
                    duration={6}
                    delay={index * 0.1}
                    className={`from-transparent ${module.beamColor} to-transparent`}
                    reverse={index % 2 === 0}
                  />
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Welcome Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-lime-500/10"></div>
        <CardHeader className="relative">
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            Welcome to MuseCraft Studio
          </CardTitle>
          <CardDescription>
            Your AI music creation journey begins here. This dashboard will grow with new features and capabilities.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-sm text-muted-foreground">
            <p>🎵 AI music generation system ready</p>
            <p>✨ Piano roll editor operational</p>
            <p>🤖 AI models loaded and verified</p>
          </div>
        </CardContent>
        <BorderBeam
          size={250}
          duration={8}
          className="from-transparent via-cyan-400 to-transparent"
        />
      </Card>
    </div>
  );
}