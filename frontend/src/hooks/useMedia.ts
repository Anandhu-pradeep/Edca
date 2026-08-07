import { useEffect, useState } from 'react';
import { useVideoStore } from '@/store/useVideoStore';

export function useMedia() {
  const { setLocalStream, isMicOn, isCameraOn, localStream } = useVideoStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startMedia = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        // Initialize with default states (which might be true or false depending on store, usually true)
        stream.getAudioTracks().forEach(track => {
          track.enabled = isMicOn;
        });
        stream.getVideoTracks().forEach(track => {
          track.enabled = isCameraOn;
        });

        setLocalStream(stream);
      } catch (err: any) {
        console.error('Error accessing media devices:', err);
        setError('Could not access camera or microphone. Please check permissions.');
      }
    };

    if (!localStream) {
      startMedia();
    }

    return () => {
      // Cleanup happens when the component fully unmounts
      // However, we only stop tracks if we are really leaving. 
      // Next.js Strict Mode double mount can kill stream if we stop tracks here without care.
      // So we leave cleanup to a higher level or explicit leave function.
    };
  }, []); // Run only once on mount

  return { error };
}
