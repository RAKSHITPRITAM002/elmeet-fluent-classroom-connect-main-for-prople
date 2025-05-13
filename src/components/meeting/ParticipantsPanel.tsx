import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  X, Search, MoreHorizontal, MicOff, VideoOff, 
  Hand, Crown, UserPlus, Ban
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
  isCoHost: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  handRaised: boolean;
  isCurrentUser: boolean;
}

interface ParticipantsPanelProps {
  participants: Participant[];
  onClose: () => void;
  onMuteParticipant: (participantId: string) => void;
  onStopVideo: (participantId: string) => void;
  onMakeHost: (participantId: string) => void;
  onMakeCoHost: (participantId: string) => void;
  onRemoveParticipant: (participantId: string) => void;
  onInviteParticipants: () => void;
  isCurrentUserHost: boolean;
}

const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({
  participants,
  onClose,
  onMuteParticipant,
  onStopVideo,
  onMakeHost,
  onMakeCoHost,
  onRemoveParticipant,
  onInviteParticipants,
  isCurrentUserHost,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredParticipants = participants.filter(
    (p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const hosts = filteredParticipants.filter((p) => p.isHost);
  const coHosts = filteredParticipants.filter((p) => p.isCoHost && !p.isHost);
  const regularParticipants = filteredParticipants.filter((p) => !p.isHost && !p.isCoHost);
  const participantsWithRaisedHands = filteredParticipants.filter((p) => p.handRaised);

  return (
    <div className="flex flex-col h-full border-l bg-white">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-medium">Participants ({participants.length})</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search participants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {participantsWithRaisedHands.length > 0 && (
          <div className="p-3">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Raised Hands</h4>
            {participantsWithRaisedHands.map((participant) => (
              <ParticipantItem
                key={`hand-${participant.id}`}
                participant={participant}
                onMuteParticipant={onMuteParticipant}
                onStopVideo={onStopVideo}
                onMakeHost={onMakeHost}
                onMakeCoHost={onMakeCoHost}
                onRemoveParticipant={onRemoveParticipant}
                isCurrentUserHost={isCurrentUserHost}
              />
            ))}
          </div>
        )}

        {hosts.length > 0 && (
          <div className="p-3">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Host</h4>
            {hosts.map((participant) => (
              <ParticipantItem
                key={`host-${participant.id}`}
                participant={participant}
                onMuteParticipant={onMuteParticipant}
                onStopVideo={onStopVideo}
                onMakeHost={onMakeHost}
                onMakeCoHost={onMakeCoHost}
                onRemoveParticipant={onRemoveParticipant}
                isCurrentUserHost={isCurrentUserHost}
              />
            ))}
          </div>
        )}

        {coHosts.length > 0 && (
          <div className="p-3">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Co-Hosts</h4>
            {coHosts.map((participant) => (
              <ParticipantItem
                key={`cohost-${participant.id}`}
                participant={participant}
                onMuteParticipant={onMuteParticipant}
                onStopVideo={onStopVideo}
                onMakeHost={onMakeHost}
                onMakeCoHost={onMakeCoHost}
                onRemoveParticipant={onRemoveParticipant}
                isCurrentUserHost={isCurrentUserHost}
              />
            ))}
          </div>
        )}

        {regularParticipants.length > 0 && (
          <div className="p-3">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Participants</h4>
            {regularParticipants.map((participant) => (
              <ParticipantItem
                key={`participant-${participant.id}`}
                participant={participant}
                onMuteParticipant={onMuteParticipant}
                onStopVideo={onStopVideo}
                onMakeHost={onMakeHost}
                onMakeCoHost={onMakeCoHost}
                onRemoveParticipant={onRemoveParticipant}
                isCurrentUserHost={isCurrentUserHost}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-3 border-t">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={onInviteParticipants}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Participants
        </Button>
      </div>
    </div>
  );
};

interface ParticipantItemProps {
  participant: Participant;
  onMuteParticipant: (participantId: string) => void;
  onStopVideo: (participantId: string) => void;
  onMakeHost: (participantId: string) => void;
  onMakeCoHost: (participantId: string) => void;
  onRemoveParticipant: (participantId: string) => void;
  isCurrentUserHost: boolean;
}

const ParticipantItem: React.FC<ParticipantItemProps> = ({
  participant,
  onMuteParticipant,
  onStopVideo,
  onMakeHost,
  onMakeCoHost,
  onRemoveParticipant,
  isCurrentUserHost,
}) => {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center">
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage src={participant.avatar} alt={participant.name} />
          <AvatarFallback>
            {participant.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center">
            <span className="text-sm font-medium">
              {participant.name} {participant.isCurrentUser && "(You)"}
            </span>
            {participant.isHost && (
              <span className="ml-1 text-xs bg-yellow-500 text-white px-1 rounded">Host</span>
            )}
            {participant.isCoHost && !participant.isHost && (
              <span className="ml-1 text-xs bg-blue-500 text-white px-1 rounded">Co-Host</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        {participant.handRaised && (
          <Hand className="h-4 w-4 text-yellow-500" />
        )}
        {!participant.audioEnabled && (
          <MicOff className="h-4 w-4 text-gray-500" />
        )}
        {!participant.videoEnabled && (
          <VideoOff className="h-4 w-4 text-gray-500" />
        )}

        {(isCurrentUserHost || participant.isCurrentUser) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isCurrentUserHost && !participant.isCurrentUser && (
                <>
                  <DropdownMenuItem onClick={() => onMuteParticipant(participant.id)}>
                    <MicOff className="h-4 w-4 mr-2" />
                    {participant.audioEnabled ? "Mute" : "Ask to Unmute"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStopVideo(participant.id)}>
                    <VideoOff className="h-4 w-4 mr-2" />
                    {participant.videoEnabled ? "Stop Video" : "Ask to Start Video"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {!participant.isHost && (
                    <DropdownMenuItem onClick={() => onMakeHost(participant.id)}>
                      <Crown className="h-4 w-4 mr-2" />
                      Make Host
                    </DropdownMenuItem>
                  )}
                  {!participant.isCoHost && !participant.isHost && (
                    <DropdownMenuItem onClick={() => onMakeCoHost(participant.id)}>
                      <Crown className="h-4 w-4 mr-2" />
                      Make Co-Host
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onRemoveParticipant(participant.id)}
                    className="text-red-500"
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Remove Participant
                  </DropdownMenuItem>
                </>
              )}
              
              {participant.isCurrentUser && (
                <>
                  <DropdownMenuItem onClick={() => onMuteParticipant(participant.id)}>
                    <MicOff className="h-4 w-4 mr-2" />
                    {participant.audioEnabled ? "Mute" : "Unmute"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStopVideo(participant.id)}>
                    <VideoOff className="h-4 w-4 mr-2" />
                    {participant.videoEnabled ? "Stop Video" : "Start Video"}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export default ParticipantsPanel;
