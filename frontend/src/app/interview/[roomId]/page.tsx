'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVideoStore } from '@/store/useVideoStore';
import { useMedia } from '@/hooks/useMedia';
import { useSocket } from '@/hooks/useSocket';
import { useWebRTC } from '@/hooks/useWebRTC';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { Controls } from '@/components/video/Controls';
import { Loader2 } from 'lucide-react';

export default function InterviewRoom({ params }: { params: Promise<{ roomId: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  
  const unwrappedParams = use(params);
  const roomId = unwrappedParams.roomId;

  const { connectionState, localStream, remoteStreams, participants, remoteVideoStates, remoteMicStates, isCameraOn, isMicOn } = useVideoStore();
  const { error: mediaError } = useMedia();
  // Delay connecting to WebSocket until localStream is acquired so WebRTC has tracks ready
  const { sendMessage } = useSocket(localStream ? roomId : null, action);

  // Initialize WebRTC with the signaling socket
  useWebRTC(sendMessage, roomId);

  const handleLeave = () => {
    sendMessage({ type: 'leave-room', roomId });
    // Cleanup local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
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

  if (!localStream || connectionState === 'Waiting' || connectionState === 'Connecting') {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p className="text-muted-foreground text-lg font-medium animate-pulse">
          {(!localStream) ? 'Acquiring camera and microphone...' : `Joining room ${roomId}...`}
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
              User {peerId.substring(0, 5)}...
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
