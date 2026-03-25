import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Upload, Play, Pause, Music, Volume2, X, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface BgmTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  mood: string;
  duration: number;
  previewUrl?: string;
  downloadUrl?: string;
  source: 'jamendo' | 'local';
  volume?: number;
  file?: File;
}

interface BgmSelectorProps {
  selectedTrack?: BgmTrack | null;
  onTrackSelect?: (track: BgmTrack | null) => void;
  onVolumeChange?: (volume: number) => void;
  currentVolume?: number;
  className?: string;
}

const MOOD_OPTIONS = [
  { value: 'happy', label: '欢快' },
  { value: 'sad', label: '悲伤' },
  { value: 'epic', label: '史诗' },
  { value: 'peaceful', label: '平静' },
  { value: 'energetic', label: '活力' },
  { value: 'dramatic', label: '戏剧性' },
  { value: 'romantic', label: '浪漫' },
  { value: 'mysterious', label: '神秘' },
];

const GENRE_OPTIONS = [
  { value: 'cinematic', label: '电影配乐' },
  { value: 'classical', label: '古典' },
  { value: 'electronic', label: '电子' },
  { value: 'ambient', label: '环境音乐' },
  { value: 'rock', label: '摇滚' },
  { value: 'jazz', label: '爵士' },
  { value: 'pop', label: '流行' },
  { value: 'folk', label: '民谣' },
];

