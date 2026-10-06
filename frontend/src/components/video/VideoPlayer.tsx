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
  objectFit?: 'cover' | 'contain';
}

export function VideoPlayer({
  stream,
  isLocal = false,
  className,
  isMuted = false,
  isCameraOn = true,
  isMicOn = true,
  username = 'User',
  objectFit = 'cover',
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const localUser = useAuthStore((state) => state.user);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // ALWAYS attach stream to the video element so audio tracks play
  // even when the camera is turned off. We never detach the stream.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (stream) {
      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }
    } else {
      video.srcObject = null;
    }
  }, [stream]);

  // Control video track enabled state separately - do NOT hide/show video element
  // for camera toggle, just disable the track
  useEffect(() => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = isCameraOn;
      });
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
      axios
        .get(`/users/public/${encodeURIComponent(username)}`)
        .then((res) => {
          if (res.data?.data?.avatar) {
            setAvatarUrl(formatAvatarUrl(res.data.data.avatar));
          }
        })
        .catch((err) => console.error('Failed to fetch user avatar:', err));
    }
  }, [isLocal, localUser?.avatar, username]);

  const initial = username.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-slate-900 rounded-2xl w-full h-full flex items-center justify-center',
        className
      )}
    >
      {/* 
        The video element is ALWAYS in the DOM so the srcObject (stream) stays attached.
        Audio plays regardless of camera state. We show/hide it with CSS only.
      */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal || isMuted}
        className={cn(
          'w-full h-full transition-all duration-300',
          objectFit === 'contain' ? 'object-contain bg-black' : 'object-cover',
          isLocal && 'scale-x-[-1]', // Mirror local video
          !isCameraOn && 'hidden'     // Hide video when camera off but keep stream attached
        )}
      />

      {/* Avatar overlay shown when camera is off */}
      {!isCameraOn && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 p-4">
          <div className="w-16 h-16 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full bg-blue-600 flex items-center justify-center shadow-2xl border-2 sm:border-4 border-slate-700 overflow-hidden">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={username}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={() => setAvatarUrl(null)}
              />
            ) : (
              <span className="text-2xl sm:text-4xl md:text-5xl text-white font-bold">{initial}</span>
            )}
          </div>
        </div>
      )}

      {/* Mic off indicator */}
      {!isMicOn && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-red-500/90 backdrop-blur text-white p-1.5 sm:p-2 rounded-full shadow-lg animate-in fade-in zoom-in">
          <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      )}
    </div>
  );
}
