import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVideoStore } from '@/store/useVideoStore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ControlsProps {
  onLeave: () => void;
  onToggleCamera?: (isCameraOn: boolean) => void;
  onToggleMic?: (isMicOn: boolean) => void;
}

export function Controls({ onLeave, onToggleCamera, onToggleMic }: ControlsProps) {
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
    <div className="flex items-center justify-center gap-4 bg-background/80 backdrop-blur-md px-8 py-4 rounded-3xl border border-border/50 shadow-2xl animate-in slide-in-from-bottom-10">
      <Button
        variant={isMicOn ? 'secondary' : 'destructive'}
        size="icon"
        className={cn("w-12 h-12 rounded-full", !isMicOn && "bg-red-500 hover:bg-red-600 text-white")}
        onClick={handleToggleMic}
      >
        {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
      </Button>

      <Button
        variant={isCameraOn ? 'secondary' : 'destructive'}
        size="icon"
        className={cn("w-12 h-12 rounded-full", !isCameraOn && "bg-red-500 hover:bg-red-600 text-white")}
        onClick={handleToggleCamera}
      >
        {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
      </Button>

      <Button
        variant="destructive"
        className="px-6 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg shadow-red-500/20"
        onClick={onLeave}
      >
        <PhoneOff className="w-5 h-5 mr-2" />
        Leave Call
      </Button>
    </div>
  );
}
