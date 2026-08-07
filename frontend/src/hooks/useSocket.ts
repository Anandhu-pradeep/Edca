import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useVideoStore } from '@/store/useVideoStore';

export function useSocket(roomId: string | null, action: string | null = 'join') {
  const socketRef = useRef<WebSocket | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);
  const { setConnectionState, setRemoteVideoState } = useVideoStore();

  useEffect(() => {
    if (!roomId || !accessToken) return;

    // Use environment variable or fallback to localhost
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws/v1/events';
    const ws = new WebSocket(`${WS_URL}?token=${accessToken}`);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnectionState('Connecting');
      
      // Request to create or join the room
      ws.send(JSON.stringify({ type: action === 'create' ? 'create-room' : 'join-room', roomId }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        // Handle native text messages wrapper if needed
        const type = message.type;
        const payload = message.payload;
        
        switch (type) {
          case 'room-joined':
            setConnectionState('Connected');
            window.dispatchEvent(new CustomEvent('webrtc-signal', { detail: message }));
            break;
          case 'room-full':
            setConnectionState('Disconnected');
            alert('Room is full.');
            ws.close();
            if (typeof window !== 'undefined') window.location.href = '/dashboard';
            break;
          case 'room-not-found':
            setConnectionState('Disconnected');
            alert('Room does not exist or has already ended.');
            ws.close();
            if (typeof window !== 'undefined') window.location.href = '/dashboard';
            break;
          case 'user-joined':
            console.log('User joined:', payload.username);
            window.dispatchEvent(new CustomEvent('webrtc-signal', { detail: message }));
            break;
          case 'user-left':
            console.log('User left:', payload.username);
            window.dispatchEvent(new CustomEvent('webrtc-signal', { detail: message }));
            break;
          case 'video-toggle':
            if (payload.username && payload.isCameraOn !== undefined) {
              setRemoteVideoState(payload.username, payload.isCameraOn);
            }
            break;
          case 'audio-toggle':
            if (payload.username && payload.isMicOn !== undefined) {
              useVideoStore.getState().setRemoteMicState(payload.username, payload.isMicOn);
            }
            break;
          case 'offer':
          case 'answer':
          case 'ice-candidate':
            // These will be handled by useWebRTC via event listeners or passed through a callback.
            // A better way is to dispatch a custom event on window for useWebRTC to catch
            window.dispatchEvent(new CustomEvent('webrtc-signal', { detail: message }));
            break;
          default:
            break;
        }
      } catch (err) {
        // If not JSON, e.g. PONG
        if (event.data === 'PONG') {
          // heartbeat
        }
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnectionState('Disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionState('Disconnected');
    };

    // Heartbeat interval
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send('PING');
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'leave-room', roomId }));
        ws.close();
      }
      socketRef.current = null;
    };
  }, [roomId, accessToken, setConnectionState, setRemoteVideoState]);

  const sendMessage = (message: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  };

  return { sendMessage };
}
