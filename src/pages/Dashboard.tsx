import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, Users, Copy, Trash2, Edit } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { meetingService } from '@/services/meeting/meetingService';
import { Meeting, CreateMeetingData } from '@/types/meetingTypes';
import MeetingScheduler from '@/components/meeting/MeetingScheduler';
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
// 'Link' removed as it's not used in the provided snippet. Add back if you add navigation links.
// import Link from 'next/link'; 

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // 'error' state is kept because it's set in fetchUserMeetings and handleDeleteMeeting,
  // even if not directly displayed as a banner, it's used for toast messages.
  // If you *only* use toasts for errors, you could remove this state and just pass err.message to toast.
  const [error, setError] = useState<string | null>(null); 
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  
  const fetchUserMeetings = useCallback(async () => {
    if (user?.id) {
      setIsLoading(true);
      setError(null); // Reset error before fetching
      try {
        const userMeetings = await meetingService.getUserMeetings(user.id);
        setMeetings(userMeetings);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch meetings.'); // Set error state
        toast({ title: "Error Fetching Meetings", description: err.message || 'Failed to fetch meetings.', variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
  }, [user?.id, toast]);
  
  useEffect(() => {
    fetchUserMeetings();
  }, [fetchUserMeetings]);

  const handleMeetingScheduledOrUpdated = (meetingData: CreateMeetingData) => {
    if (!user?.id) {
        toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    setError(null);

    const promise = editingMeeting
      ? meetingService.updateMeeting(editingMeeting.id, user.id, meetingData) // Assuming updateMeeting exists
      : meetingService.createMeeting(user.id, meetingData);

    promise
      .then((savedMeeting: {
        createdAt: string | number | Date; id: string; title: any; 
}) => {
        if (editingMeeting) {
          setMeetings(prevMeetings => prevMeetings.map(m => m.id === savedMeeting.id ? savedMeeting : m));
          toast({ title: "Success", description: `Meeting "${savedMeeting.title}" updated successfully.` });
        } else {
          setMeetings(prevMeetings => [savedMeeting, ...prevMeetings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
          toast({ title: "Success", description: `Meeting "${savedMeeting.title}" scheduled successfully.` });
        }
        setIsSchedulerOpen(false);
        setEditingMeeting(null);
      })
      .catch((err: { message: any; }) => {
        setError(err.message || `Failed to ${editingMeeting ? 'update' : 'schedule'} meeting.`);
        toast({ title: "Error", description: err.message || `Failed to ${editingMeeting ? 'update' : 'schedule'} meeting.`, variant: "destructive" });
      })
      .finally(() => setIsLoading(false));
  };
  
  const handleCopyMeetingLink = (meetingId: string) => {
    const meetingLink = meetingService.generateMeetingLink(meetingId);
    navigator.clipboard.writeText(meetingLink)
      .then(() => toast({ title: "Copied!", description: "Meeting link copied to clipboard." }))
      .catch(() => toast({ title: "Error", description: "Failed to copy link.", variant: "destructive" }));
  };
  
  const handleDeleteMeeting = async (meetingId: string) => {
    if (!user?.id) {
      toast({ title: "Error", description: "Authentication error.", variant: "destructive" });
      return;
    }
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      setError(null); // Reset error
      try {
        await meetingService.deleteMeeting(meetingId, user.id);
        setMeetings(prevMeetings => prevMeetings.filter(m => m.id !== meetingId));
        toast({ title: "Success", description: "Meeting deleted successfully." });
      } catch (err: any) {
        setError(err.message || 'Failed to delete meeting.'); // Set error state
        toast({ title: "Error", description: err.message || 'Failed to delete meeting.', variant: "destructive" });
      }
    }
  };
  
  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setIsSchedulerOpen(true);
  };
  
  if (isLoading && meetings.length === 0 && !error) return <div className="p-4 text-center">Loading meetings...</div>;
  // Display general error if not handled by specific toasts or if needed
  if (error && meetings.length === 0) {
    return <div className="p-4 text-center text-red-500">Error: {error} <Button onClick={fetchUserMeetings}>Try Again</Button></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">My Meetings Dashboard</h1>
        <Button onClick={() => { setEditingMeeting(null); setIsSchedulerOpen(true); }}>
          <Calendar className="mr-2 h-4 w-4" /> Schedule New Meeting
            </Button>
      </header>

      <Dialog open={isSchedulerOpen} onOpenChange={(isOpen) => {
        setIsSchedulerOpen(isOpen);
        if (!isOpen) setEditingMeeting(null); // Reset editingMeeting when dialog closes
      }}>
        <DialogContent className="sm:max-w-[425px] md:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingMeeting ? 'Edit Meeting' : 'Schedule a New Meeting'}</DialogTitle>
            <DialogDescription>
              {editingMeeting ? 'Update the details for your meeting.' : 'Fill in the details to schedule your new meeting.'}
            </DialogDescription>
          </DialogHeader>
            <MeetingScheduler
            initialData={editingMeeting}
            onSubmit={handleMeetingScheduledOrUpdated} // Use the combined handler
            onCancel={() => { setIsSchedulerOpen(false); setEditingMeeting(null); }}
            />
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 mb-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="all">All Meetings</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {meetings.filter(m => new Date(m.scheduledStartTime || 0) > new Date() && m.status !== 'ended' && m.status !== 'cancelled').length === 0 && !isLoading && <p className="text-center text-gray-500 py-4">No upcoming meetings.</p>}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {meetings
              .filter(m => new Date(m.scheduledStartTime || 0) > new Date() && m.status !== 'ended' && m.status !== 'cancelled')
              .map(meeting => (
                <Card key={meeting.id}>
      <CardHeader>
                    <CardTitle className="truncate">{meeting.title}</CardTitle>
        <CardDescription>
                      <Calendar className="inline mr-1 h-3 w-3" /> {new Date(meeting.scheduledStartTime || Date.now()).toLocaleDateString()}
                      <Clock className="inline ml-2 mr-1 h-3 w-3" /> {new Date(meeting.scheduledStartTime || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </CardDescription>
      </CardHeader>
      <CardContent>
                  <p className="text-sm text-gray-600 h-10 overflow-hidden text-ellipsis">{meeting.description || "No description."}</p>
                    <p className="text-xs text-gray-500 mt-2"><Users className="inline mr-1 h-3 w-3" /> {meeting.participants.length} participant(s)</p>
      </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <Button variant="outline" size="sm" onClick={() => handleCopyMeetingLink(meeting.id)}>
                      <Copy className="mr-1 h-3 w-3" /> Copy Link
                    </Button>
                    <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" title="Edit Meeting" onClick={() => handleEditMeeting(meeting)}>
                        <Edit className="h-4 w-4" />
          </Button>
                    <Button variant="ghost" size="icon" title="Delete Meeting" onClick={() => handleDeleteMeeting(meeting.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
        </div>
      </CardFooter>
    </Card>
              ))}
          </div>
        </TabsContent>
        <TabsContent value="past">
            {meetings.filter(m => new Date(m.scheduledStartTime || Date.now()) <= new Date() || m.status === 'ended' || m.status === 'cancelled').length === 0 && !isLoading && <p className="text-center text-gray-500 py-4">No past meetings.</p>}
            {/* TODO: Map and display past meetings similar to upcoming */}
        </TabsContent>
        <TabsContent value="all">
            {meetings.length === 0 && !isLoading && <p className="text-center text-gray-500 py-4">No meetings found.</p>}
            {/* TODO: Map and display all meetings similar to upcoming */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
