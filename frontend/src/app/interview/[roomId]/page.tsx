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
import { Loader2, AlertCircle, Copy, Check, Users, RefreshCw, LayoutTemplate, Rows2 } from 'lucide-react';
import { useRef } from 'react';
import { getCreditBalance, consumeInterviewCredits } from '@/lib/credit';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function InterviewRoom({ params }: { params: Promise<{ roomId: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  
  const unwrappedParams = use(params);
  const roomId = unwrappedParams.roomId;

  // Wait for auth rehydration from IndexedDB before doing anything
  const { isInitializing, isAuthenticated, activeOrganization } = useAuthStore();

  const { connectionState, localStream, remoteStreams, participants, remoteVideoStates, remoteMicStates, isCameraOn, isMicOn } = useVideoStore();
  const { error: mediaError } = useMedia();
  // Delay connecting to WebSocket until localStream is acquired so WebRTC has tracks ready
  const { sendMessage } = useSocket(localStream ? roomId : null, action);

  // Initialize WebRTC with the signaling socket
  useWebRTC(sendMessage, roomId);
  
  const interviewIdRef = useRef<string | null>(null);
  const [hasSufficientCredits, setHasSufficientCredits] = useState<boolean | null>(null);
  const [isOrgInterview, setIsOrgInterview] = useState<boolean>(false);

  // Responsive video call layout state
  const [layoutMode, setLayoutMode] = useState<'pip' | 'split'>('pip');
  const [pipSwapped, setPipSwapped] = useState<boolean>(false);
  const [objectFit, setObjectFit] = useState<'cover' | 'contain'>('cover');
  const [copied, setCopied] = useState<boolean>(false);
  const [isPortrait, setIsPortrait] = useState<boolean>(false);

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth || window.innerWidth < 768);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    toast.success("Room code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    // Wait for auth to rehydrate from IndexedDB before calling API.
    // Without this guard, on page refresh accessToken is null → 401 → logout.
    if (isInitializing) return;
    if (!isAuthenticated) {
      router.replace('/sign?view=login');
      return;
    }

    let mounted = true;

    const checkInterviewAndCredits = async () => {
      try {
        const { axiosInstance } = await import('@/lib/axios');
        let orgManaged = !!activeOrganization;

        // Check if the interview was already scheduled in DB for this roomId
        try {
          const res = await axiosInstance.get(`/interviews/room/${roomId}`);
          if (res.data?.data) {
            interviewIdRef.current = res.data.data.id;
            if (res.data.data.isOrgInterview) {
              orgManaged = true;
            }
          }
        } catch {
          // Normal ad-hoc interview room or not yet in DB
        }

        if (!mounted) return;

        if (orgManaged) {
          // Organization controls all credits! Students do not require personal credits.
          setIsOrgInterview(true);
          setHasSufficientCredits(true);
          return;
        }

        // For non-organization personal interviews, verify personal wallet credits
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
          if (mounted) setHasSufficientCredits(false);
        });
      } catch (err) {
        console.error("Failed to verify interview or credits", err);
        if (mounted) {
          if (activeOrganization) {
            setIsOrgInterview(true);
            setHasSufficientCredits(true);
          } else {
            setHasSufficientCredits(false);
          }
        }
      }
    };

    checkInterviewAndCredits();

    return () => { mounted = false; };
  }, [isInitializing, isAuthenticated, router, roomId, activeOrganization]);

  useEffect(() => {
    // Record interview start in DB only if not already pre-created
    let mounted = true;
    if (hasSufficientCredits === true && !interviewIdRef.current) {
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
            // Deduct credits after successful completion ONLY for individual interviews
            // Organization interviews are paid upfront by the organization wallet!
            if (interviewIdRef.current && !isOrgInterview && !activeOrganization) {
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
      <div className="flex h-[100dvh] items-center justify-center bg-background p-4">
        <div className="text-center p-8 bg-destructive/10 rounded-2xl max-w-md w-full">
          <p className="text-destructive font-semibold mb-4">Media Error</p>
          <p className="text-muted-foreground">{mediaError}</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="mt-6 px-4 py-2 bg-background border border-border rounded-lg hover:bg-secondary transition-colors cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (hasSufficientCredits === false) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-background p-4">
        <div className="text-center p-8 bg-destructive/10 rounded-2xl max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-semibold mb-2">Insufficient Credits</p>
          <p className="text-muted-foreground mb-6">You need at least 10 credits to start an interview.</p>
          <div className="flex gap-4 justify-center">
              <Link href="/dashboard">
                <button className="px-4 py-2 bg-background border border-border rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                  Dashboard
                </button>
              </Link>
              <Link href="/credits">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
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
      <div className="flex h-[100dvh] flex-col items-center justify-center bg-background p-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p className="text-muted-foreground text-base sm:text-lg font-medium animate-pulse text-center">
          {isInitializing ? 'Restoring session...' : hasSufficientCredits === null ? 'Checking credit balance...' : (!localStream) ? 'Acquiring camera and microphone...' : `Joining room ${roomId}...`}
        </p>
      </div>
    );
  }

  const remoteEntries = Object.entries(remoteStreams);
  const totalVideos = 1 + remoteEntries.length;

  return (
    <div className="relative h-[100dvh] min-h-[100dvh] w-full bg-background overflow-hidden flex flex-col select-none">
      
      {/* Top Header Bar */}
      <div className="absolute top-3 sm:top-5 left-3 sm:left-6 right-3 sm:right-6 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: Room Badge & Participant Count */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={handleCopyRoomId}
            className="px-3 py-1.5 bg-background/80 dark:bg-card/80 hover:bg-secondary text-foreground backdrop-blur-md rounded-xl border border-border/50 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            title="Click to copy room code"
          >
            <span>Room: <strong className="text-blue-500 font-mono tracking-wider">{roomId}</strong></span>
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
          
          {participants.length > 0 && (
            <div className="px-2.5 py-1.5 bg-background/80 dark:bg-card/80 backdrop-blur-md rounded-xl border border-border/50 text-xs font-medium text-muted-foreground hidden sm:flex items-center gap-1 shadow-md">
              <Users className="w-3.5 h-3.5" />
              <span>{participants.length}</span>
            </div>
          )}
        </div>

        {/* Right: Quick View Switcher on 2-person calls */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {totalVideos === 2 && (
            <button
              onClick={() => setLayoutMode(layoutMode === 'pip' ? 'split' : 'pip')}
              className="px-2.5 py-1.5 bg-background/80 dark:bg-card/80 hover:bg-secondary text-foreground backdrop-blur-md rounded-xl border border-border/50 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              title={layoutMode === 'pip' ? "Switch to Split View" : "Switch to Picture-in-Picture"}
            >
              {layoutMode === 'pip' ? <Rows2 className="w-3.5 h-3.5 text-blue-500" /> : <LayoutTemplate className="w-3.5 h-3.5 text-blue-500" />}
              <span className="hidden sm:inline">{layoutMode === 'pip' ? "Split View" : "PiP View"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Video Arena */}
      <div className="flex-1 w-full h-full max-w-7xl mx-auto flex items-center justify-center p-2 sm:p-4 md:p-6 pt-14 sm:pt-16 pb-20 sm:pb-24">
        
        {/* Case 1: Only Local User (Waiting for peer) */}
        {totalVideos === 1 && (
          <div className="relative w-full h-full max-w-3xl mx-auto flex flex-col items-center justify-center">
            <div className="relative w-full aspect-video max-h-[65vh] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-border/20 bg-slate-900">
              <VideoPlayer 
                stream={localStream} 
                isLocal 
                isCameraOn={isCameraOn} 
                isMicOn={isMicOn} 
                username="You" 
                objectFit={objectFit}
              />
              <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-xl text-white text-xs sm:text-sm font-medium">
                You (Waiting for peer)
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center gap-3 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Share room code to invite participant: <span className="font-mono font-bold text-foreground bg-secondary/80 px-2.5 py-1 rounded-md">{roomId}</span>
              </p>
              <button 
                onClick={handleCopyRoomId}
                className="px-3.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy Code"}
              </button>
            </div>
          </div>
        )}

        {/* Case 2: Exactly 2 Participants (1-on-1 Interview) */}
        {totalVideos === 2 && (() => {
          const [peerId, remoteStream] = remoteEntries[0];

          // Subcase 2A: Picture-in-Picture mode (Default for mobile portrait)
          if (layoutMode === 'pip') {
            return (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Main Hero Video Feed */}
                <div className="w-full h-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-border/20 bg-slate-950 relative">
                  <VideoPlayer
                    stream={pipSwapped ? localStream : remoteStream}
                    isLocal={pipSwapped}
                    isCameraOn={pipSwapped ? isCameraOn : (remoteVideoStates[peerId] ?? true)}
                    isMicOn={pipSwapped ? isMicOn : (remoteMicStates[peerId] ?? true)}
                    username={pipSwapped ? 'You' : peerId}
                    objectFit={objectFit}
                  />
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-xl text-white text-xs sm:text-sm font-medium flex items-center gap-2">
                    {!pipSwapped && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                    {pipSwapped ? 'You' : peerId}
                  </div>
                </div>

                {/* Floating Picture-in-Picture Card */}
                <div
                  onClick={() => setPipSwapped(!pipSwapped)}
                  className="absolute bottom-16 sm:bottom-24 right-3 sm:right-6 w-28 h-40 sm:w-36 sm:h-52 md:w-48 md:h-64 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 z-20 cursor-pointer transition-all hover:scale-105 active:scale-95 bg-slate-900 group"
                  title="Click to swap views"
                >
                  <VideoPlayer
                    stream={pipSwapped ? remoteStream : localStream}
                    isLocal={!pipSwapped}
                    isCameraOn={pipSwapped ? (remoteVideoStates[peerId] ?? true) : isCameraOn}
                    isMicOn={pipSwapped ? (remoteMicStates[peerId] ?? true) : isMicOn}
                    username={pipSwapped ? peerId : 'You'}
                    objectFit="cover"
                  />
                  <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-md rounded-lg text-white text-[10px] font-medium flex items-center justify-between">
                    <span className="truncate">{pipSwapped ? peerId : 'You'}</span>
                    <RefreshCw className="w-2.5 h-2.5 text-blue-400 group-hover:rotate-180 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            );
          }

          // Subcase 2B: Split View mode (Stacked vertically in portrait, Side-by-side in landscape)
          return (
            <div className={cn(
              "w-full h-full gap-3 sm:gap-4",
              isPortrait ? "flex flex-col" : "grid grid-cols-2"
            )}>
              {/* Remote Video */}
              <div className="relative flex-1 w-full h-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-border/20 bg-slate-900">
                <VideoPlayer
                  stream={remoteStream}
                  isCameraOn={remoteVideoStates[peerId] ?? true}
                  isMicOn={remoteMicStates[peerId] ?? true}
                  username={peerId}
                  objectFit={objectFit}
                />
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-xl text-white text-xs font-medium flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {peerId}
                </div>
              </div>

              {/* Local Video */}
              <div className="relative flex-1 w-full h-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-border/20 bg-slate-900">
                <VideoPlayer
                  stream={localStream}
                  isLocal
                  isCameraOn={isCameraOn}
                  isMicOn={isMicOn}
                  username="You"
                  objectFit={objectFit}
                />
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-xl text-white text-xs font-medium">
                  You
                </div>
              </div>
            </div>
          );
        })()}

        {/* Case 3: 3 or more participants */}
        {totalVideos >= 3 && (
          <div className={cn(
            "w-full h-full max-h-[75vh] overflow-y-auto gap-3 sm:gap-4 p-1",
            isPortrait ? "grid grid-cols-1 sm:grid-cols-2" : "grid grid-cols-2 lg:grid-cols-3"
          )}>
            {/* Local Video */}
            <div className="relative w-full aspect-video sm:aspect-auto sm:h-full min-h-[180px] rounded-2xl overflow-hidden shadow-2xl border border-border/20 bg-slate-900">
              <VideoPlayer 
                stream={localStream} 
                isLocal 
                isCameraOn={isCameraOn} 
                isMicOn={isMicOn} 
                username="You" 
                objectFit={objectFit} 
              />
              <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-white text-xs">
                You
              </div>
            </div>

            {/* Remote Videos */}
            {remoteEntries.map(([peerId, stream]) => (
              <div key={peerId} className="relative w-full aspect-video sm:aspect-auto sm:h-full min-h-[180px] rounded-2xl overflow-hidden shadow-2xl border border-border/20 bg-slate-900 animate-in zoom-in-95 duration-500">
                <VideoPlayer 
                  stream={stream} 
                  isCameraOn={remoteVideoStates[peerId] ?? true} 
                  isMicOn={remoteMicStates[peerId] ?? true} 
                  username={peerId} 
                  objectFit={objectFit} 
                />
                <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-white text-xs flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {peerId}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Floating Controls Bar at Bottom */}
      <div className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 w-auto max-w-[95vw] px-2">
        <Controls 
          onLeave={handleLeave} 
          onToggleCamera={handleToggleCamera} 
          onToggleMic={handleToggleMic}
          layoutMode={layoutMode}
          onToggleLayout={() => setLayoutMode(layoutMode === 'pip' ? 'split' : 'pip')}
          showLayoutToggle={totalVideos === 2}
          objectFit={objectFit}
          onToggleFit={() => setObjectFit(objectFit === 'cover' ? 'contain' : 'cover')}
        />
      </div>
      
    </div>
  );
}
