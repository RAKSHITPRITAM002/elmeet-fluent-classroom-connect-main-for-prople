import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Layout from '@/components/Layout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Mic, MicOff, Video, VideoOff, X, Users, MessageSquare, Settings } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useWebRTC } from '@/hooks/use-webrtc';
import BackgroundSelector from '@/components/BackgroundSelector';
import MeetingControls from '@/components/meeting/MeetingControls';
import VideoTile from '@/components/meeting/VideoTile';
import ChatPanel from '@/components/meeting/ChatPanel';
import ParticipantsPanel from '@/components/meeting/ParticipantsPanel';
import ScreenShareView from '@/components/meeting/ScreenShareView';
import WhiteboardView from '@/components/meeting/WhiteboardView';
import { ChatMessage } from '@/components/meeting/ChatPanel';
import { Participant } from '@/components/meeting/ParticipantsPanel';
import { meetingService, Meeting } from '@/services/meeting/meetingService';
const MeetingRoom: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const meetingId = params.id || 'new';
  
  // Meeting state
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isCoHost, setIsCoHost] = useState(false);
  const [isJoining, setIsJoining] = useState(true);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedBackground, setSelectedBackground] = useState<string>('none');
  
  // UI state
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [layout, setLayout] = useState<'speaker' | 'gallery' | 'sidebar'>('gallery');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  
  // Media state
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Participants state
  const [participants, setParticipants] = useState<Participant[]>([]);
  
  // WebRTC state
  const webrtcService = useWebRTC(
    user?.id || 'guest',
    meetingId === 'new' ? uuidv4() : meetingId
  );
  
  // Initialize meeting
  useEffect(() => {
    const initializeMeeting = async () => {
      if (meetingId === 'new') {
        // Creating a new meeting
        if (user) {
          try {
            const newMeeting = await meetingService.createMeeting(user.id, {
              title: `${user.name}'s Meeting`,
            });
            setMeeting(newMeeting);
            setMeetingTitle(newMeeting.title);
            setIsHost(true);
            
            // Redirect to the meeting URL
            navigate(`/meeting/${newMeeting.id}`, { replace: true });
          } catch (error) {
            console.error('Failed to create meeting:', error);
            toast({
              title: 'Failed to create meeting',
              description: 'An error occurred while creating the meeting.',
              variant: 'destructive',
            });
          }
        }
      } else {
        // Joining an existing meeting
        try {
          const existingMeeting = await meetingService.getMeeting(meetingId);
          if (existingMeeting) {
            setMeeting(existingMeeting);
            setMeetingTitle(existingMeeting.title);
            
            // Check if the user is the host
            if (user && existingMeeting.hostId === user.id) {
              setIsHost(true);
            }
          } else {
            toast({
              title: 'Meeting not found',
              description: 'The meeting you are trying to join does not exist.',
              variant: 'destructive',
            });
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Failed to get meeting:', error);
          toast({
            title: 'Failed to join meeting',
            description: 'An error occurred while joining the meeting.',
            variant: 'destructive',
          });
        }
      }
};

    initializeMeeting();
  }, [meetingId, user, navigate, toast]);
  
  // Set initial display name
  useEffect(() => {
    if (user) {
      setDisplayName(user.name);
    }
  }, [user]);
  
  // Initialize WebRTC
  useEffect(() => {
    if (!isJoining && webrtcService) {
      const initializeMedia = async () => {
        try {
          await webrtcService.initializeLocalStream({
            audio: audioEnabled,
            video: videoEnabled,
          });
          
          // Add system message
          addSystemMessage(`${displayName} joined the meeting`);
          
          // Add self to participants
          addParticipant({
            id: user?.id || 'guest',
            name: displayName,
            avatar: user?.avatar,
            isHost,
            isCoHost: false,
            audioEnabled,
  videoEnabled,
            handRaised: false,
            isCurrentUser: true,
          });
        } catch (error) {
          console.error('Failed to initialize media:', error);
          toast({
            title: 'Media access failed',
            description: 'Could not access your camera or microphone. Please check your permissions.',
            variant: 'destructive',
          });
        }
};

      initializeMedia();
    }
    
    return () => {
      if (webrtcService) {
        webrtcService.disconnect();
      }
};
  }, [isJoining, webrtcService, audioEnabled, videoEnabled, displayName, isHost, user, toast]);

  // Handle WebRTC state changes
  useEffect(() => {
    if (webrtcService) {
      const { state } = webrtcService;
      
      // Update audio/video state
      setAudioEnabled(state.localAudioEnabled);
      setVideoEnabled(state.localVideoEnabled);
      
      // Update participants based on peers
      state.peers.forEach((peer, peerId) => {
        if (peer.stream) {
          // Check if participant already exists
          const existingParticipant = participants.find(p => p.id === peerId);
          
          if (!existingParticipant) {
            // Add new participant
            addParticipant({
              id: peerId,
              name: `Participant ${participants.length + 1}`,
              isHost: false,
              isCoHost: false,
              audioEnabled: !!peer.audioTrack?.enabled,
              videoEnabled: !!peer.videoTrack?.enabled,
              handRaised: false,
              isCurrentUser: false,
            });
          } else {
            // Update existing participant
            updateParticipant(peerId, {
              audioEnabled: !!peer.audioTrack?.enabled,
              videoEnabled: !!peer.videoTrack?.enabled,
            });
          }
        }
      });
    }
  }, [webrtcService, participants]);
  
  // Helper functions
  const addSystemMessage = (content: string) => {
    const newMessage: ChatMessage = {
      id: uuidv4(),
      senderId: 'system',
      senderName: 'System',
      content,
      timestamp: new Date(),
      isSystem: true,
};

    setMessages(prev => [...prev, newMessage]);
  };
  
  const addChatMessage = (content: string, attachment?: File) => {
    if (!user) return;
    
    const newMessage: ChatMessage = {
      id: uuidv4(),
      senderId: user.id,
      senderName: displayName,
      senderAvatar: user.avatar,
      content,
      timestamp: new Date(),
    };
    
    if (attachment) {
      // In a real app, you would upload the file to a server
      // and get a URL back. For now, we'll create a data URL.
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        
        newMessage.attachment = {
          type: attachment.type.startsWith('image/') ? 'image' : 'file',
          url: dataUrl,
          name: attachment.name,
          size: attachment.size,
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        // Broadcast message to all participants
        if (webrtcService) {
          webrtcService.broadcastMessage(JSON.stringify(newMessage));
        }
      };
      
      reader.readAsDataURL(attachment);
    } else {
      setMessages(prev => [...prev, newMessage]);
      
      // Broadcast message to all participants
      if (webrtcService) {
        webrtcService.broadcastMessage(JSON.stringify(newMessage));
      }
    }
  };
  
  const addParticipant = (participant: Participant) => {
    setParticipants(prev => {
      // Check if participant already exists
      const exists = prev.some(p => p.id === participant.id);
      if (exists) return prev;
      
      return [...prev, participant];
    });
  };
  
  const updateParticipant = (id: string, updates: Partial<Participant>) => {
    setParticipants(prev => 
      prev.map(p => p.id === id ? { ...p, ...updates } : p)
    );
  };
  
  const removeParticipant = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
    addSystemMessage(`${participants.find(p => p.id === id)?.name || 'A participant'} left the meeting`);
  };
  
  // Event handlers
  const handleJoinMeeting = async () => {
    if (!displayName.trim()) {
      toast({
        title: 'Display name required',
        description: 'Please enter your name to join the meeting.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsJoining(false);
  };
  
  const handleToggleAudio = () => {
    const newState = webrtcService.toggleAudio();
    setAudioEnabled(newState);
    
    // Update participant
    updateParticipant(user?.id || 'guest', { audioEnabled: newState });
  };
  
  const handleToggleVideo = () => {
    const newState = webrtcService.toggleVideo();
    setVideoEnabled(newState);
    
    // Update participant
    updateParticipant(user?.id || 'guest', { videoEnabled: newState });
  };
  
  const handleToggleScreenShare = async () => {
    const { state } = webrtcService;
    
    if (state.isScreenSharing) {
      webrtcService.stopScreenShare();
      addSystemMessage(`${displayName} stopped sharing screen`);
    } else {
      const stream = await webrtcService.startScreenShare();
      if (stream) {
        addSystemMessage(`${displayName} started sharing screen`);
      }
    }
  };
  
  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      addSystemMessage(`${displayName} started recording the meeting`);
      toast({
        title: 'Recording started',
        description: 'The meeting is now being recorded.',
      });
    } else {
      addSystemMessage(`${displayName} stopped recording the meeting`);
      toast({
        title: 'Recording stopped',
        description: 'The recording has been saved.',
      });
    }
  };
  
  const handleRaiseHand = () => {
    setHandRaised(!handRaised);
    
    // Update participant
    updateParticipant(user?.id || 'guest', { handRaised: !handRaised });
    
    if (!handRaised) {
      addSystemMessage(`${displayName} raised hand`);
    } else {
      addSystemMessage(`${displayName} lowered hand`);
    }
  };
  
  const handleEndMeeting = async () => {
    if (isHost) {
      // End meeting for all participants
      if (meeting) {
        try {
          await meetingService.endMeeting(meeting.id);
          addSystemMessage(`${displayName} ended the meeting for all participants`);
        } catch (error) {
          console.error('Failed to end meeting:', error);
        }
      }
    }
    
    // Disconnect WebRTC
    webrtcService.disconnect();
    
    // Navigate back to dashboard
    navigate('/dashboard');
  };
  
  const handleInviteParticipants = () => {
    if (meeting) {
      const meetingLink = meetingService.generateMeetingLink(meeting.id);
      
      // Copy to clipboard
      navigator.clipboard.writeText(meetingLink).then(() => {
        toast({
          title: 'Meeting link copied',
          description: 'Share this link with others to invite them to the meeting.',
        });
      });
    }
  };
  
  const handleMuteParticipant = (participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    
    if (participant) {
      // In a real app, you would send a message to the participant
      // to mute/unmute their audio
      
      updateParticipant(participantId, { audioEnabled: !participant.audioEnabled });
      
      if (participant.audioEnabled) {
        addSystemMessage(`${participant.name} was muted by ${displayName}`);
      } else {
        addSystemMessage(`${displayName} requested ${participant.name} to unmute`);
      }
    }
  };
  
  const handleStopVideo = (participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    
    if (participant) {
      // In a real app, you would send a message to the participant
      // to stop/start their video
      
      updateParticipant(participantId, { videoEnabled: !participant.videoEnabled });
      
      if (participant.videoEnabled) {
        addSystemMessage(`${participant.name}'s video was stopped by ${displayName}`);
      } else {
        addSystemMessage(`${displayName} requested ${participant.name} to start video`);
      }
    }
  };
  
  const handleMakeHost = (participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    
    if (participant && isHost) {
      // Update host status
      updateParticipant(participantId, { isHost: true, isCoHost: false });
      updateParticipant(user?.id || 'guest', { isHost: false });
      
      setIsHost(false);
      addSystemMessage(`${displayName} made ${participant.name} the host`);
    }
  };
  
  const handleMakeCoHost = (participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    
    if (participant && isHost) {
      // Update co-host status
      updateParticipant(participantId, { isCoHost: true });
      
      addSystemMessage(`${displayName} made ${participant.name} a co-host`);
    }
  };
  
  const handleRemoveParticipant = (participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    
    if (participant && isHost) {
      // In a real app, you would send a message to the participant
      // to remove them from the meeting
      
      removeParticipant(participantId);
      addSystemMessage(`${participant.name} was removed from the meeting by ${displayName}`);
    }
  };
  
  const handleSaveWhiteboard = (dataUrl: string) => {
    // In a real app, you would save the whiteboard to a server
    // For now, we'll just download it
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `whiteboard-${new Date().toISOString()}.png`;
    link.click();
    
    toast({
      title: 'Whiteboard saved',
      description: 'The whiteboard has been saved to your device.',
    });
  };
  
  // Render
  if (isJoining) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Join Meeting</CardTitle>
              <CardDescription>
                {meetingTitle || 'Enter your details to join the meeting'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Your Name</Label>
                  <Input
                    id="displayName"
                    placeholder="Enter your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
                
                <Tabs defaultValue="video">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="video">Camera & Mic</TabsTrigger>
                    <TabsTrigger value="background">Background</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="video" className="space-y-4">
                    <div className="aspect-video bg-gray-100 rounded-md overflow-hidden relative">
                      {/* Preview video will go here */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-gray-500">Camera preview</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-center space-x-2">
                      <Button
                        variant={audioEnabled ? "default" : "outline"}
                        size="icon"
                        onClick={() => setAudioEnabled(!audioEnabled)}
                      >
                        {audioEnabled ? <Mic /> : <MicOff />}
                      </Button>
                      <Button
                        variant={videoEnabled ? "default" : "outline"}
                        size="icon"
                        onClick={() => setVideoEnabled(!videoEnabled)}
                      >
                        {videoEnabled ? <Video /> : <VideoOff />}
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="background">
                    <BackgroundSelector />
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={handleJoinMeeting}
              >
                Join Meeting
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout fullWidth>
      <div className="flex flex-col h-screen">
        {/* Meeting header */}
        <div className="bg-white border-b p-2 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium">{meetingTitle}</h1>
            {meeting && (
              <p className="text-sm text-gray-500">
                Meeting ID: {meeting.id}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {isRecording && (
              <div className="flex items-center space-x-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                <span className="h-2 w-2 bg-red-600 rounded-full animate-pulse"></span>
                <span>Recording</span>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleInviteParticipants}
            >
              Invite
            </Button>
          </div>
        </div>
        
        {/* Meeting content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main content */}
          <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
            {/* Video grid */}
            <div className="flex-1 p-4 overflow-auto">
              {webrtcService.state.isScreenSharing ? (
                <ScreenShareView
                  stream={webrtcService.state.screenShareStream!}
                  sharerName={displayName}
                  isFullScreen={isFullScreen}
                  onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
                  allowAnnotation={true}
                />
              ) : (
                <div className={`
                  grid gap-4 h-full
                  ${layout === 'gallery' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : ''}
                  ${layout === 'speaker' ? 'grid-cols-1' : ''}
                  ${layout === 'sidebar' ? 'grid-cols-1 lg:grid-cols-[1fr_300px]' : ''}
                `}>
                  {/* Local video */}
                  <VideoTile
                    stream={webrtcService.state.localStream || undefined}
                    displayName={displayName}
                    audioEnabled={audioEnabled}
                    videoEnabled={videoEnabled}
                    isLocal={true}
                    isActive={false}
                    isPinned={false}
                    avatarUrl={user?.avatar}
                    backgroundUrl={selectedBackground !== 'none' ? selectedBackground : undefined}
                    size={layout === 'speaker' ? 'large' : 'medium'}
                  />
                  
                  {/* Remote videos */}
                  {Array.from(webrtcService.state.peers.entries()).map(([peerId, peer]) => {
                    const participant = participants.find(p => p.id === peerId);
                    
                    return participant ? (
                      <VideoTile
                        key={peerId}
                        stream={peer.stream}
                        displayName={participant.name}
                        audioEnabled={participant.audioEnabled}
                        videoEnabled={participant.videoEnabled}
                        isLocal={false}
                        isActive={webrtcService.state.activeSpeakerId === peerId}
                        isPinned={false}
                        size={layout === 'speaker' && webrtcService.state.activeSpeakerId === peerId ? 'large' : 'medium'}
                        onPin={() => {
                          // Pin/unpin logic
                        }}
                      />
                    ) : null;
                  })}
                </div>
              )}
            </div>
            
            {/* Meeting controls */}
            <div className="p-4 flex justify-center">
              <MeetingControls
                audioEnabled={audioEnabled}
                videoEnabled={videoEnabled}
                isScreenSharing={webrtcService.state.isScreenSharing}
                isRecording={isRecording}
                showChat={showChat}
                showParticipants={showParticipants}
                onToggleAudio={handleToggleAudio}
                onToggleVideo={handleToggleVideo}
                onToggleScreenShare={handleToggleScreenShare}
                onToggleRecording={handleToggleRecording}
                onToggleChat={() => setShowChat(!showChat)}
                onToggleParticipants={() => setShowParticipants(!showParticipants)}
                onRaiseHand={handleRaiseHand}
                onEndMeeting={handleEndMeeting}
                onInviteParticipants={handleInviteParticipants}
                onLayoutChange={setLayout}
                onOpenSettings={() => setShowSettings(true)}
              />
            </div>
          </div>
          
          {/* Side panels */}
          {showChat && (
            <div className="w-80">
              <ChatPanel
                messages={messages}
                onSendMessage={addChatMessage}
                onClose={() => setShowChat(false)}
                currentUserId={user?.id || 'guest'}
                participants={participants.map(p => ({
                  id: p.id,
                  name: p.name,
                  avatar: p.avatar,
                }))}
              />
            </div>
          )}
          
          {showParticipants && (
            <div className="w-80">
              <ParticipantsPanel
                participants={participants}
                onClose={() => setShowParticipants(false)}
                onMuteParticipant={handleMuteParticipant}
                onStopVideo={handleStopVideo}
                onMakeHost={handleMakeHost}
                onMakeCoHost={handleMakeCoHost}
                onRemoveParticipant={handleRemoveParticipant}
                onInviteParticipants={handleInviteParticipants}
                isCurrentUserHost={isHost}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Settings dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Meeting Settings</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="devices">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="devices">Devices</TabsTrigger>
              <TabsTrigger value="audio">Audio</TabsTrigger>
              <TabsTrigger value="video">Video</TabsTrigger>
            </TabsList>
            
            <TabsContent value="devices" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="camera">Camera</Label>
                <select
                  id="camera"
                  className="w-full p-2 border rounded-md"
                >
                  <option>Default Camera</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="microphone">Microphone</Label>
                <select
                  id="microphone"
                  className="w-full p-2 border rounded-md"
                >
                  <option>Default Microphone</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="speaker">Speaker</Label>
                <select
                  id="speaker"
                  className="w-full p-2 border rounded-md"
                >
                  <option>Default Speaker</option>
                </select>
              </div>
            </TabsContent>
            
            <TabsContent value="audio" className="space-y-4">
              <div className="space-y-2">
                <Label>Noise Suppression</Label>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="noiseSuppression" />
                  <Label htmlFor="noiseSuppression">Enable noise suppression</Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Echo Cancellation</Label>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="echoCancellation" />
                  <Label htmlFor="echoCancellation">Enable echo cancellation</Label>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="video" className="space-y-4">
              <div className="space-y-2">
                <Label>Video Quality</Label>
                <select
                  className="w-full p-2 border rounded-md"
                >
                  <option>Standard (360p)</option>
                  <option>High (720p)</option>
                  <option>HD (1080p)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>Background</Label>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setShowSettings(false);
                    // Open background selector
                  }}
                >
                  Change Background
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button onClick={() => setShowSettings(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default MeetingRoom;
