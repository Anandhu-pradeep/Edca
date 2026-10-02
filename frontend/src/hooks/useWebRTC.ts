import { useEffect, useRef, useCallback } from 'react';
import { useVideoStore } from '@/store/useVideoStore';

const STUN_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

export function useWebRTC(sendMessage: (msg: any) => void, roomId: string) {
  const peersRef = useRef<{ [peerId: string]: RTCPeerConnection }>({});
  const pendingCandidates = useRef<{ [peerId: string]: RTCIceCandidateInit[] }>({});
  const { localStream, addRemoteStream, removeRemoteStream, addParticipant, removeParticipant, setParticipants } = useVideoStore();

  const createPeerConnection = useCallback((peerId: string) => {
    // Configurable TURN via process.env if available
    const iceServers = [...STUN_SERVERS];
    const turnUrl = process.env.NEXT_PUBLIC_TURN_URL;
    const turnUser = process.env.NEXT_PUBLIC_TURN_USERNAME || '';
    const turnPass = process.env.NEXT_PUBLIC_TURN_PASSWORD || '';
    if (turnUrl) {
      // Add TURN over UDP
      iceServers.push({ urls: turnUrl, username: turnUser, credential: turnPass });
      // Add TURN over TCP port 443 as fallback for strict NAT/firewalls
      const turnHost = turnUrl.replace(/^turn:/, '').replace(/:\d+$/, '');
      iceServers.push({ urls: `turn:${turnHost}:443?transport=tcp`, username: turnUser, credential: turnPass });
      iceServers.push({ urls: `turns:${turnHost}:443`, username: turnUser, credential: turnPass });
    }

    const pc = new RTCPeerConnection({ iceServers });

    // Add local tracks to the connection
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendMessage({
          type: 'ice-candidate',
          target: peerId,
          data: event.candidate
        });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        addRemoteStream(peerId, event.streams[0]);
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        removeRemoteStream(peerId);
        removeParticipant(peerId);
        pc.close();
        delete peersRef.current[peerId];
      }
    };

    peersRef.current[peerId] = pc;
    return pc;
  }, [localStream, sendMessage, addRemoteStream, removeRemoteStream, removeParticipant]);

  const handleUserJoined = useCallback(async (peerId: string) => {
    console.log('Creating offer for:', peerId);
    const pc = createPeerConnection(peerId);
    addParticipant(peerId);
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendMessage({
        type: 'offer',
        target: peerId,
        data: pc.localDescription
      });
    } catch (err) {
      console.error('Error creating offer:', err);
    }
  }, [createPeerConnection, sendMessage, addParticipant]);

  const handleOffer = useCallback(async (peerId: string, offer: RTCSessionDescriptionInit) => {
    const pc = createPeerConnection(peerId);
    addParticipant(peerId);
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendMessage({
        type: 'answer',
        target: peerId,
        data: pc.localDescription
      });
      if (pendingCandidates.current[peerId]) {
        for (const candidate of pendingCandidates.current[peerId]) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        delete pendingCandidates.current[peerId];
      }
    } catch (err) {
      console.error('Error handling offer:', err);
    }
  }, [createPeerConnection, sendMessage, addParticipant]);

  const handleAnswer = useCallback(async (peerId: string, answer: RTCSessionDescriptionInit) => {
    const pc = peersRef.current[peerId];
    if (pc) {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        if (pendingCandidates.current[peerId]) {
          for (const candidate of pendingCandidates.current[peerId]) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
          delete pendingCandidates.current[peerId];
        }
      } catch (err) {
        console.error('Error handling answer:', err);
      }
    }
  }, []);

  const handleIceCandidate = useCallback(async (peerId: string, candidate: RTCIceCandidateInit) => {
    const pc = peersRef.current[peerId];
    if (pc && pc.remoteDescription) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    } else {
      if (!pendingCandidates.current[peerId]) {
        pendingCandidates.current[peerId] = [];
      }
      pendingCandidates.current[peerId].push(candidate);
    }
  }, []);

  useEffect(() => {
    const handleSignal = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const { type, payload } = customEvent.detail;

      if (type === 'room-joined') {
        const participants: string[] = payload.participants;
        // When we join, we create offers to everyone already in the room
        setParticipants(participants);
        // Note: It's better for the new joiner to wait for offers, but typically the existing members create offers.
        // Wait, the logic typically is: existing user gets 'user-joined', and THEY send offer.
        // Or the new user gets 'room-joined' and sends offers to existing users. 
        // We will make the existing users send the offer when they receive 'user-joined'.
      } else if (type === 'user-joined') {
        handleUserJoined(payload.username);
      } else if (type === 'user-left') {
        const peerId = payload.username;
        if (peersRef.current[peerId]) {
          peersRef.current[peerId].close();
          delete peersRef.current[peerId];
        }
        removeRemoteStream(peerId);
        removeParticipant(peerId);
      } else if (type === 'offer') {
        handleOffer(payload.sender, payload.data);
      } else if (type === 'answer') {
        handleAnswer(payload.sender, payload.data);
      } else if (type === 'ice-candidate') {
        handleIceCandidate(payload.sender, payload.data);
      }
    };

    window.addEventListener('webrtc-signal', handleSignal);
    return () => window.removeEventListener('webrtc-signal', handleSignal);
  }, [handleUserJoined, handleOffer, handleAnswer, handleIceCandidate, removeRemoteStream, removeParticipant, setParticipants]);

  // Clean up all peers on unmount
  useEffect(() => {
    return () => {
      Object.values(peersRef.current).forEach((pc) => pc.close());
      peersRef.current = {};
    };
  }, []);
}
