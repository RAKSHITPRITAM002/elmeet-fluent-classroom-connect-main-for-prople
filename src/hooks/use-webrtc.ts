import { useState, useEffect, useRef, useCallback } from 'react';
import { WebRTCService, WebRTCState, MediaConstraints } from '@/services/webrtc/webrtcService';

export const useWebRTC = (userId: string, roomId: string) => {
  const [state, setState] = useState<WebRTCState>({
    localStream: null,
    localAudioEnabled: false,
    localVideoEnabled: false,
    peers: new Map(),
    activeSpeakerId: null,
    screenShareStream: null,
    isScreenSharing: false,
    isConnecting: false,
    isConnected: false,
    error: null,
  });

  const webrtcServiceRef = useRef<WebRTCService | null>(null);

  useEffect(() => {
    // Initialize the WebRTC service
    webrtcServiceRef.current = new WebRTCService(userId, roomId);

    // Listen for state changes
    const handleStateChange = (newState: WebRTCState) => {
      setState(newState);
    };

    webrtcServiceRef.current.on('stateChanged', handleStateChange);

    // Clean up on unmount
    return () => {
      if (webrtcServiceRef.current) {
        webrtcServiceRef.current.removeListener('stateChanged', handleStateChange);
        webrtcServiceRef.current.disconnect();
      }
    };
  }, [userId, roomId]);

  // Initialize local media stream
  const initializeLocalStream = useCallback(async (constraints: MediaConstraints = { audio: true, video: true }) => {
    if (!webrtcServiceRef.current) return null;
    return await webrtcServiceRef.current.initializeLocalStream(constraints);
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (!webrtcServiceRef.current) return false;
    return webrtcServiceRef.current.toggleAudio();
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (!webrtcServiceRef.current) return false;
    return webrtcServiceRef.current.toggleVideo();
  }, []);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    if (!webrtcServiceRef.current) return null;
    return await webrtcServiceRef.current.startScreenShare();
  }, []);

  // Stop screen sharing
  const stopScreenShare = useCallback(() => {
    if (!webrtcServiceRef.current) return;
    webrtcServiceRef.current.stopScreenShare();
  }, []);

  // Create a peer connection
  const createPeerConnection = useCallback((peerId: string) => {
    if (!webrtcServiceRef.current) return null;
    return webrtcServiceRef.current.createPeerConnection(peerId);
  }, []);

  // Create an offer
  const createOffer = useCallback(async (peerId: string) => {
    if (!webrtcServiceRef.current) return null;
    return await webrtcServiceRef.current.createOffer(peerId);
  }, []);

  // Handle an offer
  const handleOffer = useCallback(async (peerId: string, offer: RTCSessionDescriptionInit) => {
    if (!webrtcServiceRef.current) return null;
    return await webrtcServiceRef.current.handleOffer(peerId, offer);
  }, []);

  // Handle an answer
  const handleAnswer = useCallback(async (peerId: string, answer: RTCSessionDescriptionInit) => {
    if (!webrtcServiceRef.current) return;
    await webrtcServiceRef.current.handleAnswer(peerId, answer);
  }, []);

  // Add an ICE candidate
  const addIceCandidate = useCallback((peerId: string, candidate: RTCIceCandidate) => {
    if (!webrtcServiceRef.current) return;
    webrtcServiceRef.current.addIceCandidate(peerId, candidate);
  }, []);

  // Send a message
  const sendMessage = useCallback((peerId: string, message: string) => {
    if (!webrtcServiceRef.current) return false;
    return webrtcServiceRef.current.sendMessage(peerId, message);
  }, []);

  // Broadcast a message
  const broadcastMessage = useCallback((message: string) => {
    if (!webrtcServiceRef.current) return;
    webrtcServiceRef.current.broadcastMessage(message);
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    if (!webrtcServiceRef.current) return;
    webrtcServiceRef.current.disconnect();
  }, []);

  return {
    state,
    initializeLocalStream,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    createPeerConnection,
    createOffer,
    handleOffer,
    handleAnswer,
    addIceCandidate,
    sendMessage,
    broadcastMessage,
    disconnect,
  };
};