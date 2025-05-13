import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MicOff, VideoOff, Wifi, WifiOff, Hand, Crown } from "lucide-react";

export interface ParticipantStatus {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
  isCoHost: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  handRaised: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  isCurrentUser: boolean;
}

interface ParticipantsListProps {
  participants: ParticipantStatus[];
  className?: string;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  className,
}) => {
  // Sort participants: host first, then co-hosts, then by name
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.isHost && !b.isHost) return -1;
    if (!a.isHost && b.isHost) return 1;
    if (a.isCoHost && !b.isCoHost) return -1;
    if (!a.isCoHost && b.isCoHost) return 1;
    return a.name.localeCompare(b.name);
  });
  
  return (
    <ScrollArea className={className}>
      <div className="space-y-1 p-2">
        {sortedParticipants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100"
          >
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={participant.avatar} alt={participant.name} />
                  <AvatarFallback>
                    {participant.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1">
                  {participant.connectionStatus === 'connected' && (
                    <div className="h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                  {participant.connectionStatus === 'connecting' && (
                    <div className="h-3 w-3 bg-yellow-500 rounded-full border-2 border-white" />
                  )}
                  {participant.connectionStatus === 'disconnected' && (
                    <div className="h-3 w-3 bg-red-500 rounded-full border-2 border-white" />
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium">
                    {participant.name} {participant.isCurrentUser && "(You)"}
                  </span>
                  {participant.isHost && (
                    <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                      Host
                    </Badge>
                  )}
                  {participant.isCoHost && !participant.isHost && (
                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                      Co-Host
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-1 text-gray-500">
                  {participant.connectionStatus === 'connected' && (
                    <Wifi className="h-3 w-3" />
                  )}
                  {participant.connectionStatus === 'connecting' && (
                    <Wifi className="h-3 w-3 text-yellow-500" />
                  )}
                  {participant.connectionStatus === 'disconnected' && (
                    <WifiOff className="h-3 w-3 text-red-500" />
                  )}
                  <span className="text-xs">
                    {participant.connectionStatus === 'connected' && 'Connected'}
                    {participant.connectionStatus === 'connecting' && 'Connecting...'}
                    {participant.connectionStatus === 'disconnected' && 'Disconnected'}
                  </span>
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
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ParticipantsList;