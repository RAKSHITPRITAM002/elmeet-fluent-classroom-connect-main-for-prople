import { EventEmitter } from 'events';

export interface MediaConstraints {
  audio: boolean | MediaTrackConstraints;
  video: boolean | MediaTrackConstraints;
}

export interface PeerConnection {
  id: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
  videoTrack?: MediaStreamTrack;
  audioTrack?: MediaStreamTrack;
  dataChannel?: RTCDataChannel;
}

export interface WebRTCState {
  localStream: MediaStream | null;
  localAudioEnabled: boolean;
  localVideoEnabled: boolean;
  peers: Map<string, PeerConnection>;
  activeSpeakerId: string | null;
  screenShareStream: MediaStream | null;
  isScreenSharing: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  error: Error | null;
}

// This is a simplified WebRTC service that would need to be connected to a real signaling server
export class WebRTCService extends EventEmitter {
  private state: WebRTCState = {
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
  };

  private userId: string;
  private roomId: string;
  private peerConnectionConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  constructor(userId: string, roomId: string) {
    super();
    this.userId = userId;
    this.roomId = roomId;
  }

  /**
   * Initialize local media stream
   */
  async initializeLocalStream(constraints: MediaConstraints = { audio: true, video: true }): Promise<MediaStream> {
    try {
      this.state.isConnecting = true;
      this.emit('stateChanged', this.state);

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      this.state.localStream = stream;
      this.state.localAudioEnabled = stream.getAudioTracks().length > 0 && stream.getAudioTracks()[0].enabled;
      this.state.localVideoEnabled = stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled;
      this.state.isConnecting = false;
      this.state.isConnected = true;
      
      this.emit('stateChanged', this.state);
      return stream;
    } catch (error) {
      this.state.isConnecting = false;
      this.state.error = error as Error;
      this.emit('stateChanged', this.state);
      throw error;
    }
  }

  /**
   * Toggle local audio
   */
  toggleAudio(): boolean {
    if (!this.state.localStream) return false;
    
    const audioTracks = this.state.localStream.getAudioTracks();
    if (audioTracks.length === 0) return false;
    
    const enabled = !audioTracks[0].enabled;
    audioTracks[0].enabled = enabled;
    
    this.state.localAudioEnabled = enabled;
    this.emit('stateChanged', this.state);
    
    return enabled;
  }

  /**
   * Toggle local video
   */
  toggleVideo(): boolean {
    if (!this.state.localStream) return false;
    
    const videoTracks = this.state.localStream.getVideoTracks();
    if (videoTracks.length === 0) return false;
    
    const enabled = !videoTracks[0].enabled;
    videoTracks[0].enabled = enabled;
    
    this.state.localVideoEnabled = enabled;
    this.emit('stateChanged', this.state);
    
    return enabled;
  }

