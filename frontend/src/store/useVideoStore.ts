import { create } from 'zustand';

type ConnectionState = 'Waiting' | 'Connecting' | 'Connected' | 'Disconnected' | 'Reconnecting' | 'Room Ended';

interface VideoState {
  connectionState: ConnectionState;
  isMicOn: boolean;
  isCameraOn: boolean;
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>; // peerId -> stream
  remoteVideoStates: Record<string, boolean>; // peerId -> isCameraOn
  remoteMicStates: Record<string, boolean>; // peerId -> isMicOn
  participants: string[];
  
  setConnectionState: (state: ConnectionState) => void;
  toggleMic: () => void;
  toggleCamera: () => void;
  setLocalStream: (stream: MediaStream | null) => void;
  addRemoteStream: (peerId: string, stream: MediaStream) => void;
  removeRemoteStream: (peerId: string) => void;
  setParticipants: (participants: string[]) => void;
  addParticipant: (participant: string) => void;
  removeParticipant: (participant: string) => void;
  setRemoteVideoState: (peerId: string, isCameraOn: boolean) => void;
  setRemoteMicState: (peerId: string, isMicOn: boolean) => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  connectionState: 'Waiting',
  isMicOn: true,
  isCameraOn: true,
  localStream: null,
  remoteStreams: {},
  remoteVideoStates: {},
  remoteMicStates: {},
  participants: [],

  setConnectionState: (state) => set({ connectionState: state }),
  
  toggleMic: () => set((state) => {
    if (state.localStream) {
      state.localStream.getAudioTracks().forEach(track => {
        track.enabled = !state.isMicOn;
      });
    }
    return { isMicOn: !state.isMicOn };
  }),
  
  toggleCamera: () => set((state) => {
    if (state.localStream) {
      state.localStream.getVideoTracks().forEach(track => {
        track.enabled = !state.isCameraOn;
      });
    }
    return { isCameraOn: !state.isCameraOn };
  }),

  setLocalStream: (stream) => set({ localStream: stream }),
  
  addRemoteStream: (peerId, stream) => set((state) => ({
    remoteStreams: {
      ...state.remoteStreams,
      [peerId]: stream
    }
  })),
  
  removeRemoteStream: (peerId) => set((state) => {
    const newStreams = { ...state.remoteStreams };
    delete newStreams[peerId];
    return { remoteStreams: newStreams };
  }),

  setParticipants: (participants) => set({ participants }),
  
  addParticipant: (participant) => set((state) => ({
    participants: [...state.participants.filter(p => p !== participant), participant]
  })),
  
  removeParticipant: (participant) => set((state) => ({
    participants: state.participants.filter(p => p !== participant)
  })),
  
  setRemoteVideoState: (peerId, isCameraOn) => set((state) => ({
    remoteVideoStates: {
      ...state.remoteVideoStates,
      [peerId]: isCameraOn
    }
  })),
  
  setRemoteMicState: (peerId, isMicOn) => set((state) => ({
    remoteMicStates: {
      ...state.remoteMicStates,
      [peerId]: isMicOn
    }
  }))
}));
