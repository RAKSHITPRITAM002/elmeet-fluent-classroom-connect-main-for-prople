import React from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Mic, MicOff, Video, VideoOff, ScreenShare, PhoneOff,
  MessageSquare, Users, Settings, MoreHorizontal, Hand,
  Share2, CircleDot, Layout, Smile, Grid, UserPlus
} from "lucide-react";

interface MeetingControlsProps {
  audioEnabled: boolean;
  videoEnabled: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  showChat: boolean;
  showParticipants: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleRecording: () => void;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  onRaiseHand: () => void;
  onEndMeeting: () => void;
  onInviteParticipants: () => void;
  onLayoutChange: (layout: 'speaker' | 'gallery' | 'sidebar') => void;
  onOpenSettings: () => void;
}

const MeetingControls: React.FC<MeetingControlsProps> = ({
  audioEnabled,
  videoEnabled,
  isScreenSharing,
  isRecording,
  showChat,
  showParticipants,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleRecording,
  onToggleChat,
  onToggleParticipants,
  onRaiseHand,
  onEndMeeting,
  onInviteParticipants,
  onLayoutChange,
  onOpenSettings,
}) => {
  return (
    <div className="flex items-center justify-between w-full bg-gray-900 bg-opacity-90 px-4 py-2 rounded-lg">
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={audioEnabled ? "default" : "destructive"}
                size="icon"
                onClick={onToggleAudio}
                className="rounded-full"
              >
                {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{audioEnabled ? "Mute" : "Unmute"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={videoEnabled ? "default" : "destructive"}
                size="icon"
                onClick={onToggleVideo}
                className="rounded-full"
              >
                {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{videoEnabled ? "Stop Video" : "Start Video"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isScreenSharing ? "secondary" : "outline"}
                size="icon"
                onClick={onToggleScreenShare}
                className="rounded-full"
              >
                <ScreenShare className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isScreenSharing ? "Stop Sharing" : "Share Screen"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showChat ? "secondary" : "outline"}
                size="icon"
                onClick={onToggleChat}
                className="rounded-full"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Chat</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showParticipants ? "secondary" : "outline"}
                size="icon"
                onClick={onToggleParticipants}
                className="rounded-full"
              >
                <Users className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Participants</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onRaiseHand}
                className="rounded-full"
              >
                <Hand className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Raise Hand</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <Tabs defaultValue="reactions">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="reactions">Reactions</TabsTrigger>
                <TabsTrigger value="layout">Layout</TabsTrigger>
                <TabsTrigger value="more">More</TabsTrigger>
              </TabsList>
              
              <TabsContent value="reactions" className="p-2">
                <div className="grid grid-cols-4 gap-2">
                  <Button variant="outline" size="icon" className="h-10 w-10">👍</Button>
                  <Button variant="outline" size="icon" className="h-10 w-10">👏</Button>
                  <Button variant="outline" size="icon" className="h-10 w-10">❤️</Button>
                  <Button variant="outline" size="icon" className="h-10 w-10">😂</Button>
                  <Button variant="outline" size="icon" className="h-10 w-10">😮</Button>
                  <Button variant="outline" size="icon" className="h-10 w-10">🎉</Button>
                  <Button variant="outline" size="icon" className="h-10 w-10">🤔</Button>
                  <Button variant="outline" size="icon" className="h-10 w-10">😢</Button>
                </div>
              </TabsContent>
              
              <TabsContent value="layout" className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => onLayoutChange('speaker')}
                >
                  <Layout className="h-4 w-4 mr-2" />
                  Speaker View
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => onLayoutChange('gallery')}
                >
                  <Grid className="h-4 w-4 mr-2" />
                  Gallery View
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => onLayoutChange('sidebar')}
                >
                  <Layout className="h-4 w-4 mr-2" />
                  Sidebar View
                </Button>
              </TabsContent>
              
              <TabsContent value="more" className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={onInviteParticipants}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Participants
                </Button>
                <Button 
                  variant={isRecording ? "secondary" : "outline"}
                  className="w-full justify-start"
                  onClick={onToggleRecording}
                >
                  <CircleDot className="h-4 w-4 mr-2" />
                  {isRecording ? "Stop Recording" : "Start Recording"}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={onOpenSettings}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Button
          variant="destructive"
          onClick={onEndMeeting}
          className="rounded-full px-4"
        >
          <PhoneOff className="h-5 w-5 mr-2" />
          End
        </Button>
      </div>
    </div>
  );
};

export default MeetingControls;