  /**
   * Start screen sharing
   */
  async startScreenShare(): Promise<MediaStream | null> {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      
      this.state.screenShareStream = stream;
      this.state.isScreenSharing = true;
      this.emit('stateChanged', this.state);
      
      // Handle the case when user stops screen sharing via the browser UI
      stream.getVideoTracks()[0].onended = () => {
        this.stopScreenShare();
      };
      
      return stream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      return null;
    }
  }

  /**
   * Stop screen sharing
   */
  stopScreenShare(): void {
    if (this.state.screenShareStream) {
      this.state.screenShareStream.getTracks().forEach(track => track.stop());
      this.state.screenShareStream = null;
      this.state.isScreenSharing = false;
      this.emit('stateChanged', this.state);
    }
  }

  /**
   * Create a new peer connection
   */
  createPeerConnection(peerId: string): RTCPeerConnection {
    const peerConnection = new RTCPeerConnection(this.peerConnectionConfig);
    
    // Add local tracks to the peer connection
    if (this.state.localStream) {
      this.state.localStream.getTracks().forEach(track => {
        if (this.state.localStream) {
          peerConnection.addTrack(track, this.state.localStream);
        }
      });
    }
    
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // In a real implementation, this would send the candidate to the peer via signaling server
        this.emit('iceCandidate', {
          peerId,
          candidate: event.candidate,
        });
      }
    };
    
    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      const stream = event.streams[0];
      
      const peer = this.state.peers.get(peerId);
      if (peer) {
        peer.stream = stream;
        
        if (event.track.kind === 'video') {
          peer.videoTrack = event.track;
        } else if (event.track.kind === 'audio') {
          peer.audioTrack = event.track;
          
          // Set up audio level detection for active speaker
          this.detectActiveSpeaker(peerId, event.track);
        }
        
        this.state.peers.set(peerId, peer);
        this.emit('stateChanged', this.state);
      }
    };
    
    // Create a data channel for messaging
    const dataChannel = peerConnection.createDataChannel('messages');
    
    dataChannel.onopen = () => {
      console.log(`Data channel with ${peerId} opened`);
    };
    
    dataChannel.onmessage = (event) => {
      this.emit('dataChannelMessage', {
        peerId,
        message: event.data,
      });
    };
    
    // Store the peer connection
    this.state.peers.set(peerId, {
      id: peerId,
      connection: peerConnection,
      dataChannel,
    });
    
    this.emit('stateChanged', this.state);
    
    return peerConnection;
  }

  /**
   * Handle incoming ICE candidate
   */
  addIceCandidate(peerId: string, candidate: RTCIceCandidate): void {
    const peer = this.state.peers.get(peerId);
    if (peer) {
      peer.connection.addIceCandidate(candidate);
    }
  }

  /**
   * Create an offer
   */
  async createOffer(peerId: string): Promise<RTCSessionDescriptionInit> {
    const peer = this.state.peers.get(peerId);
    if (!peer) {
      throw new Error(`Peer ${peerId} not found`);
    }
    
    const offer = await peer.connection.createOffer();
    await peer.connection.setLocalDescription(offer);
    
    return offer;
  }

  /**
   * Handle incoming offer
   */
  async handleOffer(peerId: string, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    let peer = this.state.peers.get(peerId);
    
    if (!peer) {
      const peerConnection = this.createPeerConnection(peerId);
      peer = this.state.peers.get(peerId);
      
      if (!peer) {
        throw new Error(`Failed to create peer connection for ${peerId}`);
      }
    }
    
    await peer.connection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peer.connection.createAnswer();
    await peer.connection.setLocalDescription(answer);
    
    return answer;
  }

  /**
   * Handle incoming answer
   */
  async handleAnswer(peerId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const peer = this.state.peers.get(peerId);
    if (peer) {
      await peer.connection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  /**
   * Send a message via data channel
   */
  sendMessage(peerId: string, message: string): boolean {
    const peer = this.state.peers.get(peerId);
    if (peer && peer.dataChannel && peer.dataChannel.readyState === 'open') {
      peer.dataChannel.send(message);
      return true;
    }
    return false;
  }

  /**
   * Broadcast a message to all peers
   */
  broadcastMessage(message: string): void {
    this.state.peers.forEach((peer) => {
      if (peer.dataChannel && peer.dataChannel.readyState === 'open') {
        peer.dataChannel.send(message);
      }
    });
  }

  /**
   * Detect active speaker
   */
  private detectActiveSpeaker(peerId: string, audioTrack: MediaStreamTrack): void {
    // This is a simplified implementation
    // In a real app, you would use AudioContext and analyze audio levels
    
    // For now, we'll just set the active speaker randomly for demonstration
    setInterval(() => {
      const shouldBeActiveSpeaker = Math.random() > 0.7;
      
      if (shouldBeActiveSpeaker) {
        this.state.activeSpeakerId = peerId;
        this.emit('stateChanged', this.state);
      } else if (this.state.activeSpeakerId === peerId) {
        this.state.activeSpeakerId = null;
        this.emit('stateChanged', this.state);
      }
    }, 2000);
  }

  /**
   * Clean up and disconnect
   */
  disconnect(): void {
    // Stop local stream
    if (this.state.localStream) {
      this.state.localStream.getTracks().forEach(track => track.stop());
    }
    
    // Stop screen share
    this.stopScreenShare();
    
    // Close all peer connections
    this.state.peers.forEach((peer) => {
      if (peer.dataChannel) {
        peer.dataChannel.close();
      }
      peer.connection.close();
    });
    
    // Reset state
    this.state = {
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
    };
    
    this.emit('stateChanged', this.state);
  }

  /**
   * Get the current state
   */
  getState(): WebRTCState {
    return this.state;
  }
}
