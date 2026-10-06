import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize2, Minimize2, Rows2, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVideoStore } from '@/store/useVideoStore';
import { cn } from '@/lib/utils';

interface ControlsProps {
  onLeave: () => void;
  onToggleCamera?: (isCameraOn: boolean) => void;
  onToggleMic?: (isMicOn: boolean) => void;
  layoutMode?: 'pip' | 'split' | 'grid';
  onToggleLayout?: () => void;
  showLayoutToggle?: boolean;
  objectFit?: 'cover' | 'contain';
  onToggleFit?: () => void;
}

export function Controls({ 
  onLeave, 
  onToggleCamera, 
  onToggleMic,
  layoutMode = 'pip',
  onToggleLayout,
  showLayoutToggle = false,
  objectFit = 'cover',
  onToggleFit
}: ControlsProps) {
  const { isMicOn, isCameraOn, toggleMic, toggleCamera } = useVideoStore();

  const handleToggleMic = () => {
    toggleMic();
    if (onToggleMic) onToggleMic(!isMicOn);
  };

  const handleToggleCamera = () => {
    toggleCamera();
    if (onToggleCamera) onToggleCamera(!isCameraOn);
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 bg-background/90 dark:bg-card/90 backdrop-blur-xl px-3 sm:px-6 py-2 sm:py-3 rounded-full border border-border/60 shadow-2xl animate-in slide-in-from-bottom-10 max-w-full">
      {/* Microphone Button */}
      <Button
        variant={isMicOn ? 'secondary' : 'destructive'}
        size="icon"
        className={cn(
          "w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all", 
          !isMicOn && "bg-red-500 hover:bg-red-600 text-white"
        )}
        onClick={handleToggleMic}
        title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
      >
        {isMicOn ? <Mic className="w-4 h-4 sm:w-5 sm:h-5" /> : <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />}
      </Button>

      {/* Camera Button */}
      <Button
        variant={isCameraOn ? 'secondary' : 'destructive'}
        size="icon"
        className={cn(
          "w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all", 
          !isCameraOn && "bg-red-500 hover:bg-red-600 text-white"
        )}
        onClick={handleToggleCamera}
        title={isCameraOn ? "Turn off camera" : "Turn on camera"}
      >
        {isCameraOn ? <Video className="w-4 h-4 sm:w-5 sm:h-5" /> : <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" />}
      </Button>

      {/* Video Fit / Zoom Toggle Button */}
      {onToggleFit && (
        <Button
          variant="secondary"
          size="icon"
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full hover:bg-secondary/80 text-foreground transition-all"
          onClick={onToggleFit}
          title={objectFit === 'cover' ? "Fit video (no crop)" : "Fill screen (crop)"}
        >
          {objectFit === 'cover' ? <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />}
        </Button>
      )}

      {/* Mobile Layout Switcher (PiP vs Stacked/Split) */}
      {showLayoutToggle && onToggleLayout && (
        <Button
          variant="secondary"
          size="icon"
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full hover:bg-secondary/80 text-foreground transition-all"
          onClick={onToggleLayout}
          title={layoutMode === 'pip' ? "Switch to Split View" : "Switch to Picture-in-Picture"}
        >
          {layoutMode === 'pip' ? <Rows2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" /> : <LayoutTemplate className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />}
        </Button>
      )}

      {/* Leave Call Button */}
      <Button
        variant="destructive"
        className="px-3 sm:px-6 h-10 sm:h-12 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg shadow-red-500/20 text-xs sm:text-sm flex items-center gap-1.5 transition-all"
        onClick={onLeave}
        title="Leave call"
      >
        <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="hidden sm:inline">Leave Call</span>
        <span className="inline sm:hidden">Leave</span>
      </Button>
    </div>
  );
}
