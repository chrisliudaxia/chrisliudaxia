import { useState, useEffect, useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RotateCcw, Volume2, Music, Mic, Minimize2, Maximize2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface VolumeSettings {
  bgmVolume: number;
  voiceVolume: number;
  originalVolume: number;
}

interface AudioVolumeControlProps {
  initialSettings?: VolumeSettings;
  onSettingsChange?: (settings: VolumeSettings) => void;
  className?: string;
  autoSave?: boolean;
}

const DEFAULT_SETTINGS: VolumeSettings = {
  bgmVolume: 0.3,
  voiceVolume: 0.95,
  originalVolume: 0.6,
};

const STORAGE_KEY = 'audio-volume-settings';

export function AudioVolumeControl({
  initialSettings = DEFAULT_SETTINGS,
  onSettingsChange,
  className = '',
  autoSave = true,
}: AudioVolumeControlProps) {
  const [settings, setSettings] = useState<VolumeSettings>(initialSettings);
  const [isExpanded, setIsExpanded] = useState(true);

  // 从本地存储加载设置
  useEffect(() => {
    if (autoSave) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsedSettings = JSON.parse(saved);
          setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
        } catch (error) {
          console.error('解析音量设置失败:', error);
        }
      }
    }
  }, [autoSave]);

  // 保存到本地存储并通知父组件
  const updateSettings = useCallback((newSettings: VolumeSettings) => {
    setSettings(newSettings);
    
    if (autoSave) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    }
    
    onSettingsChange?.(newSettings);
  }, [autoSave, onSettingsChange]);

  const handleVolumeChange = (key: keyof VolumeSettings, value: number[]) => {
    const newSettings = {
      ...settings,
      [key]: value[0],
    };
    updateSettings(newSettings);
  };

  const resetToDefault = () => {
    updateSettings(DEFAULT_SETTINGS);
  };

  const getVolumeDescription = (type: keyof VolumeSettings, value: number) => {
    const percentage = Math.round(value * 100);
    
    switch (type) {
      case 'bgmVolume':
        if (percentage < 20) return `${percentage}% - 很轻柔`;
        if (percentage < 40) return `${percentage}% - 适中`;
        if (percentage < 60) return `${percentage}% - 较明显`;
        return `${percentage}% - 很突出`;
      
      case 'voiceVolume':
        if (percentage < 70) return `${percentage}% - 偏轻`;
        if (percentage < 90) return `${percentage}% - 标准`;
        return `${percentage}% - 清晰突出`;
      
      case 'originalVolume':
        if (percentage < 30) return `${percentage}% - 几乎静音`;
        if (percentage < 50) return `${percentage}% - 轻微保留`;
        if (percentage < 70) return `${percentage}% - 适度保留`;
        return `${percentage}% - 明显保留`;
      
      default:
        return `${percentage}%`;
    }
  };

  const volumeConfigs = [
    {
      key: 'bgmVolume' as keyof VolumeSettings,
      label: '背景音乐',
      description: '控制背景音乐的音量大小，建议保持较低以免盖过人声',
      icon: Music,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      recommended: '推荐: 30%'
    },
    {
      key: 'voiceVolume' as keyof VolumeSettings,
      label: '解说人声',
      description: '控制AI生成解说音频的音量，通常设为最高以确保清晰度',
      icon: Mic,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      recommended: '推荐: 95%'
    },
    {
      key: 'originalVolume' as keyof VolumeSettings,
      label: '原视频声音',
      description: '控制原始视频音轨的音量，可保留环境音和背景音效',
      icon: Volume2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      recommended: '推荐: 60%'
    },
  ];

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            音频混合设置
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefault}
              className="h-8"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              重置
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          调整视频中各音轨的音量比例，获得最佳的听觉效果
        </p>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* 快速预览 */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            {volumeConfigs.map((config) => {
              const Icon = config.icon;
              const value = settings[config.key];
              return (
                <div key={config.key} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon className={`h-4 w-4 ${config.color}`} />
                    <span className="text-sm font-medium">{config.label}</span>
                  </div>
                  <div className="text-2xl font-bold">{Math.round(value * 100)}%</div>
                  <div className="text-xs text-muted-foreground">{config.recommended}</div>
                </div>
              );
            })}
          </div>

          {/* 详细控制 */}
          <div className="space-y-5">
            {volumeConfigs.map((config) => {
              const Icon = config.icon;
              const value = settings[config.key];
              
              return (
                <div
                  key={config.key}
                  className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`p-2 rounded-lg bg-white ${config.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-base font-medium">{config.label}</Label>
                        <div className="text-right">
                          <div className="text-lg font-bold">{Math.round(value * 100)}%</div>
                          <div className="text-xs text-muted-foreground">
                            {getVolumeDescription(config.key, value)}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {config.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Slider
                      value={[value]}
                      onValueChange={(newValue) => handleVolumeChange(config.key, newValue)}
                      max={1}
                      min={0}
                      step={0.05}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 预设方案 */}
          <div className="space-y-3">
            <Label className="text-base font-medium">快速预设</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2"
                onClick={() => updateSettings({ bgmVolume: 0.2, voiceVolume: 0.95, originalVolume: 0.4 })}
              >
                <div className="font-medium">清晰解说型</div>
                <div className="text-xs text-muted-foreground text-left">
                  突出解说声音，背景音较轻
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2"
                onClick={() => updateSettings({ bgmVolume: 0.4, voiceVolume: 0.9, originalVolume: 0.5 })}
              >
                <div className="font-medium">平衡自然型</div>
                <div className="text-xs text-muted-foreground text-left">
                  各音轨音量均衡，听感自然
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2"
                onClick={() => updateSettings({ bgmVolume: 0.5, voiceVolume: 0.85, originalVolume: 0.7 })}
              >
                <div className="font-medium">氛围感强型</div>
                <div className="text-xs text-muted-foreground text-left">
                  保留更多原声和背景音乐
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default AudioVolumeControl;
