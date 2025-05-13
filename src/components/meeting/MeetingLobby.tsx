import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Users } from "lucide-react";
import { format } from 'date-fns';
import { Meeting } from '@/services/meeting/meetingService';

interface MeetingLobbyProps {
  meeting: Meeting;
  participantName: string;
  participantAvatar?: string;
  waitingParticipants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  isHost: boolean;
  onAdmitAll: () => void;
  onAdmitOne: (participantId: string) => void;
  onDenyOne: (participantId: string) => void;
  onJoinMeeting: () => void;
}

const MeetingLobby: React.FC<MeetingLobbyProps> = ({
  meeting,
  participantName,
  participantAvatar,
  waitingParticipants,
  isHost,
  onAdmitAll,
  onAdmitOne,
  onDenyOne,
  onJoinMeeting,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update the current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{meeting.title}</CardTitle>
          <CardDescription>
            {meeting.description || 'No description provided'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <span>{format(currentTime, 'PPpp')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-gray-500" />
              <span>{meeting.participants.length} participants</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={participantAvatar} alt={participantName} />
              <AvatarFallback className="text-xl">
                {participantName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{participantName}</p>
              <p className="text-sm text-gray-500">
                {isHost ? 'Host' : 'Waiting to be admitted'}
              </p>
            </div>
          </div>
          
          {isHost && waitingParticipants.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Waiting Room ({waitingParticipants.length})</h3>
                <Button variant="outline" size="sm" onClick={onAdmitAll}>
                  Admit All
                </Button>
              </div>
              
              <div className="space-y-2">
                {waitingParticipants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={participant.avatar} alt={participant.name} />
                        <AvatarFallback>
                          {participant.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{participant.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => onAdmitOne(participant.id)}>
                        Admit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDenyOne(participant.id)}>
                        Deny
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!isHost && (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-2">
                Please wait for the host to admit you to the meeting
              </p>
              <div className="flex justify-center">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full"
            onClick={onJoinMeeting}
            disabled={!isHost && waitingParticipants.some(p => p.name === participantName)}
          >
            {isHost ? 'Start Meeting' : 'Join Meeting'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MeetingLobby;