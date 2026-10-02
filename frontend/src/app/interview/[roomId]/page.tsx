'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVideoStore } from '@/store/useVideoStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useMedia } from '@/hooks/useMedia';
import { useSocket } from '@/hooks/useSocket';
import { useWebRTC } from '@/hooks/useWebRTC';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { Controls } from '@/components/video/Controls';
import { Loader2, AlertCircle } from 'lucide-react';
import { useRef } from 'react';
import { getCreditBalance, consumeInterviewCredits } from '@/lib/credit';
import { toast } from 'sonner';
import Link from 'next/link';

export default function InterviewRoom({ params }: { params: Promise<{ roomId: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  
  const unwrappedParams = use(params);
  const roomId = unwrappedParams.roomId;

  // Wait for auth rehydration from IndexedDB before doing anything
  const { isInitializing, isAuthenticated } = useAuthStore();

  const { connectionState, localStream, remoteStreams, participants, remoteVideoStates, remoteMicStates, isCameraOn, isMicOn } = useVideoStore();
  const { error: mediaError } = useMedia();
  // Delay connecting to WebSocket until localStream is acquired so WebRTC has tracks ready
  const { sendMessage } = useSocket(localStream ? roomId : null, action);

  // Initialize WebRTC with the signaling socket
  useWebRTC(sendMessage, roomId);
  
  const interviewIdRef = useRef<string | null>(null);
  const [hasSufficientCredits, setHasSufficientCredits] = useState<boolean | null>(null);

  useEffect(() => {
    // Wait for auth to rehydrate from IndexedDB before calling API.
    // Without this guard, on page refresh accessToken is null → 401 → logout.
    if (isInitializing) return;
    if (!isAuthenticated) {
      router.replace('/sign?view=login');
      return;
    }

    let mounted = true;
    getCreditBalance().then(res => {
      if (mounted) {
        if (res.balance < 10) {
          setHasSufficientCredits(false);
          toast.error("Insufficient credits to start the interview. Please top up.", { id: "credits" });
        } else {
          setHasSufficientCredits(true);
        }
      }
    }).catch(err => {
      console.error("Failed to fetch credits", err);
      // Fallback: allow to proceed or fail. We'll fail safe.
      if (mounted) setHasSufficientCredits(false);
    });
    return () => { mounted = false; };
  }, [isInitializing, isAuthenticated, router]);

  useEffect(() => {
    // Record the interview start in the database so it shows on the dashboard
    let mounted = true;
    if (hasSufficientCredits === true) {
      import('@/lib/axios').then(({ axiosInstance }) => {
        axiosInstance.post('/interviews', {
          role: 'Mock Interview (Video Call)',
          scheduledAt: new Date().toISOString()
        }).then(res => {
          if (mounted && res.data?.data?.id) {
            interviewIdRef.current = res.data.data.id;
          }
        }).catch(err => console.error("Failed to record interview start:", err));
      });
    }
    return () => { mounted = false; };
  }, [hasSufficientCredits]);

  const handleLeave = () => {
    sendMessage({ type: 'leave-room', roomId });
    // Cleanup local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      useVideoStore.getState().setLocalStream(null);
    }
    useVideoStore.getState().setParticipants([]);
    
    // Complete the interview with a mock grade/duration so it populates the dashboard chart
    if (interviewIdRef.current) {
      import('@/lib/axios').then(({ axiosInstance }) => {
        const mockDuration = Math.floor(Math.random() * 30) + 15; // 15-45 mins
        const grades = ['A+', 'A', 'A-', 'B+', 'B', 'B-'];
        const mockGrade = grades[Math.floor(Math.random() * grades.length)];
        
        axiosInstance.put(`/interviews/${interviewIdRef.current}/complete?grade=${mockGrade}&durationMinutes=${mockDuration}`)
          .then(() => {
            // Deduct credits after successful completion
            if (interviewIdRef.current) {
                consumeInterviewCredits(interviewIdRef.current).catch(err => console.error("Failed to deduct credits", err));
            }
          })
          .catch(err => console.error("Failed to complete interview:", err));
      });
    }

    router.push('/dashboard');
  };

  const handleToggleCamera = (isCameraOn: boolean) => {
    sendMessage({ type: 'video-toggle', roomId, isCameraOn });
  };

  const handleToggleMic = (isMicOn: boolean) => {
    sendMessage({ type: 'audio-toggle', roomId, isMicOn });
  };

  if (mediaError) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center p-8 bg-destructive/10 rounded-2xl max-w-md">
          <p className="text-destructive font-semibold mb-4">Media Error</p>
          <p className="text-muted-foreground">{mediaError}</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="mt-6 px-4 py-2 bg-background border border-border rounded-lg hover:bg-secondary transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (hasSufficientCredits === false) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center p-8 bg-destructive/10 rounded-2xl max-w-md">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-semibold mb-2">Insufficient Credits</p>
          <p className="text-muted-foreground mb-6">You need at least 10 credits to start an interview.</p>
          <div className="flex gap-4 justify-center">
              <Link href="/dashboard">
                <button className="px-4 py-2 bg-background border border-border rounded-lg hover:bg-secondary transition-colors">
                  Dashboard
                </button>
              </Link>
              <Link href="/credits">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  Buy Credits
                </button>
              </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isInitializing || hasSufficientCredits === null || !localStream || connectionState === 'Waiting' || connectionState === 'Connecting') {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p className="text-muted-foreground text-lg font-medium animate-pulse">
          {isInitializing ? 'Restoring session...' : hasSufficientCredits === null ? 'Checking credit balance...' : (!localStream) ? 'Acquiring camera and microphone...' : `Joining room ${roomId}...`}
        </p>
      </div>
    );
  }

  // Calculate layout based on number of participants
  const totalVideos = 1 + Object.keys(remoteStreams).length;
  let gridCols = 'grid-cols-1';
  if (totalVideos === 2) gridCols = 'grid-cols-1 md:grid-cols-2';
  else if (totalVideos >= 3) gridCols = 'grid-cols-2';

  return (
    <div className="relative h-screen w-full bg-background overflow-hidden flex flex-col p-4 md:p-6">
      
      {/* Header */}
      <div className="absolute top-6 left-6 z-10 flex items-center gap-4">
        <div className="px-4 py-2 bg-secondary/80 backdrop-blur-md rounded-xl border border-border/50 text-sm font-medium">
          Room: <span className="text-blue-500 font-mono tracking-wider">{roomId}</span>
        </div>
        {participants.length > 0 && (
          <div className="px-4 py-2 bg-secondary/80 backdrop-blur-md rounded-xl border border-border/50 text-sm text-muted-foreground">
            {participants.length} {participants.length === 1 ? 'Participant' : 'Participants'}
          </div>
        )}
      </div>

      {/* Main Video Grid */}
      <div className={`flex-1 grid ${gridCols} gap-4 w-full h-full max-w-7xl mx-auto items-center justify-center pt-16 pb-24`}>
        {/* Local Video - when alone, it's centered large. When with others, it joins the grid. */}
        <div className={`relative w-full aspect-video md:aspect-auto md:h-full max-h-[70vh] rounded-2xl overflow-hidden shadow-2xl border border-border/10`}>
          <VideoPlayer stream={localStream} isLocal isCameraOn={isCameraOn} isMicOn={isMicOn} username="You" />
          <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-white text-sm">
            You
          </div>
        </div>

        {/* Remote Videos */}
        {Object.entries(remoteStreams).map(([peerId, stream]) => (
          <div key={peerId} className={`relative w-full aspect-video md:aspect-auto md:h-full max-h-[70vh] rounded-2xl overflow-hidden shadow-2xl border border-border/10 animate-in zoom-in-95 duration-500`}>
            <VideoPlayer stream={stream} isCameraOn={remoteVideoStates[peerId] ?? true} isMicOn={remoteMicStates[peerId] ?? true} username={peerId} />
            <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-white text-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {peerId}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-4">
        <Controls onLeave={handleLeave} onToggleCamera={handleToggleCamera} onToggleMic={handleToggleMic} />
      </div>
      
    </div>
  );
}
