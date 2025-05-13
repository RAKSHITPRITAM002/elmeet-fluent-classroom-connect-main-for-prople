import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { meetingService, CreateMeetingData } from '@/services/meeting/meetingService';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';

interface MeetingSchedulerProps {
  userId: string;
  onScheduled?: (meetingId: string) => void;
}

const MeetingScheduler: React.FC<MeetingSchedulerProps> = ({
  userId,
  onScheduled,
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [waitingRoom, setWaitingRoom] = useState(true);
  const [muteOnEntry, setMuteOnEntry] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleScheduleMeeting = async () => {
    if (!title.trim()) {
      toast({
        title: 'Meeting title required',
        description: 'Please enter a title for your meeting.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!date) {
      toast({
        title: 'Date required',
        description: 'Please select a date for your meeting.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!startTime) {
      toast({
        title: 'Start time required',
        description: 'Please select a start time for your meeting.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create start and end date objects
      const startDate = new Date(date);
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      startDate.setHours(startHours, startMinutes);
      
      let endDate: Date | undefined;
      if (endTime) {
        endDate = new Date(date);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        endDate.setHours(endHours, endMinutes);
      }
      
      const meetingData: CreateMeetingData = {
        title,
        description: description || undefined,
        scheduledStartTime: startDate.toISOString(),
        scheduledEndTime: endDate?.toISOString(),
        settings: {
          waitingRoom,
          muteOnEntry,
        },
      };
      
      const meeting = await meetingService.createMeeting(userId, meetingData);
      
      toast({
        title: 'Meeting scheduled',
        description: `Your meeting has been scheduled for ${format(startDate, 'PPP')} at ${format(startDate, 'p')}`,
      });
      
      if (onScheduled) {
        onScheduled(meeting.id);
      } else {
        navigate(`/dashboard`);
      }
    } catch (error) {
      console.error('Failed to schedule meeting:', error);
      toast({
        title: 'Failed to schedule meeting',
        description: 'An error occurred while scheduling your meeting.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule a Meeting</CardTitle>
        <CardDescription>
          Fill in the details to schedule a new meeting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Meeting Title</Label>
          <Input
            id="title"
            placeholder="Enter meeting title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Input
            id="description"
            placeholder="Enter meeting description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Select a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-gray-500" />
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endTime">End Time (Optional)</Label>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-gray-500" />
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="waitingRoom">Enable Waiting Room</Label>
            <Switch
              id="waitingRoom"
              checked={waitingRoom}
              onCheckedChange={setWaitingRoom}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="muteOnEntry">Mute Participants on Entry</Label>
            <Switch
              id="muteOnEntry"
              checked={muteOnEntry}
              onCheckedChange={setMuteOnEntry}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleScheduleMeeting}
          disabled={isLoading}
        >
          {isLoading ? 'Scheduling...' : 'Schedule Meeting'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MeetingScheduler;