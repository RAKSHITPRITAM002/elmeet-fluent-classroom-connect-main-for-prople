export interface MeetingSettings {
  enableWaitingRoom?: boolean;
  allowScreenShare?: boolean;
  // ... other settings
}

export interface Meeting {
  id: string;
  title: string;
  description?: string | null;
  hostId: string; // Corresponds to host_id in DB
  scheduledStartTime?: string | null; // ISO date string
  scheduledEndTime?: string | null; // ISO date string
  status: "scheduled" | "active" | "ended" | "cancelled";
  settings: MeetingSettings;
  participants: string[]; // Array of user IDs, or more complex objects
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface CreateMeetingData {
  title: string;
  description?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  status?: "scheduled" | "active" | "ended" | "cancelled";
  settings?: MeetingSettings;
}

export interface JoinMeetingData {
  meetingId: string;
  userId: string;
  displayName: string; // Name of the user joining
}