export function BgmSelector({
  selectedTrack,
  onTrackSelect,
  onVolumeChange,
  currentVolume = 0.3,
  className = '',
}: BgmSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [searchResults, setSearchResults] = useState<BgmTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [localTracks, setLocalTracks] = useState<BgmTrack[]>([]);
  const [activeTab, setActiveTab] = useState('search');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // 搜索Jamendo音乐
  const searchMusic = async () => {
    if (!searchQuery.trim() && selectedMood === 'all' && selectedGenre === 'all') {
      toast({
        title: '请输入搜索条件',
        description: '请输入关键词或选择情绪/类型来搜索音乐',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        mood: selectedMood,
        genre: selectedGenre,
      });

      const response = await fetch(`/api/music/search?${params}`);
      if (!response.ok) throw new Error('搜索失败');

      const data = await response.json();
      if (data.success) {
        setSearchResults(data.tracks);
        toast({
          title: '搜索完成',
          description: `找到 ${data.tracks.length} 首相关音乐`,
        });
      } else {
        throw new Error(data.message || '搜索失败');
      }
    } catch (error) {
      console.error('搜索音乐失败:', error);
      toast({
        title: '搜索失败',
        description: error instanceof Error ? error.message : '无法搜索音乐',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  // 处理本地文件上传
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const audioFiles = files.filter(file => file.type.startsWith('audio/'));

    if (audioFiles.length === 0) {
      toast({
        title: '文件格式错误',
        description: '请选择音频文件（MP3、WAV等）',
        variant: 'destructive',
      });
      return;
    }

    const newTracks: BgmTrack[] = audioFiles.map(file => ({
      id: `local-${Date.now()}-${Math.random()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: '本地文件',
      genre: 'custom',
      mood: 'custom',
      duration: 0,
      previewUrl: URL.createObjectURL(file),
      source: 'local',
      file,
      volume: currentVolume,
    }));

    setLocalTracks(prev => [...prev, ...newTracks]);
    setActiveTab('local');
    
    toast({
      title: '上传成功',
      description: `已添加 ${newTracks.length} 个本地音频文件`,
    });
  };

  // 播放/暂停预览
  const togglePreview = async (track: BgmTrack) => {
    if (playingTrackId === track.id) {
      audioRef.current?.pause();
      setPlayingTrackId(null);
      return;
    }

    if (!track.previewUrl) {
      toast({
        title: '无法预览',
        description: '该音频文件暂无预览链接',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(track.previewUrl);
      audio.volume = currentVolume;
      audioRef.current = audio;

      audio.onended = () => setPlayingTrackId(null);
      audio.onerror = () => {
        setPlayingTrackId(null);
        toast({
          title: '播放失败',
          description: '无法播放该音频文件',
          variant: 'destructive',
        });
      };

      await audio.play();
      setPlayingTrackId(track.id);
    } catch (error) {
      console.error('播放音频失败:', error);
      toast({
        title: '播放失败',
        description: '无法播放该音频文件',
        variant: 'destructive',
      });
    }
  };

  // 选择音乐
  const selectTrack = (track: BgmTrack) => {
    const trackWithVolume = { ...track, volume: currentVolume };
    onTrackSelect?.(trackWithVolume);
    
    toast({
      title: '已选择背景音乐',
      description: `${track.title} - ${track.artist}`,
    });
  };

  // 删除本地音乐
  const removeLocalTrack = (trackId: string) => {
    const track = localTracks.find(t => t.id === trackId);
    if (track?.previewUrl) {
      URL.revokeObjectURL(track.previewUrl);
    }
    
    setLocalTracks(prev => prev.filter(t => t.id !== trackId));
    
    if (selectedTrack?.id === trackId) {
      onTrackSelect?.(null);
    }
  };

  // 音量变化处理
  const handleVolumeChange = (value: number[]) => {
    const volume = value[0];
    onVolumeChange?.(volume);
    
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  };

  // 清理资源
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      localTracks.forEach(track => {
        if (track.previewUrl) {
          URL.revokeObjectURL(track.previewUrl);
        }
      });
    };
  }, []);

  const TrackCard = ({ track }: { track: BgmTrack }) => (
    <div className={`p-4 border rounded-lg transition-all hover:shadow-md ${
      selectedTrack?.id === track.id ? 'border-primary bg-primary/5' : 'border-border'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Music className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <h4 className="font-medium truncate">{track.title}</h4>
            {track.source === 'local' && (
              <Badge variant="secondary" className="text-xs">本地</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{track.artist}</p>
          <div className="flex flex-wrap gap-1 mb-2">
            <Badge variant="outline" className="text-xs">{track.genre}</Badge>
            <Badge variant="outline" className="text-xs">{track.mood}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            时长: {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => togglePreview(track)}
            className="h-8 w-8 p-0"
          >
            {playingTrackId === track.id ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant={selectedTrack?.id === track.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => selectTrack(track)}
          >
            {selectedTrack?.id === track.id ? '已选择' : '选择'}
          </Button>
          {track.source === 'local' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeLocalTrack(track.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          背景音乐选择器
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 当前选择 */}
        {selectedTrack && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">当前选中的背景音乐</h3>
              <Badge variant="default">已选择</Badge>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <Music className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">{selectedTrack.title}</p>
                <p className="text-sm text-muted-foreground">{selectedTrack.artist}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  音量控制
                </Label>
                <span className="text-sm font-medium">{Math.round(currentVolume * 100)}%</span>
              </div>
              <Slider
                value={[currentVolume]}
                onValueChange={handleVolumeChange}
                max={1}
                min={0}
                step={0.05}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* 搜索和上传标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">搜索音乐库</TabsTrigger>
            <TabsTrigger value="local">本地上传 ({localTracks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            {/* 搜索表单 */}
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="search-query">关键词搜索</Label>
                <Input
                  id="search-query"
                  placeholder="输入音乐风格、场景描述等..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchMusic()}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>情绪风格</Label>
                  <Select value={selectedMood} onValueChange={setSelectedMood}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择情绪" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部情绪</SelectItem>
                      {MOOD_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>音乐类型</Label>
                  <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部类型</SelectItem>
                      {GENRE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={searchMusic} 
                disabled={isSearching}
                className="w-full"
              >
                <Search className="h-4 w-4 mr-2" />
                {isSearching ? '搜索中...' : '搜索音乐'}
              </Button>
            </div>

            {/* 搜索结果 */}
            <div className="space-y-3">
              {searchResults.length > 0 ? (
                searchResults.map((track) => (
                  <TrackCard key={track.id} track={track} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>输入关键词或选择筛选条件来搜索背景音乐</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="local" className="space-y-4">
            {/* 上传区域 */}
            <div className="p-6 border-2 border-dashed border-border rounded-lg text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">上传本地背景音乐</h3>
              <p className="text-sm text-muted-foreground mb-4">
                支持 MP3、WAV、AAC 等常见音频格式
              </p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                选择音频文件
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* 本地音乐列表 */}
            <div className="space-y-3">
              {localTracks.length > 0 ? (
                localTracks.map((track) => (
                  <TrackCard key={track.id} track={track} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>暂无本地音乐文件</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default BgmSelector;
