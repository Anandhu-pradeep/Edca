import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { axiosInstance as axios } from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { MicOff } from 'lucide-react';

interface VideoPlayerProps {
  stream: MediaStream | null;
  isLocal?: boolean;
  className?: string;
  isMuted?: boolean;
  isCameraOn?: boolean;
  isMicOn?: boolean;
  username?: string;
}

export function VideoPlayer({ stream, isLocal = false, className, isMuted = false, isCameraOn = true, isMicOn = true, username = 'User' }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const localUser = useAuthStore(state => state.user);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (videoRef.current && stream && isCameraOn) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isCameraOn]);

  const formatAvatarUrl = (avatar: string) => {
    if (avatar.startsWith('http')) return avatar;
    if (avatar.startsWith('data:image')) return avatar;
    return `data:image/jpeg;base64,${avatar}`;
  };

  useEffect(() => {
    if (isLocal && localUser?.avatar) {
      setAvatarUrl(formatAvatarUrl(localUser.avatar));
    } else if (!isLocal && username && username !== 'User') {
      axios.get(`/users/public/${encodeURIComponent(username)}`)
        .then(res => {
          if (res.data?.data?.avatar) {
            setAvatarUrl(formatAvatarUrl(res.data.data.avatar));
          }
        })
        .catch(err => console.error('Failed to fetch user avatar:', err));
    }
  }, [isLocal, localUser?.avatar, username]);

  const initial = username.charAt(0).toUpperCase();

  return (
    <div className={cn("relative overflow-hidden bg-slate-900 rounded-2xl w-full h-full flex items-center justify-center", className)}>
      {stream && isCameraOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal || isMuted}
          className={cn(
            "w-full h-full object-cover transition-all duration-300",
            isLocal && "scale-x-[-1]" // Mirror local video
          )}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-800">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-blue-600 flex items-center justify-center shadow-2xl border-4 border-slate-700 overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl md:text-6xl text-white font-bold">{initial}</span>
            )}
          </div>
        </div>
      )}
      
      {!isMicOn && (
        <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur text-white p-2 rounded-full shadow-lg animate-in fade-in zoom-in">
          <MicOff className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}
